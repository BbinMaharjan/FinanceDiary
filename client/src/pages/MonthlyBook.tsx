import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';

const NEPALI_MONTHS = ['Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];

export default function MonthlyBook() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(NEPALI_MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear() - 57);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/reports/monthly', { params: { year } })
      .then(({ data }) => setSummaries(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  const currentSummary = summaries.find((s: any) => s.nepaliMonth === selectedMonth);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-display text-lg font-semibold">Cash Book</h2>
        <div className="flex items-center gap-2">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 57 - 5 + i).map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {NEPALI_MONTHS.map((month) => (
          <Button
            key={month}
            variant={selectedMonth === month ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMonth(month)}
            className="whitespace-nowrap"
          >
            {month}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : currentSummary ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-5 grid grid-cols-3 gap-4 text-center">
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
              </CardContent>
            </Card>
          </motion.div>

          {currentSummary.transactions?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border bg-card divide-y divide-border"
            >
              {currentSummary.transactions.map((tx: any, i: number) => (
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
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-1">No data for {selectedMonth}</p>
            <p className="text-sm text-muted-foreground">Add transactions to see your monthly summary</p>
          </CardContent>
        </Card>
      )}

      {summaries.length > 0 && (
        <Card>
          <div className="px-5 pt-5">
            <h3 className="font-display font-semibold text-sm">All Monthly Summaries</h3>
          </div>
          <CardContent className="p-5">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
