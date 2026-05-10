import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Button, Layout, Typography, FloatButton, Avatar, Grid, Flex, Space, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();
  const { token } = theme.useToken();

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const isTransactionEdit = location.pathname.includes('/transactions/edit');
  const pageTitle = isTransactionEdit ? 'Edit Transaction'
    : PAGE_TITLES[location.pathname] || PAGE_TITLES['/' + location.pathname.split('/').filter(Boolean)[0]] || 'Daily Cash Book';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: '0 24px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <Flex align="center" justify="space-between" style={{ width: '100%' }}>
            <Flex align="center" gap={12}>
              {!screens.lg && (
                <Button type="text" icon={<Menu style={{ width: 20, height: 20 }} />} onClick={() => setSidebarOpen(true)} />
              )}
              <div>
                <Typography.Title level={4} style={{ margin: 0, fontSize: 18 }}>
                  {pageTitle}
                </Typography.Title>
                {screens.sm && (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </Typography.Text>
                )}
              </div>
            </Flex>
            <Space size={8}>
              <Button type="text" icon={<Bell style={{ width: 18, height: 18 }} />} />
              <Avatar size={36} style={{ background: token.colorPrimary, verticalAlign: 'middle' }}>
                {initials}
              </Avatar>
            </Space>
          </Flex>
        </Header>
        <Content style={{ padding: 24, background: token.colorBgLayout, minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
        {!isTransactionEdit && !screens.md && (
          <FloatButton icon={<PlusOutlined />} href="/transactions/new" />
        )}
      </Layout>
      {!screens.lg && <BottomNav />}
    </Layout>
  );
}
