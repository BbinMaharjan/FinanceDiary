import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type {
  Account,
  Category,
  CategoryReportItem,
  DailySummary,
  DashboardData,
  MonthlySummary,
  PaginatedTransactions,
  Transaction,
} from './types';

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: string;
  category?: string;
  account?: string;
  paymentType?: string;
  search?: string;
}

// ---- Transactions ----
export function useTransactions(params: TransactionQueryParams = {}) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedTransactions>('/transactions', { params });
      return data;
    },
  });
}

export function useTransaction(id?: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data } = await api.get<Transaction>(`/transactions/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/transactions', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['monthly-summaries'] });
      qc.invalidateQueries({ queryKey: ['daily-summary'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      api.put(`/transactions/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['monthly-summaries'] });
      qc.invalidateQueries({ queryKey: ['daily-summary'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['monthly-summaries'] });
      qc.invalidateQueries({ queryKey: ['daily-summary'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// ---- Categories ----
export function useCategories(type?: string) {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories', { params: type ? { type } : {} });
      return data;
    },
  });
}

export function useCategory(id?: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const { data } = await api.get<Category>(`/categories/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/categories', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      api.put(`/categories/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

// ---- Accounts ----
export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data } = await api.get<Account[]>('/accounts');
      return data;
    },
  });
}

export function useAccount(id?: string) {
  return useQuery({
    queryKey: ['account', id],
    queryFn: async () => {
      const { data } = await api.get<Account>(`/accounts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/accounts', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      api.put(`/accounts/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

// ---- Reports ----
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get<DashboardData>('/reports/dashboard');
      return data;
    },
  });
}

export function useMonthlySummaries(year: number) {
  return useQuery({
    queryKey: ['monthly-summaries', year],
    queryFn: async () => {
      const { data } = await api.get<MonthlySummary[]>('/reports/monthly', {
        params: { year },
      });
      return data;
    },
  });
}

export function useDailySummary(date: string) {
  return useQuery({
    queryKey: ['daily-summary', date],
    queryFn: async () => {
      const { data } = await api.get<DailySummary>('/reports/daily', { params: { date } });
      return data;
    },
  });
}

export function useCategoryReport(startDate?: string, endDate?: string, type?: string) {
  return useQuery({
    queryKey: ['category-report', startDate, endDate, type],
    queryFn: async () => {
      const { data } = await api.get<CategoryReportItem[]>('/reports/categories', {
        params: { startDate, endDate, type },
      });
      return data;
    },
    enabled: !!startDate && !!endDate,
  });
}
