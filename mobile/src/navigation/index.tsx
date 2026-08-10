import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme';
import type {
  AuthStackParamList,
  CashBookStackParamList,
  MainTabParamList,
  MoreStackParamList,
  TransactionsStackParamList,
} from './types';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { TransactionFormScreen } from '../screens/TransactionFormScreen';
import { CashBookScreen } from '../screens/CashBookScreen';
import { DailySummaryScreen } from '../screens/DailySummaryScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { AccountsScreen } from '../screens/AccountsScreen';
import { AccountFormScreen } from '../screens/AccountFormScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { CategoryFormScreen } from '../screens/CategoryFormScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const TransactionsStack = createNativeStackNavigator<TransactionsStackParamList>();
const CashBookStack = createNativeStackNavigator<CashBookStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TransactionsStackNavigator() {
  return (
    <TransactionsStack.Navigator>
      <TransactionsStack.Screen
        name="TransactionsList"
        component={TransactionsScreen}
        options={{ headerShown: false }}
      />
      <TransactionsStack.Screen
        name="TransactionForm"
        component={TransactionFormScreen}
        options={{ title: 'Add Transaction', headerBackTitle: 'Back' }}
      />
    </TransactionsStack.Navigator>
  );
}

function CashBookStackNavigator() {
  return (
    <CashBookStack.Navigator>
      <CashBookStack.Screen name="CashBook" component={CashBookScreen} options={{ headerShown: false }} />
      <CashBookStack.Screen
        name="DailySummary"
        component={DailySummaryScreen}
        options={{ title: 'Daily Summary', headerBackTitle: 'Back' }}
      />
      <CashBookStack.Screen
        name="TransactionForm"
        component={TransactionFormScreen}
        options={{ title: 'Add Transaction', headerBackTitle: 'Back' }}
      />
    </CashBookStack.Navigator>
  );
}

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator>
      <MoreStack.Screen name="More" component={MoreScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="Accounts" component={AccountsScreen} options={{ headerBackTitle: 'Back' }} />
      <MoreStack.Screen name="AccountForm" component={AccountFormScreen} options={{ title: 'Account', headerBackTitle: 'Back' }} />
      <MoreStack.Screen name="Categories" component={CategoriesScreen} options={{ headerBackTitle: 'Back' }} />
      <MoreStack.Screen name="CategoryForm" component={CategoryFormScreen} options={{ title: 'Category', headerBackTitle: 'Back' }} />
      <MoreStack.Screen name="Reports" component={ReportsScreen} options={{ headerBackTitle: 'Back' }} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} options={{ headerBackTitle: 'Back' }} />
    </MoreStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🏠</Text> }}
      />
      <Tab.Screen
        name="TransactionsTab"
        component={TransactionsStackNavigator}
        options={{ tabBarLabel: 'Transactions', tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>💸</Text> }}
      />
      <Tab.Screen
        name="CashBookTab"
        component={CashBookStackNavigator}
        options={{ tabBarLabel: 'Cash Book', tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>📒</Text> }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{ tabBarLabel: 'Reports', tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>📊</Text> }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackNavigator}
        options={{ tabBarLabel: 'More', tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>☰</Text> }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <MainTabs />
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  tabIcon: { fontSize: 18 },
});
