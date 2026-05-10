import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionItem } from '../components/cashbook/TransactionItem';
import { Button, Input, Select, Skeleton } from 'antd';
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
        <Link to="/transactions/new">
          <Button type="primary" icon={<Plus className="size-4" />}>Add</Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search transactions..."
          style={{ paddingLeft: 36 }}
        />
      </form>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {!routeType && (
          <Select
            value={effectiveType || undefined}
            onChange={(v) => setFilter('type', v || '')}
            placeholder="All Types"
            style={{ width: 130 }}
            allowClear
          >
            <Select.Option value="">All Types</Select.Option>
            <Select.Option value="income">Income</Select.Option>
            <Select.Option value="expense">Expense</Select.Option>
          </Select>
        )}
        <Select
          value={params.paymentType || undefined}
          onChange={(v) => setFilter('paymentType', v || '')}
          placeholder="Payment"
          style={{ width: 140 }}
          allowClear
        >
          <Select.Option value="">All Payment</Select.Option>
          <Select.Option value="Cash">Cash</Select.Option>
          <Select.Option value="Bank Transfer">Bank</Select.Option>
          <Select.Option value="Card">Card</Select.Option>
          <Select.Option value="UPI">UPI</Select.Option>
          <Select.Option value="Wallet">Wallet</Select.Option>
          <Select.Option value="Other">Other</Select.Option>
        </Select>
        <Input
          type="date"
          value={params.startDate || ''}
          onChange={(e) => setFilter('startDate', e.target.value)}
          style={{ width: 140 }}
        />
        <Input
          type="date"
          value={params.endDate || ''}
          onChange={(e) => setFilter('endDate', e.target.value)}
          style={{ width: 140 }}
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton.Button key={i} active style={{ height: 64, borderRadius: 12 }} block />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No transactions found</p>
          <Link to="/transactions/new">
            <Button type="link">Add your first transaction</Button>
          </Link>
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
                  type={page === i + 1 ? 'primary' : 'default'}
                  size="small"
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
