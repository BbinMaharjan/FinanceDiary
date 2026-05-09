import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import api from '../services/api';
import { StatCard } from '../components/cashbook/StatCard';
import { TransactionItem } from '../components/cashbook/TransactionItem';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const chartData = [
    { name: 'Income', value: data.monthlyIncome },
    { name: 'Expense', value: data.monthlyExpense },
    { name: 'Balance', value: data.monthlyBalance },
  ];

  const deltaIncome = data.lastMonthIncome ? Math.round(((data.monthlyIncome - data.lastMonthIncome) / data.lastMonthIncome) * 100) : undefined;
  const deltaExpense = data.lastMonthExpense ? Math.round(((data.monthlyExpense - data.lastMonthExpense) / data.lastMonthExpense) * 100) : undefined;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Monthly Income" amount={data.monthlyIncome} variant="income" delta={deltaIncome} index={0} />
        <StatCard label="Monthly Expense" amount={data.monthlyExpense} variant="expense" delta={deltaExpense} index={1} />
        <StatCard label="Net Balance" amount={data.monthlyBalance} variant="balance" index={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card p-5"
        >
          <h3 className="font-display font-semibold text-sm mb-4">Monthly Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="overviewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--foreground)',
                }}
              />
              <Area type="monotone" dataKey="value" stroke="var(--primary)" fill="url(#overviewGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm">Recent Transactions</h3>
            <Link to="/transactions" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          {data.recentTransactions?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">No transactions yet</p>
              <Link to="/transactions/new" className="text-sm text-primary font-medium hover:underline">
                Add your first transaction
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {data.recentTransactions?.slice(0, 6).map((tx: any, i: number) => (
                <TransactionItem
                  key={tx._id}
                  title={tx.title}
                  amount={tx.amount}
                  type={tx.type}
                  date={tx.date}
                  categoryName={tx.category?.name}
                  index={i}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
