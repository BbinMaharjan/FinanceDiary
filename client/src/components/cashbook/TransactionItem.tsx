import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const CATEGORY_EMOJIS: Record<string, string> = {
  salary: '💼', freelance: '💻', business: '🏪', gift: '🎁', investment: '📈',
  food: '🍔', transport: '🚗', shopping: '🛍️', bills: '📄', health: '💊',
  education: '📚', entertainment: '🎮', other: '📦',
};

interface Props {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  categoryName?: string;
  paymentType?: string;
  onDelete?: () => void;
  index?: number;
}

export function TransactionItem({ title, amount, type, date, categoryName, paymentType, onDelete, index = 0 }: Props) {
  const emoji = CATEGORY_EMOJIS[categoryName?.toLowerCase() || ''] || '📄';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/60 transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-lg flex-shrink-0">{emoji}</span>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {categoryName ? ` • ${categoryName}` : ''}
            {paymentType ? ` • ${paymentType}` : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn('font-semibold text-sm tabular-nums', type === 'income' ? 'text-income' : 'text-expense')}>
          {type === 'income' ? '+' : '-'}रू {amount.toLocaleString('en-IN')}
        </span>
        {onDelete && (
          <button onClick={onDelete} className="p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all">
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
