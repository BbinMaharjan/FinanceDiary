import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getErrorMessage } from '../api/client';
import { useAccount, useCreateAccount, useUpdateAccount } from '../api/hooks';
import { PickerModal } from '../components/PickerModal';
import { colors } from '../theme';
import type { MoreStackParamList } from '../navigation/types';
import type { AccountType } from '../api/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'AccountForm'>;

const ACCOUNT_TYPES: AccountType[] = ['Savings', 'Current', 'Cash', 'Other'];

export function AccountFormScreen({ navigation, route }: Props) {
  const id = route.params?.id;
  const isEdit = !!id;
  const { data: existing, isLoading: existingLoading } = useAccount(id);
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('Savings');
  const [openingBalance, setOpeningBalance] = useState('');
  const [notes, setNotes] = useState('');
  const [showType, setShowType] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setBankName(existing.bankName ?? '');
      setAccountNumber(existing.accountNumber ?? '');
      setAccountType(existing.accountType);
      setOpeningBalance(String(existing.openingBalance ?? 0));
      setNotes(existing.notes ?? '');
    }
  }, [existing]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Account name is required');
      return;
    }
    const opening = Number(openingBalance);
    if (openingBalance !== '' && isNaN(opening)) {
      Alert.alert('Validation', 'Opening balance must be a number');
      return;
    }
    const payload = {
      name: name.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountType,
      openingBalance: openingBalance === '' ? 0 : opening,
      notes: notes.trim(),
    };
    setSaving(true);
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: id!, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (existingLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Account Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Nabil Savings"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Bank Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Nabil Bank"
          placeholderTextColor={colors.textSecondary}
          value={bankName}
          onChangeText={setBankName}
        />

        <Text style={styles.label}>Account Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional"
          placeholderTextColor={colors.textSecondary}
          value={accountNumber}
          onChangeText={setAccountNumber}
        />

        <Text style={styles.label}>Account Type</Text>
        <Pressable style={styles.input} onPress={() => setShowType(true)}>
          <Text style={styles.inputText}>{accountType}</Text>
        </Pressable>

        <Text style={styles.label}>Opening Balance (रू)</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          value={openingBalance}
          onChangeText={setOpeningBalance}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notes]}
          placeholder="Optional notes"
          placeholderTextColor={colors.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Pressable style={[styles.saveBtn, saving && styles.saveDisabled]} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveText}>{isEdit ? 'Update Account' : 'Save Account'}</Text>
          )}
        </Pressable>
      </ScrollView>

      <PickerModal
        visible={showType}
        title="Account Type"
        options={ACCOUNT_TYPES.map(t => ({ label: t, value: t }))}
        selected={accountType}
        onSelect={v => setAccountType(v as AccountType)}
        onClose={() => setShowType(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 6 },
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
    justifyContent: 'center',
  },
  notes: { minHeight: 80, textAlignVertical: 'top' },
  inputText: { fontSize: 15, color: colors.text },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  saveDisabled: { opacity: 0.7 },
  saveText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
