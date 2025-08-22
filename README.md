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
