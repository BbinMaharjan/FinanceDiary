import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';

const ICONS = ['💰', '🍔', '🏠', '🚗', '📚', '💊', '👕', '🎮', '✈️', '🎵', '🏋️', '💼', '📱', '🎁', '🏥', '🐾', '🌿', '🔧', '📦', '🛒'];
const PALETTE = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

export default function Categories() {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories(type);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', icon: '📁', color: '#6b7280' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateCategory(editing, { ...form, type });
      } else {
        await createCategory({ ...form, type });
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', icon: '📁', color: '#6b7280' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleEdit = (cat: any) => {
    setEditing(cat._id);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    await deleteCategory(id);
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Categories</h2>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', icon: '📁', color: '#6b7280' }); }}>
          <Plus className="size-4 mr-1" /> Add
        </Button>
      </div>

      <div className="flex gap-2">
        {(['income', 'expense'] as const).map((t) => (
          <Button key={t} variant={type === t ? 'default' : 'outline'} size="sm" onClick={() => setType(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h3 className="font-medium text-sm">{editing ? 'Edit Category' : 'New Category'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" required />
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setForm({ ...form, icon })}
                        className={`size-9 flex items-center justify-center rounded-lg text-lg transition-all ${form.icon === icon ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm({ ...form, color })}
                        className={`size-9 rounded-lg transition-all ${form.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No categories yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {categories.map((cat: any, i: number) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between rounded-xl border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{cat.icon}</span>
                <div>
                  <p className="font-medium text-sm">{cat.name}</p>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{cat.type}</Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(cat._id)} className="hover:text-destructive">
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
