import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBase } from "@utils/apiBase";

const baseUrl = getApiBase();

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
  let result = await rawBaseQuery(args, api, extraOptions );
  // console.log('[adminApi] initial result', result);
  if (result.error && result.error.status === 401) {
    // console.debug('[adminApi] received 401 for', args, 'extraOptions=', extraOptions);
  // Prevent infinite retry loops: only attempt refresh once per original request
  const hasAttempted = (args && args.headers && args.headers['x-refresh-attempt']) || (extraOptions && extraOptions.headers && extraOptions.headers['x-refresh-attempt']);
  if (hasAttempted) return result;
    const apiBase = getApiBase();
    // create the refresh URL
    const refreshUrl = `${apiBase}/clients/refresh`;

    // create the refresh promise if not already running
    if (!refreshPromise) {
      // console.debug('[adminApi] starting refresh promise ->', refreshUrl);
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
          // console.debug('[adminApi] refresh response data', data);
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
  // console.debug('[adminApi] waiting for refresh promise');
  
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
  // console.debug('[adminApi] retry result after refresh', result);
  return result;
    } catch (e) {
  // console.debug('[adminApi] refresh failed:', e && e.message ? e.message : e);
      // refresh failed: cleanup, call backend logout to clear refresh cookie, remove local token and redirect to main frontend login
      refreshPromise = null;
      try {
        // attempt to clear refresh cookie server-side
        await fetch(`${apiBase}/clients/logout`, { method: 'POST', credentials: 'include' });
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
        const isProd = !!(import.meta && import.meta.env && import.meta.env.PROD);
        let frontend = import.meta.env.VITE_FRONTEND_URL;
        if (!frontend) {
          frontend = isProd ? 'https://zixx.vercel.app' : `http://${window.location.hostname}:8080`;
        }
        try { const u = new URL(frontend); frontend = u.origin; } catch (e) {}
        try { window.location.replace(`${frontend}/auth`); } catch (er) {}
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
    "Orders",
    "Geography",
    "Sales",
    "Admins",
    "Performance",
    "Dashboard",
  ],
  endpoints: (build) => ({
    getUser: build.query({
      query: (id) => `admin/users/${id}`,
      providesTags: ["User"],
    }),
    //client
    getProducts: build.query({
      query: () => "clients/products",
      providesTags: ["Products"],
    }),

    getUsers: build.query({
      query: () => "admin/users",  // backend -> /api/users
      providesTags: ["User"],
    }),

    getCustomers: build.query({
      query: () => "admin/users",
      providesTags: ["Customers"],
    }),
    getTransactions: build.query({
      query: ({ page, pageSize, sort, search }) => ({
        url: "admin/transactions",
        method: "GET",
        params: { page, pageSize, sort, search },
      }),
      providesTags: ["Transactions"],
    }),

    // Admin Orders
    getAdminOrders: build.query({
      query: () => ({ url: "admin/orders", method: "GET" }),
      providesTags: ["Orders"],
    }),

    verifyAdminOrder: build.mutation({
      query: ({ id, adminNotes } = {}) => ({
        url: `admin/orders/${id}/verify`,
        method: "PATCH",
        body: adminNotes ? { adminNotes } : undefined,
      }),
      invalidatesTags: ["Orders"],
    }),

    confirmAdminOrder: build.mutation({
      query: ({ id, trackingNumber, deliveryDate, adminNotes } = {}) => ({
        url: `admin/orders/${id}/confirm`,
        method: "PATCH",
        body: { trackingNumber, deliveryDate, adminNotes },
      }),
      invalidatesTags: ["Orders"],
    }),

    // Admin mark as packed
    packAdminOrder: build.mutation({
      query: ({ id, adminNotes } = {}) => ({
        url: `admin/orders/${id}/pack`,
        method: "PATCH",
        body: adminNotes ? { adminNotes } : undefined,
      }),
      invalidatesTags: ["Orders"],
    }),

    // Admin mark as delivered
    deliverAdminOrder: build.mutation({
      query: ({ id, adminNotes } = {}) => ({
        url: `admin/orders/${id}/deliver`,
        method: "PATCH",
        body: adminNotes ? { adminNotes } : undefined,
      }),
      invalidatesTags: ["Orders"],
    }),

    // Admin update courier info
    updateAdminOrderCourier: build.mutation({
      query: ({ id, carrier, carrierUrl, courierPhone, courierLogoUrl, adminNotes } = {}) => ({
        url: `admin/orders/${id}/courier`,
        method: "PATCH",
        body: { carrier, carrierUrl, courierPhone, courierLogoUrl, adminNotes },
      }),
      invalidatesTags: ["Orders"],
    }),

    // Admin upload courier logo (multipart/form-data with field 'file')
    uploadAdminOrderCourierLogo: build.mutation({
      query: ({ id, file } = {}) => {
        const form = new FormData();
        if (file) form.append('file', file);
        return {
          url: `admin/orders/${id}/courier/logo`,
          method: 'POST',
          body: form,
        };
      },
      invalidatesTags: ["Orders"],
    }),

    // Admin refund (full or partial)
    refundAdminOrder: build.mutation({
      query: ({ id, amount } = {}) => ({
        url: `admin/orders/${id}/refund`,
        method: "POST",
        body: typeof amount === 'number' ? { amount } : {},
      }),
      invalidatesTags: ["Orders"],
    }),

    // Admin delete order (soft-delete)
    deleteAdminOrder: build.mutation({
      query: ({ id } = {}) => ({
        url: `admin/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
    }),

    // Admin endpoints
    getAdminTransactions: build.query({
      query: ({ page, pageSize, sort, search } = {}) => ({
        url: "admin/transactions",
        method: "GET",
        params: { page, pageSize, sort, search },
      }),
      providesTags: ["Transactions"],
    }),

    // Admin Products
    updateAdminProduct: build.mutation({
      query: ({ id, body } = {}) => ({
        url: `admin/products/update/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Products"],
    }),
    deleteAdminProduct: build.mutation({
      query: ({ id } = {}) => ({
        url: `admin/products/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    // Admin Users
    updateAdminUser: build.mutation({
      query: ({ id, body } = {}) => ({
        url: `admin/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Customers", "Admins", "User"],
    }),
    deleteAdminUser: build.mutation({
      query: ({ id } = {}) => ({
        url: `admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers", "Admins", "User"],
    }),

    getAdminUsers: build.query({
      query: () => ({ url: "admin/users", method: "GET" }),
      providesTags: ["Admins"],
    }),

    getClientsUsers: build.query({
      query: () => ({ url: "clients/users", method: "GET" }),
      providesTags: ["Customers"],
    }),

    getGeography: build.query({
      // admin geography endpoint is mounted under /admin on the server
      query: () => "admin/geography",
      providesTags: ["Geography"],
    }),
    // sales
    getSales: build.query({
  // admin sales endpoint is mounted under /admin on the server
  query: () => "admin/sales",
      providesTags: ["Sales"],
    }),

    //Management
    getAdmins: build.query({
      query: () => "admin/allAdmins",
      providesTags: ["Admins"],
    }),
    getUserPerformance: build.query({
      query: (id) => `admin/performance/${id}`,
      providesTags: ["Performance"],
    }),

    getDashboard: build.query({
      query: () => "admin/dashboard",
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
  useGetAdminOrdersQuery,
  useVerifyAdminOrderMutation,
  useConfirmAdminOrderMutation,
  usePackAdminOrderMutation,
  useDeliverAdminOrderMutation,
  useRefundAdminOrderMutation,
  useDeleteAdminOrderMutation,
  useUpdateAdminOrderCourierMutation,
  useUploadAdminOrderCourierLogoMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetGeographyQuery,
  useGetSalesQuery,
  useGetAdminsQuery,
  useGetUserPerformanceQuery,
  useGetDashboardQuery,
  useGetAdminTransactionsQuery,
  useGetAdminUsersQuery,
  useGetClientsUsersQuery,
} = api;
