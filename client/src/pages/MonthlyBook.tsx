import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import api from '../services/api';
import { Button, Card, Select, Skeleton, Typography, Flex } from 'antd';
import type { MonthlySummary, Transaction } from '../types';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getMonthDateRange(month: string, year: number) {
  const monthIndex = MONTHS.indexOf(month);
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

export default function MonthlyBook() {
  const [summaries, setSummaries] = useState<MonthlySummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [monthTransactions, setMonthTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get<MonthlySummary[]>('/reports/monthly', { params: { year } })
      .then(({ data }) => setSummaries(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  useEffect(() => {
    if (!selectedMonth) return;
    setTxLoading(true);
    const { startDate, endDate } = getMonthDateRange(selectedMonth, year);
    api.get('/transactions', { params: { startDate, endDate, limit: 50 } })
      .then(({ data }) => setMonthTransactions(data.transactions || []))
      .catch(console.error)
      .finally(() => setTxLoading(false));
  }, [selectedMonth, year]);

  const currentSummary = summaries.find((s: MonthlySummary) => s.month === selectedMonth);

  const handleDownload = async () => {
    try {
      const { data } = await api.get('/export/excel', {
        params: { startDate: `${year}-01-01`, endDate: `${year}-12-31` },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cash-book-${year}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
        <Typography.Title level={4} style={{ margin: 0 }}>Cash Book</Typography.Title>
        <Flex gap={8} align="center">
          <Select value={String(year)} onChange={(v) => setYear(Number(v))} style={{ width: 100 }}>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
              <Select.Option key={y} value={String(y)}>{y}</Select.Option>
            ))}
          </Select>
          <Button icon={<Download style={{ width: 16, height: 16 }} />} onClick={handleDownload} />
        </Flex>
      </Flex>

      <Flex gap={8} wrap="wrap">
        {MONTHS.map((month) => (
          <Button
            key={month}
            type={selectedMonth === month ? 'primary' : 'default'}
            size="small"
            onClick={() => setSelectedMonth(month)}
          >
            {month}
          </Button>
        ))}
      </Flex>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton.Button active style={{ height: 128, borderRadius: 12, width: '100%' }} />
          <Skeleton.Button active style={{ height: 192, borderRadius: 12, width: '100%' }} />
        </div>
      ) : currentSummary ? (
        <>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card style={{ borderRadius: 12 }}>
              <Flex justify="space-around" style={{ padding: '12px 0' }}>
                {[
                  { label: 'Income', value: currentSummary.totalIncome, color: '#22c55e' },
                  { label: 'Expense', value: currentSummary.totalExpense, color: '#f97316' },
                  { label: 'Balance', value: currentSummary.balance, color: currentSummary.balance >= 0 ? '#22c55e' : '#ef4444' },
                ].map((card) => (
                  <div key={card.label} style={{ textAlign: 'center' }}>
                    <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{card.label}</Typography.Text>
                    <Typography.Title level={3} style={{ margin: 0, color: card.color }}>
                      रू {card.value.toLocaleString('en-IN')}
                    </Typography.Title>
                  </div>
                ))}
              </Flex>
            </Card>
          </motion.div>

          {txLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton.Button key={i} active style={{ height: 56, borderRadius: 12, width: '100%' }} />
              ))}
            </div>
          ) : monthTransactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card style={{ borderRadius: 12, padding: 0 }}>
                {monthTransactions.map((tx: Transaction, i: number) => (
                  <Flex
                    key={tx._id || i}
                    align="center"
                    justify="space-between"
                    style={{
                      padding: '12px 16px',
                      borderBottom: i < monthTransactions.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}
                  >
                    <div>
                      <Typography.Text style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>{tx.title}</Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(tx.date).toLocaleDateString()}
                      </Typography.Text>
                    </div>
                    <Typography.Text
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                        color: tx.type === 'income' ? '#22c55e' : '#f97316',
                      }}
                    >
                      {tx.type === 'income' ? '+' : '-'}रू {tx.amount.toLocaleString('en-IN')}
                    </Typography.Text>
                  </Flex>
                ))}
              </Card>
            </motion.div>
          )}
        </>
      ) : (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '32px 0' }}>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>No data for {selectedMonth}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>Add transactions to see your monthly summary</Typography.Text>
        </Card>
      )}

      {summaries.length > 0 && (
        <Card title={<Typography.Text strong>All Monthly Summaries</Typography.Text>} style={{ borderRadius: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {summaries.map((s: MonthlySummary) => (
              <Flex
                key={`${s.month}-${s.year}`}
                align="center"
                justify="space-between"
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedMonth(s.month)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f5'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Typography.Text style={{ fontWeight: 500 }}>{s.month} {s.year}</Typography.Text>
                <Flex gap={12} align="center">
                  <Typography.Text style={{ color: '#22c55e', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                    +रू {s.totalIncome.toLocaleString('en-IN')}
                  </Typography.Text>
                  <Typography.Text style={{ color: '#f97316', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                    -रू {s.totalExpense.toLocaleString('en-IN')}
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      fontVariantNumeric: 'tabular-nums',
                      color: s.balance >= 0 ? '#22c55e' : '#ef4444',
                    }}
                  >
                    रू {s.balance.toLocaleString('en-IN')}
                  </Typography.Text>
                </Flex>
              </Flex>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
