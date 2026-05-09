import { useState, useEffect } from 'react';
import api from '../services/api';

export function useCategories(type) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = type ? { type } : {};
      const { data } = await api.get('/categories', { params });
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const createCategory = async (catData) => {
    const { data } = await api.post('/categories', catData);
    await fetchCategories();
    return data;
  };

  const updateCategory = async (id, catData) => {
    const { data } = await api.put(`/categories/${id}`, catData);
    await fetchCategories();
    return data;
  };

  const deleteCategory = async (id) => {
    await api.delete(`/categories/${id}`);
    await fetchCategories();
  };

  return { categories, loading, refetch: fetchCategories, createCategory, updateCategory, deleteCategory };
}
