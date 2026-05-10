import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import api from '../services/api';
import { Button, Card, Input, Select, Alert } from 'antd';
import { ArrowLeft } from 'lucide-react';

export default function TransactionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { createTransaction, updateTransaction } = useTransactions();
  const { categories: incomeCategories } = useCategories('income');
  const { categories: expenseCategories } = useCategories('expense');

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    paymentType: 'Cash',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      api.get(`/transactions/${id}`).then(({ data }) => {
        setForm({
          date: new Date(data.date).toISOString().split('T')[0],
          title: data.title,
          amount: String(data.amount),
          type: data.type,
          category: data.category?._id || '',
          paymentType: data.paymentType,
          notes: data.notes || '',
        });
      }).catch(() => navigate('/transactions'));
    }
  }, [id]);

  const categories = form.type === 'income' ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (!form.category && categories.length > 0) {
      setForm((prev) => ({ ...prev, category: categories[0]._id }));
    }
  }, [form.type, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (isEdit) {
        await updateTransaction(id!, payload);
      } else {
        await createTransaction(payload);
      }
      navigate('/transactions');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Link to="/transactions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-4" /> Back
      </Link>

      <h2 className="font-display text-lg font-semibold">{isEdit ? 'Edit Transaction' : 'New Transaction'}</h2>

      {error && <Alert message={error} type="error" showIcon />}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4" style={{ padding: 0 }}>
          <div className="flex gap-2">
            {(['income', 'expense'] as const).map((t) => (
              <Button
                key={t}
                type={form.type === t ? 'primary' : 'default'}
                danger={form.type === t && t === 'expense'}
                onClick={() => setForm({ ...form, type: t, category: '' })}
                style={{ flex: 1 }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Date</label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Title</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What for?" required />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Amount (रू)</label>
            <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Category</label>
            <Select value={form.category || undefined} onChange={(v) => setForm({ ...form, category: v })} style={{ width: '100%' }}>
              {categories.map((cat: any) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Payment Type</label>
            <Select value={form.paymentType} onChange={(v) => setForm({ ...form, paymentType: v })} style={{ width: '100%' }}>
              {['Cash', 'Bank Transfer', 'Card', 'UPI', 'Wallet', 'Other'].map((pt) => (
                <Select.Option key={pt} value={pt}>{pt}</Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="ant-input"
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--border)' }}
            />
          </div>

          <Button type="primary" htmlType="submit" loading={loading} block>
            {loading ? 'Saving...' : isEdit ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
