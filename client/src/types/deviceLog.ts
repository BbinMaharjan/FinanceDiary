export interface DeviceCallLog {
  deviceId: string;
  phoneNumber: string;
  formattedNumber: string;
  duration: number;
  name: string | null;
  timestamp: string;
  dateTime: string;
  type: string;
  simDisplayName: string | null;
}

export interface SmsMessage {
  deviceId: string;
  address: string;
  date: string;
  read: number;
  type: number;
  body: string;
  box: "inbox" | "sent";
}

export interface DeviceLogs {
  callLogs: DeviceCallLog[];
  sms: SmsMessage[];
  lastSyncedAt: string | null;
}
