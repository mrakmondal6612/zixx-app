import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/hooks/AuthProvider';

const Logout = () => {
  const { setUser, logout } = useAuthContext();

  useEffect(() => {
    const signOut = async () => {
      try {
        // No Supabase logout; rely on backend logout via AuthProvider
      } catch (e) { /* noop */ }
      try { localStorage.removeItem('token'); } catch (e) {}
      try { await logout(); } catch (e) { console.error('[Logout] logout failed', e); }
      setUser(null); // Clear auth context
    };

    signOut();
  }, [setUser, logout]);

  return <Navigate to="/auth" replace />;
};

export default Logout;
