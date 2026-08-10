export interface DeviceCallLog {
  id: string;
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
  _id: number;
  thread_id: number;
  address: string;
  date: number;
  read: number;
  type: number;
  body: string;
  person: number;
}

export interface SmsFilter {
  box?: 'inbox' | 'sent' | 'draft' | 'outbox' | 'failed' | 'queued' | '';
  minDate?: number;
  maxDate?: number;
  read?: number;
  address?: string;
  bodyRegex?: string;
  indexFrom?: number;
  maxCount?: number;
}
