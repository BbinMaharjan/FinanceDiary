export type TransactionType = 'income' | 'expense';
export type PaymentType = 'Cash' | 'Bank Transfer' | 'Card' | 'Other';
export type AccountType = 'Savings' | 'Current' | 'Cash' | 'Other';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  token: string;
}

export interface Category {
  _id: string;
  user: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Account {
  _id: string;
  user: string;
  name: string;
  bankName?: string;
  accountNumber?: string;
  accountType: AccountType;
  openingBalance: number;
  notes?: string;
  totalIncome?: number;
  totalExpense?: number;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  _id: string;
  user: string;
  date: string;
  title: string;
  amount: number;
  type: TransactionType;
  category?: {
    _id: string;
    name: string;
    icon?: string;
    color?: string;
  } | null;
  account?: { _id: string; name: string; bankName?: string } | null;
  paymentType: PaymentType;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  total: number;
  page: number;
  pages: number;
}

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

export interface DailySummary {
  date: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  transactions: Transaction[];
}

export interface DashboardAccount {
  _id: string;
  name: string;
  bankName?: string;
  accountType?: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CashFlowItem {
  date: string;
  income: number;
  expense: number;
}

export interface CategorySpending {
  categoryName: string;
  total: number;
  icon?: string;
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
  accounts: DashboardAccount[];
}

export interface CategoryReportItem {
  _id: string;
  total: number;
  count: number;
  category: { _id: string; name: string; icon?: string; color?: string } | null;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}
