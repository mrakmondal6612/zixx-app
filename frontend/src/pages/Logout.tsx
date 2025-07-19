import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/hooks/AuthProvider';

const Logout = () => {
  const { setUser, logout } = useAuthContext();

  useEffect(() => {
    const signOut = async () => {
      try {
        await supabase.auth.signOut(); // Supabase logout
        localStorage.removeItem('token'); // Clear custom token if any
        setUser(null); // Clear auth context
        logout(); // Trigger any extra cleanup in your app context
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };

    signOut();
  }, [setUser, logout]);

  return <Navigate to="/auth" replace />;
};

export default Logout;
