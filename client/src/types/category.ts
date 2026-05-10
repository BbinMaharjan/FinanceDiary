import type { TransactionType } from './common';

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

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface CategorySpending {
  categoryName: string;
  total: number;
  icon?: string;
}
