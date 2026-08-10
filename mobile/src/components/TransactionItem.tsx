import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';
import { formatDate, formatNPR } from '../lib/format';
import type { Transaction } from '../api/types';

interface Props {
  transaction: Transaction;
  onPress?: () => void;
  showDate?: boolean;
}

export function TransactionItem({ transaction, onPress, showDate = true }: Props) {
  const isIncome = transaction.type === 'income';
  const color = isIncome ? colors.income : colors.expense;
  const icon = transaction.category?.icon || '📄';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={onPress ? 0.6 : 1}>
      <View style={styles.iconBox}>
        <Text style={styles.emoji}>{icon}</Text>
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {transaction.category?.name || 'Uncategorized'}
          {transaction.paymentType ? ` • ${transaction.paymentType}` : ''}
          {showDate ? ` • ${formatDate(transaction.date)}` : ''}
        </Text>
      </View>
      <Text style={[styles.amount, { color }]}>
        {isIncome ? '+' : '-'}
        {formatNPR(transaction.amount)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 18 },
  textCol: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
