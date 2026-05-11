export interface MonthlySummary {
  _id: string;
  user: string;
  month: string;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface YearlyReportData {
  monthlyData: MonthlySummary[];
  categoryBreakdown: Record<string, unknown>[];
}

import type { Transaction } from './transaction';

export interface DailySummary {
  date: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  transactions: Transaction[];
}

export interface CategoryReportItem {
  _id: string;
  total: number;
  count: number;
  category: {
    _id: string;
    name: string;
    icon?: string;
    color?: string;
  } | null;
}
