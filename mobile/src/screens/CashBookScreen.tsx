import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMonthlySummaries } from '../api/hooks';
import { colors } from '../theme';
import { formatNPR } from '../lib/format';
import type { CashBookStackParamList } from '../navigation/types';
import type { MonthlySummary } from '../api/types';

type Props = NativeStackScreenProps<CashBookStackParamList, 'CashBook'>;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function CashBookScreen({ navigation }: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data, isLoading, isError, refetch, isRefetching } = useMonthlySummaries(year);

  const byMonth = useMemo(() => {
    const map: Record<number, MonthlySummary> = {};
    (data ?? []).forEach(s => {
      const m = Number(s.month);
      map[m] = s;
    });
    return map;
  }, [data]);

  const yearSummary = useMemo(() => {
    const months = data ?? [];
    return {
      income: months.reduce((s, m) => s + m.totalIncome, 0),
      expense: months.reduce((s, m) => s + m.totalExpense, 0),
      balance: months.reduce((s, m) => s + m.balance, 0),
    };
  }, [data]);

  const today = new Date();
  const isCurrentYear = year === currentYear;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
      <View style={styles.yearRow}>
        <Pressable style={styles.yearBtn} onPress={() => setYear(y => y - 1)}>
          <Text style={styles.yearBtnText}>‹</Text>
        </Pressable>
        <Text style={styles.yearText}>{year}</Text>
        <Pressable style={[styles.yearBtn, isCurrentYear && styles.yearBtnDisabled]} onPress={() => setYear(y => y + 1)}>
          <Text style={styles.yearBtnText}>›</Text>
        </Pressable>
      </View>

      {isError ? (
        <Text style={styles.errorText}>Failed to load cash book. Pull to refresh.</Text>
      ) : null}

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Year Income</Text>
          <Text style={[styles.summaryValue, { color: colors.income }]}>+{formatNPR(yearSummary.income)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Year Expense</Text>
          <Text style={[styles.summaryValue, { color: colors.expense }]}>-{formatNPR(yearSummary.expense)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Year Balance</Text>
          <Text style={[styles.summaryValue, { color: yearSummary.balance >= 0 ? colors.income : colors.expense }]}>
            {formatNPR(yearSummary.balance)}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {MONTHS.map((m, idx) => {
          const monthNum = idx + 1;
          const summary = byMonth[monthNum];
          const isPast = isCurrentYear && monthNum < today.getMonth() + 1;
          const isCurrent = isCurrentYear && monthNum === today.getMonth() + 1;
          return (
            <Pressable
              key={m}
              style={[styles.monthCard, isCurrent && styles.monthCardCurrent]}
              onPress={() => navigation.navigate('DailySummary', { date: undefined })}
            >
              <View style={styles.monthHeader}>
                <Text style={styles.monthName}>{m}</Text>
                {summary ? (
                  <Text style={styles.monthBal}>
                    {formatNPR(summary.balance).replace(/\.00$/, '')}
                  </Text>
                ) : (
                  <Text style={styles.monthEmpty}>{isPast ? '—' : ''}</Text>
                )}
              </View>
              {summary ? (
                <View style={styles.monthStats}>
                  <Text style={styles.monthIncome}>+{formatNPR(summary.totalIncome).replace(/\.00$/, '')}</Text>
                  <Text style={styles.monthExpense}>-{formatNPR(summary.totalExpense).replace(/\.00$/, '')}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  yearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearBtnDisabled: { opacity: 0.4 },
  yearBtnText: { fontSize: 22, color: colors.primary, fontWeight: '600', lineHeight: 24 },
  yearText: { fontSize: 20, fontWeight: '700', color: colors.text },
  errorText: { color: colors.danger, textAlign: 'center', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  summaryValue: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  monthCard: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  monthCardCurrent: { borderColor: colors.primary, backgroundColor: '#f0f6ff' },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  monthName: { fontSize: 13, fontWeight: '700', color: colors.text },
  monthBal: { fontSize: 13, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  monthEmpty: { fontSize: 13, color: colors.border },
  monthStats: { gap: 2 },
  monthIncome: { fontSize: 11, fontWeight: '600', color: colors.income, fontVariant: ['tabular-nums'] },
  monthExpense: { fontSize: 11, fontWeight: '600', color: colors.expense, fontVariant: ['tabular-nums'] },
});
