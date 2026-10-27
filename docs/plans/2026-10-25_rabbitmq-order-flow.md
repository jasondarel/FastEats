# Hybrid Event-Driven Order Pipeline with RabbitMQ Workers and PostgreSQL Outbox
**Date:** 2026-10-25  
**Status:** In Progress — Phase 1 and Phase 2 state transitions verified; notification separation and cleanup pending
**Revision:** v3 — PostgreSQL Transactional Outbox + RabbitMQ Consumer Pipeline

### Progress Log

| Phase | Step | Status | Commit |
|---|---|---|---|
| 1 | Schema migration: `orders.idempotency_key` + `order_jobs` outbox fields | ✅ Done | `4435a65` |
| 1 | RabbitMQ order topology in workers (`order_exchange`, queues, DLX/DLQ) | ✅ Done | `4435a65` |
| 1 | Redis → Socket.IO bridge (`fasteats:order:events` → `order:<id>` rooms) | ✅ Done | `166ad21` |
| 1 | Outbox publisher (`order_jobs` → `order_exchange`, confirm channel, retry) | ✅ Done | `44970b5` |
| 1 | `paymentCreateWorker` (Midtrans Snap → `snaps` → Redis `payment.ready`) | ✅ Done | `44970b5` |
| 1 | `snaps` migration: `redirect_url` + unique `order_id` (upsert) | ✅ Done | `44970b5` |
| 1 | Order creation accepts shipping + queues `payment.create` outbox job (both checkout endpoints) | ✅ Done | — |
| 1 | `Idempotency-Key` lookup + unique conflict handling on order creation | ✅ Done | — |
| 1 | Client: shared checkout shipping modal sends shipping with order creation | ✅ Done | — |
| 1 | Client: consumes `payment.ready` + polls `GET /snap/:order_id` fallback | ✅ Done | — |
| 1 | `payOrderConfirmationController` reuses an existing Snap token (safe fallback) | ✅ Done | — |
| 1 | Fix outbox race: consumer claims `pending`/`published` jobs (message can arrive before the publisher commits `published`) | ✅ Done | — |
| 1 | Runtime verification: real sandbox Snap token created for a test order via the async pipeline | ✅ Done | — |
| 2 | Settlement webhook queues `order.payment.settled` outbox job (settlement + accepted `capture`) | ✅ Done | `e4ba1a5` |
| 2 | `paymentSettledWorker` (claim, conditional `Pending`/`Waiting` → `Preparing`, transaction upsert, `preparing_order` job, Redis `order.status_changed`, retry/DLQ) | ✅ Done | `e4ba1a5` |
| 2 | Client consumes `order.status_changed` (keeps legacy `statusChanged`) | ✅ Done | `e4ba1a5` |
| 2 | Runtime verification: simulated settlement webhook → worker transition → notification job → Socket.IO event; duplicate webhook is a no-op | ✅ Done | `e4ba1a5` |
| 2 | `deliverOrderController` / `completeOrderController` queue `order.delivering` / `order.completed` jobs and return 202; direct status updates and `io.emit` removed | ✅ Done | `ee8026e` |
| 2 | `orderDeliveringWorker` (guard `Preparing` → `Delivering`, Redis `order.status_changed` + legacy `orderDelivering`) | ✅ Done | — |
| 2 | `orderCompletedWorker` (guard `Delivering` → `Completed`, `completed_order` job, Redis `order.status_changed` + legacy `orderCompleted`) | ✅ Done | — |
| 2 | Runtime verification: deliver → complete through the gateway transitions `Preparing → Delivering → Completed`, queues both Redis events, and creates/publishes the completion notification job | ✅ Done | — |

### Environment & Migration Notes

**Database** (applied locally via `prisma db push`; this repo has no Prisma migration history):
- `orders.idempotency_key` — nullable + unique, no backfill required.
- `order_jobs` — `event_id` (DB default `gen_random_uuid()`), `order_id`, `attempts`, `last_error`, plus `(status, created_at)` and `(order_id, routing_key)` indexes.
- `snaps` — `redirect_url` added, `order_id` now unique; `saveSnapTokenService` upserts on conflict.
- Existing rows are compatible. Legacy notification jobs (`preparing_order`, `completed_order`) are intentionally ignored by the outbox publisher.

**Worker environment** (add to each deployed `workers` environment):
- `RABBITMQ_URL`
- `SOCKET_EVENTS_CHANNEL` (default `fasteats:order:events`)
- `MIDTRANS_SERVER_KEY`, `MIDTRANS_SNAP_URL` (server-side API endpoint, e.g. `https://app.sandbox.midtrans.com/snap/v1/transactions` — not `snap.js`), `IS_PRODUCTION`
- Client only: `VITE_MIDTRANS_CLIENT_KEY` and `VITE_MIDTRANS_SNAP_URL` (the `snap.js` script URL).
- Optional: `ORDER_*_QUEUE` / `ORDER_*_ROUTE`, `OUTBOX_POLL_INTERVAL_MS`, `OUTBOX_BATCH_SIZE`, `OUTBOX_MAX_ATTEMPTS`, `PAYMENT_WORKER_MAX_ATTEMPTS`, `PAYMENT_WORKER_RETRY_DELAY_MS`, `PAYMENT_SETTLED_WORKER_MAX_ATTEMPTS`, `PAYMENT_SETTLED_WORKER_RETRY_DELAY_MS`, `ORDER_DELIVERING_WORKER_MAX_ATTEMPTS`, `ORDER_DELIVERING_WORKER_RETRY_DELAY_MS`, `ORDER_COMPLETED_WORKER_MAX_ATTEMPTS`, `ORDER_COMPLETED_WORKER_RETRY_DELAY_MS`, `EMAIL_PREPARING_ORDER_ROUTE` (default `preparing_order`).

**Client**: shipping is now collected before order creation via a shared `CheckoutShippingModal` (Cart and MenuDetails) and sent with `POST /checkout-cart` / `POST /order`. `OrderDetails` consumes `payment.ready` from the Socket.IO bridge and polls `GET /snap/:order_id` as a fallback. The synchronous `pay-order-confirmation` flow remains for older orders and now reuses an existing Snap token.

**Verification**: `node --check` passes for the touched server files and the client `npm run build` succeeds with only pre-existing ESLint warnings. Runtime verification against the Midtrans sandbox passes for the async pipeline through the gateway: `POST /order/order` returned 202, the outbox publisher delivered `payment.create`, the worker created a Snap token and a `snaps` row with a `redirect_url`, the job finished as `completed`, and Redis published `payment.ready` to `order:<id>`. Replaying the same `Idempotency-Key` returned the original order with `idempotent: true`.

Phase 2 settlement runtime verification (sandbox signature, simulated Midtrans webhook through the gateway): `POST /order/pay-order` returned 200 with the order accepted; the outbox publisher delivered `order.payment.settled`; the worker moved a `Waiting` order to `Preparing`, inserted the `transactions` row, created and published the `preparing_order` notification job, and emitted `order.status_changed` to `order:<id>` through Redis. Replaying the same settlement webhook inserted a second settlement job that completed without creating a duplicate notification or changing the order again.

Phase 2 delivering/completed controller verification (`ee8026e`): `PATCH /order/deliver-order/:id` and `PATCH /order/complete-order/:id` both returned 202 and published `order.delivering` / `order.completed`. Order status did **not** change and no Socket.IO event was emitted, because the corresponding workers were not implemented at that point; the messages remained in `order_delivering_queue` / `order_completed_queue`. Test jobs and messages were cleaned up afterwards.

Phase 2 delivering/completed runtime verification (workers registered): `PATCH /order/deliver-order/1003` returned 202, the outbox publisher delivered `order.delivering`, and `orderDeliveringWorker` moved the order `Preparing → Delivering`, publishing `order.status_changed` and legacy `orderDelivering` to `order:1003`. `PATCH /order/complete-order/1003` returned 202 and `orderCompletedWorker` moved it `Delivering → Completed`, inserted a `completed_order` notification job (published by the existing order-service 5-second cron and consumed by notification-service), and published `order.status_changed` plus legacy `orderCompleted`. The test jobs were deleted, order `1003` was restored to `Preparing`, and both new queues drained to 0. Notification delivery still runs through the legacy cron and currently fails in dev because the SMTP credentials are placeholders.

**Runtime notes**:
- The outbox publisher publishes while its job-status update is still uncommitted. Consumers must claim jobs with status `pending` **or** `published`; claiming only `published` lets the consumer see `pending`, skip/ack the message, and leave the job stuck. This is fixed in `claimJob`.
- Midtrans retains Snap `order_id`s across database resets. Reusing low sequential IDs fails with `transaction_details.order_id sudah digunakan`; advance `orders_order_id_seq` (or use a fresh sandbox account) when re-testing against a reset local database.
- `paymentSettledWorker` accepts `Waiting` as well as `Pending` because settlement can arrive before the pending webhook. Duplicate settlement jobs are harmless: only the first conditional update returns a row, and later jobs complete without inserting another `preparing_order` job.
- Startup ordering caveat: if `workers` or `order-service` start before RabbitMQ/Redis is reachable, worker consumers are not attached and the Socket.IO bridge may remain unsubscribed until the process restarts. Start infrastructure first (or restart the apps after Docker). Automatic reconnect/re-subscription is a follow-up.
- `.env.dev` files are gitignored (they hold local sandbox credentials), so no secrets enter the commit.

---

## Goal & Architecture Overview

The order pipeline uses **PostgreSQL as the source of truth** and **RabbitMQ for asynchronous payment, state-transition, and notification workers**. 

Order events are persisted as **outbox jobs (`order_jobs`) within the same database transaction** before publication, guaranteeing that no event is lost if RabbitMQ or the network is temporarily unavailable. A dedicated publisher process moves jobs to RabbitMQ, while workers asynchronously execute the heavy tasks and report state changes back to PostgreSQL and real-time clients via a Redis-to-Socket.IO bridge.

```
API (order-service)
  ├── 1. Validate & Auth & Idempotency Check
  ├── 2. Mutate DB (orders / transactions / snaps)
  ├── 3. Insert Outbox Job (order_jobs, status: 'pending')
  ├── 4. Commit DB Transaction
  └── 5. Return 200/202 Response

Publisher (Outbox Poller / CDC)
  ├── 1. Poll/Fetch pending jobs from order_jobs
  ├── 2. Publish message to RabbitMQ exchange
  └── 3. Update job status: 'pending' → 'published'

Worker (workers service)
  ├── 1. Consume message from RabbitMQ queue (with event_id idempotency check)
  ├── 2. Mark job/event status: 'processing'
  ├── 3. Execute business logic (Midtrans Snap, conditional DB state updates)
  ├── 4. If generating new event (e.g. notification): insert new order_job ('pending')
  ├── 5. Publish real-time events via Redis Pub/Sub to order-service Socket.IO
  ├── 6. Mark job: 'completed' (or 'failed' + retry / DLQ)
  └── 7. Acknowledge message (ack)
```

---

## Order Job Lifecycle & Status Semantics

The lifecycle of an outbox job and asynchronous task follows a strict state transition:

```
                  ┌───────────────┐
                  │    pending    │  (Inserted by API/Worker inside DB transaction)
                  └───────┬───────┘
                          │  (Published to RabbitMQ by Outbox Publisher)
                          ▼
                  ┌───────────────┐
                  │   published   │  (In RabbitMQ exchange/queue)
                  └───────┬───────┘
                          │  (Consumer picks up message)
                          ▼
                  ┌───────────────┐
                  │  processing   │  (Worker actively executing)
                  └───────┬───────┘
             ┌────────────┴────────────┐
             ▼                         ▼
     ┌───────────────┐         ┌───────────────┐
     │   completed   │         │    failed     │  (Error / Retried up to 3x → DLQ)
     └───────────────┘         └───────────────┘
```

| Status | Meaning | Owned By |
|---|---|---|
| `pending` | Job stored in DB, waiting for publisher to deliver to RabbitMQ | API or Worker DB transaction |
| `published` | Successfully delivered to RabbitMQ exchange | Outbox Publisher |
| `processing` | Consumer has picked up the event and is actively executing | Worker consumer |
| `completed` | Worker successfully finished all business logic & mutations | Worker consumer |
| `failed` | Error occurred; awaiting retry or sent to Dead Letter Queue (DLQ) | Worker consumer / Publisher |

---

## Idempotency & Data Model Changes

### 1. Database Schema Updates

#### `orders` Table
```prisma
model orders {
  // ... existing fields ...
  idempotency_key   String?       @unique @db.VarChar(100)
}
```
* **Purpose:** If `POST /checkout-cart` or `POST /order` is retried with the same `Idempotency-Key` header, the API returns the existing order record immediately without creating duplicate orders or duplicate outbox jobs.

#### `order_jobs` (Outbox & Job Tracking)
```prisma
model order_jobs {
  id          Int      @id @default(autoincrement())
  event_id    String   @unique @default(uuid()) @db.VarChar(100)
  order_id    Int?
  routing_key String   @db.VarChar(100)
  payload     Json
  status      String   @default("pending") @db.VarChar(30) // pending | published | processing | completed | failed
  attempts    Int      @default(0)
  last_error  String?  @db.Text
  created_at  DateTime @default(now())
  updated_at  DateTime @default(now())

  @@index([status, created_at])
  @@index([order_id, routing_key])
}
```

#### Event Envelope Standard
Every message published to RabbitMQ contains an explicit event envelope:
```json
{
  "event_id": "c1f7a0b3-9821-4f12-a7d0-123456789abc",
  "event": "payment.create",
  "order_id": 123,
  "payload": {
    "user_id": 45,
    "gross_amount": 125000,
    "shipping": { ... }
  },
  "timestamp": "2026-10-25T14:30:00Z"
}
```

### 2. Inbound Worker Idempotency Guard
Consumers do not rely on fragile `SELECT order_id + routing_key + status = published` queries. Instead:
1. Each incoming message has an `event_id`.
2. Worker checks `order_jobs` by `event_id` or executes atomic status transitions:
```sql
UPDATE order_jobs
SET status = 'processing',
    attempts = attempts + 1,
    updated_at = NOW()
WHERE event_id = $1
  AND status = 'published'
RETURNING *;
```
If no rows are updated: the event has already been picked up, is currently processing, or is already completed. The consumer acknowledges and safely discards duplicate messages.

---

## End-to-End Order Flow (Target Architecture)

```
1. POST /checkout-cart (API: order-service)
   ├── Validate cart, items, prices, shipping
   ├── Check idempotency_key (return cached order if present)
   ├── BEGIN DB TRANSACTION
   │     INSERT orders (status: 'Waiting', idempotency_key: ...)
   │     INSERT order_items & add-ons
   │     INSERT order_jobs (routing_key: 'payment.create', status: 'pending', event_id: uuid())
   ├── COMMIT
   └── Return 202 Accepted { order_id, status: 'Waiting' }

2. Outbox Publisher (order-service / background worker)
   ├── Fetch pending jobs: SELECT * FROM order_jobs WHERE status = 'pending' FOR UPDATE SKIP LOCKED
   ├── Publish to order_exchange [routing_key: 'payment.create']
   └── UPDATE order_jobs SET status = 'published'

3. paymentCreateWorker (workers service)
   ├── Atomic transition: status 'published' → 'processing'
   ├── Call Midtrans Snap API (gross_amount, order_id, customer, shipping)
   ├── Persist token & redirect_url to `snaps` table
   ├── Mark job 'completed'
   └── Publish to Redis Pub/Sub:
         Channel: `socket:order_events`
         Payload: { "event": "payment.ready", "order_id": 123, "snap_token": "...", "redirect_url": "..." }
         (order-service bridge forwards this to Socket.IO room `order:123`)

4. Client Frontend
   ├── Receives Socket.IO `payment.ready` event → opens Midtrans Snap UI
   └── Fallback: Polls `GET /snap/:order_id` if socket disconnected

5. Midtrans Webhooks (POST /pay-order in order-service API)
   ├── Verify signature hash
   ├── Branch A: transaction_status === 'pending'
   │     Update transactions record
   │     Order stays status: 'Pending'
   │     Return 200 OK
   │
   └── Branch B: transaction_status === 'settlement' / 'capture'
         INSERT order_jobs (routing_key: 'order.payment.settled', status: 'pending')
         Return 200 OK to Midtrans immediately

6. Outbox Publisher
   └── Publishes 'order.payment.settled' to order_exchange → status: 'published'

7. paymentSettledWorker (workers service)
   ├── Atomic transition: status 'published' → 'processing'
   ├── Conditional DB state transition:
   │     UPDATE orders 
   │     SET status = 'Preparing', updated_at = NOW() 
   │     WHERE order_id = $1 AND status = 'Pending' 
   │     RETURNING *;
   │     (If no rows returned: order already updated or invalid state → ack & stop)
   ├── Upsert transaction record
   ├── Insert new outbox job for notification:
   │     INSERT order_jobs (routing_key: 'preparing_order', status: 'pending')
   ├── Mark settlement job 'completed'
   ├── Emit Redis Socket.IO event: { "event": "order.status_changed", "order_id": 123, "status": "Preparing" }
   └── ack(msg)

8. Outbox Publisher & Notification Consumer
   ├── Publisher picks up 'preparing_order' pending job → publishes to notification_exchange
   └── notification-service consumes message → renders email template → sends email to owner & customer

9. Seller Marks Delivering (PATCH /deliver-order/:order_id)
   ├── API validates seller ownership
   ├── API inserts order_jobs (routing_key: 'order.delivering', status: 'pending')
   └── Return 202 Accepted

10. orderDeliveringWorker
    ├── Conditional update:
    │     UPDATE orders SET status = 'Delivering', updated_at = NOW()
    │     WHERE order_id = $1 AND status = 'Preparing' RETURNING *;
    ├── Emit Redis Socket.IO: { "event": "order.status_changed", "order_id": 123, "status": "Delivering" }
    └── Mark job 'completed' & ack(msg)

11. Customer Marks Completed (PATCH /complete-order/:order_id)
    ├── API validates customer ownership
    ├── API inserts order_jobs (routing_key: 'order.completed', status: 'pending')
    └── Return 202 Accepted

12. orderCompletedWorker
    ├── Conditional update:
    │     UPDATE orders SET status = 'Completed', updated_at = NOW()
    │     WHERE order_id = $1 AND status = 'Delivering' RETURNING *;
    ├── Insert outbox job: (routing_key: 'completed_order', status: 'pending')
    ├── Emit Redis Socket.IO: { "event": "order.status_changed", "order_id": 123, "status": "Completed" }
    └── Mark job 'completed' & ack(msg)
```

---

## Real-Time Socket.IO & Redis Bridge

Workers run in a separate process/container (`apps/services/workers`) from `order-service` and do not hold direct WebSocket connections to browser clients.

### Redis Pub/Sub Bridge Architecture
```
[Worker Process]
  │
  │ Redis PUBLISH channel: "fasteats:order:events"
  │ {
  │   "room": "order:123",
  │   "event": "payment.ready",
  │   "data": { "snap_token": "...", "redirect_url": "..." }
  │ }
  ▼
[Redis Server]
  │
  ▼
[order-service Subscriber]
  │
  │ io.to(message.room).emit(message.event, message.data)
  ▼
[Connected Web / Mobile Client]
```

### Standardized Room & Event Naming Conventions
* **Rooms:**
  * Order-specific room: `order:${order_id}` (e.g. `order:123`)
  * User-specific room: `user:${user_id}` (e.g. `user:45`)
* **Events:**
  * `payment.ready` — Payload contains `{ order_id, snap_token, redirect_url }`
  * `order.status_changed` — Payload contains `{ order_id, status, updated_at }`

---

## Exchange, Queue, and DLQ Design

### 1. `order_exchange` (Direct, Durable)
```
Exchange: order_exchange
Type:     direct
Durable:  true
```

| Queue | Routing Key | Arguments / DLX | Consumer |
|---|---|---|---|
| `order_payment_create_queue` | `payment.create` | `x-dead-letter-exchange: order_dead_letter_exchange`, `x-dead-letter-routing-key: order.dlq` | `paymentCreateWorker.js` |
| `order_payment_settled_queue` | `order.payment.settled` | `x-dead-letter-exchange: order_dead_letter_exchange`, `x-dead-letter-routing-key: order.dlq` | `paymentSettledWorker.js` |
| `order_delivering_queue` | `order.delivering` | `x-dead-letter-exchange: order_dead_letter_exchange`, `x-dead-letter-routing-key: order.dlq` | `orderDeliveringWorker.js` |
| `order_completed_queue` | `order.completed` | `x-dead-letter-exchange: order_dead_letter_exchange`, `x-dead-letter-routing-key: order.dlq` | `orderCompletedWorker.js` |

### 2. `order_dead_letter_exchange` (DLX) & DLQ
```
Exchange: order_dead_letter_exchange (direct, durable)
Queue:    order_dlq
Binding:  routing key 'order.dlq'
```

### 3. Retry Policy & Anti-Infinite-Loop Rules
* **Max Attempts:** 3 retries.
* On error in consumer:
  1. Increment `attempts` and record `last_error` in `order_jobs`.
  2. If `attempts < 3`: Reject and requeue, or republish with delay.
  3. If `attempts >= 3`: `channel.nack(msg, false, false)` → RabbitMQ routes the message directly to `order_dead_letter_exchange` -> `order_dlq`.
  4. **DO NOT** use unconstrained `nack(msg, false, true)` as it causes catastrophic poison-pill infinite retry loops.

### 4. Notification Queues (Technical Debt Note)
* In current code, `notification_exchange` binds `email_verification_queue` to multiple routing keys (`preparing_order`, `completed_order`).
* **Planned Refactor (Phase 2):** Introduce separate dedicated queues:
  * `order_preparing_notification_queue` bound to `preparing_order`
  * `order_completed_notification_queue` bound to `completed_order`
  * Keep `email_verification_queue` solely for user registration verification.

---

## Shipping Data & Payment Controller Transition Strategy

### The Problem
In the original flow, shipping addresses and contact details are collected during the payment confirmation step (`payOrderConfirmationController`).
If `payOrderConfirmationController` is deleted immediately, client checkout flows that submit shipping details at that point will break.

### Safe Transition Plan
1. **Move Shipping Input Upstream:** Update checkout API / client form so shipping information (`shipping_province`, `shipping_city`, `shipping_district`, `shipping_village`, `shipping_address`, `shipping_phone`, `shipping_name`) is supplied during order creation (`POST /checkout-cart` or `POST /order`).
2. **Preserve `payOrderConfirmationController` during Migration:**
   * Keep `payOrderConfirmationController` operational as a fallback endpoint.
   * If invoked, it checks if a Snap token already exists in `snaps`. If so, it returns the existing token.
   * Only deprecate and remove `payOrderConfirmationController` after client migration and end-to-end integration tests are verified.

---

## Phased Implementation Roadmap

### Phase 1: Foundations & Async Payment Creation (Non-Breaking)
- [x] **Schema Migration:** *(commit `4435a65`)*
  - Add `idempotency_key` unique constraint to `orders`.
  - Add `event_id`, `order_id`, `attempts`, and `last_error` to `order_jobs`.
  - `event_id` uses a DB-level default (`gen_random_uuid()`) instead of client-side `uuid()` because job rows are also inserted via raw SQL in workers.
- [x] **RabbitMQ Infrastructure in Workers:** *(commit `4435a65`)*
  - Create `apps/services/workers/config/rabbitMQInit.js` with `order_exchange`, queues, and `order_dead_letter_exchange`.
- [x] **Redis-to-Socket.IO Bridge:** *(commit `166ad21`)*
  - Add Redis subscriber in `order-service` to listen on `fasteats:order:events` and emit to Socket.IO rooms (`order:${order_id}`).
  - Room joins handled via `joinOrder` and `joinUser`; no ownership auth yet (documented as a follow-up).
- [x] **Payment Create Worker:** *(commit `44970b5`)*
  - Implement `paymentCreateWorker.js`.
  - Connect Midtrans Snap API call and persist token in `snaps` table.
  - Publish `payment.ready` event via Redis bridge.
  - Atomic `published → processing` guard, reuse existing Snap token on retry, 3 attempts → DLQ.
- [x] **Outbox Publisher:** *(commit `44970b5`)*
  - Wire an outbox publisher (poller or recurring task) that reads `pending` jobs from `order_jobs`, publishes to RabbitMQ, and marks them `published`.
  - Filters to order routing keys so legacy notification jobs stay with the `order-service` cron.
- [x] **Update Order Creation:**
   - Attach shipping data to order creation (optional; legacy requests without shipping still use `payOrderConfirmationController`).
   - Insert `payment.create` pending job within order creation transaction.
   - Return 202 with order information.
   - Read `Idempotency-Key`, return the existing order on replay, and resolve unique conflicts.
- [x] **Client Migration:**
   - Collect shipping before order creation through a shared checkout shipping modal.
   - Consume `payment.ready` on `OrderDetails` and poll `GET /snap/:order_id` as a fallback.
   - Keep the synchronous `pay-order-confirmation` fallback for older orders.
- [x] **Verification:** Test duplicate order creation with `Idempotency-Key` and verify fallback `GET /snap/:order_id`.

### Phase 2: State Transitions & Notification Decoupling
- [x] **Settlement Webhook & Worker:** *(commit `e4ba1a5`)*
  - `payOrderController` now inserts an `order.payment.settled` pending job for `settlement` and accepted `capture` webhooks, then returns 200 without touching order state.
  - `paymentSettledWorker.js` claims the job, runs the conditional guard (`AND status IN ('Pending', 'Waiting')`), upserts the `transactions` row, inserts the `preparing_order` notification outbox job, and emits `order.status_changed` via the Redis bridge.
  - Duplicate webhooks are safe: a job that finds the order already past the guard completes without a notification; retries re-emit the status event when the transition already committed.
- [x] **Delivering & Completed Workers:** *(controllers `ee8026e`; workers uncommitted)*
  - [x] `deliverOrderController` / `completeOrderController` queue `order.delivering` / `order.completed` jobs and return 202.
  - [x] Implement `orderDeliveringWorker.js` with guard `WHERE status = 'Preparing'`.
  - [x] Implement `orderCompletedWorker.js` with guard `WHERE status = 'Delivering'`; insert the `completed_order` notification job from `payload.order_details`.
  - [x] Register both consumers in `workers/server.js`.
  - [x] Emit status changes through the Redis bridge to client Socket.IO (`order.status_changed`, plus legacy `orderDelivering`/`orderCompleted`).
  - [x] Runtime verification: deliver/complete update order status in the DB and publish the socket events.
- [ ] **Notification Queue Separation:**
  - Split `notification_exchange` queue bindings into dedicated queues.
- [ ] **Cleanup & Deprecation:**
  - Safely deprecate old synchronous `payOrderConfirmationController`.
  - Remove legacy synchronous publishing functions in `orderUtil.js`.
