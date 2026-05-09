import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, BookOpen, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';

const TABS = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/income', label: 'Income', icon: ArrowDownCircle },
  { to: '/expense', label: 'Expense', icon: ArrowUpCircle },
  { to: '/monthly-book', label: 'Cash Book', icon: BookOpen },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
] as const;

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="flex justify-around items-center h-16">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {({ isActive }) => (
              <>
                <tab.icon className={cn('size-5 transition-transform', isActive && 'scale-110')} />
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
