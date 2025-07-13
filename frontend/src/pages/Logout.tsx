
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Logout = () => {
  useEffect(() => {
    const signOut = async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };
    
    signOut();
  }, []);

  // Redirect to auth page after logout
  return <Navigate to="/auth" replace />;
};

export default Logout;
