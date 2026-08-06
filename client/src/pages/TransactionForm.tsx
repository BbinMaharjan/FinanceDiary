import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useAccounts } from '../hooks/useAccounts';
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
  account?: string;
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
  const { accounts } = useAccounts();

  const [form, setForm] = useState<TransactionFormState>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    paymentType: 'Cash',
    notes: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const { isLoading: loading, error: fetchError } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      if (!isEdit || !id) return null;
      const { data } = await api.get<Transaction>(`/transactions/${id}`);
      setForm({
        date: new Date(data.date).toISOString().split('T')[0],
        title: data.title,
        amount: String(data.amount),
        type: data.type,
        category: typeof data.category === 'object' && '_id' in data.category ? data.category._id : '',
        account: typeof data.account === 'object' && data.account && '_id' in data.account ? data.account._id : undefined,
        paymentType: data.paymentType,
        notes: data.notes || '',
      });
      return data;
    },
    enabled: isEdit,
    retry: false,
  });

  useEffect(() => {
    if (fetchError) navigate('/transactions');
  }, [fetchError, navigate]);

  const categories = form.type === 'income' ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (!form.category && categories.length > 0) {
      setForm((prev) => ({ ...prev, category: categories[0]._id }));
    }
  }, [form.type, categories]);

  const handlePaymentTypeChange = (paymentType: PaymentType) => {
    setForm((prev) => ({
      ...prev,
      paymentType,
      account: paymentType === 'Cash' ? undefined : prev.account,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount), account: form.account || undefined };
      if (isEdit) {
        await updateTransaction({ id: id!, ...payload });
        navigate('/transactions');
      } else {
        await createTransaction(payload);
        setForm({
          date: new Date().toISOString().split('T')[0],
          title: '',
          amount: '',
          type: form.type,
          category: '',
          account: undefined,
          paymentType: 'Cash',
          notes: '',
        });
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.response?.data?.message || 'Failed to save transaction');
    } finally {
      setSaving(false);
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
            <Select value={form.paymentType} onChange={(v) => handlePaymentTypeChange(v as PaymentType)} style={{ width: '100%' }}>
              {(['Cash', 'Bank Transfer', 'Card', 'Other'] as PaymentType[]).map((pt) => (
                <Select.Option key={pt} value={pt}>{pt}</Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
              Bank Account {form.paymentType === 'Cash' ? '(optional)' : ''}
            </label>
            <Select
              value={form.account || undefined}
              onChange={(v) => setForm({ ...form, account: v })}
              placeholder={form.paymentType === 'Cash' ? 'Not needed for cash payments' : 'Select an account (optional)'}
              style={{ width: '100%' }}
              allowClear
              notFoundContent={accounts.length === 0 ? (
                <Link to="/accounts" style={{ padding: 8, display: 'block', color: '#1677ff' }}>+ Add a bank account</Link>
              ) : 'No accounts'}
            >
              {accounts.map((acc: { _id: string; name: string; bankName?: string }) => (
                <Select.Option key={acc._id} value={acc._id}>
                  {acc.name}{acc.bankName ? ` (${acc.bankName})` : ''}
                </Select.Option>
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

          <Button type="primary" htmlType="submit" loading={saving} block>
            {saving ? 'Saving...' : isEdit ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
