import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, BookOpen, BarChart3 } from 'lucide-react';
import { theme } from 'antd';

const TABS = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/income', label: 'Income', icon: ArrowDownCircle },
  { to: '/expense', label: 'Expense', icon: ArrowUpCircle },
  { to: '/monthly-book', label: 'Cash Book', icon: BookOpen },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
] as const;

export function BottomNav() {
  const { token } = theme.useToken();

  return (
    <nav
      className="bottom-nav-mobile"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        background: token.colorBgContainer,
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: 64,
        }}
      >
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '4px 12px',
              fontSize: 10,
              fontWeight: 500,
              textDecoration: 'none',
              color: isActive ? token.colorPrimary : token.colorTextSecondary,
              transition: 'color 0.2s',
            })}
          >
            {({ isActive }) => (
              <>
                <tab.icon
                  style={{
                    width: 20,
                    height: 20,
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.2s',
                  }}
                />
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .bottom-nav-mobile {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
