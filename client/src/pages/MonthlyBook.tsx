import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import api from '../services/api';
import { Button, Card, Select, Skeleton, Tag } from 'antd';

const NEPALI_MONTHS = ['Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];

function getMonthDateRange(nepaliMonth: string, nepaliYear: number) {
  const monthIndex = NEPALI_MONTHS.indexOf(nepaliMonth);
  const gregYear = nepaliYear + 57;
  let startMonth = (monthIndex + 1) % 12 || 12;
  let startYear = gregYear + (monthIndex === 11 ? 1 : 0);
  let endMonth = startMonth + 1;
  let endYear = startYear;
  if (endMonth > 12) { endMonth = 1; endYear += 1; }
  const start = new Date(startYear, startMonth - 1, 1);
  const end = new Date(endYear, endMonth - 1, 1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

export default function MonthlyBook() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(NEPALI_MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear() - 57);
  const [loading, setLoading] = useState(true);
  const [monthTransactions, setMonthTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/reports/monthly', { params: { year } })
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

  const currentSummary = summaries.find((s: any) => s.nepaliMonth === selectedMonth);

  const handleDownload = async () => {
    try {
      const startDate = `${year + 56}-04-01`;
      const endDate = `${year + 57}-03-31`;
      const { data } = await api.get('/export/excel', {
        params: { startDate, endDate },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(data);
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
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-display text-lg font-semibold">Cash Book</h2>
        <div className="flex items-center gap-2">
          <Select value={String(year)} onChange={(v) => setYear(Number(v))} style={{ width: 100 }}>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 57 - 5 + i).map((y) => (
              <Select.Option key={y} value={String(y)}>{y}</Select.Option>
            ))}
          </Select>
          <Button icon={<Download className="size-4" />} onClick={handleDownload} />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {NEPALI_MONTHS.map((month) => (
          <Button
            key={month}
            type={selectedMonth === month ? 'primary' : 'default'}
            size="small"
            onClick={() => setSelectedMonth(month)}
          >
            {month}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          <Skeleton.Button active style={{ height: 128, borderRadius: 12 }} block />
          <Skeleton.Button active style={{ height: 192, borderRadius: 12 }} block />
        </div>
      ) : currentSummary ? (
        <>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <div className="grid grid-cols-3 gap-4 text-center" style={{ padding: '12px 0' }}>
                {[
                  { label: 'Income', value: currentSummary.totalIncome, color: 'text-income' },
                  { label: 'Expense', value: currentSummary.totalExpense, color: 'text-expense' },
                  { label: 'Balance', value: currentSummary.balance, color: currentSummary.balance >= 0 ? 'text-balance' : 'text-destructive' },
                ].map((card) => (
                  <div key={card.label}>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className={`font-display text-xl font-bold tabular-nums ${card.color}`}>
                      रू {card.value.toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {txLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton.Button key={i} active style={{ height: 56, borderRadius: 12 }} block />
              ))}
            </div>
          ) : monthTransactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border bg-card divide-y divide-border"
            >
              {monthTransactions.map((tx: any, i: number) => (
                <div key={tx._id || i} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-sm">{tx.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`font-semibold text-sm tabular-nums ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {tx.type === 'income' ? '+' : '-'}रू {tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </>
      ) : (
        <Card>
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <p className="text-muted-foreground mb-1">No data for {selectedMonth}</p>
            <p className="text-sm text-muted-foreground">Add transactions to see your monthly summary</p>
          </div>
        </Card>
      )}

      {summaries.length > 0 && (
        <Card title="All Monthly Summaries">
          {summaries.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground text-sm">No summaries available</p>
          ) : (
            <div className="space-y-2">
              {summaries.map((s: any) => (
                <div
                  key={`${s.nepaliMonth}-${s.nepaliYear}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-sm cursor-pointer"
                  onClick={() => setSelectedMonth(s.nepaliMonth)}
                >
                  <span className="font-medium">{s.nepaliMonth} {s.nepaliYear}</span>
                  <div className="flex gap-3 text-xs tabular-nums">
                    <span className="text-income">+रू {s.totalIncome.toLocaleString('en-IN')}</span>
                    <span className="text-expense">-रू {s.totalExpense.toLocaleString('en-IN')}</span>
                    <span className={s.balance >= 0 ? 'text-balance font-medium' : 'text-destructive font-medium'}>
                      रू {s.balance.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
