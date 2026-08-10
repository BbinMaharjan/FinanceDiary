import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import type { User } from './types';

export const AUTH_STORAGE_KEY = 'daybook.user';

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export async function storeUser(user: User) {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export async function clearStoredUser() {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

api.interceptors.request.use(async config => {
  const user = await getStoredUser();
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearStoredUser().then(() => {
        unauthorizedHandler?.();
      });
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string })?.message;
    if (message) return message;
    if (error.code === 'ECONNABORTED') return 'Request timed out. Check your connection.';
    if (!error.response) return 'Cannot reach server. Check your internet connection.';
    return error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}
