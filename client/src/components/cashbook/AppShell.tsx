import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import {
  Button,
  Layout,
  Typography,
  FloatButton,
  Avatar,
  Grid,
  Flex,
  theme,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/income": "Income",
  "/expense": "Expense",
  "/transactions": "Transactions",
  "/transactions/new": "Add Transaction",
  "/monthly-book": "Cash Book",
  "/reports": "Reports",
  "/settings": "Settings",
  "/categories": "Categories",
  "/accounts": "Bank Accounts",
};

const SIDEBAR_WIDTH = 256;

export function AppShell() {
  const location = useLocation();
  const { user } = useAuth();
  const screens = useBreakpoint();
  const { token } = theme.useToken();
  const { dark, toggleTheme } = useTheme();

  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const isTransactionEdit = location.pathname.includes("/transactions/edit");
  const pageTitle = isTransactionEdit
    ? "Edit Transaction"
    : PAGE_TITLES[location.pathname] ||
      PAGE_TITLES["/" + location.pathname.split("/").filter(Boolean)[0]] ||
      "Daily Cash Book";

  const isDesktop = screens.lg;

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {isDesktop && <Sidebar />}
      <Layout
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          marginLeft: isDesktop ? SIDEBAR_WIDTH : 0,
          transition: "margin-left 0.2s",
        }}
      >
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <Flex
            align="center"
            justify="space-between"
            style={{ width: "100%" }}
          >
            <Flex align="center" justify="center" gap={8}>
              <Typography.Title level={4} style={{ margin: 0, fontSize: 18 }}>
                {pageTitle}
              </Typography.Title>
              {screens.sm && (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography.Text>
              )}
            </Flex>
            <Flex align="center" gap={4}>
              <Button
                type="text"
                icon={dark ? <Sun style={{ width: 18, height: 18 }} /> : <Moon style={{ width: 18, height: 18 }} />}
                onClick={toggleTheme}
              />
              <Avatar
                size={36}
                style={{
                  background: token.colorPrimary,
                  verticalAlign: "middle",
                }}
              >
                {initials}
              </Avatar>
            </Flex>
          </Flex>
        </Header>
        <Content
          style={{
            padding: 24,
            background: token.colorBgLayout,
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Outlet />
        </Content>
        {!isTransactionEdit && !screens.md && (
          <FloatButton icon={<PlusOutlined />} href="/transactions/new" />
        )}
      </Layout>
      {!screens.lg && <BottomNav />}
    </div>
  );
}
