import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { Button, Card, DatePicker, Flex, Skeleton, Typography } from 'antd';
import type { DailySummary as DailySummaryType, Transaction } from '../types';
import dayjs from 'dayjs';

export default function DailySummary() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [data, setData] = useState<DailySummaryType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const dateStr = selectedDate.format('YYYY-MM-DD');
    api.get<DailySummaryType>('/reports/daily', { params: { date: dateStr } })
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const goToPrevDay = () => setSelectedDate((d) => d.subtract(1, 'day'));
  const goToNextDay = () => setSelectedDate((d) => d.add(1, 'day'));
  const goToToday = () => setSelectedDate(dayjs());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
        <Typography.Title level={4} style={{ margin: 0 }}>Daily Summary</Typography.Title>
        <Flex gap={8} align="center">
          <DatePicker
            value={selectedDate}
            onChange={(d) => d && setSelectedDate(d)}
            allowClear={false}
            suffixIcon={<Calendar style={{ width: 16, height: 16 }} />}
          />
          <Button onClick={goToToday}>Today</Button>
        </Flex>
      </Flex>

      <Flex align="center" justify="center" gap={16}>
        <Button type="text" icon={<ChevronLeft style={{ width: 18, height: 18 }} />} onClick={goToPrevDay} />
        <Typography.Text strong style={{ fontSize: 16, minWidth: 180, textAlign: 'center' }}>
          {selectedDate.format('dddd, MMMM D, YYYY')}
        </Typography.Text>
        <Button type="text" icon={<ChevronRight style={{ width: 18, height: 18 }} />} onClick={goToNextDay} />
      </Flex>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton.Button active style={{ height: 128, borderRadius: 12, width: '100%' }} />
          <Skeleton.Button active style={{ height: 192, borderRadius: 12, width: '100%' }} />
        </div>
      ) : data ? (
        <>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card style={{ borderRadius: 12 }}>
              <Flex justify="space-around" style={{ padding: '12px 0' }}>
                {[
                  { label: 'Income', value: data.totalIncome, color: '#22c55e' },
                  { label: 'Expense', value: data.totalExpense, color: '#f97316' },
                  { label: 'Balance', value: data.balance, color: data.balance >= 0 ? '#22c55e' : '#ef4444' },
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

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
              <Typography.Text strong style={{ fontSize: 15 }}>
                Transactions ({data.transactionCount})
              </Typography.Text>
            </Flex>
            {data.transactions.length > 0 ? (
              <Card style={{ borderRadius: 12, padding: 0 }}>
                {data.transactions.map((tx: Transaction, i: number) => (
                  <Flex
                    key={tx._id || i}
                    align="center"
                    justify="space-between"
                    style={{
                      padding: '12px 16px',
                      borderBottom: i < data.transactions.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}
                  >
                    <Flex align="center" gap={10} style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>
                        {(tx.category as { icon?: string })?.icon || '📄'}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <Typography.Text style={{ fontSize: 14, fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.title}
                        </Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {(tx.category as { name?: string })?.name || 'Uncategorized'}
                          {tx.paymentType ? ` • ${tx.paymentType}` : ''}
                        </Typography.Text>
                      </div>
                    </Flex>
                    <Typography.Text
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                        color: tx.type === 'income' ? '#22c55e' : '#f97316',
                        flexShrink: 0,
                      }}
                    >
                      {tx.type === 'income' ? '+' : '-'}रू {tx.amount.toLocaleString('en-IN')}
                    </Typography.Text>
                  </Flex>
                ))}
              </Card>
            ) : (
              <Card style={{ borderRadius: 12, textAlign: 'center', padding: '32px 0' }}>
                <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                  No transactions for this day
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                  Add a transaction to see it here
                </Typography.Text>
              </Card>
            )}
          </motion.div>
        </>
      ) : (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '32px 0' }}>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>
            Could not load data for this date
          </Typography.Text>
        </Card>
      )}
    </div>
  );
}
