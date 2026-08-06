import type { TransactionType, PaymentType } from './common';
import type { Category } from './category';
import type { Account } from './account';

export interface Transaction {
  _id: string;
  user: string;
  date: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category | { _id: string; name: string; icon?: string; color?: string };
  account?: Account | { _id: string; name: string; bankName?: string } | null;
  paymentType: PaymentType;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionFormData {
  date: string;
  title: string;
  amount: string;
  type: TransactionType;
  category: string;
  account?: string;
  paymentType: PaymentType;
  notes: string;
}

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: TransactionType | '';
  category?: string;
  account?: string;
  paymentType?: string;
  search?: string;
}
