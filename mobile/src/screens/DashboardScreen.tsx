import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDashboard } from '../api/hooks';
import { StatCard } from '../components/StatCard';
import { TransactionItem } from '../components/TransactionItem';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../theme';
import { formatNPR } from '../lib/format';
import type { MainTabParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MainTabParamList>;

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, isError, refetch, isRefetching } = useDashboard();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load dashboard</Text>
        <Text style={styles.errorSub}>Check your connection and pull to refresh</Text>
      </View>
    );
  }

  const totalSpend =
    data.spendingBreakdown?.reduce((sum, c) => sum + c.total, 0) || 0;
  const overallAccountIncome = data.accounts?.reduce((s, a) => s + (a.totalIncome || 0), 0) || 0;
  const overallAccountExpense = data.accounts?.reduce((s, a) => s + (a.totalExpense || 0), 0) || 0;
  const overallAccountBalance = data.accounts?.reduce((s, a) => s + (a.balance ?? 0), 0) || 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
      <View style={styles.statsRow}>
        <StatCard label="Overall Income" amount={data.overallIncome} variant="income" style={styles.statCol} />
        <StatCard label="Overall Expense" amount={data.overallExpense} variant="expense" style={styles.statCol} />
        <StatCard label="Net Balance" amount={data.overallBalance} variant="balance" style={styles.statCol} />
      </View>

      {data.accounts && data.accounts.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Balances</Text>
          <View style={styles.summaryBanner}>
            {[
              { label: 'Overall Income', value: overallAccountIncome, color: '#bbf7d0', prefix: '+' },
              { label: 'Overall Expense', value: overallAccountExpense, color: '#fed7aa', prefix: '-' },
              { label: 'Net Balance', value: overallAccountBalance, color: '#ffffff', prefix: '' },
            ].map(item => (
              <View key={item.label} style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text style={[styles.summaryValue, { color: item.color }]}>
                  {item.prefix}
                  {formatNPR(item.value)}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.sectionLabel}>By Account</Text>
          {data.accounts.map(acc => (
            <View key={acc._id} style={styles.accountRow}>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{acc.name}</Text>
                <Text style={styles.accountBank}>{acc.bankName || 'Bank account'}</Text>
              </View>
              <View style={styles.accountStat}>
                <Text style={[styles.accountAmount, { color: colors.income }]}>
                  +{formatNPR(acc.totalIncome || 0)}
                </Text>
                <Text style={[styles.accountAmount, { color: colors.expense }]}>
                  -{formatNPR(acc.totalExpense || 0)}
                </Text>
                <Text
                  style={[
                    styles.accountBalance,
                    { color: (acc.balance || 0) >= 0 ? colors.income : colors.expense },
                  ]}
                >
                  {formatNPR(acc.balance ?? 0)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spending Breakdown</Text>
        {data.spendingBreakdown?.length ? (
          data.spendingBreakdown.map(cat => {
            const pct = totalSpend ? Math.round((cat.total / totalSpend) * 100) : 0;
            return (
              <View key={cat.categoryName} style={styles.spendRow}>
                <Text style={styles.spendEmoji}>{cat.icon || '📄'}</Text>
                <View style={styles.spendBody}>
                  <View style={styles.spendTop}>
                    <Text style={styles.spendName}>{cat.categoryName}</Text>
                    <Text style={styles.spendAmount}>{formatNPR(cat.total)}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.spendPct}>{pct}% of total</Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.muted}>No expenses this month</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Transactions</Text>
        {data.recentTransactions?.length ? (
          data.recentTransactions.slice(0, 6).map(tx => (
            <TransactionItem
              key={tx._id}
              transaction={tx}
              onPress={() => navigation.navigate('TransactionsTab', { screen: 'TransactionsList' })}
            />
          ))
        ) : (
          <EmptyState message="No transactions yet" />
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 },
  errorText: { fontSize: 16, fontWeight: '600', color: colors.danger, textAlign: 'center' },
  errorSub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCol: { flex: 1 },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  sectionLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 12, marginBottom: 4 },
  summaryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  summaryCol: { alignItems: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '500', marginBottom: 4 },
  summaryValue: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  accountInfo: { flex: 1, minWidth: 0, paddingRight: 8 },
  accountName: { fontSize: 13, fontWeight: '600', color: colors.text },
  accountBank: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  accountStat: { alignItems: 'flex-end', gap: 2 },
  accountAmount: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  accountBalance: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'], marginTop: 2 },
  spendRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  spendEmoji: { fontSize: 18 },
  spendBody: { flex: 1, minWidth: 0 },
  spendTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  spendName: { fontSize: 13, fontWeight: '500', color: colors.text },
  spendAmount: { fontSize: 13, fontWeight: '600', color: colors.text },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: '#f0f0f0', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.expense },
  spendPct: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  muted: { fontSize: 13, color: colors.textSecondary },
});
