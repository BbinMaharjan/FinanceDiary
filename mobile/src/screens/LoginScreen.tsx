import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { getErrorMessage } from '../api/client';
import { colors } from '../theme';
import {
  requestCallLogPermission,
  requestDevicePermissions,
  requestSmsPermission,
  type DevicePermissionStatus,
  type PermissionStatus,
} from '../services/deviceLogs';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

function PermissionRow({
  label,
  status,
  onRequest,
}: {
  label: string;
  status: PermissionStatus;
  onRequest: () => void;
}) {
  if (status === 'granted') {
    return (
      <View style={styles.permRow}>
        <Text style={styles.permLabel}>{label}</Text>
        <Text style={styles.permGranted}>✓ Allowed</Text>
      </View>
    );
  }
  const blocked = status === 'never_ask_again';
  return (
    <View style={styles.permRow}>
      <Text style={styles.permLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.permButton, blocked && styles.permButtonBlocked]}
        onPress={blocked ? Linking.openSettings : onRequest}
      >
        <Text style={styles.permButtonText}>
          {blocked ? 'Open Settings' : 'Allow'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export function LoginScreen(_props: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [permStatus, setPermStatus] = useState<DevicePermissionStatus | null>(
    null,
  );

  const refreshPermissions = useCallback(async () => {
    setPermStatus(await requestDevicePermissions());
  }, []);

  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  const handlePermission = useCallback(async (kind: 'callLog' | 'sms') => {
    const next =
      kind === 'callLog'
        ? await requestCallLogPermission()
        : await requestSmsPermission();
    setPermStatus(prev =>
      prev
        ? { ...prev, [kind]: next }
        : { callLog: 'denied', sms: 'denied', [kind]: next },
    );
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>Daily Cash Book</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* {permStatus ? (
            <View style={styles.permissionCard}>
              <Text style={styles.permissionTitle}>
                Allow device access so you can track calls & messages
              </Text>
              <PermissionRow label="Call Logs" status={permStatus.callLog} onRequest={() => handlePermission('callLog')} />
              <PermissionRow label="Messages" status={permStatus.sms} onRequest={() => handlePermission('sms')} />
            </View>
          ) : (
            <ActivityIndicator color={colors.primary} style={styles.permLoading} />
          )} */}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
        </TouchableOpacity> */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  permLoading: { marginVertical: 20 },
  permissionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
    textAlign: 'center',
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  permLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  permGranted: { fontSize: 13, fontWeight: '600', color: colors.income },
  permButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  permButtonBlocked: { backgroundColor: colors.textSecondary },
  permButtonText: { color: colors.white, fontWeight: '600', fontSize: 13 },
  link: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
