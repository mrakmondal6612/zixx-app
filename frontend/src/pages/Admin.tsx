import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/hooks/AuthProvider';

// Read admin panel URL from env or fallback to Vite default dev port used by admin client
// Prefer explicit env override. If not set, assume the admin client is served from the same host but common dev port 8000/8001,
// otherwise fall back to the current page origin which is the safest runtime choice.
// Default to admin client dev server on port 8000 (user dev setup)
const ADMIN_PANEL_URL = import.meta.env.VITE_ADMIN_PANEL_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:8000` : 'http://localhost:8000');

const Admin = () => {
  const { user, role, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && role === 'admin') {
      if (typeof window !== 'undefined') {
        try {
          // If admin panel is same-origin, navigate via router; otherwise do full redirect
          const adminUrl = new URL(ADMIN_PANEL_URL);
          if (adminUrl.origin === window.location.origin) {
            navigate(adminUrl.pathname + adminUrl.search + adminUrl.hash, { replace: true });
          } else {
            // replace so user can't go back to this page using browser Back
            try {
              // if we have an access token, pass it to the admin app as a query param (dev-only fallback)
              const token = localStorage.getItem('token');
              const sep = ADMIN_PANEL_URL.includes('?') ? '&' : '?';
              const target = token ? `${ADMIN_PANEL_URL}${sep}token=${encodeURIComponent(token)}` : ADMIN_PANEL_URL;
              window.location.replace(target);
            } catch (err) {
              window.location.replace(ADMIN_PANEL_URL);
            }
          }
        } catch (err) {
          window.location.href = ADMIN_PANEL_URL;
        }
      }
    }
  }, [user, role, loading]);

  if (loading) return <div>Loading authentication...</div>;
  if (!user) return <div>Please sign in on the main site before accessing the admin panel.</div>;
  if (role !== 'admin') return <div>Unauthorized — you need admin privileges to continue.</div>;
  return <div>Redirecting to admin panel ({ADMIN_PANEL_URL})…</div>;
};

export default Admin;
