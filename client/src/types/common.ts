export type TransactionType = 'income' | 'expense';

export type PaymentType = 'Cash' | 'Bank Transfer' | 'Card' | 'Other';

export interface PaginatedResponse<T> {
  transactions: T[];
  total: number;
  page: number;
  pages: number;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}
