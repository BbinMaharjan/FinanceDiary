import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getErrorMessage } from '../api/client';
import { useDailySummary, useDeleteTransaction } from '../api/hooks';
import { TransactionItem } from '../components/TransactionItem';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../theme';
import { formatNPR, todayInput } from '../lib/format';
import type { CashBookStackParamList } from '../navigation/types';
import type { Transaction } from '../api/types';

type Props = NativeStackScreenProps<CashBookStackParamList, 'DailySummary'>;

export function DailySummaryScreen({ navigation, route }: Props) {
  const initialDate = route.params?.date ?? todayInput();
  const [date, setDate] = useState(initialDate);
  const { data, isLoading, isError, refetch, isRefetching } = useDailySummary(date);
  const deleteMutation = useDeleteTransaction();

  useEffect(() => {
    if (route.params?.date) setDate(route.params.date);
  }, [route.params?.date]);

  const handleDelete = (tx: Transaction) => {
    Alert.alert('Delete Transaction', `Delete "${tx.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(tx._id);
          } catch (e) {
            Alert.alert('Error', getErrorMessage(e));
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
      }
    >
      <View style={styles.dateRow}>
        <Pressable
          style={styles.dateBtn}
          onPress={() => {
            const d = new Date(date);
            d.setDate(d.getDate() - 1);
            setDate(d.toISOString().split('T')[0]);
          }}
        >
          <Text style={styles.dateBtnText}>‹</Text>
        </Pressable>
        <TextInput
          style={styles.dateInput}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numbers-and-punctuation"
        />
        <Pressable
          style={styles.dateBtn}
          onPress={() => {
            const d = new Date(date);
            d.setDate(d.getDate() + 1);
            setDate(d.toISOString().split('T')[0]);
          }}
        >
          <Text style={styles.dateBtnText}>›</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <Text style={styles.errorText}>Failed to load day summary</Text>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryValue, { color: colors.income }]}>
                +{formatNPR(data?.totalIncome ?? 0)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Expense</Text>
              <Text style={[styles.summaryValue, { color: colors.expense }]}>
                -{formatNPR(data?.totalExpense ?? 0)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Balance</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: (data?.balance ?? 0) >= 0 ? colors.income : colors.expense },
                ]}
              >
                {formatNPR(data?.balance ?? 0)}
              </Text>
            </View>
          </View>

          <Text style={styles.txTitle}>
            {data?.transactionCount ?? 0} transaction{data?.transactionCount === 1 ? '' : 's'}
          </Text>

          {data?.transactions?.length ? (
            data.transactions.map(tx => (
              <View key={tx._id} style={styles.itemWrap}>
                <TransactionItem transaction={tx} />
                <View style={styles.itemActions}>
                  <Pressable
                    style={styles.itemBtn}
                    onPress={() => navigation.navigate('TransactionForm', { id: tx._id })}
                  >
                    <Text style={styles.itemBtnText}>Edit</Text>
                  </Pressable>
                  <Pressable style={styles.itemBtn} onPress={() => handleDelete(tx)}>
                    <Text style={[styles.itemBtnText, { color: colors.danger }]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <EmptyState message="No transactions on this day" />
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { paddingVertical: 40, alignItems: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dateBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBtnText: { fontSize: 22, color: colors.primary, fontWeight: '600', lineHeight: 24 },
  dateInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
  },
  errorText: { color: colors.danger, textAlign: 'center', marginVertical: 24 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 12, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  summaryValue: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  txTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  itemWrap: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  itemActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 14, marginTop: 2 },
  itemBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  itemBtnText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
});
