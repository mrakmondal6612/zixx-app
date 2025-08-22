import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  _id?: string;
  // ...other user fields...
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  role: string | null;
  setRole: (role: string | null) => void;
  login: (email: string, password: string, redirectTo?: string, navCallback?: (to: string) => void) => Promise<void>;
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

  // Fetch user info using cookie-based auth
  const fetchUser = async () => {
    const res = await fetch('/api/clients/users/me', {
      credentials: 'include',
    });
    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await res.text();
      console.error('[AuthProvider] fetchUser - non-json response', res.status, text);
      if (text.startsWith('<!DOCTYPE')) throw new Error('HTML instead of JSON from /users/me');
      throw new Error('Invalid content-type in user fetch');
    }
    const data = await res.json();
    if (!data?.user) {
      console.error('[AuthProvider] fetchUser - no user in response', { status: res.status, body: data });
      throw new Error(`User fetch failed: ${res.status} ${JSON.stringify(data)}`);
    }
    setUser(data.user);
  };

  useEffect(() => {
    const validateAndFetchUser = async () => {
      try {
        await fetchUser();
      } catch (err) {
        console.error('[AuthProvider] Auth failed:', err);
        setUser(null);
        setToken(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };
    validateAndFetchUser();
    // eslint-disable-next-line
  }, []);

  // Minimal login/logout logic for cookie-based auth
  const login = async (email: string, password: string, redirectTo?: string, navCallback?: (to: string) => void) => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      let data: any;
      try {
        data = await res.json();
      } catch (parseErr) {
        const text = await res.text().catch(() => null);
        console.error('[AuthProvider] login - failed to parse JSON response', { status: res.status, text });
        if (text && text.startsWith && text.startsWith('<!DOCTYPE')) throw new Error('HTML instead of JSON in login');
        throw new Error('Invalid login content-type or malformed JSON');
      }
      if (!res.ok || !data.ok) throw new Error(data.msg || 'Login failed');
      await fetchUser();
      if (data.role) setRole(data.role);
      if (navCallback) navCallback(redirectTo || '/');
    } catch (err) {
      console.error('[AuthProvider] Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = (navCallback?: (to: string) => void) => {
    // For cookie-based logout, you may want to call a backend logout endpoint to clear the cookie
    setUser(null);
    setToken(null);
    setRole(null);
    if (navCallback) navCallback('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, role, setRole, login, logout, setUser }}>
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
