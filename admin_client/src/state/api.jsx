import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Prefer explicit backend URL; fall back to legacy/app var if present.
const backend = import.meta.env.VITE_BACKEND_SERVER || import.meta.env.VITE_APP_BASE_URL || '';
// ensure requests target backend API namespace
const baseUrl = backend.replace(/\/$/, '') + '/api';

// // dev debug: surface configured URLs at runtime to help integration
// try {
//   if (typeof window !== 'undefined') {
//     console.log('adminClient: API Base URL =', baseUrl);
//     console.log('adminClient: Backend refresh URL =', import.meta.env.VITE_BACKEND_SERVER );
//     console.log('adminClient: Frontend URL (VITE_FRONTEND_URL) =', import.meta.env.VITE_FRONTEND_URL || `http://${window.location.hostname}:8080`);
//   }
// } catch (e) {}

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include', // include cookies when calling backend refresh
  prepareHeaders: (headers) => {
    try {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
    } catch (e) {
      // ignore
    }
    return headers;
  },
});

// single-flight refresh promise to avoid refresh storms
let refreshPromise = null;

// wrapper to attempt refresh on 401 with single-flight dedupe and auto-logout on failure
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  console.log('[adminApi] initial result', result);
  if (result.error && result.error.status === 401) {
    console.debug('[adminApi] received 401 for', args, 'extraOptions=', extraOptions);
  // Prevent infinite retry loops: only attempt refresh once per original request
  const hasAttempted = (args && args.headers && args.headers['x-refresh-attempt']) || (extraOptions && extraOptions.headers && extraOptions.headers['x-refresh-attempt']);
  if (hasAttempted) return result;
    const backendUrl = import.meta.env.VITE_BACKEND_SERVER;
    const refreshUrl = `${backendUrl}/api/refresh`;

    // create the refresh promise if not already running
    if (!refreshPromise) {
      console.debug('[adminApi] starting refresh promise ->', refreshUrl);
      refreshPromise = (async () => {
        try {
          const refreshRes = await fetch(refreshUrl, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!refreshRes.ok) {
            console.debug('[adminApi] refresh response not ok', refreshRes.status, await refreshRes.text());
            throw new Error('refresh-failed');
          }
          const data = await refreshRes.json();
          console.debug('[adminApi] refresh response data', data);
          if (data && data.token) {
            try { localStorage.setItem('token', data.token); } catch (e) {}
            return data.token;
          }
          throw new Error('no-token-in-refresh');
        } catch (e) {
          throw e;
        }
      })();
    }

  try {
  // wait for refresh to complete (shared promise)
  console.debug('[adminApi] waiting for refresh promise');
  
  await refreshPromise;
  // refresh succeeded, clear shared promise and retry original request
  refreshPromise = null;
  // mark retry attempt so we don't loop
  if (!args.headers) args.headers = {};
  args.headers['x-refresh-attempt'] = '1';
  if (!extraOptions) extraOptions = {};
  if (!extraOptions.headers) extraOptions.headers = {};
  extraOptions.headers['x-refresh-attempt'] = '1';
  result = await rawBaseQuery(args, api, extraOptions);
  console.debug('[adminApi] retry result after refresh', result);
  return result;
    } catch (e) {
  console.debug('[adminApi] refresh failed:', e && e.message ? e.message : e);
      // refresh failed: cleanup, call backend logout to clear refresh cookie, remove local token and redirect to main frontend login
      refreshPromise = null;
      try {
        // attempt to clear refresh cookie server-side
        await fetch(`${backendUrl}/api/logout`, { method: 'POST', credentials: 'include' });
      } catch (err) {
        // ignore logout errors
      }
      try { localStorage.removeItem('token'); } catch (er) {}
      // notify other windows (main frontend) about logout so they can clear auth state
      try {
        if (typeof window !== 'undefined') {
          // notify other tabs via BroadcastChannel
          const bc = new BroadcastChannel('auth');
          bc.postMessage({ type: 'logout' });
          bc.close();
          // also dispatch an in-window event so the app can show a modal before redirect
          try { window.dispatchEvent(new CustomEvent('auth:logout')); } catch (e) {}
        }
      } catch (er) {
        // fallback: use localStorage event
        try { localStorage.setItem('auth_logout', Date.now().toString()); } catch (e) {}
      }
      // final fallback: redirect to frontend login using replace so user can't go back
      if (typeof window !== 'undefined') {
        // prefer explicit env override; otherwise assume frontend dev server runs on same host at port 8081
  let frontend = import.meta.env.VITE_FRONTEND_URL || `http://${window.location.hostname}:8080`;
        // if frontend resolves to the same origin as this admin app, force the common dev port 8081
        try {
          const frontendOrigin = new URL(frontend).origin;
            if (frontendOrigin === window.location.origin) {
            frontend = `http://${window.location.hostname}:8080`;
          }
        } catch (e) {
          frontend = `http://${window.location.hostname}:8080`;
        }
        try { window.location.replace(`${frontend.replace(/\/$/, '')}/auth`); } catch (er) {}
      }
      return result; // return original 401 result
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "adminApi",
  tagTypes: [
    "User",
    "Products",
    "Customers",
    "Transactions",
    "Geography",
    "Sales",
    "Admins",
    "Performance",
    "Dashboard",
  ],
  endpoints: (build) => ({
    getUser: build.query({
      query: (id) => `general/user/${id}`,
      providesTags: ["User"],
    }),
    //client
    getProducts: build.query({
      query: () => "client/products",
      providesTags: ["Products"],
    }),

    getUsers: build.query({
      query: () => "users",  // backend -> /api/users
      providesTags: ["User"],
    }),

    getCustomers: build.query({
      query: () => "client/customers",
      providesTags: ["Customers"],
    }),
    getTransactions: build.query({
      query: ({ page, pageSize, sort, search }) => ({
        url: "client/transactions",
        method: "GET",
        params: { page, pageSize, sort, search },
      }),
      providesTags: ["Transactions"],
    }),

    getGeography: build.query({
      query: () => "client/geography",
      providesTags: ["Geography"],
    }),
    // sales
    getSales: build.query({
      query: () => "sales/sales",
      providesTags: ["Sales"],
    }),

    //Management
    getAmins: build.query({
      query: () => "management/admins",
      providesTags: ["Admins"],
    }),
    getUserPerformance: build.query({
      query: (id) => `management/performance/${id}`,
      providesTags: ["Performance"],
    }),

    getDashboard: build.query({
      query: () => "general/dashboard",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetProductsQuery,
  useGetUsersQuery,
  useGetCustomersQuery,
  useGetTransactionsQuery,
  useGetGeographyQuery,
  useGetSalesQuery,
  useGetAminsQuery,
  useGetUserPerformanceQuery,
  useGetDashboardQuery,
} = api;
