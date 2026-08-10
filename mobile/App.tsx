import React from 'react';
import { StatusBar } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/auth/AuthContext';
import AppNavigator from './src/navigation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
