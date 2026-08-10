import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../theme';
import { formatSmsDate, getSmsMessages, PermissionError, syncDeviceLogs } from '../services/deviceLogs';
import type { SmsMessage } from '../types/deviceLogs';
import type { MoreStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'SMS'>;

type Box = 'inbox' | 'sent';

const BOXES: { key: Box; label: string }[] = [
  { key: 'inbox', label: 'Inbox' },
  { key: 'sent', label: 'Sent' },
];

export function SmsScreen(_props: Props) {
  const [box, setBox] = useState<Box>('inbox');
  const [messages, setMessages] = useState<SmsMessage[]>([]);
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

  const load = useCallback(
    async (targetBox: Box, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const data = await getSmsMessages({ box: targetBox, maxCount: 300 });
        setMessages(data);
        if (!isRefresh) {
          syncDeviceLogs()
            .then(() => setLastSyncAt(new Date()))
            .catch(() => {});
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to load SMS.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    load(box);
  }, [box, load]);

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.center}>
        <EmptyState icon="📵" message="SMS tracking is only available on Android." />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerRight}>
          {messages.length > 0 ? <Text style={styles.count}>{messages.length} messages</Text> : null}
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

      <View style={styles.segment}>
        {BOXES.map(b => (
          <Pressable
            key={b.key}
            style={[styles.segmentItem, box === b.key && styles.segmentItemActive]}
            onPress={() => setBox(b.key)}
          >
            <Text style={[styles.segmentText, box === b.key && styles.segmentTextActive]}>{b.label}</Text>
          </Pressable>
        ))}
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
            onAction={error instanceof PermissionError ? Linking.openSettings : () => load(box)}
          />
        </View>
      ) : messages.length === 0 ? (
        <EmptyState icon="💬" message="No messages found" />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={item => String(item._id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.address}>{item.address || 'Unknown'}</Text>
                <Text style={styles.date}>{formatSmsDate(item.date)}</Text>
              </View>
              <Text style={styles.body} numberOfLines={2}>
                {item.body}
              </Text>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(box, true)} tintColor={colors.primary} />
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
  segment: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 3,
  },
  segmentItem: { flex: 1, borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  segmentItemActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  segmentTextActive: { color: colors.white },
  list: { padding: 16, gap: 10 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  address: { fontSize: 14, fontWeight: '700', color: colors.text, flexShrink: 1 },
  date: { fontSize: 11, color: colors.textSecondary },
  body: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});
