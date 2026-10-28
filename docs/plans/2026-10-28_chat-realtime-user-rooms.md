# Chat List Realtime via Per-User Rooms
**Date:** 2026-10-28
**Status:** Planned
**Revision:** v1

### Progress Log

| Phase | Step | Status | Commit |
|---|---|---|---|
| 1 | Add `sellerId` to Chat model + populate on chat creation | Done | — |
| 1 | Backfill `sellerId` for legacy chats on seller list/room access | Done | — |
| 2 | Add `chatRealtime` room/emit helpers | Pending | — |
| 2 | Target `update_chat` to both participant rooms; remove global broadcast | Pending | — |
| 2 | Atomic last-message + recipient unread increment | Pending | — |
| 2 | Emit `update_chat` on chat creation | Pending | — |
| 2 | Remove premature image-upload socket emit | Pending | — |
| 2 | Add mark-read endpoint + service | Pending | — |
| 3 | Join `user_<userId>` from chat list; listen to `update_chat` | Pending | — |
| 3 | Role-correct unread mapping; refetch unknown chats | Pending | — |
| 4 | Mark chat read from ChatRoom on load and on new messages | Pending | — |
| 5 | Manual multi-session verification + client lint | Pending | — |

## Problem

The `user_` room already exists in the chat client, but the realtime chat-list path
does not use it:

- `ChatRoom` joins `user_${currentUserId}` (`apps/client/src/pages/ChatRoom/services/useChatSocket.js:44-47`),
  but `ChatsList` joins no room at all
  (`apps/client/src/pages/ChatsList/index.jsx:160-171`).
- The server emits `update_chat` to `user_${sender.id}`
  (`apps/services/chat-service/src/controller/chatControllers.js:297`), which is
  the sender's identity, not the recipient's. Restaurant senders also use
  `restaurant_id` as `sender.id` (`chatControllers.js:241`), so the seller's user
  room never matches.
- The chat list is actually kept in sync by `io.emit("refresh_chat_list")`
  (`chatControllers.js:293`), which broadcasts every chat update to every
  connected socket.
- `ChatsList.handleChatUpdate` inserts unknown chats into the list
  (`ChatsList/index.jsx:148-149`), so a non-participant can receive and display
  another user's chat.
- `unreadCountUser` / `unreadCountRestaurant` exist
  (`apps/services/chat-service/src/config/schema.js:71-72`) but are never
  updated. The list always reads `unreadCountUser`, even for sellers
  (`ChatsList/index.jsx:263`).
- `createChatController` emits nothing, so a brand-new chat appears only after a
  message or a page reload.
- `uploadImageChatController` emits a premature `new_message`
  (`chatControllers.js:403-416`) before the message is persisted by the
  follow-up `POST /message`, risking duplicate or malformed image messages.

Net effect: the customer and seller POVs appeared to work only because of the
global broadcast. The per-user room and unread path were effectively dead.

## Goal

1. Deliver chat-list updates only to the two participants of a chat.
2. Remove the global `refresh_chat_list` broadcast.
3. Support both customers and sellers through `user_<userId>` rooms.
4. Keep unread counts accurate per role.
5. Emit list updates for new chats and image messages.
6. Clear unread counts when a participant opens or is viewing a chat.
7. No database migration tooling required; `sellerId` is an additive optional
   field and legacy chats are backfilled lazily.

## Non-Goals

- Socket handshake JWT auth and validated `join_room` membership. The server
  still trusts client room joins; this remains a follow-up security task.
- Refactoring the duplicated socket `send_message` plus HTTP `POST /message`
  flow.
- Push/email notifications for chat messages.
- UI redesign of the chat list or chat room.

## Design

### Room model

Use `user_<userId>` for both roles. Each chat has two participants:

- customer: `chat.userId`
- seller: `chat.sellerId` (new field, from `order.seller_id`)

This keeps the existing `ChatRoom` join correct and avoids a separate
`restaurant_` room. `order.seller_id` is already the restaurant owner's user id
(`order-service/src/controllers/OrderController.js:1460`).

Legacy chats have no `sellerId`. They are backfilled when the seller loads their
chat list or opens one of their chats, using the authenticated seller's
`userId`. New chats receive `sellerId` at creation.

### Event contracts

- `new_message` → `chat_<chatId>` (unchanged).
- `update_chat` → each of `user_<chat.userId>` and `user_<chat.sellerId>`:
  ```json
  { "updatedChat": { "...Chat document fields..." } }
  ```
- Mark read: `POST /chat/:chat_id/read` resets the caller's unread counter and
  emits `update_chat` to both participants.

`updatedChat` is the raw Mongoose chat document. If the client receives an
unknown chat id, it refetches the list instead of inserting the raw document,
because the raw document lacks the enriched `restaurant`, `user`, and
`orderDetails` payload added by `chatUtil.js`.

### Unread rules

| Sender type | Increment |
|---|---|
| `user` | `unreadCountRestaurant` |
| `restaurant` | `unreadCountUser` |

The sender's own message never increments their own counter. The list maps the
counter by the logged-in role.

## File Changes

### Backend (`apps/services/chat-service`)

- `src/config/schema.js`
  - Add optional indexed `sellerId: Number` to `chatSchema`.
- `src/service/chatService.js`
  - Replace/extend `updateLastMessageChatService` with
    `updateChatOnNewMessageService(chatId, lastMessage, recipientType)`:
    sets `lastMessage` and atomically `$inc`s the recipient unread counter.
  - Add `markChatReadService(chatId, role)`.
  - Add `backfillChatSellerIdService(restaurantId, sellerId)`.
- `src/util/chatRealtime.js` (new)
  - `getChatRooms(chat)`
  - `emitChatUpdate(io, chat)`
- `src/controller/chatControllers.js`
  - `createChatController`: save `sellerId`, emit `update_chat`.
  - `createMessageController`: use the atomic update service, emit
    `new_message` to the chat room, emit `update_chat` to both user rooms,
    remove `io.emit("refresh_chat_list")` and the sender-targeted event.
  - `uploadImageChatController`: remove the premature `new_message` emit.
  - Add `markChatReadController`.
  - Backfill `sellerId` in seller `getChatsController` / `getChatByIdController`
    paths.
- `src/util/chatUtil.js`
  - Backfill legacy chats in `getSellerChatsUtil` using the resolved
    `restaurantId` and authenticated `userId`.
- `src/route/chatRoutes.js`
  - Add `POST /chat/:chat_id/read`.

### Frontend (`apps/client`)

- `src/pages/ChatsList/index.jsx`
  - Decode the JWT with the existing `jwt-decode` dependency to get `userId`
    and `role`.
  - Join `user_<userId>` in the socket `connect` handler (rejoins on
    reconnect).
  - Listen to `update_chat` instead of `refresh_chat_list`.
  - `handleChatUpdate`: update known chats; call `fetchChats()` for unknown
    chats instead of inserting them.
  - Map unread by role.
- `src/pages/ChatRoom/services/useChatSocket.js`
  - Keep the existing `user_<currentUserId>` join; it is now correct for both
    roles.
- `src/pages/ChatRoom/index.jsx`
  - Call the mark-read endpoint after initial message load and after receiving
    a new message while the room is open.

## Phases

### Phase 1 — Seller identity on chats

1. Add `sellerId` to the Chat schema.
2. Populate it in `createChatController` from `order.data.order.seller_id`.
3. Backfill missing `sellerId` for a seller's chats when that seller loads the
   chat list or opens a chat.

### Phase 2 — Server-side targeted realtime

1. Add `chatRealtime.js` helpers.
2. Update message creation to target both participant rooms and increment the
   correct unread counter atomically.
3. Remove the global `refresh_chat_list` broadcast.
4. Emit `update_chat` on chat creation.
5. Remove the image-upload premature broadcast.
6. Add the mark-read endpoint and emit `update_chat` after reset.

### Phase 3 — Chat list client

1. Join the logged-in user's room.
2. Listen to `update_chat`.
3. Refetch on unknown chats.
4. Use the role-appropriate unread counter.

### Phase 4 — Chat room read state

1. Mark the chat read after messages load.
2. Mark read when a new message arrives while the room is open.

### Phase 5 — Verification

1. Run `npm run lint` in `apps/client`.
2. Perform the multi-session checks below.

## Verification

Manual, with separate browser sessions:

1. **Customer ↔ seller:** customer sends a message; only that customer's and
   that seller's lists update. A second customer's list does not change.
2. **No global leak:** the second customer never receives an unknown chat in the
   list.
3. **Open chat:** both roles receive `new_message` in the room and typing
   indicators continue to work.
4. **Unread:** seller badge increments via `unreadCountRestaurant`; customer
   badge increments via `unreadCountUser`; opening the chat clears the badge.
5. **Image:** sending an image updates the list once and does not produce a
   duplicate or empty message.
6. **New chat:** creating a chat makes it appear on both sides without a page
   reload.
7. **Reconnect:** disconnect and reconnect the socket; room joins are restored
   and updates resume.
8. **Legacy chat:** open an existing chat created before `sellerId` existed;
   seller updates still arrive after the lazy backfill.

## Risks and Mitigations

- **Missing `sellerId` on old chats:** lazy backfill on seller access; new chats
  always carry it. Add a server log when a chat is emitted without `sellerId`.
- **Unknown-chat refetch loop:** only refetch when an unknown chat arrives and
  debounce it; the server only emits to participants.
- **Duplicate mark-read emits:** mark read on initial load and on incoming
  messages only, not on every message render.
- **Removing `refresh_chat_list`:** search for other listeners before deletion;
  currently only `ChatsList` consumes it.
- **Security remains open:** room joins are still client-driven. Track socket
  auth and membership validation as a separate follow-up.
