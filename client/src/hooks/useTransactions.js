import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useTransactions(params = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const { data: res } = await api.get('/transactions', { params });
      return res;
    },
  });

  const createTransaction = useMutation({
    mutationFn: (txData) => api.post('/transactions', txData).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  const updateTransaction = useMutation({
    mutationFn: ({ id, ...txData }) => api.put(`/transactions/${id}`, txData).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  const deleteTransaction = useMutation({
    mutationFn: (id) => api.delete(`/transactions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  return {
    transactions: data?.transactions ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    pages: data?.pages ?? 1,
    loading: isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    createTransaction: createTransaction.mutateAsync,
    updateTransaction: updateTransaction.mutateAsync,
    deleteTransaction: deleteTransaction.mutateAsync,
  };
}
