import React from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getErrorMessage } from '../api/client';
import { useCategories, useDeleteCategory } from '../api/hooks';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../theme';
import type { MoreStackParamList } from '../navigation/types';
import type { Category } from '../api/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Categories'>;

export function CategoriesScreen({ navigation }: Props) {
  const { data, isLoading, isError, refetch, isRefetching } = useCategories();
  const deleteMutation = useDeleteCategory();

  const income = (data ?? []).filter(c => c.type === 'income');
  const expense = (data ?? []).filter(c => c.type === 'expense');

  const handleDelete = (category: Category) => {
    Alert.alert('Delete Category', `Delete "${category.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(category._id);
          } catch (e) {
            Alert.alert('Error', getErrorMessage(e));
          }
        },
      },
    ]);
  };

  const renderCategory = (category: Category) => (
    <View key={category._id} style={styles.row}>
      <Pressable
        style={styles.rowMain}
        onPress={() => navigation.navigate('CategoryForm', { id: category._id, type: category.type })}
      >
        <Text style={styles.icon}>{category.icon || '📄'}</Text>
        <Text style={styles.name}>{category.name}</Text>
      </Pressable>
      <Pressable style={styles.deleteBtn} onPress={() => handleDelete(category)}>
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </View>
  );

  const renderSection = (title: string, items: Category[], type: 'income' | 'expense') => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable
          style={styles.smallAdd}
          onPress={() => navigation.navigate('CategoryForm', { type })}
        >
          <Text style={styles.smallAddText}>+ Add</Text>
        </Pressable>
      </View>
      {items.length ? items.map(renderCategory) : <Text style={styles.muted}>No {title.toLowerCase()} categories</Text>}
    </View>
  );

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
        <Text style={styles.errorText}>Failed to load categories. Pull to refresh.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={[{}]}
      keyExtractor={() => 'list'}
      renderItem={() => (
        <>
          {renderSection('Income', income, 'income')}
          {renderSection('Expense', expense, 'expense')}
          {data.length === 0 ? (
            <EmptyState
              message="No categories yet"
              actionLabel="Add a category"
              onAction={() => navigation.navigate('CategoryForm', {})}
            />
          ) : null}
        </>
      )}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 },
  content: { padding: 16, gap: 20 },
  errorText: { color: colors.danger, textAlign: 'center' },
  section: { gap: 6 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  smallAdd: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  smallAddText: { color: colors.white, fontWeight: '600', fontSize: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { fontSize: 18 },
  name: { fontSize: 15, color: colors.text, fontWeight: '500' },
  deleteBtn: { paddingHorizontal: 4 },
  deleteText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
  muted: { fontSize: 13, color: colors.textSecondary, paddingVertical: 8 },
});
