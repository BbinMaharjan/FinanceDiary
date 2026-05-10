import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { Card, Typography } from 'antd';

type Variant = 'income' | 'expense' | 'balance';

const GRADIENTS: Record<Variant, { bg: string; iconBg: string }> = {
  income: { bg: 'linear-gradient(135deg, #22c55e, #14b8a6)', iconBg: 'rgba(255,255,255,0.2)' },
  expense: { bg: 'linear-gradient(135deg, #f97316, #f59e0b)', iconBg: 'rgba(255,255,255,0.2)' },
  balance: { bg: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', iconBg: 'rgba(255,255,255,0.2)' },
};

const ICONS: Record<Variant, typeof Wallet> = {
  income: ArrowDownRight,
  expense: ArrowUpRight,
  balance: Wallet,
};

interface Props {
  label: string;
  amount: number;
  variant: Variant;
  delta?: number;
  index?: number;
}

export function StatCard({ label, amount, variant, delta, index = 0 }: Props) {
  const Icon = ICONS[variant];
  const formatted = 'रू ' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
    >
      <Card
        style={{
          background: GRADIENTS[variant].bg,
          borderRadius: 16,
          border: 'none',
          overflow: 'hidden',
          position: 'relative',
        }}
        bodyStyle={{ padding: 20 }}
      >
        <div
          style={{
            position: 'absolute',
            right: -24,
            top: -24,
            width: 128,
            height: 128,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            filter: 'blur(32px)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <Typography.Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>
              {label}
            </Typography.Text>
            <Typography.Title
              level={3}
              style={{
                color: '#fff',
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              {formatted}
            </Typography.Title>
            {typeof delta === 'number' && (
              <Typography.Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>
                {delta > 0 ? '+' : ''}{delta}% vs last month
              </Typography.Text>
            )}
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              flexShrink: 0,
            }}
          >
            <Icon style={{ width: 20, height: 20, color: '#fff' }} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
