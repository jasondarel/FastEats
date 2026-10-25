# Hybrid Event-Driven Order Pipeline with RabbitMQ Workers and PostgreSQL Outbox
**Date:** 2026-10-25  
**Status:** In Progress — Phase 1 (partial)  
**Revision:** v3 — PostgreSQL Transactional Outbox + RabbitMQ Consumer Pipeline

### Progress Log

| Phase | Step | Status | Commit |
|---|---|---|---|
| 1 | Schema migration: `orders.idempotency_key` + `order_jobs` outbox fields | ✅ Done | `4435a65` |
| 1 | RabbitMQ order topology in workers (`order_exchange`, queues, DLX/DLQ) | ✅ Done | `4435a65` |

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
- [ ] **Redis-to-Socket.IO Bridge:**
  - Add Redis subscriber in `order-service` to listen on `fasteats:order:events` and emit to Socket.IO rooms (`order:${order_id}`).
- [ ] **Payment Create Worker:**
  - Implement `paymentCreateWorker.js`.
  - Connect Midtrans Snap API call and persist token in `snaps` table.
  - Publish `payment.ready` event via Redis bridge.
- [ ] **Outbox Publisher:**
  - Wire an outbox publisher (poller or recurring task) that reads `pending` jobs from `order_jobs`, publishes to RabbitMQ, and marks them `published`.
- [ ] **Update Order Creation:**
  - Attach shipping data to order creation.
  - Insert `payment.create` pending job within order creation transaction.
  - Return 202 with order information.
- [ ] **Verification:** Test duplicate order creation with `Idempotency-Key` and verify fallback `GET /snap/:order_id`.

### Phase 2: State Transitions & Notification Decoupling
- [ ] **Settlement Webhook & Worker:**
  - Update `payOrderController` to insert `order.payment.settled` pending job.
  - Implement `paymentSettledWorker.js` with conditional guard:
    `UPDATE orders SET status = 'Preparing' WHERE order_id = $1 AND status = 'Pending'`
  - Insert `preparing_order` notification outbox job.
- [ ] **Delivering & Completed Workers:**
  - Implement `orderDeliveringWorker.js` with guard `WHERE status = 'Preparing'`.
  - Implement `orderCompletedWorker.js` with guard `WHERE status = 'Delivering'`.
  - Emit status changes through Redis bridge to client Socket.IO.
- [ ] **Notification Queue Separation:**
  - Split `notification_exchange` queue bindings into dedicated queues.
- [ ] **Cleanup & Deprecation:**
  - Safely deprecate old synchronous `payOrderConfirmationController`.
  - Remove legacy synchronous publishing functions in `orderUtil.js`.
