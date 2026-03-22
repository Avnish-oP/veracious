# 🔍 Veracious Backend — Production Readiness Audit

**Date:** June 2025  
**Scope:** Full backend codebase analysis for production-grade e-commerce app with admin dashboard  
**Deployment:** AWS  

---

## Table of Contents

1. [What's Strong](#-whats-strong)
2. [Security](#1--security)
3. [Architecture](#2-%EF%B8%8F-architecture)
4. [Performance](#3--performance)
5. [Error Handling](#4-%EF%B8%8F-error-handling)
6. [Database](#5-%EF%B8%8F-database)
7. [Payment / Orders](#6--payment--orders)
8. [Testing](#7--testing)
9. [DevOps / AWS](#8--devops--aws)
10. [Code Quality](#9--code-quality)
11. [Prioritized Action Plan](#-prioritized-action-plan)

---

## ✅ What's Strong

| # | Strength | Details |
|---|----------|---------|
| 1 | **Solid auth flow** | JWT access + refresh token rotation with Redis-backed storage |
| 2 | **Good security baseline** | Helmet, CORS, compression, rate limiting are all present |
| 3 | **Well-structured Prisma schema** | Proper relations, cascading deletes, `Decimal` types for money |
| 4 | **Caching strategy** | Redis caching with TTL on public product/category routes |
| 5 | **Payment integration** | Both client-verify and webhook paths with idempotency checks |
| 6 | **Admin dashboard** | Comprehensive: order management, coupon CRUD, product CRUD, dashboard stats |
| 7 | **Invoice generation** | GST-compliant PDF invoices with proper tax breakdowns |
| 8 | **Email templates** | Professional HTML templates for all key lifecycle events |
| 9 | **Multi-stage Docker build** | Good practice for minimizing production image size |
| 10 | **TypeScript strict mode** | `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes` all enabled |

---

## 1. 🔒 Security

### 🔴 CRITICAL

#### S1. Sensitive tokens logged to stdout in production

- **File:** `src/controllers/auth/forgot-password.ts:40`
  ```ts
  console.log("Password reset token for testing:", resetToken);
  ```
- **File:** `src/controllers/auth/resendVerification.ts:41`
  ```ts
  console.log("New verification code for testing:", newVerificationCode);
  ```
- **Risk:** Anyone with access to logs (CloudWatch, container stdout) can hijack any account.
- **Fix:** Delete these lines immediately. Use conditional `if (process.env.NODE_ENV !== 'production')` guards at minimum.

#### S2. Client-supplied `shipping` amount in order creation

- **File:** `src/controllers/order/createOrder.ts:83`
  ```ts
  if (shipping) { totalAmount += Number(shipping); }
  ```
- **Risk:** An attacker can send a negative `shipping` value to reduce their total to near-zero.
- **Fix:** Calculate shipping server-side based on address, weight, or a flat-rate lookup. Never trust client-supplied monetary values.

#### S3. Webhook raw body handling is fragile

- **File:** `src/controllers/order/webhook.ts:10`
  ```ts
  const body = (req as any).rawBody || JSON.stringify(req.body);
  ```
- **Risk:** If `rawBody` is unavailable, `JSON.stringify` may produce a different byte sequence than what Razorpay signed, making signature verification unreliable or bypassable.
- **Fix:** Use a dedicated raw-body middleware that reliably saves `req.rawBody` as a Buffer. Verify the route-level `express.raw({ type: "*/*" })` is correctly providing the raw body.

#### S4. `registerStep2` has no auth middleware

- **File:** `src/routes/auth.ts`
  ```ts
  router.post("/register-step-2", registerStep2);
  ```
- **Risk:** Anyone can update any user's face shape and preferred styles by guessing a UUID.
- **Fix:** Add `authMiddleware` to the route and use `req.user.id` instead of `req.body.userId`.

---

### 🟠 HIGH

#### S5. No rate limiting on authentication-critical endpoints

- Login, verify, resend-verification, and forgot-password only have the global 100-req/15-min limiter. A 6-digit verification code (1M combinations) can be brute-forced within that.
- **Fix:** Add a strict per-IP rate limiter (e.g., 5 req/min) on:
  - `/auth/login`
  - `/auth/verify`
  - `/auth/resend-verification`
  - `/auth/forgot-password`

#### S6. Login leaks user existence

- "Invalid email" vs "Invalid password" enables email enumeration.
- **Fix:** Return a generic `"Invalid credentials"` for both cases.

#### S7. Forgot-password leaks user existence

- Returns 404 for non-existent emails.
- **Fix:** Always return 200: `"If an account exists, a reset email has been sent."`

#### S8. No password strength validation

- Any string is accepted as a password.
- **Fix:** Enforce minimum 8 characters, mixed case, and numbers.

#### S9. Verification code uses `Math.random()`

- **File:** `src/utils/authentication.ts`
  ```ts
  return Math.floor(100000 + Math.random() * 900000).toString();
  ```
- **Risk:** Not cryptographically secure; output can be predicted.
- **Fix:** Use `crypto.randomInt(100000, 999999)`.

#### S10. Cookie clear on logout doesn't match set options

- `res.clearCookie("accessToken")` without passing `domain`/`path`/`secure` options won't clear cross-subdomain cookies on `.otticamart.com`.
- **Fix:** Pass the same cookie options (minus `maxAge`) to `clearCookie`.

#### S11. Redis TLS `rejectUnauthorized: false`

- **File:** `src/lib/redis.ts`
- **Risk:** Disables certificate verification — vulnerable to MITM attacks.
- **Fix:** Set to `true` and provide proper CA certs, or use Upstash's default TLS config.

#### S12. No CSRF protection

- With `sameSite: "none"` cookies in production, the app is vulnerable to CSRF.
- **Fix:** Implement CSRF tokens or switch to `sameSite: "lax"` if subdomain sharing allows it.

#### S13. `trust proxy` set AFTER routes

- **File:** `src/index.ts` — `app.set("trust proxy", 1)` is placed after all route registrations.
- **Risk:** Rate limiter reads the proxy's IP instead of the real client IP, making it useless.
- **Fix:** Move `app.set("trust proxy", 1)` to **before** the rate limiter setup.

---

### 🟡 MEDIUM

| ID | Issue | Fix |
|----|-------|-----|
| S14 | Razorpay keys default to `""` instead of failing fast | Throw on startup if not configured |
| S15 | `applyCouponCode` route has no `authMiddleware` — per-user coupon limits won't work | Add auth middleware |
| S16 | Hardcoded company GSTIN placeholder in invoices | Move to env vars |
| S17 | Email sender name is `"Mailtrap Test"` | Change to actual brand name |
| S18 | No `express.json({ limit })` body size limit | Add `express.json({ limit: '1mb' })` |

---

## 2. 🏗️ Architecture

### 🟠 HIGH

#### A1. Coupons route order bug

- **File:** `src/routes/coupons.ts`
  ```ts
  router.get("/:productId", getCouponsByProductId);
  router.get("/by-order-value", getCouponsByValue);
  ```
- **Risk:** Express matches `GET /by-order-value` as `productId = "by-order-value"`.
- **Fix:** Reorder routes — specific paths before parameterized ones.

#### A2. Duplicate PrismaClient in `lensPriceManagement.ts`

- **File:** `src/controllers/admin/lensPriceManagement.ts`
  ```ts
  const prisma = new PrismaClient(); // ← creates a separate connection pool
  ```
- **Risk:** Opens extra database connections under load, potentially exhausting the DB connection limit.
- **Fix:** Import the shared singleton from `utils/prisma.ts`.

#### A3. Redis+DB dual-write without consistency guarantees

- Cart and wishlist write to Redis and DB separately. If one write fails, data drifts silently.
- **Fix:** Use DB as source of truth and Redis as a read-through cache. On cache miss, populate from DB. Invalidate Redis on DB writes.

#### A4. No input validation library

- All validation is ad-hoc `if (!field)` checks. Missing type coercion, length limits, format validation.
- **Fix:** Adopt **Zod** for request body validation schemas on all endpoints.

---

### 🟡 MEDIUM

| ID | Issue | Fix |
|----|-------|-----|
| A5 | No service layer — controllers directly call Prisma | Extract business logic into service classes for testability |
| A6 | Inconsistent API response format (`{ success, message }` vs `{ success, error }` vs `{ message }`) | Standardize on a single response envelope |
| A7 | `Order.items` stored as JSON blob — loses relational integrity | Consider an `OrderItem` model for maintainability |
| A8 | `Review` model has duplicate product relations (`reviews` and `Review` fields) | Clean up to a single relation |
| A9 | `addCart.ts` is a 400+ line mega-file | Split into separate files per function |

---

## 3. ⚡ Performance

### 🟠 HIGH

#### P1. N+1 queries in `getSimilarProducts`

- **File:** `src/controllers/products/getProduct.ts`
- Aggregates reviews per-product in a loop using `Promise.all` with individual queries.
- **Fix:** Use a single raw SQL query or Prisma's `include: { _avg }` pattern.

#### P2. No cache invalidation on product updates

- Admin product CRUD doesn't clear the product cache (1-hour TTL). Users see stale prices/stock.
- **Fix:** After product create/update/delete, invalidate relevant Redis cache keys (`cache:/api/v1/products*`).

#### P3. No database connection pooling configuration

- Default Prisma settings. Under AWS load, this will exhaust connections.
- **Fix:** Configure pool size via `DATABASE_URL` connection params (`?connection_limit=10&pool_timeout=30`) or use **PgBouncer** / **Prisma Accelerate**.

---

### 🟡 MEDIUM

| ID | Issue | Fix |
|----|-------|-----|
| P4 | No pagination on `listOrders` — returns ALL user orders | Add `page`/`limit` query params |
| P5 | Cart/wishlist Redis keys have no TTL — memory grows forever | Set TTL (e.g., 7 days) |
| P6 | LensPrice fetched per cart item instead of batched | Collect all IDs, fetch in a single query |
| P7 | Dashboard makes 11 parallel queries | Consolidate with raw SQL if latency becomes an issue |

---

## 4. 🛡️ Error Handling

### 🟠 HIGH

#### E1. No structured logging

- All logging uses `console.log`/`console.error`. Useless for searching/filtering in CloudWatch.
- **Fix:** Use **Winston** or **Pino** with JSON format, log levels, and CloudWatch integration.

#### E2. No error monitoring

- No Sentry, Datadog, or CloudWatch Logs integration for real-time alerting.
- **Fix:** Add **Sentry** SDK for error tracking with alert rules.

#### E3. Webhook returns 500 on errors

- Razorpay retries on 5xx responses, risking duplicate processing.
- **Fix:** Return 200 after logging the error, or ensure full idempotency handling.

---

### 🟡 MEDIUM

| ID | Issue | Fix |
|----|-------|-----|
| E4 | Controllers catch-all with generic messages, losing error context | Create typed error classes (`NotFoundError`, `ValidationError`, etc.) and let global handler format responses |
| E5 | Silent `.catch(() => {})` in cart deletion within transaction | At least log the error for debugging |

---

## 5. 🗄️ Database

### 🟠 HIGH

#### D1. Missing critical indexes

The following columns are queried frequently but have no indexes:

| Table | Column(s) | Query Pattern |
|-------|-----------|---------------|
| `Order` | `userId` | List user orders |
| `Order` | `paymentStatus` | Dashboard stats, webhook queries |
| `Order` | `status` | Admin order filtering |
| `Order` | `razorpayOrderId` | Webhook lookup |
| `CartItem` | `cartId, productId` | Cart item lookup |

**Fix:** Add `@@index` annotations in `schema.prisma`:
```prisma
model Order {
  // ...existing fields...
  @@index([userId])
  @@index([paymentStatus])
  @@index([status])
  @@index([razorpayOrderId])
}
```

#### D2. `razorpayOrderId` not `@unique`

- Could lead to duplicate payment processing if the same Razorpay order ID appears on multiple records.
- **Fix:** Add `@unique` constraint to `Order.razorpayOrderId`.

#### D3. No soft deletes for products

- Products referenced by orders can be hard-deleted, breaking order history display.
- **Fix:** Add `deletedAt DateTime?` field and filter queries with `WHERE deletedAt IS NULL`.

#### D4. No backup strategy documented

- **Fix:** Enable RDS automated backups + point-in-time recovery on AWS. Consider cross-region read replicas for disaster recovery.

---

### 🟡 MEDIUM

| ID | Issue | Fix |
|----|-------|-----|
| D5 | `Order.userId` is nullable but always required by app logic | Make it required (`String` instead of `String?`) |
| D6 | Inconsistent `Decimal` → `Number` conversion throughout | Create a utility function `toNumber(decimal)` and use consistently |
| D7 | `frameShape` enum defined in schema but Product model uses `String` | Either use the enum or remove the unused enum definition |

---

## 6. 💳 Payment / Orders

### 🔴 CRITICAL

#### O1. Race condition in stock verification

- **File:** `src/controllers/order/verifyOrder.ts`
- Checks stock, then decrements. Under concurrent requests, multiple orders can pass the check before any decrement executes.
- **Fix:** Use atomic `UPDATE ... WHERE stock >= quantity` pattern:
  ```ts
  const result = await tx.product.updateMany({
    where: { id: item.productId, stock: { gte: item.quantity } },
    data: { stock: { decrement: item.quantity } }
  });
  if (result.count === 0) throw new Error('Insufficient stock');
  ```

#### O2. Double-processing between verify and webhook

- Both `verifyOrder` and `razorpayWebhook` process the same payment. The idempotency check (`paymentStatus === "PAID"`) isn't atomic.
- **Fix:** Use `UPDATE WHERE paymentStatus = 'PENDING'` and check the update count to ensure only one processor wins:
  ```ts
  const result = await tx.order.updateMany({
    where: { id: orderId, paymentStatus: 'PENDING' },
    data: { paymentStatus: 'PAID', status: 'PROCESSING' }
  });
  if (result.count === 0) return; // Already processed
  ```

---

### 🟠 HIGH

| ID | Issue | Fix |
|----|-------|-----|
| O3 | Webhook doesn't verify stock before decrementing | Add the same stock availability check as `verifyOrder` |
| O4 | `Payment.orderId` is `@unique` — prevents recording multiple payment attempts for the same order | Remove `@unique`, add composite unique on `[orderId, paymentId]` |
| O5 | No refund flow for cancelled/returned orders | Implement Razorpay refund API integration |
| O6 | No cleanup for abandoned PENDING orders | Add a scheduled job (AWS Lambda + EventBridge) to expire orders older than 30 minutes |

---

### 🟡 MEDIUM

| ID | Issue | Fix |
|----|-------|-----|
| O7 | No idempotency key on order creation | Accept a client-generated idempotency key and deduplicate |

---

## 7. 🧪 Testing

| ID | Severity | Issue | Fix |
|----|----------|-------|-----|
| T1 | 🟠 HIGH | Only unit tests with mocks — no integration tests against a real database | Add integration test suite with a test PostgreSQL instance |
| T2 | 🟠 HIGH | No E2E test for the payment flow | Create test: order creation → Razorpay mock → verification → stock decrement → email |
| T3 | 🟡 MED | One-off scripts (`test-checkout.ts`, `verify-checkout-fixes.ts`) not in test suite | Convert to proper Jest tests |

---

## 8. 🚀 DevOps / AWS

### 🟠 HIGH

#### D-1. Health check doesn't verify dependencies

- **File:** `src/index.ts`
  ```ts
  app.get("/health", (req, res) => {
    res.status(200).json({ message: "ok" });
  });
  ```
- **Risk:** AWS ALB health checks pass even when DB or Redis is down.
- **Fix:**
  ```ts
  app.get("/health", async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await redisClient.ping();
      res.json({ status: "ok", db: "connected", redis: "connected" });
    } catch (e) {
      res.status(503).json({ status: "degraded", error: e.message });
    }
  });
  ```

#### D-2. No graceful shutdown

- In-flight requests are dropped during ECS/EKS deployments.
- **Fix:** Handle `SIGTERM`, stop accepting new connections, drain existing ones, close DB/Redis connections:
  ```ts
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(async () => {
      await prisma.$disconnect();
      redisClient.quit();
      process.exit(0);
    });
  });
  ```

#### D-3. Morgan "dev" format in production

- Colored output is useless in CloudWatch.
- **Fix:** Use `morgan("combined")` in production or a custom JSON format:
  ```ts
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  ```

---

### 🟡 MEDIUM

| ID | Issue | Fix |
|----|-------|-----|
| D-4 | No Prisma migration step in CI/CD pipeline | Run `prisma migrate deploy` as a pre-deployment step (ECS task or CodePipeline step) |
| D-5 | No `.env.example` documenting required env vars | Create one listing all required variables with descriptions |
| D-6 | Mailtrap config throws at import time if token missing — crashes entire app | Lazy-initialize or gracefully degrade |
| D-7 | No Docker `HEALTHCHECK` instruction | Add `HEALTHCHECK CMD wget -q --spider http://localhost:5001/health \|\| exit 1` |
| D-8 | No Node.js memory limits in container | Add `--max-old-space-size=512` (or appropriate) in Dockerfile CMD |

---

## 9. 🧹 Code Quality

### 🟡 MEDIUM

| ID | Issue | Fix |
|----|-------|-----|
| C1 | Excessive `any` types throughout controllers | Define proper interfaces for request bodies, Prisma results, etc. |
| C2 | Hardcoded domain `.otticamart.com` in cookies | Move to `COOKIE_DOMAIN` env var |
| C3 | No API documentation (Swagger/OpenAPI) | Add `swagger-jsdoc` + `swagger-ui-express` |
| C4 | No linting/formatting config visible | Add ESLint + Prettier configs |

### 🟢 LOW

| ID | Issue | Fix |
|----|-------|-----|
| C5 | `registeration.ts` filename typo | Rename to `registration.ts` |
| C6 | Unused import `{ get } from "http"` in `src/routes/coupons.ts` | Remove the import |
| C7 | Server startup message contains emojis/Hindi text | Use a professional log message for production |
| C8 | `upstash.ts` exports `any`-typed search index | Define a proper interface |

---

## 📋 Prioritized Action Plan

### P0 — Fix Immediately (1-2 hours)

| Item | Category | Description |
|------|----------|-------------|
| S1 | Security | Remove token/verification code console.log statements |
| S2 | Security | Remove client-supplied `shipping` — calculate server-side |
| S4 | Security | Add `authMiddleware` to `registerStep2` route |
| S13 | Security | Move `app.set("trust proxy", 1)` before rate limiter |
| A1 | Architecture | Reorder coupons routes (specific before parameterized) |
| A2 | Architecture | Replace duplicate `PrismaClient` in `lensPriceManagement.ts` with shared singleton |

### P1 — This Week (1-2 days)

| Item | Category | Description |
|------|----------|-------------|
| S5 | Security | Add per-endpoint rate limiting on auth routes |
| S6, S7 | Security | Fix user enumeration in login and forgot-password |
| S8 | Security | Add password strength validation |
| S9 | Security | Use `crypto.randomInt()` for verification codes |
| O1, O2 | Payments | Fix stock race condition and double-processing |
| D-1 | DevOps | Add dependency health checks (DB, Redis) |
| D-2 | DevOps | Implement graceful shutdown handler |
| D-3 | DevOps | Fix Morgan log format for production |

### P2 — Next Sprint (2-3 days)

| Item | Category | Description |
|------|----------|-------------|
| D1 | Database | Add missing indexes on Order, CartItem |
| D2 | Database | Add `@unique` on `razorpayOrderId` |
| D3 | Database | Implement soft deletes for products |
| A4 | Architecture | Add Zod input validation on all endpoints |
| E1 | Error Handling | Implement structured logging (Winston/Pino) |
| E2 | Error Handling | Add Sentry for error monitoring |
| P2 | Performance | Implement cache invalidation on product updates |
| P3 | Performance | Configure database connection pooling |

### P3 — Backlog (1-2 weeks)

| Item | Category | Description |
|------|----------|-------------|
| A5 | Architecture | Extract service layer from controllers |
| A6 | Architecture | Standardize API response format |
| C3 | Code Quality | Add Swagger/OpenAPI documentation |
| O5 | Payments | Implement refund flow |
| O6 | Payments | Add abandoned order cleanup scheduled job |
| T1, T2 | Testing | Add integration and E2E test suites |
| S12 | Security | Implement CSRF protection |

---

## Summary

**The app has a strong functional foundation** — auth flows, payment integration, admin dashboard, caching, and email notifications are all present and working. The codebase demonstrates good use of TypeScript strict mode, Prisma ORM, and a multi-stage Docker build.

**The main risks for production are:**

1. **Security holes** — Token logging, client-supplied monetary values, missing auth on endpoints, user enumeration
2. **Data integrity** — Payment race conditions, missing database indexes/constraints
3. **Operational gaps** — No dependency health checks, no graceful shutdown, no structured logging, no error monitoring

**The P0 items (1-2 hours of work) should be fixed before any real production traffic hits this system.** The P1 items should follow within the first week of deployment.

---

*Generated by Codebuff — Production Readiness Audit*
