# Zixx App — Local dev notes

This repository contains multiple services used for local development:

- backend: main API (Express + MongoDB)
- admin_server: admin dashboard API (Express + MongoDB)
- frontend: public web app (Vite + React + TypeScript)
- admin_client: admin dashboard web app (Vite + React)

## Quick start (recommended)

1. Copy environment variables:
   cp .env.example .env

2. Start backend and admin_server (each in its own terminal):

   - backend: PORT=8282 node backend/index.js (or npm run dev in backend)
   - admin_server: PORT=9000 node admin_server/index.js (or npm run dev in admin_server)

3. Start the UIs (from repo root or each folder):

   - admin_client: cd admin_client && npm install && npm run dev (Vite will pick an available port, often 8000→8001)
   - frontend: cd frontend && npm install && npm run dev (Vite will pick an available port, often 8080→8081)

4. Optional smoke test (verifies register/login/refresh/cookie):
   node scripts/smoke.js

## Notes

- When fetch() uses credentials (cookies) the servers must return the exact origin in Access-Control-Allow-Origin and set Access-Control-Allow-Credentials: true. If you run the UI on a different port than configured in env, update FRONTEND_URL / ADMIN_CLIENT_URL accordingly.

- Access tokens are stored in localStorage and the refresh token is an httpOnly cookie set by the backend.

- If Vite reports "Port X is in use, trying another one..." it will start on the next free port (check the terminal for the actual URL).

## Troubleshooting

- If you see CORS errors about Access-Control-Allow-Origin being "\*" and credentials: true, check backend/index.js and admin_server/index.js — they should echo allowed origins from env (no wildcard).

- To inspect cookies saved by the smoke test: /tmp/cookies.txt

---

That's a minimal starter guide. Add project-specific scripts or a docker-compose later for a single-command dev start.

## One-time Setup (Payments, Webhooks, Email)

Follow these once per environment (dev/staging/prod):

1. Backend `.env` (in `backend/.env`)

   - RAZORPAY_KEY_ID=your_key_id
   - RAZORPAY_SECRET=your_secret
   - RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   - SMTP_HOST=smtp.example.com
   - SMTP_PORT=587
   - SMTP_USER=user@example.com
   - SMTP_PASS=your_password
   - SMTP_FROM="Zixx <no-reply@yourdomain.com>"

2. Install backend deps and restart

   ```bash
   # from repo root
   cd backend && npm i && npm run dev
   ```

3. Razorpay Dashboard → Webhooks

   - URL: `https://<your-host>/api/clients/payments/razorpay/webhook`
   - Events: payments.authorized, payment.captured, payment.failed
   - Secret: same as `RAZORPAY_WEBHOOK_SECRET`

4. Email deliverability

   - Configure SPF/DKIM with your SMTP provider for `SMTP_FROM` domain.
   - Test: place an order and verify receipt email delivery.

5. Admin refund UI usage

   - Open Admin → Orders.
   - Click "Refund"; enter amount (leave blank for full refund).
   - Requires admin auth; calls POST `/api/admin/orders/:id/refund`.
