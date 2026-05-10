import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import api from '../services/api';
import { Button, Card, Input, Select, Alert } from 'antd';
import { ArrowLeft } from 'lucide-react';
import type { Transaction, TransactionType, PaymentType, ApiError } from '../types';

interface TransactionFormState {
  date: string;
  title: string;
  amount: string;
  type: TransactionType;
  category: string;
  paymentType: PaymentType;
  notes: string;
}

export default function TransactionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { createTransaction, updateTransaction } = useTransactions();
  const { categories: incomeCategories } = useCategories('income');
  const { categories: expenseCategories } = useCategories('expense');

  const [form, setForm] = useState<TransactionFormState>({
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
      api.get<Transaction>(`/transactions/${id}`).then(({ data }) => {
        setForm({
          date: new Date(data.date).toISOString().split('T')[0],
          title: data.title,
          amount: String(data.amount),
          type: data.type,
          category: typeof data.category === 'object' && '_id' in data.category ? data.category._id : '',
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
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Link to="/transactions" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, color: '#8c8c8c', textDecoration: 'none' }}>
        <ArrowLeft style={{ width: 16, height: 16 }} /> Back
      </Link>

      <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{isEdit ? 'Edit Transaction' : 'New Transaction'}</h2>

      {error && <Alert message={error} type="error" showIcon />}

      <Card style={{ borderRadius: 12 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
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

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Date</label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Title</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What for?" required />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Amount (रू)</label>
            <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Category</label>
            <Select value={form.category || undefined} onChange={(v) => setForm({ ...form, category: v })} style={{ width: '100%' }}>
              {categories.map((cat: { _id: string; icon: string; name: string }) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Payment Type</label>
            <Select value={form.paymentType} onChange={(v) => setForm({ ...form, paymentType: v as PaymentType })} style={{ width: '100%' }}>
              {(['Cash', 'Bank Transfer', 'Card', 'Other'] as PaymentType[]).map((pt) => (
                <Select.Option key={pt} value={pt}>{pt}</Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="ant-input"
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d9d9d9' }}
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
