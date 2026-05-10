import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Download, LogOut, User, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Button, Card, Input, Switch, Divider, Avatar, Alert, Typography } from 'antd';

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
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="font-display text-lg font-semibold">Settings</h2>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-4" style={{ marginBottom: 16 }}>
            <Avatar size={56} style={{ backgroundColor: 'var(--primary)', verticalAlign: 'middle', fontSize: 20, fontWeight: 600 }}>
              {initials}
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <Divider />

          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <User className="size-4" /> Profile
            </h4>

            {message && (
              <Alert message={message} type={message === 'Profile updated' ? 'success' : 'error'} showIcon />
            )}

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="primary" htmlType="submit" loading={saving} icon={<Save className="size-4" />}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <h4 className="font-medium text-sm flex items-center gap-2" style={{ marginBottom: 16 }}>
            {dark ? <Moon className="size-4" /> : <Sun className="size-4" />} Appearance
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
            </div>
            <Switch checked={dark} onChange={toggleTheme} />
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <h4 className="font-medium text-sm flex items-center gap-2" style={{ marginBottom: 16 }}>
            <Download className="size-4" /> Export Data
          </h4>
          <div className="flex gap-2">
            <Button icon={<Download className="size-4" />} onClick={() => window.open('/api/export/excel', '_blank')} style={{ flex: 1 }}>
              Excel
            </Button>
            <Button icon={<Download className="size-4" />} onClick={() => window.open('/api/export/pdf', '_blank')} style={{ flex: 1 }}>
              PDF
            </Button>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <Button danger block icon={<LogOut className="size-4" />} onClick={logout}>
            Sign out
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
