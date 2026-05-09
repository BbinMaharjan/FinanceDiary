import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

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

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {(['income', 'expense'] as const).map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={form.type === t ? (t === 'income' ? 'default' : 'destructive') : 'outline'}
                  className="flex-1"
                  onClick={() => setForm({ ...form, type: t, category: '' })}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What for?" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (रू)</Label>
              <Input id="amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select value={form.paymentType} onValueChange={(v) => setForm({ ...form, paymentType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Cash', 'Bank Transfer', 'Card', 'UPI', 'Wallet', 'Other'].map((pt) => (
                    <SelectItem key={pt} value={pt}>{pt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? 'Saving...' : isEdit ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
