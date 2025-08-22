
import { useEffect, useState } from "react";

export default function AdminRouteGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const mainLogin = (import.meta.env.VITE_FRONTEND_URL || 'http://localhost:8080') + '/auth';

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Fetch user info using cookie-based auth
        const res = await fetch('/api/clients/users/me', {
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
