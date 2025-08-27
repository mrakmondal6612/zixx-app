
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
        // 1) Try to fetch current user using cookie-based auth
        let res = await fetch(`${apiBase}/clients/user/me`, { credentials: 'include' });
        // 2) If unauthorized, attempt refresh using httpOnly refresh cookie
        if (res.status === 401) {
          try {
            const refreshRes = await fetch(`${apiBase}/clients/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });
            if (refreshRes.ok) {
              const rj = await refreshRes.json().catch(() => ({}));
              if (rj && rj.token) {
                try { localStorage.setItem('token', rj.token); } catch {}
              }
              // retry /me once after refresh
              res = await fetch(`${apiBase}/clients/user/me`, { credentials: 'include' });
            }
          } catch {}
        }
        if (!res.ok) return window.location.replace(mainLogin);
        const data = await res.json();
        if (!data?.user || data.user.role !== 'admin') return window.location.replace(mainLogin);
        setAllowed(true);
      } catch (e) {
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
