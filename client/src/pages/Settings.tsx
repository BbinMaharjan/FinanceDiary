import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Download, LogOut, User, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Button, Card, Input, Switch, Divider, Avatar, Alert, Typography } from 'antd';
import type { ApiError } from '../types';

export default function Settings() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/auth/profile', { name, email });
      setMessage('Profile updated');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setMessage(apiErr.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Typography.Title level={4} style={{ margin: 0 }}>Settings</Typography.Title>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Avatar size={56} style={{ background: '#1677ff', verticalAlign: 'middle', fontSize: 20, fontWeight: 600 }}>
              {initials}
            </Avatar>
            <div>
              <Typography.Text style={{ fontWeight: 500, display: 'block' }}>{user?.name}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 14 }}>{user?.email}</Typography.Text>
            </div>
          </div>

          <Divider />

          <form onSubmit={handleSave}>
            <h4 style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <User style={{ width: 16, height: 16 }} /> Profile
            </h4>

            {message && (
              <Alert message={message} type={message === 'Profile updated' ? 'success' : 'error'} showIcon style={{ marginBottom: 16 }} />
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="primary" htmlType="submit" loading={saving} icon={<Save style={{ width: 16, height: 16 }} />}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card style={{ borderRadius: 12 }}>
          <h4 style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            {dark ? <Moon style={{ width: 16, height: 16 }} /> : <Sun style={{ width: 16, height: 16 }} />} Appearance
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Typography.Text style={{ fontWeight: 500, display: 'block' }}>Dark Mode</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 14 }}>Switch between light and dark theme</Typography.Text>
            </div>
            <Switch checked={dark} onChange={toggleTheme} />
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card style={{ borderRadius: 12 }}>
          <h4 style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Download style={{ width: 16, height: 16 }} /> Export Data
          </h4>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<Download style={{ width: 16, height: 16 }} />} onClick={() => window.open('/api/export/excel', '_blank')} style={{ flex: 1 }}>
              Excel
            </Button>
            <Button icon={<Download style={{ width: 16, height: 16 }} />} onClick={() => window.open('/api/export/pdf', '_blank')} style={{ flex: 1 }}>
              PDF
            </Button>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card style={{ borderRadius: 12 }}>
          <Button danger block icon={<LogOut style={{ width: 16, height: 16 }} />} onClick={logout}>
            Sign out
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
