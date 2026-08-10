import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategoryReport, useDashboard, useMonthlySummaries } from '../api/hooks';
import { colors } from '../theme';
import { formatNPR } from '../lib/format';
import { StatCard } from '../components/StatCard';

const YEAR = new Date().getFullYear();
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ReportsScreen() {
  const [range, setRange] = useState<'week' | 'month' | 'year'>('month');
  const { data: dashboard } = useDashboard();

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    if (range === 'week') {
      const s = new Date(now);
      s.setDate(now.getDate() - 6);
      return { startDate: fmt(s), endDate: fmt(now) };
    }
    if (range === 'year') {
      return { startDate: `${YEAR}-01-01`, endDate: `${YEAR}-12-31` };
    }
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: fmt(s), endDate: fmt(e) };
  }, [range]);

  const { data: categoryReport, isLoading: reportLoading } = useCategoryReport(startDate, endDate);
  const { data: monthly } = useMonthlySummaries(YEAR);

  const totalExpense = (categoryReport ?? []).reduce((s, c) => s + c.total, 0);

  const monthlyTotals = useMemo(() => {
    const income = (monthly ?? []).reduce((s, m) => s + m.totalIncome, 0);
    const expense = (monthly ?? []).reduce((s, m) => s + m.totalExpense, 0);
    return { income, expense, balance: income - expense };
  }, [monthly]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.chips}>
        {(['week', 'month', 'year'] as const).map(r => (
          <Pressable
            key={r}
            style={[styles.chip, range === r && styles.chipActive]}
            onPress={() => setRange(r)}
          >
            <Text style={[styles.chipText, range === r && styles.chipTextActive]}>
              {r === 'week' ? 'Week' : r === 'month' ? 'Month' : 'Year'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statsRow}>
        <StatCard
          label="Range Income"
          amount={
            dashboard?.monthlyIncome ?? 0
          }
          variant="income"
          style={styles.statCol}
        />
        <StatCard
          label="Range Expense"
          amount={
            dashboard?.monthlyExpense ?? 0
          }
          variant="expense"
          style={styles.statCol}
        />
        <StatCard
          label="Range Balance"
          amount={dashboard?.monthlyBalance ?? 0}
          variant="balance"
          style={styles.statCol}
        />
      </View>

      <Text style={styles.sectionTitle}>Spending by Category ({range})</Text>
      {reportLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : categoryReport && categoryReport.length > 0 ? (
        <View style={styles.card}>
          {categoryReport.map(cat => {
            const pct = totalExpense ? Math.round((cat.total / totalExpense) * 100) : 0;
            return (
              <View key={cat._id} style={styles.catRow}>
                <Text style={styles.catIcon}>{cat.category?.icon || '📄'}</Text>
                <View style={styles.catBody}>
                  <View style={styles.catTop}>
                    <Text style={styles.catName}>{cat.category?.name ?? 'Unknown'}</Text>
                    <Text style={styles.catAmount}>{formatNPR(cat.total)}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.catPct}>{cat.count} tx • {pct}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.muted}>No expenses in this period</Text>
      )}

      <Text style={styles.sectionTitle}>{YEAR} Monthly Summary</Text>
      <View style={styles.card}>
        {MONTHS.map((m, idx) => {
          const summary = (monthly ?? []).find(s => Number(s.month) === idx + 1);
          return (
            <View key={m} style={styles.monthRow}>
              <Text style={styles.monthName}>{m}</Text>
              {summary ? (
                <View style={styles.monthStats}>
                  <Text style={styles.monthIncome}>+{formatNPR(summary.totalIncome)}</Text>
                  <Text style={styles.monthExpense}>-{formatNPR(summary.totalExpense)}</Text>
                </View>
              ) : (
                <Text style={styles.muted}>—</Text>
              )}
            </View>
          );
        })}
        <View style={styles.monthRowFooter}>
          <Text style={styles.monthName}>Total</Text>
          <View style={styles.monthStats}>
            <Text style={styles.monthIncome}>+{formatNPR(monthlyTotals.income)}</Text>
            <Text style={styles.monthExpense}>-{formatNPR(monthlyTotals.expense)}</Text>
          </View>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCol: { flex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 16 },
  center: { paddingVertical: 30, alignItems: 'center' },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  catIcon: { fontSize: 18 },
  catBody: { flex: 1, minWidth: 0 },
  catTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catName: { fontSize: 13, fontWeight: '500', color: colors.text },
  catAmount: { fontSize: 13, fontWeight: '600', color: colors.text },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: '#f0f0f0', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.expense },
  catPct: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  monthRowFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 },
  monthName: { fontSize: 14, fontWeight: '600', color: colors.text },
  monthStats: { alignItems: 'flex-end', gap: 1 },
  monthIncome: { fontSize: 12, fontWeight: '600', color: colors.income, fontVariant: ['tabular-nums'] },
  monthExpense: { fontSize: 12, fontWeight: '600', color: colors.expense, fontVariant: ['tabular-nums'] },
  muted: { fontSize: 13, color: colors.textSecondary },
});
