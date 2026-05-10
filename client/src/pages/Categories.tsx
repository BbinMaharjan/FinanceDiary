import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { Button, Input, Card, Skeleton, Tag } from 'antd';

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
        <Button type="primary" icon={<Plus className="size-4" />} onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', icon: '📁', color: '#6b7280' }); }}>
          Add
        </Button>
      </div>

      <div className="flex gap-2">
        {(['income', 'expense'] as const).map((t) => (
          <Button key={t} type={type === t ? 'primary' : 'default'} size="small" onClick={() => setType(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="font-medium text-sm" style={{ marginBottom: 16 }}>{editing ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Icon</label>
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

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Color</label>
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
                <Button type="primary" htmlType="submit">Save</Button>
                <Button onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton.Button key={i} active style={{ height: 56, borderRadius: 12 }} block />)}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            No categories yet
          </div>
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
                  <Tag>{cat.type}</Tag>
                </div>
              </div>
              <div className="flex gap-1">
                <Button type="text" icon={<Pencil className="size-3.5" />} onClick={() => handleEdit(cat)} />
                <Button type="text" danger icon={<Trash2 className="size-3.5" />} onClick={() => handleDelete(cat._id)} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
