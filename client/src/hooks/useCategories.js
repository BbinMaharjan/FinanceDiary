import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useCategories(type) {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      const params = type ? { type } : {};
      const { data } = await api.get('/categories', { params });
      return data;
    },
  });

  const createCategory = useMutation({
    mutationFn: (catData) => api.post('/categories', catData).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, ...catData }) => api.put(`/categories/${id}`, catData).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const deleteCategory = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  return {
    categories,
    loading: isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    createCategory: createCategory.mutateAsync,
    updateCategory: updateCategory.mutateAsync,
    deleteCategory: deleteCategory.mutateAsync,
  };
}
