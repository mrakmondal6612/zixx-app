// src/hooks/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '@/lib/api';

interface User {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  // Extended fields used by Account.tsx
  first_name?: string;
  last_name?: string;
  phone?: number | string;
  gender?: string;
  dob?: string;
  profile_pic?: string;
  address?: {
    personal_address?: string;
    shoping_address?: string;
    billing_address?: string;
    address_village?: string;
    landmark?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  } | string;
  wishlist?: any[];
  orders?: any[];
  emailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  role: string | null;
  setRole: (role: string | null) => void;
  login: (
    email: string,
    password: string,
    redirectTo?: string,
    navCallback?: (to: string) => void
  ) => Promise<void>;
  logout: (navCallback?: (to: string) => void) => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Keep role synced with user.role
  useEffect(() => {
    setRole(user?.role ?? null);
  }, [user]);

  // Fetch logged-in user from backend (cookie-based auth)
  const fetchUser = async () => {
    try {
      const res = await fetch(apiUrl('/clients/user/me'), { credentials: 'include' });

      if (res.status === 401) {
        // User is logged out - silently reset state
        setUser(null);
        setToken(null);
        setRole(null);
        try { localStorage.removeItem('isLoggedIn'); } catch {}
        return;
      }

      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Invalid response from /user/me: ${contentType} body=${text?.slice(0, 120)}`);
      }

      const data = await res.json();
      if (!data?.user) {
        setUser(null);
        setToken(null);
        setRole(null);
        return;
      }

      setUser(data.user);
      setRole(data.user?.role ?? null);
    } catch (err) {
      console.error('[AuthProvider] fetchUser failed:', err);
      setUser(null);
      setToken(null);
      setRole(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      // Avoid hitting /me when clearly logged out
      let shouldFetch = false;
      try {
        shouldFetch = localStorage.getItem('isLoggedIn') === '1';
      } catch {}

      if (shouldFetch) {
        await fetchUser();
      }
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login using cookie-based auth
  const login = async (
    email: string,
    password: string,
    redirectTo?: string,
    navCallback?: (to: string) => void
  ) => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/clients/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => null);
        throw new Error(`Invalid login response: ${text?.slice(0, 120)}`);
      }

      if (!res.ok || (data && data.ok === false)) {
        throw new Error(data?.msg || 'Login failed');
      }

      await fetchUser();

      if (data?.user?.role) setRole(data.user.role);

      // Mark as logged in so init() fetches next time
      try { localStorage.setItem('isLoggedIn', '1'); } catch {}

      if (navCallback) navCallback(redirectTo || '/');
    } catch (err) {
      console.error('[AuthProvider] Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout and clear all states
  const logout = async (navCallback?: (to: string) => void) => {
    try {
      await fetch(apiUrl('/clients/logout'), { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('[AuthProvider] logout backend call failed', e);
    }

    setUser(null);
    setToken(null);
    setRole(null);

    try { localStorage.removeItem('token'); } catch {}
    try { localStorage.removeItem('isLoggedIn'); } catch {}

    try {
      const bc = new BroadcastChannel('auth');
      bc.postMessage({ type: 'logout' });
      bc.close();
      window.dispatchEvent(new CustomEvent('auth:logout'));
    } catch {}

    if (navCallback) navCallback('/auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        role,
        setRole,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};

export const useAuth = useAuthContext;
