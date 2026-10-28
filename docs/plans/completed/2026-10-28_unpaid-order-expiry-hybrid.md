# Hybrid Unpaid Order Expiry with Redis TTL and Cron Fallback
**Date:** 2026-10-28
**Status:** Complete — implemented and verified
**Revision:** v2 — implementation, E2E verification, Redis fail-fast hardening

### Progress Log

| Phase | Step | Status | Commit |
|---|---|---|---|
| 1 | Shared worker helpers: `orderEvents.js` (`publishStatusChanged`) + `orderExpiry.js` (`cancelExpiredOrder`) | ✅ Done | `c86d487` |
| 1 | Cron: expire both `Waiting` and `Pending`, publish per-order events | ✅ Done | `c86d487` |
| 1 | Rewrite + wire `order-expiry-listener` (remove broken axios path) | ✅ Done | `c86d487` |
| 2 | order-service Redis init + TTL key on checkout/pending | ✅ Done | `c86d487` |
| 2 | Socket `order.status_changed` on manual cancel | ✅ Done | `c86d487` |
| 2 | Verification: TTL, cron fallback, paid-order no-op, manual cancel | ✅ Done | — |
| 3 | Redis fail-fast hardening: `enableOfflineQueue: false` + `commandTimeout: 1000` | ✅ Done | `99385b0` |

## Problem

Unpaid order expiration currently relies only on a PostgreSQL cron. The Redis-based
expiry path is dead code:

- `workers/server.js` registers `setupOrderExpiryCron()` but never imports
  `order-expiry-listener.js`.
- `order:<id>` is never written anymore. Commit `88a09c4` removed the
  `redisClient.set('order:<id>', ..., 'EX', 1800)` from the payment-pending path
  and the `del` on payment success, replacing it with the cron.
- `order-expiry-listener.js` has latent bugs: undefined `API_URL`, axios call to
  `PUT /order/orders/:id`, wrong status casing, and it never re-subscribes.

The cron itself has gaps:

- It only cancels `status = 'Pending'`, but new orders default to `'Waiting'`
  (`order-service/prisma/schema.prisma`). Orders that never receive a Midtrans
  `pending` webhook stay `Waiting` forever.
- It bulk-updates without publishing `order.status_changed`, so connected clients
  are not notified.
- Manual cancellation (`cancelOrderController`) also emits no socket event.

Redis infrastructure already supports expiry notifications: `infra/docker-compose.yml`
runs `fasteats_redis` with `--notify-keyspace-events Ex`.

## Goal

1. Unpaid orders expire reliably after 30 minutes, whether `Waiting` or `Pending`.
2. Redis TTL provides near-instant expiry; the cron remains the durable fallback
   when Redis loses keys (restart, eviction, downtime).
3. Every `Cancelled` transition — automatic expiry and manual cancel — publishes
   `order.status_changed` to `fasteats:order:events`, reaching clients in
   `order:<id>` via the existing Socket.IO bridge.
4. No schema changes and no new dependencies.

## Non-Goals

- Email/push notification on cancellation.
- Refactoring the existing Preparing/Delivering/Completed workers to share the
  new publisher helper.
- Changing the Midtrans payment pipeline or order statuses.

## Design

### Event contract

Reuse the shape already published by the order workers:

```json
{
  "room": "order:123",
  "event": "order.status_changed",
  "data": { "order_id": 123, "status": "Cancelled", "updated_at": "..." }
}
```

Published to `SOCKET_EVENTS_CHANNEL` (`fasteats:order:events`). The bridge in
`order-service/src/config/socketBridgeInit.js` emits `event` with `data` to `room`.

### Idempotent cancellation

Single conditional statement shared by cron and listener:

```sql
UPDATE orders
SET status = 'Cancelled', updated_at = NOW()
WHERE order_id = $1 AND status IN ('Waiting', 'Pending')
RETURNING *;
```

Only one caller can win; the other gets zero rows and emits no event. Paid orders
(`Preparing` and later) are never affected when their stale TTL fires.

## Implementation

### 1. Shared worker helpers

**New `apps/services/workers/redis/order-service/orderEvents.js`**

- Export `SOCKET_EVENTS_CHANNEL` and `publishStatusChanged(order)`.
- Uses `getRedisClient()`; throws if unavailable.
- Mirrors `publishStatusChanged` in `paymentSettledWorker.js:153`.

**New `apps/services/workers/redis/order-service/orderExpiry.js`**

- Export `cancelExpiredOrder(orderId)`:
  - Run the conditional update above.
  - If a row is returned, call `publishStatusChanged(row)`.
  - Catch and log Redis publish errors; the DB cancellation still stands.

### 2. Fix the cron

**`apps/services/workers/redis/order-service/order-expiry-cron.js`**

- Replace the bulk `UPDATE` predicate with:
  `status IN ('Waiting', 'Pending') AND created_at < NOW() - INTERVAL '30 minutes'`.
- Select candidate `order_id`s first, then loop `cancelExpiredOrder(id)` so each
  cancellation emits an event.
- Keep the `* * * * *` schedule and existing logging.
- Log per-order failures without aborting the remaining rows.

### 3. Fix and wire the listener

**`apps/services/workers/redis/order-service/order-expiry-listener.js`**

- Remove imports/usages of `axios`, undefined `API_URL`, `INTERNAL_API_KEY`, and
  the HTTP `PUT /order/orders/:id` call.
- Subscribe to `__keyevent@0__:expired`; on `message`, ignore anything not
  starting with `order:`; parse the numeric id and call `cancelExpiredOrder(id)`.
- Subscribe on the `ready` event and add an `error` handler for reconnect safety.
- Close the subscriber cleanly if a stop hook is added later.

**`apps/services/workers/server.js`**

- Import `setupOrderExpiryListener` and call it next to `setupOrderExpiryCron()`.

### 4. order-service: set TTL and socket manual cancel

**`apps/services/order-service/index.js`**

- `await redisInit()` during bootstrap (after `createDatabase`/`testDatabase`).
  Currently `redisInit()` is never called, so the lazy `getRedisClient()` fallback
  returns `undefined` on first use.

**`apps/services/order-service/src/controllers/OrderController.js`**

- `checkoutCartController` (after `COMMIT`, ~line 2731): in a try/catch that never
  fails checkout, set `order:<order_id>` with `EX 1800`.
- `payOrderController` `pending` branch (after `pendingOrderService`, ~line 1625):
  reset the same key with `EX 1800` so the window starts at payment initiation.
- `cancelOrderController` (after `cancelOrderService`, ~line 1121): publish the
  same `order.status_changed` message via `getRedisClient().publish(...)` in a
  best-effort try/catch, so manual cancels notify other open clients.
- Keep `getTTLOrderController` / `GET /ttl-order/:order_id` for debugging.

## Files Touched

| File | Change |
|---|---|
| `apps/services/workers/redis/order-service/orderEvents.js` | New publisher helper |
| `apps/services/workers/redis/order-service/orderExpiry.js` | New idempotent cancel helper |
| `apps/services/workers/redis/order-service/order-expiry-cron.js` | Waiting+Pending, per-order cancel |
| `apps/services/workers/redis/order-service/order-expiry-listener.js` | Rewrite, remove axios, resubscribe |
| `apps/services/workers/server.js` | Register listener |
| `apps/services/order-service/index.js` | Await `redisInit()` |
| `apps/services/order-service/src/controllers/OrderController.js` | TTL writes + manual-cancel event |
| `apps/services/order-service/src/config/redisInit.js` | Fail-fast Redis commands (`enableOfflineQueue: false`, `commandTimeout: 1000`) |
| `apps/services/workers/config/redisInit.js` | Same fail-fast Redis settings |

## Verification

1. Create an order → `GET /ttl-order/:id` returns roughly `1800`.
2. Delete/expire the key in dev Redis → listener cancels the order and the client
   in `order:<id>` receives exactly one `order.status_changed` (`Cancelled`).
3. Insert a stale `Waiting` row and a stale `Pending` row → one cron run cancels
   both and publishes two events.
4. Pay an order, then let its TTL expire → status unchanged (`Preparing` or later),
   no cancellation event.
5. `PATCH /cancel-order/:id` as the owner → `Cancelled` plus one socket event.
6. Restart Redis → worker listener re-subscribes on `ready`; cron still catches
   expirations while Redis is down.
7. `node --check` on every touched `.js` file.

### Verification Results (2026-10-28)

- Checkout through the gateway created order `#1009` as `Waiting`; `GET /ttl-order/1009`
  returned `1796` seconds (about 30 minutes).
- A valid simulated Midtrans `pending` webhook set the order to `Pending` and reset
  the TTL from 30 seconds to `1800`.
- Setting the order to `Preparing` and then expiring the TTL left the status
  unchanged and emitted no `order.status_changed` event.
- The cron canceled stale `Waiting`/`Pending` rows and published per-order events.
- `PATCH /cancel-order/:id` emitted exactly one `order.status_changed`.
- Redis resilience: with Redis stopped, the cron still canceled a stale order while
  the publish failed fast (`enableOfflineQueue: false`). After restarting Redis, the
  listener re-subscribed on `ready`, and both a TTL expiry and a cron run emitted
  exactly one `order.status_changed` each.
- `node --check` passed for every touched file. Test orders/transactions were removed
  and the user cart was restored afterward.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Redis down at checkout | TTL write wrapped in try/catch; cron is the fallback |
| Redis restart/eviction loses timers | Cron sweep remains authoritative after 30 minutes |
| Cron and listener race | Conditional `UPDATE` ensures one cancellation and one event |
| Double socket events | Event only published when the conditional update returns a row |
| Stale TTL after payment | Conditional update skips non-`Waiting`/`Pending` orders |

## Rollout

Deploy workers first (cron + listener are backward-compatible), then order-service
(TTL writes and manual-cancel event). No migration or downtime required.

### Production prerequisite

Redis must emit expired-key events in every environment. `notify-keyspace-events`
must include `E` and `x` (for example `--notify-keyspace-events Ex`). The dev
`infra/docker-compose.yml` already sets this; verify the production Redis
configuration. Without it, the TTL listener never fires and expiry falls back to
the cron only.
