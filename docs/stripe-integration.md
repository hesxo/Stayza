# Stripe Integration Guide

This document walks through the full Stripe Embedded Checkout integration used by Stayza. It covers dashboard configuration, environment variables, backend/frontend flows, webhook handling, and security practices.

## 1. Environment Variables

Copy the provided `.env.example` files into `.env` and fill in the secrets:

### Backend (`stayza-backend/.env`)

| Variable | Purpose |
| --- | --- |
| `PORT` | Express port (default `8000`). |
| `FRONTEND_URL` | Base URL used in return links and CORS. |
| `MONGODB_URL` | Connection string for MongoDB. |
| `STRIPE_SECRET_KEY` | Secret API key from Stripe dashboard. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from the webhook endpoint created below. |
| `CLERK_SECRET_KEY` | Server-side key required by `@clerk/express`. |
| `OPENAI_API_KEY` | Used by the AI endpoint (unrelated to payments). |

### Frontend (`stayza-frontend/.env`)

| Variable | Purpose |
| --- | --- |
| `VITE_BACKEND_URL` | Points to the backend API (default `http://localhost:8000`). |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Publishable key used by `@stripe/react-stripe-js`. |
| `VITE_CLERK_PUBLISHABLE_KEY` | Public key for Clerk authentication. |

> After editing `.env`, restart both dev servers so Vite/Node pick up the changes.

## 2. Stripe Dashboard Setup

1. **Create a Product per hotel template**  
   - In the Stripe Dashboard go to **Products → + Add product**.  
   - Provide a name/description that matches the hotel and set a *standard pricing* model (USD, recurring = off).  
   - You can also let the backend seed script create products automatically (see below).

2. **Configure Embedded Checkout**  
   - Feature is enabled by default on modern Stripe accounts. If it is disabled, visit **Checkout settings → Embedded** and toggle it on.

3. **Create a webhook endpoint**  
   - URL: `https://<your-domain>/api/stripe/webhook` (or `http://localhost:8000/api/stripe/webhook` when using the Stripe CLI).  
   - Events to subscribe to:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
     - `checkout.session.expired`
   - Copy the signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.

4. **Local testing**  
   - Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).  
   - Run `stripe login` once, then forward events:  
     ```bash
     stripe listen --forward-to localhost:8000/api/stripe/webhook
     ```
   - The CLI prints the signing secret to use locally.

## 3. Product Catalog Automation

- When admins create hotels, the backend creates a Stripe product with a default price representing the nightly rate (`src/application/hotel.ts`, `createHotel`).  
- Existing hotels can be backfilled through the seed script (`src/seed.ts`), via the `POST /api/hotels/:id/stripe/price` endpoint, or automatically during checkout (the payment service provisions a product/price if a hotel is missing one).  
- `Hotel` documents store `stripePriceId` so that clients never send arbitrary prices.

## 4. Checkout Session Creation

- `POST /api/payments/create-checkout-session` (`src/application/payment.ts`) is protected by Clerk. It:
  1. Ensures the requester owns the booking and that the booking is still `PENDING`.
  2. Validates the hotel has a stored `stripePriceId`.
  3. Builds a line item using `price + quantity` (number of nights) to avoid client-side price tampering.
  4. Creates an embedded Checkout session with `return_url` set to `FRONTEND_URL/booking/complete?session_id={CHECKOUT_SESSION_ID}`.
  5. Stores `bookingId` and `userId` in `metadata` for webhook lookups.
  6. Returns the `clientSecret` needed by Stripe's `<EmbeddedCheckout>` component.

If a booking is already paid or belongs to another user, the endpoint returns a 4xx with a descriptive message.

## 5. Frontend Embedded Checkout Flow

- The `CheckoutForm` component (`src/components/CheckoutForm.jsx`) loads Stripe using the publishable key and supplies an asynchronous `fetchClientSecret` callback to `EmbeddedCheckoutProvider`.
- The callback attaches the Clerk session token, posts the booking ID, validates the API response, and throws meaningful errors when something goes wrong. The Embedded Checkout widget surfaces these errors to the guest automatically.
- `PaymentPage` passes the booking ID via URL search params, while `CompletePage` reads the `session_id` on redirect to display confirmation or failure states (`src/Pages/complete.page.jsx`).

## 6. Session Status Polling & Webhooks

### Polling

- `GET /api/payments/session-status?session_id=...` fetches the Checkout session directly from Stripe, verifies ownership, and idempotently upgrades the booking to `PAID` if Stripe reports `payment_status = paid`.
- The endpoint also returns hotel/booking details so the frontend can render a confirmation view immediately after redirect.

### Webhooks

- Webhook handling lives in `src/application/payment.ts`:
  - The Express app wires `/api/stripe/webhook` *before* `express.json()` and uses `bodyParser.raw` so Stripe signature verification works.
  - `handleWebhook` validates the signature with `STRIPE_WEBHOOK_SECRET` and routes events:
    - `checkout.session.completed` & `checkout.session.async_payment_succeeded` → `fulfillCheckout()` marks the booking `PAID`.
    - `checkout.session.async_payment_failed` & `checkout.session.expired` → `failCheckout()` marks the booking `FAILED` so guests can retry safely.
  - All updates are idempotent: repeated events do not flip an already-PAID booking back to another state.

## 7. Booking Status Management

- `Booking` documents have a `paymentStatus` field (`PENDING`, `PAID`, `FAILED`) defined in `src/infrastructure/entities/Booking.ts`.
- Creation defaults to `PENDING`.  
- `fulfillCheckout` upgrades to `PAID` once Stripe confirms payment.  
- `failCheckout` sets `FAILED` when Stripe notifies about expired or failed sessions.
- The confirmation page renders:
  - Success UI when `status === "complete"` and `paymentStatus === "PAID"`.
  - Retry guidance when `paymentStatus === "FAILED"` or the session expired/opened.

## 8. Security Best Practices Implemented

- Stripe secret key is validated at startup (`src/infrastructure/stripe.ts`) and the API version is pinned (`2024-06-20`) to avoid sudden contract changes.
- Checkout requests require Clerk authentication and ownership verification so guests cannot pay for someone else’s booking.
- The backend never accepts client-side amounts—`stripePriceId` + quantity fully define the charge.
- Webhooks verify the Stripe signature before mutating state.
- Errors return safe messages to clients while full stack traces remain server-side.
- Environment examples document which secrets are required, reducing misconfiguration risk.

## 9. Putting It All Together

1. Set up `.env` files with your Stripe/Clerk credentials.
2. Create or seed hotels so each has a `stripePriceId`.
3. Run the backend (`npm run dev` in `stayza-backend`) and frontend (`npm run dev` in `stayza-frontend`).
4. Use the app to create a booking, visit `/booking/payment?bookingId=<id>`, and complete the Embedded Checkout flow.
5. Stripe redirects back to `/booking/complete?session_id=...`, the booking shows as `PAID`, and the webhook keeps the backend authoritative even if the user closes the tab.

That’s the entire secure payment flow end-to-end. Refer back to the code locations above when extending or debugging the integration.
