import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Typography, theme } from 'antd';

interface Props {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  categoryName?: string;
  categoryIcon?: string;
  paymentType?: string;
  onDelete?: () => void;
  index?: number;
}

export function TransactionItem({ title, amount, type, date, categoryName, categoryIcon, paymentType, onDelete, index = 0 }: Props) {
  const { token } = theme.useToken();
  const emoji = categoryIcon || '📄';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderRadius: 12,
        transition: 'background 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = token.colorFillTertiary; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
        <div style={{ minWidth: 0 }}>
          <Typography.Text
            style={{ fontSize: 14, fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {title}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {categoryName ? ` • ${categoryName}` : ''}
            {paymentType ? ` • ${paymentType}` : ''}
          </Typography.Text>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Typography.Text
          style={{
            fontSize: 14,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            color: type === 'income' ? '#22c55e' : '#f97316',
          }}
        >
          {type === 'income' ? '+' : '-'}रू {amount.toLocaleString('en-IN')}
        </Typography.Text>
        {onDelete && (
          <button
            onClick={onDelete}
            style={{
              padding: 6,
              color: token.colorTextSecondary,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: 0,
              transition: 'opacity 0.2s',
              borderRadius: 6,
            }}
            className="delete-btn"
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = token.colorErrorBg; e.currentTarget.style.color = token.colorError; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = token.colorTextSecondary; }}
          >
            <Trash2 style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      <style>{`
        .delete-btn {
          opacity: 0;
        }
        .delete-btn:hover {
          background: ${token.colorErrorBg} !important;
          color: ${token.colorError} !important;
        }
      `}</style>
    </motion.div>
  );
}
