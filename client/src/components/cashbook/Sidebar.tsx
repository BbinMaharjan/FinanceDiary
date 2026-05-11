import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  BookOpen,
  BarChart3,
  Settings,
  Tags,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Typography, theme } from "antd";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/daily-summary", label: "Daily Summary", icon: CalendarDays },
  { to: "/income", label: "Income", icon: ArrowDownCircle },
  { to: "/expense", label: "Expense", icon: ArrowUpCircle },
  { to: "/monthly-book", label: "Cash Book", icon: BookOpen },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const { user } = useAuth();
  const { token } = theme.useToken();

  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <aside
      style={{
        width: 256,
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 30,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          Daily Cash Book
        </Typography.Title>
      </div>

      <nav style={{ flex: 1, padding: 12, overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              marginBottom: 4,
              background: isActive ? token.colorFillSecondary : "transparent",
              color: isActive ? token.colorText : token.colorTextSecondary,
              transition: "background 0.2s, color 0.2s",
            })}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = token.colorFillTertiary;
            }}
            onMouseLeave={(e) => {
              const isActive = e.currentTarget.classList.contains("active");
              if (!isActive) e.currentTarget.style.background = "transparent";
            }}
          >
            <item.icon style={{ width: 16, height: 16 }} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          padding: 16,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {/* <div
          style={{
            borderRadius: 12,
            background: `linear-gradient(135deg, ${token.colorPrimary}, #3b82f6)`,
            padding: 16,
            color: '#fff',
            marginBottom: 12,
          }}
        >
          <Typography.Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 500, display: 'block' }}>
            Track every रुपया
          </Typography.Text>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, display: 'block', marginTop: 2 }}>
            Small wins compound.
          </Typography.Text>
        </div> */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${token.colorPrimary}, #3b82f6)`,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography.Text
              style={{
                fontSize: 14,
                fontWeight: 500,
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name || "User"}
            </Typography.Text>
            <Typography.Text
              type="secondary"
              style={{
                fontSize: 12,
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email}
            </Typography.Text>
          </div>
        </div>
      </div>
    </aside>
  );
}
