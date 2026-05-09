import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { cn } from '../../lib/utils';

type Variant = 'income' | 'expense' | 'balance';

const GRADIENTS: Record<Variant, string> = {
  income: 'bg-gradient-to-br from-green-500 to-teal-500',
  expense: 'bg-gradient-to-br from-orange-500 to-amber-500',
  balance: 'bg-gradient-to-br from-blue-500 to-violet-500',
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
      className={cn('relative overflow-hidden rounded-2xl p-5 text-white', GRADIENTS[variant])}
    >
      <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium opacity-90">{label}</p>
          <p className="font-display text-2xl md:text-3xl font-bold tracking-tight">{formatted}</p>
          {typeof delta === 'number' && (
            <p className="text-xs opacity-85">{delta > 0 ? '+' : ''}{delta}% vs last month</p>
          )}
        </div>
        <div className="size-10 rounded-xl bg-white/20 grid place-items-center backdrop-blur-sm shrink-0">
          <Icon className="size-5" />
        </div>
      </div>
    </motion.div>
  );
}
