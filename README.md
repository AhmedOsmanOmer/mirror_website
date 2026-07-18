# Mirror Business Cards

A full-stack Laravel app for a plastic mirror business card ordering platform: one side is a mirror
finish, the other is fully customizable in an in-browser design studio. The frontend is
[Inertia.js](https://inertiajs.com) + React, served by this same Laravel app (not a separate SPA) —
styled with Tailwind CSS, animated with Framer Motion and GSAP, and fully bilingual (English/Arabic,
with RTL layout). A token-based JSON API under `/api/*` also exists (originally built for a separate
frontend) and is now reused by the Inertia app itself via Sanctum's SPA session auth — see
[Frontend architecture](#frontend-architecture) below.

## Stack

- Laravel 13, PHP 8.3+ · MySQL (Eloquent ORM + migrations)
- Inertia.js + React 19, Tailwind CSS v4, Framer Motion + GSAP, Fabric.js (design studio canvas)
- Laravel Sanctum — SPA session auth for the frontend, personal-access tokens for any external API client
- Stripe PHP SDK (Checkout Sessions + webhooks)
- Laravel Mail (Mailtrap in dev, any SMTP/provider in prod)
- barryvdh/laravel-dompdf (server-side card design PDF generation)

## Setup

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate

# Create a MySQL database matching DB_DATABASE in .env, then:
php artisan migrate

# Required once so generated design PDFs are publicly downloadable at /storage/...
php artisan storage:link

# Grant an existing (verified) user admin access, once you have one:
php artisan admin:promote you@example.com

# Run the app (server + queue worker + Vite dev server), or just `php artisan serve` + `npm run dev`
composer dev
```

Emails (verification codes, password reset codes) are queued (`database` queue driver), so a queue
worker must be running — `composer dev` already starts one via `queue:listen`.

### Environment variables

See `.env.example` for the full list. Key groups:

- **DB**: `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` (MySQL)
- **Mail**: `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`
  (point at Mailtrap sandbox SMTP for dev, your real provider for prod)
- **Stripe**: `STRIPE_KEY` (publishable, used by frontend), `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`
- **App**: `APP_KEY`, `APP_URL`, `FRONTEND_URL` (used to build Stripe redirect URLs — same origin as
  `APP_URL` now that the frontend is served by this app), `CORS_ALLOWED_ORIGINS` (only relevant to an
  external API client; same-origin Inertia traffic doesn't need CORS),
  `SANCTUM_STATEFUL_DOMAINS` (host:port pairs allowed to authenticate `/api/*` via session cookie instead
  of a Bearer token — must include wherever you actually run the app, e.g. `localhost:8000`)
- **Pricing**: `CARD_FOIL_FEE_CENTS`, `CARD_CURRENCY` (quantity tiers themselves are fixed price points in
  `config/cards.php` → `pricing_tiers`, not env-tunable)

Pricing is tiered by quantity, not a linear per-card rate — a customer picks one of the fixed quantities
in `config('cards.pricing_tiers')` (100/200/250/300/500/1000) and pays that tier's flat price, plus an
optional flat `foil_fee_cents` add-on. Shipping is calculated separately (not included in this price) and
production has a 4-week lead time — both surfaced as notices in the studio and order pages, not enforced
by the backend.

Card dimensions (`config/cards.php` → `width_mm`/`height_mm`, fixed at 85×50) and the allowed font list
(`config/fonts.php` → `allowed`) are hardcoded config rather than env vars or per-order input, since
they're product constants, not customer choices.

### Stripe webhook (local dev)

```bash
stripe listen --forward-to localhost:8000/api/stripe/webhook
```

Copy the `whsec_...` signing secret it prints into `STRIPE_WEBHOOK_SECRET`.

## Frontend architecture

The Inertia/React frontend lives under `resources/js/` and is served by this same Laravel app — there's
no separate frontend deployment. It reuses the `/api/*` controllers documented below for every data
operation (register, verify, orders, checkout, admin, etc.) rather than duplicating that logic: Sanctum's
`EnsureFrontendRequestsAreStateful` middleware (prepended to the `api` middleware group in
`bootstrap/app.php`) lets a first-party browser session authenticate `/api/*` requests via cookie + CSRF,
with no Bearer token anywhere in the frontend. `resources/js/lib/api.js` is the axios instance used for
this (`withCredentials`, `withXSRFToken`).

The only backend surface that's genuinely new for the frontend (not shared with the API) is:

- **Session login/logout** — `POST /login` and `POST /logout` (`AuthenticatedSessionController`). The
  existing `POST /api/auth/login` issues a Bearer token, which isn't useful for a session-based app, so
  the frontend uses this instead. Registration, email verification, and password reset still go straight
  through the existing `/api/auth/*` endpoints (no session needed for those, they're guest actions).
- **Page routes** (`routes/web.php`) — thin controllers under `app/Http/Controllers/Web/` that just
  `Inertia::render(...)`, reusing `UserResource`/`OrderResource` for prop shape parity with the API.
- **The design-PDF endpoint's input** — `POST /api/orders/{id}/design-pdf` now accepts an uploaded
  `design_image` (the studio canvas exported as a PNG) instead of structured text fields, since the studio
  is a free-form canvas, not a fixed-field form. See `CardDesignPdfService`.

### Pages

| Route | Page | Notes |
|---|---|---|
| `/` | `Pages/Landing.jsx` | Animated hero (GSAP mirror-card flip), scroll reveals, product showcase |
| `/signup` | `Pages/Auth/Signup.jsx` | Signup → 6-digit email verification → auto session-login → `/studio` |
| `/login` | `Pages/Auth/Login.jsx` | Inertia form; validation errors via Laravel's normal flashed-error flow |
| `/forgot-password` | `Pages/Auth/ForgotPassword.jsx` | Request code → enter code + new password |
| `/studio` | `Pages/Studio/Index.jsx` | Design → order details → review wizard (own component state, not separate page visits, so the Fabric canvas is never unmounted mid-flow) |
| `/orders/{id}` | `Pages/Orders/Show.jsx` | Checkout success/cancel banner, order summary, design PDF download, retry-checkout for still-pending orders |
| `/dashboard` | `Pages/Dashboard/Index.jsx` | Editable profile, order history |
| `/admin/orders` | `Pages/Admin/Orders.jsx` | Admin-only order table with inline status updates |

`Context/LanguageContext.jsx` drives the English/Arabic language switcher (`i18n/en.js`, `i18n/ar.js`),
toggling `<html lang dir>` between `ltr`/`rtl`; layout components use logical Tailwind spacing
(`ps-`/`pe-`/`ms-`/`me-`) so both directions render correctly.

## Auth model

All authenticated endpoints expect a Sanctum bearer token:

```
Authorization: Bearer <token>
```

Every `api/*` request is forced to be treated as a JSON request regardless of headers sent
(`App\Http\Middleware\ForceJsonResponse`, prepended to the `api` middleware group), and
`bootstrap/app.php` forces JSON error rendering for all `api/*` routes. In practice this means the
API never returns an HTML redirect or error page — auth/validation/authorization failures are always
JSON, even if the frontend forgets an `Accept` header.

New accounts must verify their email (6-digit code) before they can access `/api/profile`, `/api/orders`,
or the admin endpoints — those routes are behind both `auth:sanctum` and `verified` middleware.

## Error responses

- **Validation (422)**: `{"message": "The email field is required.", "errors": {"email": ["The email field is required."]}}`
- **Unauthenticated (401)**: `{"message": "Unauthenticated."}`
- **Unauthorized (403)**: `{"message": "This action is unauthorized."}`
- **Unverified email (403)**: `{"message": "Your email address is not verified."}`
- **Not found (404)**: `{"message": "No query results for model [App\\Models\\Order] 5"}`

## Routes

Base URL: `/api`

### Auth (`/api/auth`) — public unless noted

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password, password_confirmation, phone }` | `201` `{ message, user }`. Sends a 6-digit verification code by email. |
| POST | `/auth/verify-email` | `{ email, code }` | `200` `{ message, user, token }`. Marks the account verified and issues a Sanctum token — treat this as the "finish signup" step. |
| POST | `/auth/resend-verification` | `{ email }` | `200` `{ message }`. Issues and emails a new code. |
| POST | `/auth/login` | `{ email, password }` | `200` `{ user, token }`. Works even if unverified — the token just won't unlock `verified`-gated routes yet. |
| POST | `/auth/forgot-password` | `{ email }` | `200` `{ message }`. Emails a 6-digit reset code. |
| POST | `/auth/reset-password` | `{ email, code, password, password_confirmation }` | `200` `{ message }`. Revokes all existing tokens for the user (forces re-login). |
| POST | `/auth/logout` | *(auth required)* — none | `200` `{ message }`. Revokes the current access token only. |

### Profile (`/api/profile`) — `auth:sanctum` + `verified`

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/profile` | — | `200` `{ user }` |
| PUT | `/profile` | `{ name?, email?, phone? }` (all optional, `sometimes`-validated) | `200` `{ message, user }`. Changing `email` clears `email_verified_at`, requiring re-verification (not currently exposed via an endpoint — extend `resend-verification` to accept an authenticated user if you need this in the frontend). |

### Orders (`/api/orders`) — `auth:sanctum` + `verified`

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/orders` | — | `200` `{ orders: [...], meta: { current_page, last_page, per_page, total } }`. Only the caller's own orders, paginated 15/page. |
| POST | `/orders` | see below | `201` `{ message, order }` |
| GET | `/orders/{id}` | — | `200` `{ order }`. Owner or admin only (403 otherwise, via `OrderPolicy`). |
| POST | `/orders/{id}/checkout` | — | `200` `{ checkout_url, session_id }`. Owner or admin only; order must still be `pending`. Redirect the browser to `checkout_url`. |
| POST | `/orders/{id}/design-pdf` | see below | `200` `{ message, order }`. Owner or admin only. Generates the card design PDF and attaches it to the order. |

**`POST /orders` body:**

```json
{
  "selected_color": "#6CC0A8",
  "font_family": "Helvetica",
  "orientation": "horizontal",
  "quantity": 250,
  "foil": true,
  "company_name": "Acme Inc",
  "shipping_name": "Jane Doe",
  "shipping_phone": "+1 555 000 1111",
  "shipping_address_line1": "123 Main St",
  "shipping_address_line2": "Suite 4",
  "shipping_city": "Springfield",
  "shipping_state": "IL",
  "shipping_postal_code": "62704",
  "shipping_country": "US"
}
```

- `selected_color` must be a valid hex color (`/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/`, e.g. `#6CC0A8` or `#FFF`) — any color is accepted, it is no longer limited to a fixed palette.
- `font_family` must be one of the keys in `config/fonts.php` (`allowed`) — currently `Helvetica`, `Arial`, `Times New Roman`, `Georgia`, `Courier New`, `Verdana`. This is an allow-list specifically to keep unsafe/arbitrary values out of the generated PDF.
- `orientation` is required and must be `horizontal` or `vertical` (defaults to `vertical` at the database level, but the API always requires it explicitly). It does not change the physical card area, just which edge is 85mm vs 50mm — `horizontal` is 85mm wide × 50mm tall (landscape), `vertical` is 50mm wide × 85mm tall (portrait). The design PDF is generated at whichever size matches the order's orientation.
- `quantity` must be one of the keys in `config('cards.pricing_tiers')` — currently `100`, `200`, `250`, `300`, `500`, `1000`. Each tier has a fixed flat price (not `unit_price × quantity`).
- `foil` is optional (defaults to `false`) and adds `config('cards.foil_fee_cents')` as a flat fee regardless of quantity.

Pricing (`base_price_cents`, `foil_fee_cents`, `total_amount_cents`, `currency`) is computed server-side
from `config('cards.pricing_tiers')` / `CARD_FOIL_FEE_CENTS` / `CARD_CURRENCY` — do not send it from the
frontend. The physical card size (85mm × 50mm, or 50mm × 85mm for `vertical` orientation) is likewise
fixed — see `config('cards.width_mm')` / `config('cards.height_mm')` — and is not a per-order input.
Shipping cost and the 4-week production lead time are not part of this price at all (shown as static
notices in the frontend, not modeled in the backend).

**`POST /orders/{id}/design-pdf` body** — `multipart/form-data`:

| Field | Type | Notes |
|---|---|---|
| `design_image` | file | Required. PNG/JPEG, max 5MB. The design studio's canvas exported via `canvas.toDataURL()`. |
| `selected_color` | string | Required, same hex validation as order creation. |
| `font_family` | string | Required, same allow-list as order creation. |

`selected_color` and `font_family` follow the same validation as order creation, and — since this is the
step where the customer finalizes their design — **overwrite** the order's `selected_color` and
`font_family`. `orientation` is not part of this request — it's fixed at order creation and read from the
order itself when sizing the PDF. The server embeds the uploaded image into a PDF page (dompdf) sized to
the fixed card dimensions (85×50mm, or 50×85mm if the order's `orientation` is `vertical`), stores it at
`storage/app/public/order-designs/{order_id}/{uuid}.pdf`, and sets `design_pdf_path` on the order. Calling
this endpoint again regenerates and replaces the previous PDF (the old file is deleted).

**Order JSON shape** (used by all order endpoints):

```json
{
  "id": 1,
  "user_id": 3,
  "user": { "name": "Jane Doe", "email": "jane@example.com" },
  "selected_color": "#6CC0A8",
  "font_family": "Helvetica",
  "orientation": "horizontal",
  "quantity": 250,
  "foil": true,
  "company_name": "Acme Inc",
  "shipping": {
    "name": "Jane Doe",
    "phone": "+1 555 000 1111",
    "address_line1": "123 Main St",
    "address_line2": "Suite 4",
    "city": "Springfield",
    "state": "IL",
    "postal_code": "62704",
    "country": "US"
  },
  "base_price_cents": 45000,
  "foil_fee_cents": 5000,
  "total_amount_cents": 50000,
  "currency": "aud",
  "status": "pending",
  "stripe_session_id": null,
  "design_pdf_path": "http://localhost/storage/order-designs/1/6d1e...-uuid.pdf",
  "created_at": "2026-07-14T12:00:00.000000Z",
  "updated_at": "2026-07-14T12:00:00.000000Z"
}
```

`status` is one of: `pending`, `paid`, `processing`, `shipped`, `delivered`. `design_pdf_path` is `null`
until `/design-pdf` has been called at least once; when present it's already a full downloadable URL
(built from the `public` disk, i.e. `APP_URL` + `/storage/...`) — use it directly as the download link on
the order confirmation and admin order views. The `user` key only appears when the order was loaded with
its `user` relation eager-loaded (currently just `GET /admin/orders`) — it's absent on customer-facing
endpoints, which don't need to name the owner back to themselves.

### Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders/{id}/checkout` | `auth:sanctum` + `verified` | Creates a Stripe Checkout Session for the order and returns `{ checkout_url, session_id }`. The order's `stripe_session_id` is stored immediately. |
| POST | `/stripe/webhook` | none (Stripe signature verified instead) | Stripe calls this directly. On `checkout.session.completed`, the matching order (by `stripe_session_id`, falling back to `client_reference_id`/`metadata.order_id`) is marked `paid`. |

Stripe redirects the browser back to:

- Success: `{FRONTEND_URL}/orders/{id}?checkout=success`
- Cancel: `{FRONTEND_URL}/orders/{id}?checkout=cancelled`

The frontend should treat these as hints only and re-fetch `GET /orders/{id}` (or poll briefly) to confirm
`status === "paid"`, since the webhook — not the redirect — is the source of truth.

### Admin (`/api/admin`) — `auth:sanctum` + `verified` + `admin` (`users.is_admin === true`)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/admin/orders` | — | `200` `{ orders: [...] }`. All orders across all users, unpaginated — the admin table filters/sorts client-side over the full list. |
| PUT | `/admin/orders/{id}` | `{ status }` | `200` `{ message, order }`. `status` must be one of `pending, paid, processing, shipped, delivered`. |

There's no signup flow for admins — flip `is_admin` to `true` on a user row directly (e.g. via `tinker` or
a seeder) once you have a trusted account.

## Project structure notes

- `app/Enums/OrderStatus.php`, `app/Enums/OrderOrientation.php` — backed enums used for validation (`Rule::enum`) and Eloquent casts (`Order::status`, `Order::orientation`). `selected_color` is a plain hex-string column (validated by regex), not an enum.
- `app/Http/Requests/**` — one Form Request per endpoint; Laravel's default 422 JSON shape is used for validation errors.
- `app/Http/Resources/**` — `UserResource`, `OrderResource` shape every JSON response above.
- `app/Policies/OrderPolicy.php` — `view` ability: owner or admin.
- `app/Http/Middleware/EnsureUserIsAdmin.php` — registered as the `admin` route middleware alias.
- `app/Services/StripeCheckoutService.php` — wraps the Stripe SDK's Checkout Session creation.
- `app/Services/CardDesignPdfService.php` — embeds the uploaded design image into `resources/views/pdf/card-design.blade.php` with dompdf at the fixed (orientation-aware) card size, and stores the PDF on the `public` disk under `order-designs/{order_id}/`.
- `app/Mail/VerificationCodeMail.php`, `app/Mail/PasswordResetCodeMail.php` — queued mailables with markdown views under `resources/views/emails/`.
- `app/Http/Controllers/Auth/AuthenticatedSessionController.php`, `app/Http/Controllers/Web/**` — the Inertia-specific controllers described in [Frontend architecture](#frontend-architecture).
- `app/Console/Commands/PromoteAdminCommand.php` — `php artisan admin:promote {email}`.
