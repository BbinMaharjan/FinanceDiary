import React from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getErrorMessage } from '../api/client';
import { useAccounts, useDeleteAccount } from '../api/hooks';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../theme';
import { formatNPR } from '../lib/format';
import type { MoreStackParamList } from '../navigation/types';
import type { Account } from '../api/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Accounts'>;

export function AccountsScreen({ navigation }: Props) {
  const { data, isLoading, isError, refetch, isRefetching } = useAccounts();
  const deleteMutation = useDeleteAccount();

  const handleDelete = (account: Account) => {
    Alert.alert('Delete Account', `Delete "${account.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(account._id);
          } catch (e) {
            Alert.alert('Error', getErrorMessage(e));
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Accounts</Text>
        <Pressable style={styles.addButton} onPress={() => navigation.navigate('AccountForm', {})}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      {isError ? <Text style={styles.errorText}>Failed to load accounts. Pull to refresh.</Text> : null}

      {!isError && (!data || data.length === 0) ? (
        <EmptyState
          message="No accounts yet"
          actionLabel="Add an account"
          onAction={() => navigation.navigate('AccountForm', {})}
        />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('AccountForm', { id: item._id })}
            >
              <View style={styles.cardMain}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.detail}>
                  {item.bankName ?? item.accountType}
                  {item.accountNumber ? ` • ${item.accountNumber}` : ''}
                </Text>
              </View>
              <View style={styles.cardStats}>
                <Text style={styles.balance}>
                  {formatNPR(item.balance ?? item.openingBalance)}
                </Text>
                <Text style={styles.income}>+{formatNPR(item.totalIncome ?? 0)}</Text>
                <Text style={styles.expense}>-{formatNPR(item.totalExpense ?? 0)}</Text>
              </View>
              <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Text style={styles.deleteText}>✕</Text>
              </Pressable>
            </Pressable>
          )}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addButtonText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  errorText: { color: colors.danger, textAlign: 'center', marginTop: 16 },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  cardMain: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  detail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  cardStats: { alignItems: 'flex-end', gap: 1 },
  balance: { fontSize: 14, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  income: { fontSize: 11, fontWeight: '600', color: colors.income, fontVariant: ['tabular-nums'] },
  expense: { fontSize: 11, fontWeight: '600', color: colors.expense, fontVariant: ['tabular-nums'] },
  deleteBtn: { paddingHorizontal: 4 },
  deleteText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
});
