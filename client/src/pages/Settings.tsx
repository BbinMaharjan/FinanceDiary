import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Download, LogOut, User, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

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
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-blue-500 text-primary-foreground font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <Separator />

            <form onSubmit={handleSave} className="space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <User className="size-4" /> Profile
              </h4>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${message === 'Profile updated' ? 'bg-income/10 text-income' : 'bg-destructive/10 text-destructive'}`}>
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" disabled={saving}>
                <Save className="size-4 mr-1" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              {dark ? <Moon className="size-4" /> : <Sun className="size-4" />} Appearance
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
              </div>
              <Switch checked={dark} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Download className="size-4" /> Export Data
            </h4>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => window.open('/api/export/excel', '_blank')}>
                <Download className="size-4 mr-1" /> Excel
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => window.open('/api/export/pdf', '_blank')}>
                <Download className="size-4 mr-1" /> PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardContent className="pt-6">
            <Button variant="destructive" className="w-full" onClick={logout}>
              <LogOut className="size-4 mr-1" /> Sign out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
