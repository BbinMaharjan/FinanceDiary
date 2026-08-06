import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useAccounts() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data: res } = await api.get('/accounts');
      return res;
    },
  });

  const createAccount = useMutation({
    mutationFn: (accountData) => api.post('/accounts', accountData).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const updateAccount = useMutation({
    mutationFn: ({ id, ...accountData }) => api.put(`/accounts/${id}`, accountData).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const deleteAccount = useMutation({
    mutationFn: (id) => api.delete(`/accounts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });

  return {
    accounts: data ?? [],
    loading: isLoading,
    createAccount: createAccount.mutateAsync,
    updateAccount: updateAccount.mutateAsync,
    deleteAccount: deleteAccount.mutateAsync,
  };
}
