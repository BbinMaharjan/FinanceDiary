import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearStoredUser, getStoredUser, setUnauthorizedHandler, storeUser } from '../api/client';
import type { User } from '../api/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getStoredUser().then(u => {
      if (mounted) setUser(u);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<User>('/auth/login', { email, password });
    await storeUser(data);
    setUser(data);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await api.post<User>('/auth/register', { name, email, password });
    await storeUser(data);
    setUser(data);
  }, []);

  const logout = useCallback(async () => {
    await clearStoredUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
