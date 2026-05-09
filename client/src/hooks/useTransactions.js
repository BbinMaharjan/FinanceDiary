import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useTransactions(params = {}) {
  const [data, setData] = useState({ transactions: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/transactions', { params });
      setData(res);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = async (txData) => {
    const { data: tx } = await api.post('/transactions', txData);
    await fetchTransactions();
    return tx;
  };

  const updateTransaction = async (id, txData) => {
    const { data: tx } = await api.put(`/transactions/${id}`, txData);
    await fetchTransactions();
    return tx;
  };

  const deleteTransaction = async (id) => {
    await api.delete(`/transactions/${id}`);
    await fetchTransactions();
  };

  return { ...data, loading, refetch: fetchTransactions, createTransaction, updateTransaction, deleteTransaction };
}
