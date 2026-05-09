import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionItem } from '../components/cashbook/TransactionItem';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Plus, Search } from 'lucide-react';

interface Props {
  type?: string | null;
}

export default function Transactions({ type: routeType }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const effectiveType = routeType || params.type || '';
  const queryParams = { ...params, type: effectiveType || undefined };
  const { transactions, total, page, pages, loading, deleteTransaction, refetch } = useTransactions(queryParams);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchText, setSearchText] = useState(params.search || '');

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this transaction?')) return;
    setDeleting(id);
    await deleteTransaction(id);
    setDeleting(null);
  };

  const setFilter = (key: string, value: string) => {
    const next = { ...params };
    if (value) next[key] = value;
    else delete next[key];
    setSearchParams(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter('search', searchText);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">
          {routeType === 'income' ? 'Income' : routeType === 'expense' ? 'Expense' : 'All'} Transactions
        </h2>
        <Button asChild>
          <Link to="/transactions/new">
            <Plus className="size-4" /> Add
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search transactions..."
          className="pl-9"
        />
      </form>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {!routeType && (
          <Select value={effectiveType} onValueChange={(v) => setFilter('type', v)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Select value={params.paymentType || ''} onValueChange={(v) => setFilter('paymentType', v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Payment</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Bank Transfer">Bank</SelectItem>
            <SelectItem value="Card">Card</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="Wallet">Wallet</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={params.startDate || ''}
          onChange={(e) => setFilter('startDate', e.target.value)}
          className="w-[140px]"
        />
        <Input
          type="date"
          value={params.endDate || ''}
          onChange={(e) => setFilter('endDate', e.target.value)}
          className="w-[140px]"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No transactions found</p>
          <Button asChild variant="link">
            <Link to="/transactions/new">Add your first transaction</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-xl border bg-card divide-y divide-border">
            {transactions.map((tx: any, i: number) => (
              <div key={tx._id} className="relative group">
                <Link
                  to={`/transactions/edit/${tx._id}`}
                  className="block hover:bg-muted/30 transition-colors rounded-xl [&>div]:rounded-none"
                >
                  <TransactionItem
                    title={tx.title}
                    amount={tx.amount}
                    type={tx.type}
                    date={tx.date}
                    categoryName={tx.category?.name}
                    paymentType={tx.paymentType}
                    index={i}
                  />
                </Link>
                <button
                  onClick={() => handleDelete(tx._id)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pages }).map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('page', String(i + 1))}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
