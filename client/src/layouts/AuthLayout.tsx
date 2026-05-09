import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-blue-500 text-primary-foreground shadow-glow mb-4">
            <span className="font-display text-xl font-bold">D</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Daily Cash Book</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your finances effortlessly</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
