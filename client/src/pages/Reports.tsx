import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import api from '../services/api';
import { Button, Card, Select, Skeleton } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['var(--primary)', 'var(--expense)', 'var(--income)', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Reports() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [yearlyData, setYearlyData] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/reports/yearly', { params: { year: year - 57 } }),
      api.get('/reports/categories', { params: { startDate: `${year}-01-01`, endDate: `${year}-12-31` } }),
    ])
      .then(([yearly, cat]) => {
        setYearlyData(yearly.data);
        setCategoryData(cat.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  const barData = yearlyData?.monthlyData?.map((m: any) => ({
    name: m.nepaliMonth?.slice(0, 3),
    Income: m.totalIncome,
    Expense: m.totalExpense,
  })) || [];

  const pieData = categoryData.map((c: any) => ({
    name: c.category?.name || 'Unknown',
    value: c.total,
    icon: c.category?.icon || '',
  }));

  const handleExport = async (format: string) => {
    try {
      const { data } = await api.get(`/export/${format}`, {
        params: { startDate: `${year}-01-01`, endDate: `${year}-12-31` },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton.Button active style={{ height: 32, width: 192 }} />
        <Skeleton.Button active style={{ height: 288, borderRadius: 12 }} block />
        <Skeleton.Button active style={{ height: 288, borderRadius: 12 }} block />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-display text-lg font-semibold">Reports & Analytics</h2>
        <div className="flex items-center gap-2">
          <Select value={String(year)} onChange={(v) => setYear(Number(v))} style={{ width: 100 }}>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
              <Select.Option key={y} value={String(y)}>{y}</Select.Option>
            ))}
          </Select>
          <Button icon={<Download className="size-3.5" />} onClick={() => handleExport('excel')}>Excel</Button>
          <Button icon={<Download className="size-3.5" />} onClick={() => handleExport('pdf')}>PDF</Button>
        </div>
      </div>

      {barData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="font-display font-semibold text-sm mb-4">Monthly Income vs Expense</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
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
                <Bar dataKey="Income" fill="var(--income)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="var(--expense)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}

      {pieData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <h3 className="font-display font-semibold text-sm mb-4">Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: 'var(--foreground)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {pieData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {entry.icon} {entry.name}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {pieData.length === 0 && barData.length === 0 && (
        <Card>
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <p className="text-muted-foreground mb-1">No data available for {year - 57}</p>
            <p className="text-sm text-muted-foreground">Add transactions to see reports</p>
          </div>
        </Card>
      )}
    </div>
  );
}
