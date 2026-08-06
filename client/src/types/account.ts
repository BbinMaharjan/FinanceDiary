export type AccountType = 'Savings' | 'Current' | 'Cash' | 'Other';

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

export interface AccountFormData {
  name: string;
  bankName: string;
  accountNumber: string;
  accountType: AccountType;
  openingBalance: string;
  notes: string;
}
