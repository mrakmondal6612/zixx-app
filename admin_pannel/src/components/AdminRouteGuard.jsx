
import { useEffect, useState } from "react";
import getApiBase from "@utils/apiBase";

export default function AdminRouteGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const apiBase = getApiBase();
  const frontendBase = (() => {
    const isProd = !!(import.meta && import.meta.env && import.meta.env.PROD);
    let f = import.meta.env.VITE_FRONTEND_URL;
    if (!f) {
      if (isProd) {
        // Safe default for production if env not set
        f = 'https://zixx.vercel.app';
      } else {
        // Dev fallback: assume main frontend runs on :8080 on same host
        f = `http://${window.location.hostname}:8080`;
      }
    }
    try { const u = new URL(f); return u.origin; } catch { return f; }
  })().replace(/\/$/, '');
  const mainLogin = `${frontendBase}/auth`;

  useEffect(() => {
    const checkAccess = async () => {
      try {
        console.log('[AdminRouteGuard] Starting access check...');
        console.log('[AdminRouteGuard] API Base:', apiBase);
        console.log('[AdminRouteGuard] Main Login URL:', mainLogin);
        
        // helper to build auth headers from localStorage token
        const buildAuthHeaders = () => {
          const h = {};
          try {
            const t = localStorage.getItem('token');
            if (t) {
              h['Authorization'] = `Bearer ${t}`;
              console.log('[AdminRouteGuard] Found token in localStorage');
            } else {
              console.log('[AdminRouteGuard] No token found in localStorage');
            }
          } catch {}
          return h;
        };
        
        // 1) Try to fetch current user using cookie-based auth plus Bearer if available
        console.log('[AdminRouteGuard] Attempting to fetch user info...');
        let res = await fetch(`${apiBase}/clients/user/me`, {
          credentials: 'include',
          headers: buildAuthHeaders(),
        });
        
        console.log('[AdminRouteGuard] Initial response status:', res.status);
        
        // 2) If unauthorized, attempt refresh using httpOnly refresh cookie
        if (res.status === 401) {
          console.log('[AdminRouteGuard] Unauthorized, attempting refresh...');
          try {
            const refreshRes = await fetch(`${apiBase}/clients/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });
            console.log('[AdminRouteGuard] Refresh response status:', refreshRes.status);
            
            if (refreshRes.ok) {
              const rj = await refreshRes.json().catch(() => ({}));
              if (rj && rj.token) {
                try { localStorage.setItem('token', rj.token); } catch {}
                console.log('[AdminRouteGuard] New token received and stored');
              }
              // retry /me once after refresh
              res = await fetch(`${apiBase}/clients/user/me`, {
                credentials: 'include',
                headers: buildAuthHeaders(),
              });
              console.log('[AdminRouteGuard] Retry response status:', res.status);
            }
          } catch (refreshError) {
            console.log('[AdminRouteGuard] Refresh failed:', refreshError);
          }
        }
        
        if (!res.ok) {
          console.log('[AdminRouteGuard] Final response not OK, redirecting to login');
          return window.location.replace(mainLogin);
        }
        
        const data = await res.json();
        console.log('[AdminRouteGuard] User data:', data);
        
        if (!data?.user || data.user.role !== 'admin') {
          console.log('[AdminRouteGuard] User not admin or missing, redirecting to login');
          return window.location.replace(mainLogin);
        }
        
        console.log('[AdminRouteGuard] Access granted!');
        setAllowed(true);
      } catch (e) {
        console.log('[AdminRouteGuard] Error during access check:', e);
        window.location.replace(mainLogin);
      } finally {
        setChecking(false);
      }
    };
    checkAccess();
  }, []);

  if (checking) return null;
  if (!allowed) return null;
  return children;
}
