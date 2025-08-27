
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
        // Fetch user info using cookie-based auth to backend API base
        const res = await fetch(`${apiBase}/clients/user/me`, {
          credentials: 'include',
        });
        if (!res.ok) {
          window.location.replace(mainLogin);
          return;
        }
        const data = await res.json();
        if (!data?.user || data.user.role !== 'admin') {
          window.location.replace(mainLogin);
          return;
        }
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
