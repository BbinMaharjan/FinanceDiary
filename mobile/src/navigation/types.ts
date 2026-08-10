import type { NavigatorScreenParams } from '@react-navigation/native';
import type { TransactionType } from '../api/types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TransactionsStackParamList = {
  TransactionsList: { type?: TransactionType | null } | undefined;
  TransactionForm: { id?: string } | undefined;
};

export type CashBookStackParamList = {
  CashBook: undefined;
  DailySummary: { date?: string } | undefined;
  TransactionForm: { id?: string } | undefined;
};

export type MoreStackParamList = {
  More: undefined;
  Accounts: undefined;
  AccountForm: { id?: string } | undefined;
  Categories: undefined;
  CategoryForm: { id?: string; type?: TransactionType } | undefined;
  Reports: undefined;
  Settings: undefined;
  CallLogs: undefined;
  SMS: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<TransactionsStackParamList> | undefined;
  TransactionsTab: NavigatorScreenParams<TransactionsStackParamList> | undefined;
  CashBookTab: NavigatorScreenParams<CashBookStackParamList> | undefined;
  ReportsTab: NavigatorScreenParams<TransactionsStackParamList> | undefined;
  MoreTab: NavigatorScreenParams<MoreStackParamList> | undefined;
};
