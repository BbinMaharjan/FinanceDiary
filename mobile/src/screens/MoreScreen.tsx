import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDashboard } from '../api/hooks';
import { colors } from '../theme';
import { formatNPR } from '../lib/format';
import type { MoreStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'More'>;

export function MoreScreen({ navigation }: Props) {
  const { data } = useDashboard();

  const menu = [
    { label: 'Accounts', sub: `${data?.accounts?.length ?? 0} account(s)`, screen: 'Accounts' as const },
    { label: 'Categories', sub: 'Manage income & expense categories', screen: 'Categories' as const },
    { label: 'Reports', sub: 'Spending by category & monthly summary', screen: 'Reports' as const },
    { label: 'Settings', sub: 'Account info & logout', screen: 'Settings' as const },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
        <Text style={styles.subtitle}>Overall balance: {formatNPR(data?.overallBalance ?? 0)}</Text>
      </View>

      <View style={styles.card}>
        {menu.map((item, idx) => (
          <Pressable
            key={item.screen}
            style={[styles.row, idx < menu.length - 1 && styles.rowBorder]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowSub}>{item.sub}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  card: { backgroundColor: colors.card, borderRadius: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.textSecondary },
});
