import type { Transaction } from './transaction';
import type { CategorySpending } from './category';

export interface CashFlowItem {
  date: string;
  income: number;
  expense: number;
}

export interface DashboardData {
  overallIncome: number;
  overallExpense: number;
  overallBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
  yearlyIncome: number;
  yearlyExpense: number;
  yearlyBalance: number;
  lastMonthIncome: number;
  lastMonthExpense: number;
  recentTransactions: Transaction[];
  cashFlow: CashFlowItem[];
  spendingBreakdown: CategorySpending[];
}
