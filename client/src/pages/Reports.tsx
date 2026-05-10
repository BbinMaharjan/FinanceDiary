import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import api from '../services/api';
import { Button, Card, Select, Skeleton, Typography, Flex } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { YearlyReportData, CategoryReportItem, MonthlySummary } from '../types';

const COLORS = ['#1677ff', '#f97316', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#fa8c16'];

export default function Reports() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [yearlyData, setYearlyData] = useState<YearlyReportData | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<YearlyReportData>('/reports/yearly', { params: { year } }),
      api.get<CategoryReportItem[]>('/reports/categories', { params: { startDate: `${year}-01-01`, endDate: `${year}-12-31` } }),
    ])
      .then(([yearly, cat]) => {
        setYearlyData(yearly.data);
        setCategoryData(cat.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  const barData = yearlyData?.monthlyData?.map((m: MonthlySummary) => ({
    name: m.month?.slice(0, 3),
    Income: m.totalIncome,
    Expense: m.totalExpense,
  })) || [];

  const pieData = categoryData.map((c: CategoryReportItem) => ({
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
      const url = URL.createObjectURL(data as Blob);
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Skeleton.Button active style={{ height: 32, width: 192 }} />
        <Skeleton.Button active style={{ height: 288, borderRadius: 12, width: '100%' }} />
        <Skeleton.Button active style={{ height: 288, borderRadius: 12, width: '100%' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
        <Typography.Title level={4} style={{ margin: 0 }}>Reports & Analytics</Typography.Title>
        <Flex gap={8} align="center">
          <Select value={String(year)} onChange={(v) => setYear(Number(v))} style={{ width: 100 }}>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
              <Select.Option key={y} value={String(y)}>{y}</Select.Option>
            ))}
          </Select>
          <Button icon={<Download style={{ width: 14, height: 14 }} />} onClick={() => handleExport('excel')}>Excel</Button>
          <Button icon={<Download style={{ width: 14, height: 14 }} />} onClick={() => handleExport('pdf')}>PDF</Button>
        </Flex>
      </Flex>

      {barData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card title={<Typography.Text strong>Monthly Income vs Expense</Typography.Text>} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#8c8c8c" fontSize={12} />
                <YAxis stroke="#8c8c8c" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0' }} />
                <Bar dataKey="Income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}

      {pieData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card title={<Typography.Text strong>Category Breakdown</Typography.Text>} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0' }} />
              </PieChart>
            </ResponsiveContainer>
            <Flex wrap="wrap" gap={8} justify="center" style={{ marginTop: 16 }}>
              {pieData.map((entry, i) => (
                <Flex key={entry.name} align="center" gap={4} style={{ fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length], display: 'inline-block' }} />
                  {entry.icon} {entry.name}
                </Flex>
              ))}
            </Flex>
          </Card>
        </motion.div>
      )}

      {pieData.length === 0 && barData.length === 0 && (
        <Card style={{ borderRadius: 12 }}>
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>No data available for {year}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 14 }}>Add transactions to see reports</Typography.Text>
          </div>
        </Card>
      )}
    </div>
  );
}
