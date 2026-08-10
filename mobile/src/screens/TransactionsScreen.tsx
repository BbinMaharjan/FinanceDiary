import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeleteTransaction, useTransactions } from '../api/hooks';
import { getErrorMessage } from '../api/client';
import { TransactionItem } from '../components/TransactionItem';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../theme';
import type { TransactionsStackParamList } from '../navigation/types';
import type { Transaction } from '../api/types';

type Props = NativeStackScreenProps<TransactionsStackParamList, 'TransactionsList'>;

export function TransactionsScreen({ navigation, route }: Props) {
  const routeType = route.params?.type ?? null;
  const [typeFilter, setTypeFilter] = useState<string>(routeType ?? '');
  const [search, setSearch] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      type: typeFilter || undefined,
      search: searchApplied || undefined,
    }),
    [page, typeFilter, searchApplied],
  );

  const { data, isLoading, isFetching, refetch } = useTransactions(params);
  const deleteMutation = useDeleteTransaction();

  const transactions = data?.transactions ?? [];
  const pages = data?.pages ?? 1;

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

  const applySearch = () => {
    setSearchApplied(search.trim());
    setPage(1);
  };

  const setType = (t: string) => {
    setTypeFilter(t);
    setPage(1);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {routeType === 'income' ? 'Income' : routeType === 'expense' ? 'Expense' : 'All'} Transactions
        </Text>
        <Pressable style={styles.addButton} onPress={() => navigation.navigate('TransactionForm', {})}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={applySearch}
          returnKeyType="search"
        />
        {searchApplied ? (
          <Pressable
            onPress={() => {
              setSearch('');
              setSearchApplied('');
            }}
          >
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.chips}>
        {[
          { key: '', label: 'All' },
          { key: 'income', label: 'Income' },
          { key: 'expense', label: 'Expense' },
        ].map(chip => (
          <Pressable
            key={chip.key}
            style={[styles.chip, typeFilter === chip.key && styles.chipActive]}
            onPress={() => setType(chip.key)}
          >
            <Text style={[styles.chipText, typeFilter === chip.key && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : transactions.length === 0 ? (
        <EmptyState
          message="No transactions found"
          actionLabel="Add your first transaction"
          onAction={() => navigation.navigate('TransactionForm', {})}
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.itemWrap}>
              <TransactionItem
                transaction={item}
                onPress={() => navigation.navigate('TransactionForm', { id: item._id })}
              />
              <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Text style={styles.deleteText}>✕</Text>
              </Pressable>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={() => refetch()} tintColor={colors.primary} />
          }
          ListFooterComponent={
            page < pages ? (
              <Pressable
                style={styles.loadMore}
                onPress={() => setPage(p => p + 1)}
                disabled={isFetching}
              >
                <Text style={styles.loadMoreText}>{isFetching ? 'Loading...' : 'Load more'}</Text>
              </Pressable>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
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
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10, gap: 10 },
  searchInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: colors.text,
  },
  clearText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  itemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  deleteBtn: { paddingHorizontal: 14, alignSelf: 'stretch', justifyContent: 'center' },
  deleteText: { color: colors.danger, fontSize: 16, fontWeight: '700' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 68 },
  loadMore: { alignItems: 'center', paddingVertical: 14 },
  loadMoreText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
