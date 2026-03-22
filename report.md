# 🔍 Veracious — Full-Stack Application Audit Report

**Date:** July 2025  
**Scope:** Frontend (Next.js 15 + React 19), Admin Panel (Next.js 16), Backend (Express + Prisma + Redis), and cross-cutting integration concerns  
**Existing Backend Report:** See `backend/report.md` for detailed backend-only findings  

---

## Table of Contents

1. [What's Strong](#-whats-strong)
2. [Critical Issues](#-critical-issues)
3. [High-Priority Issues](#-high-priority-issues)
4. [Medium-Priority Issues](#-medium-priority-issues)
5. [Integration Issues](#-integration-issues)
6. [Prioritized Action Plan](#-prioritized-action-plan)
7. [Summary](#summary)

---

## ✅ What's Strong

### Frontend

| # | Strength | Details |
|---|----------|---------|
| 1 | **Modern React patterns** | React Query v5 + Zustand for clean server/client state separation |
| 2 | **Dual cart system** | Guest (localStorage) and authenticated (server) carts with seamless merge-on-login |
| 3 | **Polished UX** | Skeleton loaders, Framer Motion animations, toast notifications, smooth transitions |
| 4 | **Comprehensive product filtering** | URL-driven filters, sort, pagination, search with debounce |
| 5 | **Coupon integration** | Cart-level coupon application with live validation and smart suggestions |
| 6 | **Responsive design** | Mobile-first with Tailwind CSS, adaptive layouts for all screen sizes |
| 7 | **Wishlist with graceful degradation** | Login prompt for unauthenticated users, full CRUD for logged-in users |
| 8 | **Product detail page** | Image gallery, tabs, reviews, recommendations — feature-rich |
| 9 | **Smart checkout flow** | Address selection/creation, coupon application, payment integration |
| 10 | **Guest cart persistence** | localStorage-based guest cart survives page refreshes |

### Admin Panel

| # | Strength | Details |
|---|----------|---------|
| 1 | **Clean UI library** | shadcn/ui + Radix primitives for accessible, consistent components |
| 2 | **Full dashboard stats** | Revenue charts, orders, products, customers, low-stock alerts (Recharts) |
| 3 | **Comprehensive CRUD** | Products, orders, coupons, lens pricing — all manageable from one dashboard |
| 4 | **Order management** | Status updates, invoice downloads, payment tracking, customer info |
| 5 | **Token refresh interceptor** | Automatic retry on 401 with redirect to login on failure |
| 6 | **Zod validation** | Login and product forms use Zod schemas for type-safe validation |
| 7 | **Image upload** | Supabase storage integration with signed URLs |
| 8 | **Coupon management** | Full lifecycle: create, edit, activate/deactivate, delete with usage tracking |

### Integration

| # | Strength | Details |
|---|----------|---------|
| 1 | **Transparent auth** | Backend middleware auto-refreshes tokens; cookies handle cross-request auth |
| 2 | **Cart merge flow** | Guest cart items merge into server cart on login seamlessly |
| 3 | **Consistent API patterns** | Both frontends use Axios with `withCredentials: true` |
| 4 | **Admin role enforcement** | Backend `adminMiddleware` checks role on all `/admin` routes |
| 5 | **Shared payment flow** | Razorpay integration works across frontend → backend → webhook |

---

## 🔴 Critical Issues

### F1. Free Shipping Threshold Mismatch

- **Cart page** (`frontend/src/app/cart/page.tsx:26`):
  ```ts
  const FREE_SHIPPING_THRESHOLD = 999;
  ```
- **Checkout page** (`frontend/src/app/checkout/page.tsx:48`):
  ```ts
  const SHIPPING_COST = itemsTotal > 1000 ? 0 : 50;
  ```
- **Impact:** Users see "FREE shipping unlocked!" in the cart at ₹999, but then get charged ₹50 at checkout because the threshold is ₹1000 there. This is a user-facing pricing inconsistency that will erode trust.
- **Fix:** Extract to a shared constant:
  ```ts
  // utils/constants.ts
  export const FREE_SHIPPING_THRESHOLD = 999;
  ```
  Import and use consistently in both cart and checkout pages.

---

### F2. Client-Side Shipping Amount Sent to Backend

- **File:** `frontend/src/app/checkout/page.tsx:240`
  ```ts
  const orderResponse = await createOrder({
    items,
    addressId: finalAddressId || undefined,
    couponCode: appliedCoupon?.code || undefined,
    shipping: SHIPPING_COST, // ← Client-supplied monetary value
  });
  ```
- **Impact:** This mirrors backend issue **S2** from `backend/report.md`. An attacker can intercept the request and send a negative shipping value to reduce their total to near-zero.
- **Fix:** Remove `shipping` from the client request entirely. The backend should calculate shipping server-side based on order value and delivery address.

---

### A1. Admin API Base URL Mismatch

- **File:** `admin/src/lib/axios.ts:4`
  ```ts
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  ```
- **Backend:** Actually runs on port `5001` (see `backend/src/index.ts`).
- **Impact:** Admin panel won't connect to the backend out of the box in development. Developers must always set `NEXT_PUBLIC_API_URL` env var.
- **Fix:** Change default to `http://localhost:5001/api/v1` to match the backend, or require the env var and fail fast if missing.

---

### A2. No Server-Side Admin Route Protection

- **File:** `admin/src/app/login/page.tsx` — role check is client-side only:
  ```ts
  if (response.data.user?.role !== 'ADMIN') {
    setError('Access Denied. Admins only.');
    return;
  }
  ```
- **No middleware** in the admin Next.js app to protect `/dashboard` routes.
- **Impact:** Any authenticated user can access admin dashboard pages by navigating directly. The backend protects API calls with `adminMiddleware`, but the admin UI renders fully (with empty states or errors) before any API call fails. This leaks admin UI structure.
- **Fix:** Add Next.js middleware in the admin app that checks for an admin session cookie/role before rendering dashboard routes. Example:
  ```ts
  // admin/src/middleware.ts
  export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken');
    if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
  ```

---

### I1. Frontend Missing Token Refresh Interceptor

- **Frontend** (`frontend/src/lib/axios.ts`): Only clears auth state on 401. **No retry.**
  ```ts
  if (error.response?.status === 401) {
    setAuthenticated(false); // Just gives up
  }
  ```
- **Admin** (`admin/src/lib/axios.ts`): Has full retry logic:
  ```ts
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    await api.post('/auth/refresh-token');
    return api(originalRequest); // Retries the failed request
  }
  ```
- **Impact:** Frontend users get logged out on access token expiry even though the refresh token is still valid. The backend middleware does refresh cookies, but if the frontend doesn't retry the failed request, the user sees an error or gets redirected to login unnecessarily.
- **Fix:** Port the admin's interceptor logic to the frontend `lib/axios.ts`.

---

## 🟠 High-Priority Issues

### F3. Duplicate `<WishlistHydration />` in Root Layout

- **File:** `frontend/src/app/layout.tsx:35-36`
  ```tsx
  <WishlistHydration />
  <WishlistHydration />  {/* ← Duplicate */}
  ```
- **Impact:** Fires the wishlist API call twice on every page load. Wastes bandwidth and may cause hydration race conditions.
- **Fix:** Remove the duplicate line.

---

### F4. Homepage Fetches Identical Data Twice

- **File:** `frontend/src/app/page.tsx`
  ```ts
  const { data: allProductsData } = useProducts({ page: 1, limit: 8, category: "sunglasses" });
  const { data: newArrivalsData } = useProducts({ page: 1, limit: 8, category: "sunglasses" });
  // ↑ Exact same query parameters
  ```
- **Impact:** React Query deduplicates by key so only one network request fires, but the **intent is wrong**. The "New Arrivals" section should show recently added products.
- **Fix:** Add a `sort: "newest"` parameter to the new arrivals query, or use a dedicated `/products/new-arrivals` endpoint.

---

### F5. `useUser` Hook State Sync is Incomplete

- **File:** `frontend/src/hooks/useUser.ts:44-49`
  ```ts
  if (user !== undefined) {
    // We only sync if user is defined (loaded).
    // Actually strictly speaking we should sync in useEffect.
  }
  ```
- The comment acknowledges the problem but no `useEffect` is implemented.
- **Impact:** Zustand store (`useUserStore`) may hold stale user data when React Query refreshes.
- **Fix:**
  ```ts
  useEffect(() => {
    if (user !== undefined) {
      setUser(user);
    }
  }, [user, setUser]);
  ```

---

### F6. Multiple API Functions Return `unknown` Type

- **File:** `frontend/src/utils/api.ts`
  ```ts
  export const fetchCategories = async (): Promise<unknown> => { ... };
  export const fetchOrders = async (): Promise<unknown> => { ... };
  export const fetchOrderById = async (orderId: string): Promise<unknown> => { ... };
  export const fetchAddresses = async (): Promise<unknown> => { ... };
  export const addAddress = async (data: any): Promise<unknown> => { ... };
  ```
- **Impact:** No type safety for consumers; forces unsafe type assertions throughout the codebase.
- **Fix:** Define proper response interfaces in `types/` and use as generic parameters.

---

### F7. Homepage is Fully Client-Rendered — No SSR/SEO

- **File:** `frontend/src/app/page.tsx` — starts with `"use client"`
- **Impact:** The most important page for SEO (the homepage) renders as an empty shell for search engine crawlers. No server-side content, no `generateMetadata` for dynamic SEO tags.
- **Fix:** Convert to a server component with React Query server-side prefetching (using `HydrationBoundary` + `dehydrate`), or at minimum use `generateMetadata` for SEO tags.

---

### A3. Admin Login Shares User Login Endpoint

- **File:** `admin/src/app/login/page.tsx` — POSTs to `/auth/login`
- Role check is client-side only after a successful login.
- **Impact:** Regular users can authenticate on the admin panel, receive tokens, and briefly see "Access Denied" after login succeeds. Tokens are still set in cookies.
- **Fix:** Create a dedicated `/auth/admin-login` backend endpoint that validates role server-side, OR add Next.js middleware to the admin app that verifies admin role.

---

### A4. Coupon Form Uses Native FormData Instead of React Hook Form

- **File:** `admin/src/app/dashboard/coupons/page.tsx`
  ```ts
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    // manual extraction...
  };
  ```
- **Impact:** No client-side validation, no field-level error messages, type coercion issues (e.g., `usageLimit` sent as string not number). `react-hook-form` and `zod` are already installed.
- **Fix:** Refactor to use `useForm` + `zodResolver` like the ProductForm component does.

---

### A5. Admin Uses `alert()` / `confirm()` Instead of Proper UI

- **Files:** `products/page.tsx`, `coupons/page.tsx`, `lens-pricing/page.tsx`, `orders/[orderId]/page.tsx`
  ```ts
  if (!confirm("Are you sure you want to delete this product?")) return;
  // ...
  alert("Failed to delete product");
  ```
- **Impact:** Jarring UX that blocks the main thread, inconsistent with the polished shadcn/ui design language. Mobile experience is particularly poor.
- **Fix:** Use shadcn's `AlertDialog` for confirmations and `toast` (from a toast library like sonner or react-hot-toast) for notifications.

---

## 🟡 Medium-Priority Issues

### Frontend

| ID | Issue | File | Fix |
|----|-------|------|-----|
| F8 | `addAddress` uses `any` type parameter | `utils/api.ts` | Define `AddAddressRequest` interface |
| F9 | Cart API double-serializes body | `utils/cartApi.ts` | `cartApiCall` receives already-stringified body via `JSON.stringify()`, then `JSON.parse()`s it back — remove the unnecessary round-trip |
| F10 | `eslint-disable` comments on wrong lines | `cart/page.tsx` | `// eslint-disable-line` is placed on the line after `catch`, not on the unused variable — move to correct location or use `// eslint-disable-next-line` |
| F11 | Payment data stored in `sessionStorage` | `checkout/page.tsx:244` | Fragile — lost on tab close. Consider passing order ID via URL params |
| F12 | Login page copyright says "© 2026 Otticamart" | `auth/login/page.tsx` | Change to `new Date().getFullYear()` for auto-updating |
| F13 | Guest cart uses `JSON.stringify` for deep equality | `guestCart.ts:53` | Works but fragile for object key ordering; use a dedicated deep-equal utility |
| F14 | `ErrorBoundary` component exists but isn't used | Root layout | `ErrorBoundary.tsx` exists in `components/ui/` but isn't wrapping any content |
| F15 | Order detail page redefines interfaces locally | `orders/[id]/page.tsx` | Duplicates types already in `types/orderTypes.ts` — import shared types instead |
| F16 | Wishlist "Add All to Cart" is sequential | `wishlist/page.tsx` | Uses a `for...of` loop — use `Promise.all` for parallel execution |
| F17 | `useUserStore` has empty `fetchUser` method | `store/useUserStore.ts` | Dead code: `fetchUser: async () => {}` — remove entirely |
| F18 | `useProducts` hook has duplicated `fetchProducts` logic | `hooks/useProducts.ts` | Standalone `fetchProducts` function duplicates the inline queryFn logic in `useProducts` hook |

### Admin

| ID | Issue | File | Fix |
|----|-------|------|-----|
| A6 | Hardcoded `ROOT_CATEGORIES` in ProductForm | `ProductForm.tsx` | Fetch root categories from backend dynamically instead of hardcoding slugs |
| A7 | No search debouncing on products page | `products/page.tsx` | Every keystroke triggers a new API query — add 300ms debounce |
| A8 | Commented-out toast import in lens pricing | `lens-pricing/page.tsx` | Either implement toast notifications or clean up dead code |
| A9 | Category sub-selection has flawed fallback logic | `ProductForm.tsx` | When `parentId` lookup fails, falls back to type-based matching which may assign wrong categories for "eyewear" (returns `false` always) |
| A10 | No pagination on coupons page | `coupons/page.tsx` | All coupons loaded at once — will degrade as coupons grow |
| A11 | `ProductForm` `selectedRootCategory` not initialized from `initialValues` | `ProductForm.tsx` | When editing a product, root category starts as `null` even though categories are selected |

---

## 🔗 Integration Issues

| ID | Severity | Issue | Fix |
|----|----------|-------|-----|
| I2 | 🟡 | **No shared type definitions** between frontend, admin, and backend | Consider a shared `types` package, monorepo tooling, or auto-generate types from Prisma schema |
| I3 | 🟡 | **Frontend middleware only checks `refreshToken` cookie** — cross-origin cookies may not be visible in edge middleware | Document this known limitation; ensure `SameSite` and `Domain` cookie settings support edge middleware visibility |
| I4 | 🟡 | **Different error handling patterns** — Frontend uses custom `ExtendedApiError`, admin relies on raw Axios errors | Standardize error handling across both frontends |
| I5 | 🟢 | **Admin doesn't clear cookies on logout** — just redirects to `/login` via `window.location.href` | Add a proper logout API call before redirect |
| I6 | 🟡 | **Root `package.json` has orphaned dependencies** | Root `package.json` lists `cookie-parser`, `crypto`, `ioredis`, `react-hook-form` — these should be in backend/frontend `package.json` files, not root |
| I7 | 🟡 | **Backend `Prisma` schema has duplicate Review relation** | `Product` has both `reviews Review[] @relation("ProductReviews")` and `Review Review[]` — one is redundant (also flagged in backend report as A8) |
| I8 | 🟡 | **Checkout page calculates GST client-side for display** | GST rate (12%) is hardcoded in frontend — should come from backend or product data for accuracy |

---

## 📋 Prioritized Action Plan

### P0 — Fix Immediately (< 1 hour)

| Item | Category | Description |
|------|----------|-------------|
| F1 | Frontend | Unify free shipping threshold to a shared constant (999 vs 1000 mismatch) |
| F2 | Frontend | Remove client-side `shipping` from checkout `createOrder()` call |
| F3 | Frontend | Remove duplicate `<WishlistHydration />` from root layout |
| A1 | Admin | Fix admin default API URL from port 8000 → 5001 |
| F12 | Frontend | Fix copyright year to be dynamic |

### P1 — This Week (1-2 days)

| Item | Category | Description |
|------|----------|-------------|
| I1 | Integration | Add token refresh retry interceptor to frontend Axios (port from admin) |
| F5 | Frontend | Add `useEffect` sync in `useUser` hook for Zustand store |
| A2 | Admin | Add server-side admin route protection (Next.js middleware) |
| A3 | Admin | Create dedicated admin login flow or add role check middleware |
| F4 | Frontend | Fix homepage duplicate query — add proper "new arrivals" sorting |
| A5 | Admin | Replace `alert()`/`confirm()` with shadcn AlertDialog + toast |
| F9 | Frontend | Fix cart API double-serialization issue |

### P2 — Next Sprint (3-5 days)

| Item | Category | Description |
|------|----------|-------------|
| F6 | Frontend | Type all API functions properly (remove `unknown` / `any` returns) |
| F7 | Frontend | Convert homepage to SSR for SEO |
| A4 | Admin | Refactor coupon form to use react-hook-form + Zod |
| A7 | Admin | Add search debouncing to admin products page |
| I2 | Integration | Create shared type definitions across apps |
| F14 | Frontend | Wrap pages in `ErrorBoundary` component |
| A6 | Admin | Fetch root categories dynamically in ProductForm |
| A11 | Admin | Initialize `selectedRootCategory` from `initialValues` in edit mode |

### P3 — Backlog

| Item | Category | Description |
|------|----------|-------------|
| F11 | Frontend | Replace `sessionStorage` with URL-based order tracking |
| F15 | Frontend | Consolidate order types — remove local interface definitions |
| F16 | Frontend | Parallelize "Add All to Cart" with `Promise.all` |
| A8-A10 | Admin | Clean up admin code quality issues |
| I3-I5 | Integration | Standardize error handling and cross-app patterns |
| I6 | Integration | Clean up root `package.json` orphaned dependencies |
| I7 | Integration | Clean up duplicate Review relation in Prisma schema |
| I8 | Integration | Move GST calculation to backend |

---

## Summary

**The application has a strong functional foundation across all three parts.** The frontend offers a polished shopping experience with animations, responsive design, and a thoughtful dual-cart system; the admin panel provides comprehensive management tools with a clean shadcn/ui-based interface; and the backend handles auth, payments, and data management correctly (see `backend/report.md` for detailed backend analysis).

**The main risks for production are:**

1. **User-facing data inconsistency** — Free shipping threshold mismatch (₹999 vs ₹1000) between cart and checkout will confuse customers
2. **Security gaps** — Client-side shipping cost, no server-side admin route protection, shared login endpoint
3. **Auth fragility** — Frontend lacks the token refresh retry that admin has, causing unnecessary logouts
4. **SEO blindspot** — Homepage is fully client-rendered, invisible to search engines
5. **Developer experience** — No shared types, inconsistent error handling, `unknown`/`any` return types

**The P0 items (< 1 hour of work) should be fixed before any user-facing deployment.** They are all quick, low-risk changes that prevent real user impact. The P1 items should follow within the first week.

For backend-specific findings (security vulnerabilities, payment race conditions, database issues, DevOps concerns), refer to the detailed analysis in **`backend/report.md`**.

---

*Generated by Codebuff — Full-Stack Application Audit*
