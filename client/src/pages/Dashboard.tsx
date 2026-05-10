import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card, Col, Row, Skeleton, Typography, Flex } from 'antd';
import { StatCard } from '../components/cashbook/StatCard';
import { TransactionItem } from '../components/cashbook/TransactionItem';
import api from '../services/api';
import type { DashboardData, CategorySpending, Transaction } from '../types';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/reports/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error('Dashboard API error:', err);
        setError(err.message || 'Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} sm={8} key={i}>
              <Skeleton.Button active style={{ height: 128, borderRadius: 16, width: '100%' }} />
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Skeleton.Button active style={{ height: 320, borderRadius: 12, width: '100%' }} />
          </Col>
          <Col xs={24} lg={12}>
            <Skeleton.Button active style={{ height: 320, borderRadius: 12, width: '100%' }} />
          </Col>
        </Row>
        <Col xs={24}>
          <Skeleton.Button active style={{ height: 320, borderRadius: 12, width: '100%' }} />
        </Col>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Typography.Text type="danger" style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
          {error}
        </Typography.Text>
        <Typography.Text type="secondary">Check that the backend server is running on port 5000</Typography.Text>
      </div>
    );
  }

  if (!data) return null;

  const totalSpend = data.spendingBreakdown?.reduce((sum: number, c: CategorySpending) => sum + c.total, 0) || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <StatCard label="Overall Income" amount={data.overallIncome} variant="income" index={0} />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard label="Overall Expense" amount={data.overallExpense} variant="expense" index={1} />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard label="Net Balance" amount={data.overallBalance} variant="balance" index={2} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card
              title={<Typography.Text strong>Cash Flow</Typography.Text>}
              extra={<Typography.Text type="secondary" style={{ fontSize: 12 }}>Last 14 days</Typography.Text>}
              style={{ borderRadius: 12 }}
            >
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => {
                      const d = new Date(v);
                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                    stroke="#8c8c8c"
                    fontSize={11}
                  />
                  <YAxis stroke="#8c8c8c" fontSize={11} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0' }}
                    labelFormatter={(v: string) => new Date(v).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  <Bar dataKey="expense" name="Expense" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={12}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card
              title={<Typography.Text strong>Spending Breakdown</Typography.Text>}
              extra={<Typography.Text type="secondary" style={{ fontSize: 12 }}>By category</Typography.Text>}
              style={{ borderRadius: 12 }}
            >
              {data.spendingBreakdown?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <Typography.Text type="secondary">No expenses this month</Typography.Text>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.spendingBreakdown?.map((cat: CategorySpending, i: number) => {
                    const pct = totalSpend ? Math.round((cat.total / totalSpend) * 100) : 0;
                    const emoji = cat.icon || '📄';
                    return (
                      <motion.div
                        key={cat.categoryName}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                      >
                        <Flex align="center" gap={12}>
                          <span style={{ fontSize: 18 }}>{emoji}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Flex justify="space-between" align="center" style={{ marginBottom: 4 }}>
                              <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>
                                {cat.categoryName}
                              </Typography.Text>
                              <Typography.Text style={{ fontSize: 13, fontWeight: 600 }}>
                                रू {cat.total.toLocaleString('en-IN')}
                              </Typography.Text>
                            </Flex>
                            <div
                              style={{
                                height: 6,
                                borderRadius: 3,
                                background: '#f0f0f0',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  borderRadius: 3,
                                  background: 'linear-gradient(90deg, #f97316, #f59e0b)',
                                  transition: 'width 0.6s ease',
                                }}
                              />
                            </div>
                            <Typography.Text type="secondary" style={{ fontSize: 10 }}>
                              {pct}% of total
                            </Typography.Text>
                          </div>
                        </Flex>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        </Col>
      </Row>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card
          title={<Typography.Text strong>Recent Transactions</Typography.Text>}
          extra={
            <Link to="/transactions" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          }
          style={{ borderRadius: 12 }}
        >
          {data.recentTransactions?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                No transactions yet
              </Typography.Text>
              <Link to="/transactions/new" style={{ fontSize: 14 }}>
                Add your first transaction
              </Link>
            </div>
          ) : (
            <div>
              {data.recentTransactions?.slice(0, 6).map((tx: Transaction, i: number) => (
                <TransactionItem
                  key={tx._id}
                  title={tx.title}
                  amount={tx.amount}
                  type={tx.type}
                  date={tx.date}
                  categoryName={tx.category?.name}
                  categoryIcon={tx.category?.icon}
                  index={i}
                />
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
