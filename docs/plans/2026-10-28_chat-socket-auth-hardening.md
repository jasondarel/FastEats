# Chat Socket Authentication and Room Authorization
**Date:** 2026-10-28
**Status:** Implemented — browser UI smoke pending
**Revision:** v2 — server and client hardening implemented and verified

### Progress Log

| Phase | Step | Status | Commit |
|---|---|---|---|
| 1 | Authenticate Socket.IO handshake with JWT | Done | — |
| 2 | Auto-join own user room; reject arbitrary room names | Done | — |
| 3 | Add participant-checked `join_chat` | Done | — |
| 4 | Remove `send_message`, `list_rooms`, and unsafe client emits | Done | — |
| 5 | Harden `typing` identity handling | Done | — |
| 6 | Wire client handshake auth and `join_chat` | Done | — |
| 7 | Automated socket security tests | Done | — |
| 8 | Browser smoke check | Pending | — |

## Problem

The HTTP chat APIs verify the JWT and check chat ownership, but the Socket.IO
server does not:

- `apps/services/chat-service/src/server.js:40` accepts every connection. There
  is no handshake authentication.
- `join_room` at `server.js:43` joins any client-supplied string without
  authorization.
  - `user_<id>` room IDs are sequential and trivially enumerable. An attacker can
    subscribe to another user's `update_chat` events, exposing last-message
    previews and unread counts.
  - `chat_<chatId>` has no participant check. Anyone who learns or guesses a chat
    ID can receive live `new_message` events.
- `send_message` at `server.js:56` broadcasts arbitrary client payloads to any
  `chat_<chatId>` without authentication or persistence. An attacker can spoof
  messages and sender identity into any chat without joining it.
- `typing` at `server.js:101` trusts client-supplied `userId` and `chatId`, so
  typing indicators can also be spoofed.
- `list_rooms` at `server.js:76` leaks every room name and occupancy count.
- CORS at `server.js:29` is not an authentication control. Non-browser clients
  ignore it.

The existing live E2E test proved the issue: it connected without a token and
joined arbitrary rooms successfully. Severity is high because the socket path
bypasses the authorization already enforced by the HTTP controllers.

## Goal

- Only requests carrying a valid JWT can establish a Socket.IO connection.
- A connection can receive events only for:
  - its own `user_<userId>` room, and
  - chats where the authenticated user is a participant.
- Clients cannot broadcast fabricated chat messages or impersonate another user's
  typing state.
- Realtime behavior for legitimate customers and sellers is preserved.
- Room names and occupancy are not exposed to clients.

## Non-Goals

- Changing HTTP authentication or token issuance.
- Adding refresh-token rotation or forcing re-authentication mid-connection.
- End-to-end message encryption.
- Full abuse protection such as per-IP rate limiting or WAF rules.
- Admin moderation or room-inspection tooling.
- Reworking Redis/RabbitMQ socket bridges for non-chat services.

## Design

### Trust model

The JWT is the single source of identity. After handshake verification, the
server stores `{ userId, role }` on `socket.data.user` and never trusts
client-supplied identity fields for authorization.

The JWT payload shape must match the HTTP middleware:
`apps/services/chat-service/src/middleware/authMiddleware.js:15`.

### Handshake authentication

Add Socket.IO middleware before `io.on("connection")`:

```js
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  // verify with JWT_SECRET, validate numeric userId and role in ["user", "seller"]
  // reject with next(new Error("Unauthorized"))
});
```

Rules:

- Missing, malformed, expired, or wrongly signed tokens are rejected.
- `userId` must be numeric and truthy.
- `role` must be `user` or `seller`.
- The raw token is never placed in a query string or logged.
- Verification uses the same `JWT_SECRET` as the HTTP service.

### Room model

- `user_<userId>` is joined automatically by the server on connection. Clients do
  not emit this join.
- `chat_<chatId>` is joined only through an explicit `join_chat` event.
- Generic `join_room` is removed. The server no longer accepts arbitrary room
  names.

### Chat join authorization

`join_chat` receives a `chatId` and checks:

1. `chatId` is a valid ObjectId-shaped value.
2. The chat exists.
3. The authenticated user is a participant:
   - Customer: `chat.userId === socket.data.user.userId`.
   - Seller: `chat.sellerId === socket.data.user.userId`.
4. If a legacy seller chat has `sellerId === null`, resolve the restaurant owner
   through the same path used by the HTTP controllers, backfill `sellerId`, and
   then allow or reject. If ownership cannot be verified, reject.

On success, the server joins `chat_<chatId>` and acknowledges. On failure, it
returns a generic error and logs the rejection. Do not reveal whether the chat
exists to unauthorized callers.

### Event contracts

Client to server:

| Event | Payload | Notes |
|---|---|---|
| `join_chat` | `{ chatId }` | Participant-checked; ack `{ success, room? }` or `{ success: false, error }` |
| `leave_chat` | `{ chatId }` | Leaves only the matching chat room |
| `typing` | `{ chatId, isTyping, username? }` | `userId` is taken from `socket.data.user`; client value ignored |

Removed events:

- `join_room`
- `send_message`
- `list_rooms`

Server to client:

| Event | Payload | Notes |
|---|---|---|
| `chat_joined` | `{ room }` | Optional success event in addition to ack |
| `chat_error` | `{ message }` | Generic join/typing failure |
| `update_chat` | `{ updatedChat }` | Sent only to participant user rooms |
| `new_message` | message object | Sent only to the participant chat room |
| `user_typing` | `{ userId, username, isTyping, timestamp }` | `userId` always comes from the authenticated socket |

### Message writes stay on HTTP

`POST /message` already persists the message and emits `new_message` after
persistence. The socket must not be a second write path.

- Remove the server `send_message` handler.
- Remove `emitMessage` calls from
  `apps/client/src/pages/ChatRoom/index.jsx:145` and `:645`.
- Remove the `emitMessage` function from
  `apps/client/src/pages/ChatRoom/services/useChatSocket.js:153`.
- Keep optimistic UI based on the HTTP response, not an unauthenticated socket
  broadcast.

This also removes duplicate delivery risk: the current client emits over socket
and then calls the HTTP endpoint.

### Typing identity

`typing` must verify that the socket is a participant in the target chat. The
server emits `userId` from `socket.data.user.userId`. A client-supplied
`username` is display-only and must not be used for authorization.

### Client wiring

Both sockets pass the JWT in the handshake auth payload and let the server
auto-join the user room:

- `apps/client/src/pages/ChatsList/index.jsx:195`
- `apps/client/src/pages/ChatRoom/services/useChatSocket.js:29`

Use Socket.IO's function form so a refreshed token is used on reconnect:

```js
io(API_URL, {
  path: "/chat/socket.io",
  auth: (callback) => callback({ token: localStorage.getItem("token") }),
});
```

`ChatRoom` emits `join_chat` on connect, handles the ack/`chat_error`, and emits
`leave_chat` when the room unmounts.

The API gateway needs no change because the token travels in the Socket.IO
handshake payload, which is proxied by the existing `/chat` upgrade handler
(`apps/api-gateway/src/gateway.js:191`).

## Files Touched

| File | Change |
|---|---|
| `apps/services/chat-service/src/server.js` | Add handshake auth, auto-join user room, participant-checked `join_chat`, remove unsafe events |
| `apps/services/chat-service/src/middleware/socketAuthMiddleware.js` | New socket handshake JWT verification |
| `apps/services/chat-service/src/service/chatService.js` | Add participant lookup/authorization helper |
| `apps/services/chat-service/src/util/chatRealtime.js` | Reuse existing room-name helpers |
| `apps/client/src/pages/ChatsList/index.jsx` | Send handshake token; remove manual user-room join |
| `apps/client/src/pages/ChatRoom/services/useChatSocket.js` | Send handshake token; use `join_chat`/`leave_chat`; remove `emitMessage` |
| `apps/client/src/pages/ChatRoom/index.jsx` | Remove socket message writes; keep HTTP persistence |
| `docs/plans/2026-10-28_chat-socket-auth-hardening.md` | Progress and verification results |

## Verification

### Automated

Extend the live chat-service integration harness to cover:

1. Connection without a token is rejected.
2. Connection with an invalid or expired token is rejected.
3. A valid customer connects and is auto-joined to their own `user_<id>` room.
4. A customer cannot join another user's `user_<id>` room.
5. A non-participant cannot join `chat_<chatId>`.
6. A customer can join their own chat; a seller can join the same chat.
7. A legacy seller chat with null `sellerId` is backfilled and then joins.
8. Removed `send_message` no longer broadcasts to a chat room.
9. A spoofed `typing.userId` is ignored; the emitted identity matches the token.
10. Legitimate `update_chat`, `new_message`, and mark-read events still work.
11. `list_rooms` no longer returns data.
12. Customer/seller reconnect still re-authenticates and rejoins their user room.

### Manual

- Customer and seller in two browser sessions still see chat-list updates.
- Opening a chat still receives live messages.
- A third account cannot observe another user's list or chat events.
- Image and GIF messages still send through HTTP and appear once.

### Commands

```bash
node --check apps/services/chat-service/src/server.js
npm run build
# run the chat-service live socket security harness
```

Client lint is currently red with 259 pre-existing repo-wide errors, so it is not
a clean gate for this change.

### Verification Results (2026-10-29)

Implemented:

- `io.use(socketAuthMiddleware)` verifies the handshake JWT, stores
  `{ userId, role }` on `socket.data.user`, and rejects missing, malformed,
  expired, wrongly signed, non-numeric-user, or invalid-role tokens.
- The server auto-joins `user_<userId>` and exposes only `join_chat`,
  `leave_chat`, and `typing`. `join_room`, `send_message`, `list_rooms`, and
  `leave_room` were removed.
- `join_chat` validates the ObjectId, loads the chat, checks customer/seller
  participation, and resolves plus backfills a legacy null `sellerId` through the
  restaurant owner lookup. Unauthorized callers receive a generic error.
- `typing` requires membership of `chat_<chatId>` and always emits the user id
  from the authenticated socket; the client `userId` field is gone.
- Both client sockets pass the JWT through Socket.IO's `auth` callback.
  `ChatRoom` emits `join_chat` on connect and `leave_chat` on unmount. The socket
  message-write path was removed from `ChatRoom` and `useChatSocket`; message
  persistence remains HTTP-only.

Checks:

- `node --check` passes for `server.js`, `socketAuthMiddleware.js`, and
  `chatService.js`.
- `npm run build` in `apps/client` passes (chunk-size warning only).
- Live socket harness against local MongoDB and the running chat-service passed
  all 11 checks: handshake rejection cases, user-room auto-join, non-participant
  isolation, `join_chat` ownership, removed `send_message`/`join_room`/
  `list_rooms`, spoofed typing identity, participant `new_message` delivery,
  reconnect re-authentication, and legacy `sellerId` backfill.
- Handshake through the API gateway with path `/chat/socket.io` also connects
  with a valid token, confirming the existing upgrade proxy needs no change.
- Test fixtures were deleted after the harness run.
- Post-implementation fix: socket message classification now decides ownership by
  sender role before sender id. This fixes the live chat room hiding restaurant
  messages when the customer user id and restaurant id are both `1`. The helper
  is covered by direct assertion cases.

Remaining: the manual two-browser UI smoke check (list updates, live messages,
third-account isolation, image/GIF single delivery).

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Old clients connect without a token after server deploy | Deploy server and client together; old clients receive `connect_error` |
| Legacy seller chats have `sellerId: null` | Resolve restaurant owner and backfill before allowing the join; reject if unresolved |
| Participant checks diverge from HTTP behavior | Extract one authorization helper used by both paths |
| Token expires during a long-lived socket | Socket.IO re-authorizes on reconnect; document short-lived-token behavior |
| Removing `send_message` breaks optimistic UI | Verify message opens via HTTP response and `new_message`; test images/GIFs |
| False join rejection due to race after chat creation | Client joins after chat fetch; add retry on `chat_error` where appropriate |
| Room metadata leaks remain through logs | Do not log raw tokens; log user ID and room only at debug level |
| Unauthorized join attempts become noisy | Log rejections at warn level with user ID and chat ID, not token contents |

## Rollout

- Implement server and client changes in one commit.
- No API gateway change is required.
- Verify locally with the automated harness and two browser sessions.
- Monitor chat-service logs for `connect_error`, rejected `join_chat`, and
  `chat_error` spikes after deploy.
- Rollback by reverting both server and client changes together; a server-only
  rollback would restore the vulnerability.

## Resolved Decisions

1. **Strict vs minimal:** implemented the strict version. `join_room` and
   `send_message` were removed and replaced by participant-checked `join_chat`.
2. **Legacy seller fallback:** implemented restaurant-owner resolution with
   backfill during the first authorized socket join.
3. **Backward compatibility:** no compatibility shim. The server and client must
   be deployed together; old unauthenticated clients receive `connect_error`.
