import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  _id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: number;
  gender: string;
  dob?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, redirectTo?: string, navCallback?: (to: string) => void) => Promise<void>;
  logout: (navCallback?: (to: string) => void) => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (authToken: string) => {
    const res = await fetch('/api/users/me', {
      headers: { Authorization: authToken },
    });

    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await res.text();
      if (text.startsWith('<!DOCTYPE')) throw new Error('HTML instead of JSON from /api/users/me');
      throw new Error('Invalid content-type in user fetch');
    }

    const data = await res.json();
    if (!data?.user) throw new Error('User fetch failed');
    setUser(data.user);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    const validateTokenAndFetchUser = async () => {
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/validatetoken', {
          headers: { Authorization: storedToken },
        });

        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const html = await res.text();
          if (html.startsWith('<!DOCTYPE')) throw new Error('HTML instead of JSON in token validation');
          throw new Error('Invalid token content-type');
        }

        const data = await res.json();
        if (!data.ok) throw new Error('Invalid token');

        setToken(storedToken);
        await fetchUser(storedToken);
      } catch (err) {
        console.error('[AuthProvider] Auth failed:', err);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    validateTokenAndFetchUser();
  }, []);

  const login = async (email: string, password: string, redirectTo?: string, navCallback?: (to: string) => void) => {
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const html = await res.text();
        if (html.startsWith('<!DOCTYPE')) throw new Error('HTML instead of JSON in login');
        throw new Error('Invalid login content-type');
      }

      const data = await res.json();
      if (!res.ok || !data.ok || !data.token) throw new Error(data.msg || 'Login failed');

      setToken(data.token);
      localStorage.setItem('token', data.token);
      await fetchUser(data.token);

      if (navCallback) navCallback(redirectTo || '/');
    } catch (err) {
      console.error('[AuthProvider] Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = (navCallback?: (to: string) => void) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    if (navCallback) navCallback('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
