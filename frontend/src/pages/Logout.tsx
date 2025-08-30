import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/hooks/AuthProvider';
import React from 'react';
import TestimonialModal from '@/components/TestimonialModal';
import { apiUrl } from '@/lib/api';

const Logout = () => {
  const { setUser, logout, user } = useAuthContext();
  const [ask, setAsk] = React.useState(true);
  const [done, setDone] = React.useState(false);

  useEffect(() => {
    // If user navigates directly and modal was skipped/submitted already, ensure logout proceeds
    if (!ask && !done) {
      (async () => {
        try { localStorage.removeItem('token'); } catch {}
        try { await logout(); } catch (e) { console.error('[Logout] logout failed', e); }
        setUser(null);
        setDone(true);
      })();
    }
  }, [ask, done, logout, setUser]);

  const submitTestimonial = async (payload: { rating: number; text: string; name?: string }) => {
    try {
      const meta = {
        page: typeof window !== 'undefined' ? window.location.href : '',
        path: typeof window !== 'undefined' ? window.location.pathname : '',
        device: typeof navigator !== 'undefined' ? (navigator.platform || '') : '',
        locale: typeof navigator !== 'undefined' ? (navigator.language || '') : '',
      };
      await fetch(apiUrl('/clients/testimonials'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...payload, ...meta }),
      });
    } catch (e) {
      // non-blocking
    } finally {
      setAsk(false);
      try { localStorage.removeItem('token'); } catch {}
      try { await logout(); } catch (e) { console.error('[Logout] logout failed', e); }
      setUser(null);
      setDone(true);
    }
  };

  const skipTestimonial = async () => {
    setAsk(false);
    try { localStorage.removeItem('token'); } catch {}
    try { await logout(); } catch (e) { console.error('[Logout] logout failed', e); }
    setUser(null);
    setDone(true);
  };

  if (!done) {
    return (
      <>
        <TestimonialModal open={ask} onSubmit={submitTestimonial} onSkip={skipTestimonial} userName={user?.first_name || user?.name} />
        {/* When modal completes, Navigate below will render */}
        {ask ? null : <Navigate to="/auth" replace />}
      </>
    );
  }
  return <Navigate to="/auth" replace />;
};

export default Logout;
