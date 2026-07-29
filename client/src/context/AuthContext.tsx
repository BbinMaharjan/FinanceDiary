import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const updated = { ...user, ...data } as User;
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    },
    retry: false,
    enabled: !!JSON.parse(localStorage.getItem('user') || 'null')?.token,
    staleTime: Infinity,
  });

  const [user, setUser] = useState<User | null>(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    queryClient.setQueryData(['auth', 'me'], data);
    return data as User;
  }, [queryClient]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    queryClient.setQueryData(['auth', 'me'], data);
    return data as User;
  }, [queryClient]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    queryClient.setQueryData(['auth', 'me'], null);
    queryClient.clear();
  }, [queryClient]);

  const loading = isLoading && !!user?.token;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
