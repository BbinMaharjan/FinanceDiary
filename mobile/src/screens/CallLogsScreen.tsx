import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../theme';
import { formatDuration, getCallLogs, PermissionError, syncDeviceLogs } from '../services/deviceLogs';
import type { DeviceCallLog } from '../types/deviceLogs';
import type { MoreStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'CallLogs'>;

const TYPE_LABELS: Record<string, string> = {
  INCOMING: 'Incoming',
  OUTGOING: 'Outgoing',
  MISSED: 'Missed',
  VOICEMAIL: 'Voicemail',
  REJECTED: 'Rejected',
  BLOCKED: 'Blocked',
  ANSWERED_EXTERNALLY: 'Answered',
  WIFI_INCOMING: 'WiFi Incoming',
  WIFI_OUTGOING: 'WiFi Outgoing',
  UNKNOWN: 'Unknown',
};

function typeColor(type: string): string {
  if (type === 'OUTGOING' || type === 'WIFI_OUTGOING') {
    return colors.income;
  }
  if (type === 'MISSED' || type === 'BLOCKED') {
    return colors.danger;
  }
  return colors.primary;
}

export function CallLogsScreen(_props: Props) {
  const [logs, setLogs] = useState<DeviceCallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  const handleSync = useCallback(async () => {
    if (syncing) {
      return;
    }
    setSyncing(true);
    try {
      await syncDeviceLogs();
      setLastSyncAt(new Date());
    } catch {
      // Sync is best-effort; keep the previous state.
    } finally {
      setSyncing(false);
    }
  }, [syncing]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getCallLogs(500);
      setLogs(data);
      if (!isRefresh) {
        syncDeviceLogs()
          .then(() => setLastSyncAt(new Date()))
          .catch(() => {});
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load call logs.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.center}>
        <EmptyState icon="📵" message="Call log tracking is only available on Android." />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Call Logs</Text>
        <View style={styles.headerRight}>
          {logs.length > 0 ? <Text style={styles.count}>{logs.length} calls</Text> : null}
          <Pressable
            style={[styles.syncBtn, syncing && styles.syncBtnDisabled]}
            onPress={handleSync}
            disabled={syncing}
          >
            <Text style={styles.syncText}>
              {syncing ? 'Syncing...' : lastSyncAt ? 'Synced' : 'Sync'}
            </Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <EmptyState
            icon="🔒"
            message={error.message}
            actionLabel={error instanceof PermissionError ? 'Open Settings' : 'Retry'}
            onAction={error instanceof PermissionError ? Linking.openSettings : () => load()}
          />
        </View>
      ) : logs.length === 0 ? (
        <EmptyState icon="📞" message="No call logs found" />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const number = item.formattedNumber || item.phoneNumber || 'Unknown';
            return (
              <View style={styles.card}>
                <View style={styles.cardMain}>
                  <View style={styles.titleRow}>
                    {item.name ? (
                      <Text style={styles.name} numberOfLines={1}>
                        {item.name}
                      </Text>
                    ) : (
                      <Text style={styles.name} numberOfLines={1}>
                        {number}
                      </Text>
                    )}
                    {!item.name ? (
                      <View style={styles.unsavedBadge}>
                        <Text style={styles.unsavedText}>Unsaved</Text>
                      </View>
                    ) : null}
                  </View>
                  {item.name ? <Text style={styles.number}>{number}</Text> : null}
                  <Text style={styles.detail}>
                    {item.dateTime} • {formatDuration(item.duration)}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: typeColor(item.type) }]}>
                  <Text style={styles.badgeText}>{TYPE_LABELS[item.type] ?? item.type}</Text>
                </View>
              </View>
            );
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  count: { fontSize: 13, color: colors.textSecondary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  syncBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  syncBtnDisabled: { opacity: 0.6 },
  syncText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  cardMain: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text, flexShrink: 1 },
  unsavedBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  unsavedText: { color: '#b45309', fontSize: 10, fontWeight: '700' },
  number: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  detail: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
});
