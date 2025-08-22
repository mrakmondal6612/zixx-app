Admin integration overview

Goal

- Keep login/sign-up on the main frontend while using a standalone admin client + admin server for admin UI and admin-specific APIs.
- Share authentication via JWT issued by the main backend: frontend stores `localStorage.token`; admin client attaches `Authorization: Bearer <token>` to requests; admin server validates the token with the same `JWT_SECRET`.

Files changed

- `frontend/src/pages/Admin.tsx` — redirect-only page for authenticated admin users (safe fallback URL and robust redirect).
- `admin_client/src/state/api.jsx` — RTK Query baseQuery already adds `Authorization: Bearer <token>` when `localStorage.token` exists.
- `admin_server/middlewares/authenticator.js` — new middleware to verify JWTs (accepts both `Bearer <token>` and raw token formats).
- `admin_server/index.js` — admin routes mounted behind the `authenticator` middleware.
- `admin_server/controllers/client.js` — when proxying requests to main backend, forwards the incoming `Authorization` header.
- `admin_server/package.json` — added `jsonwebtoken` dependency (for server-side JWT verification).
- README additions in `admin_server/` and `admin_client/`.

Local-dev environment variables (important)

Main backend (`/backend/.env`)

- JWT_SECRET (must be the same as admin_server's JWT_SECRET for shared tokens)
- JWT_REFRESH_SECRET
- PORT (e.g. 8282)

Admin server (`/admin_server/.env`)

- DBURL (mongodb connection)
- PORT (default 9000)
- VITE_BACKEND_SERVER (e.g. http://localhost:8282)
- JWT_SECRET (should match backend's JWT_SECRET in local dev)

Admin client (`/admin_client/.env.local`)

- VITE_APP_BASE_URL=http://localhost:9000

Frontend (`/frontend/.env`)

- VITE_ADMIN_PANEL_URL (URL to admin client — e.g. http://localhost:5173)

How to start each service (local)

1. Backend (main API)

```bash
cd backend
npm install
npm run dev
```

2. Admin server

```bash
cd admin_server
npm install
npm run dev
```

3. Admin client

```bash
cd admin_client
npm install
npm run dev
```

4. Frontend (main site)

```bash
cd frontend
npm install
npm run dev
```

Quick verification steps

1. On the main frontend: create or login to an admin user. Confirm `localStorage.token` and `localStorage.role` are set.
2. Visit `/admin` on the main frontend. The page will validate the role and redirect to the admin client (value of `VITE_ADMIN_PANEL_URL`).
3. On the admin client, open devtools → Network and inspect requests — they should include `Authorization: Bearer <token>` header.
4. Confirm admin API calls succeed (status 200) and data loads.

Smoke-test script (optional)

If you don't want to run the UIs you can use the `scripts/smoke-test.sh` helper to validate server endpoints (set TOKEN to a valid JWT):

```bash
# from repo root
TOKEN="<your-jwt-here>" bash scripts/smoke-test.sh
```

If you want me to run an end-to-end test here (start servers, perform login and redirect), tell me and I'll kick off the dev servers and run the checks.

Security & production notes

- Do NOT use the local `jwtsecret` value in production.
- Prefer short-lived access tokens and use a refresh flow.
- Use HTTPS and strict CORS for admin_client/admin_server.
- Consider centralizing auth (auth service) if you plan more apps to share identity.
