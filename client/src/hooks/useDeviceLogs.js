import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useDeviceLogs() {
  const { data, isLoading } = useQuery({
    queryKey: ['device-logs'],
    queryFn: async () => {
      const { data: res } = await api.get('/device-logs');
      return res;
    },
  });

  return {
    callLogs: data?.callLogs ?? [],
    sms: data?.sms ?? [],
    lastSyncedAt: data?.lastSyncedAt ?? null,
    loading: isLoading,
  };
}
