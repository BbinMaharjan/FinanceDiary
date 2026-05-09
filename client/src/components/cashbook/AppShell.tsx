import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, Search, Bell, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Button } from '../ui/button';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/income': 'Income',
  '/expense': 'Expense',
  '/transactions': 'Transactions',
  '/transactions/new': 'Add Transaction',
  '/monthly-book': 'Cash Book',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/categories': 'Categories',
};

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const currentPath = '/' + location.pathname.split('/').filter(Boolean).slice(0, 1).join('/');
  const isTransactionEdit = location.pathname.includes('/transactions/edit');
  const pageTitle = isTransactionEdit ? 'Edit Transaction'
    : PAGE_TITLES[location.pathname] || PAGE_TITLES['/' + location.pathname.split('/').filter(Boolean)[0]] || 'Daily Cash Book';

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-4 md:px-8 h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 -ml-1.5 text-muted-foreground hover:text-foreground">
                <Menu className="size-5" />
              </button>
              <div>
                <h1 className="text-lg md:text-xl font-display font-semibold">{pageTitle}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                <Search className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="size-4" />
                <span className="absolute top-2 right-2 size-1.5 rounded-full bg-expense" />
              </Button>
              <div className="size-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-blue-500 grid place-items-center text-primary-foreground text-sm font-semibold shadow-glow">
                {initials}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 md:px-8 py-6 pb-28 md:pb-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
        {!isTransactionEdit && (
          <Link
            to="/transactions/new"
            className="md:hidden fixed bottom-20 right-4 z-40 size-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-blue-500 grid place-items-center text-primary-foreground shadow-glow active:scale-95 transition-transform"
          >
            <Plus className="size-6" />
          </Link>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
