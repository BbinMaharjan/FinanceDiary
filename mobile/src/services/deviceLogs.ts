import { NativeModules, PermissionsAndroid, Platform, type Permission } from 'react-native';
import CallLogs from 'react-native-call-log';
import { api } from '../api/client';
import type { DeviceCallLog, SmsFilter, SmsMessage } from '../types/deviceLogs';

interface NativeSmsModule {
  getMessages(filter: Record<string, unknown>): Promise<SmsMessage[]>;
}

const NativeSms: NativeSmsModule | undefined = NativeModules.Sms;

function toDeviceCallLog(log: any): DeviceCallLog {
  return {
    id: String(log.id ?? ''),
    phoneNumber: log.phoneNumber ?? '',
    formattedNumber: log.formattedNumber ?? log.phoneNumber ?? 'Unknown',
    duration: Number(log.duration ?? 0),
    name: log.name ?? null,
    timestamp: String(log.timestamp ?? ''),
    dateTime: log.dateTime ?? '',
    type: log.type ?? 'UNKNOWN',
    simDisplayName: log.simDisplayName ?? null,
  };
}

export type PermissionStatus = 'granted' | 'denied' | 'never_ask_again';

export class PermissionError extends Error {
  readonly permanentlyDenied: boolean;

  constructor(message: string, permanentlyDenied: boolean) {
    super(message);
    this.name = 'PermissionError';
    this.permanentlyDenied = permanentlyDenied;
  }
}

async function requestPermission(permission: Permission, rationale: string): Promise<PermissionStatus> {
  try {
    if (await PermissionsAndroid.check(permission)) {
      return 'granted';
    }
    const result = await PermissionsAndroid.request(permission, {
      title: 'Permission required',
      message: rationale,
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    });
    return result;
  } catch {
    return 'denied';
  }
}

export interface DevicePermissionStatus {
  callLog: PermissionStatus;
  sms: PermissionStatus;
}

export async function requestCallLogPermission(): Promise<PermissionStatus> {
  if (Platform.OS !== 'android') {
    return 'granted';
  }
  return requestPermission(
    PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    'Allow access to your call history so this app can show your call logs.',
  );
}

export async function requestSmsPermission(): Promise<PermissionStatus> {
  if (Platform.OS !== 'android') {
    return 'granted';
  }
  return requestPermission(
    PermissionsAndroid.PERMISSIONS.READ_SMS,
    'Allow access to your SMS so this app can show your messages.',
  );
}

export async function requestDevicePermissions(): Promise<DevicePermissionStatus> {
  const [callLog, sms] = await Promise.all([requestCallLogPermission(), requestSmsPermission()]);
  return { callLog, sms };
}

export async function getCallLogs(limit = 200): Promise<DeviceCallLog[]> {
  if (Platform.OS !== 'android') {
    return [];
  }
  const status = await requestCallLogPermission();
  if (status !== 'granted') {
    throw new PermissionError(
      status === 'never_ask_again'
        ? 'Call log access is blocked. Enable it in Settings.'
        : 'Call log permission was denied.',
      status === 'never_ask_again',
    );
  }
  const logs = await CallLogs.load(limit);
  return logs.map(toDeviceCallLog);
}

export function getSmsMessages(filter: SmsFilter = {}): Promise<SmsMessage[]> {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'android') {
      resolve([]);
      return;
    }
    if (!NativeSms) {
      reject(new Error('SMS module is not available. Rebuild the app.'));
      return;
    }
    requestSmsPermission()
      .then(status => {
        if (status !== 'granted') {
          reject(
            new PermissionError(
              status === 'never_ask_again'
                ? 'SMS access is blocked. Enable it in Settings.'
                : 'SMS permission was denied.',
              status === 'never_ask_again',
            ),
          );
          return;
        }
        NativeSms.getMessages({ box: 'inbox', maxCount: 200, ...filter })
          .then(resolve)
          .catch(e => reject(new Error(e?.message ?? 'Failed to load SMS.')));
      })
      .catch(() => reject(new Error('Failed to load SMS.')));
  });
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) {
    return '0s';
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}

export function formatSmsDate(timestamp: number | string): string {
  const d = new Date(Number(timestamp));
  if (isNaN(d.getTime())) {
    return '';
  }
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface SyncResult {
  callLogs: number;
  sms: number;
  lastSyncedAt?: string;
}

export async function syncDeviceLogs(): Promise<SyncResult> {
  const callLogs = await getCallLogs(500).catch(() => [] as DeviceCallLog[]);
  const [inbox, sent] = await Promise.all([
    getSmsMessages({ box: 'inbox', maxCount: 300 }).catch(() => [] as SmsMessage[]),
    getSmsMessages({ box: 'sent', maxCount: 300 }).catch(() => [] as SmsMessage[]),
  ]);

  const sms = [
    ...inbox.map(m => ({
      deviceId: String(m._id),
      address: m.address,
      date: String(m.date),
      read: m.read,
      type: m.type,
      body: m.body,
      box: 'inbox' as const,
    })),
    ...sent.map(m => ({
      deviceId: String(m._id),
      address: m.address,
      date: String(m.date),
      read: m.read,
      type: m.type,
      body: m.body,
      box: 'sent' as const,
    })),
  ];

  const callLogPayload = callLogs.map(log => ({
    deviceId: log.id,
    phoneNumber: log.phoneNumber,
    formattedNumber: log.formattedNumber,
    duration: log.duration,
    name: log.name,
    timestamp: log.timestamp,
    dateTime: log.dateTime,
    type: log.type,
    simDisplayName: log.simDisplayName,
  }));

  const { data } = await api.post<SyncResult>('/device-logs/sync', {
    callLogs: callLogPayload,
    sms,
  });
  return data;
}
