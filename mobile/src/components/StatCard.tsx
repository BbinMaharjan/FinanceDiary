import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { formatNPR } from '../lib/format';

type Variant = 'income' | 'expense' | 'balance';

const GRADIENTS: Record<Variant, [string, string]> = {
  income: ['#22c55e', '#14b8a6'],
  expense: ['#f97316', '#f59e0b'],
  balance: ['#3b82f6', '#8b5cf6'],
};

const ICONS: Record<Variant, string> = { income: '↓', expense: '↑', balance: 'रू' };

interface Props {
  label: string;
  amount: number;
  variant: Variant;
  style?: object;
}

export function StatCard({ label, amount, variant, style }: Props) {
  const [from, to] = GRADIENTS[variant];
  return (
    <View style={[styles.card, { backgroundColor: from }, style]}>
      <View style={styles.orbit} />
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.amount}>{formatNPR(amount)}</Text>
        </View>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{ICONS[variant]}</Text>
        </View>
      </View>
      <View style={[styles.glow, { backgroundColor: to }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  orbit: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  glow: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 140,
    height: 80,
    borderRadius: 40,
    opacity: 0.35,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },
  textCol: { flex: 1 },
  label: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500', marginBottom: 4 },
  amount: { color: colors.white, fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { color: colors.white, fontSize: 20, fontWeight: '700' },
});
