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
import {
  useAccounts,
  useCategories,
  useCreateTransaction,
  useTransaction,
  useUpdateTransaction,
} from '../api/hooks';
import { PickerModal } from '../components/PickerModal';
import { colors } from '../theme';
import { todayInput } from '../lib/format';
import type { TransactionsStackParamList } from '../navigation/types';
import type { PaymentType, TransactionType } from '../api/types';

type Props = NativeStackScreenProps<TransactionsStackParamList, 'TransactionForm'>;

const PAYMENT_TYPES: PaymentType[] = ['Cash', 'Bank Transfer', 'Card', 'Other'];

export function TransactionFormScreen({ navigation, route }: Props) {
  const id = route.params?.id;
  const isEdit = !!id;
  const { data: existing, isLoading: existingLoading } = useTransaction(id);
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(todayInput());
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [paymentType, setPaymentType] = useState<PaymentType>('Cash');
  const [accountId, setAccountId] = useState<string | undefined>();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [showCategory, setShowCategory] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setAmount(String(existing.amount));
      setType(existing.type);
      setDate(new Date(existing.date).toISOString().split('T')[0]);
      setCategoryId(existing.category?._id);
      setPaymentType(existing.paymentType || 'Cash');
      setAccountId(existing.account?._id);
      setNotes(existing.notes || '');
    }
  }, [existing]);

  const filteredCategories = (categories ?? []).filter(c => c.type === type);
  const selectedCategory = filteredCategories.find(c => c._id === categoryId) ?? categories?.find(c => c._id === categoryId);
  const selectedAccount = accounts?.find(a => a._id === accountId);
  const selectedPayment = PAYMENT_TYPES.find(p => p === paymentType);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required');
      return;
    }
    const amountNum = Number(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Validation', 'Amount must be a positive number');
      return;
    }
    if (!categoryId) {
      Alert.alert('Validation', 'Please select a category');
      return;
    }
    const payload = {
      date,
      title: title.trim(),
      amount: amountNum,
      type,
      category: categoryId,
      paymentType,
      account: accountId || null,
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
        <View style={styles.typeToggle}>
          {(['expense', 'income'] as TransactionType[]).map(t => (
            <Pressable
              key={t}
              style={[styles.typeBtn, type === t && (t === 'income' ? styles.typeIncome : styles.typeExpense)]}
              onPress={() => {
                setType(t);
                setCategoryId(undefined);
              }}
            >
              <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                {t === 'income' ? '+ Income' : '- Expense'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Groceries, Salary"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Amount (रू)</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
          value={date}
          onChangeText={setDate}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>Category</Text>
        <Pressable style={styles.input} onPress={() => setShowCategory(true)}>
          <Text style={selectedCategory ? styles.inputText : styles.inputPlaceholder}>
            {selectedCategory ? `${selectedCategory.icon || '📄'} ${selectedCategory.name}` : 'Select category'}
          </Text>
        </Pressable>

        <Text style={styles.label}>Payment</Text>
        <Pressable style={styles.input} onPress={() => setShowPayment(true)}>
          <Text style={selectedPayment ? styles.inputText : styles.inputPlaceholder}>
            {selectedPayment || 'Select payment type'}
          </Text>
        </Pressable>

        <Text style={styles.label}>Account (optional)</Text>
        <Pressable style={styles.input} onPress={() => setShowAccount(true)}>
          <Text style={accountId && selectedAccount ? styles.inputText : styles.inputPlaceholder}>
            {accountId && selectedAccount ? selectedAccount.name : 'No account'}
          </Text>
        </Pressable>

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
            <Text style={styles.saveText}>{isEdit ? 'Update Transaction' : 'Save Transaction'}</Text>
          )}
        </Pressable>
      </ScrollView>

      <PickerModal
        visible={showCategory}
        title="Select Category"
        options={filteredCategories.map(c => ({ label: c.name, value: c._id, icon: c.icon || '📄' }))}
        selected={categoryId}
        onSelect={setCategoryId}
        onClose={() => setShowCategory(false)}
      />
      <PickerModal
        visible={showPayment}
        title="Payment Type"
        options={PAYMENT_TYPES.map(p => ({ label: p, value: p }))}
        selected={paymentType}
        onSelect={v => setPaymentType(v as PaymentType)}
        onClose={() => setShowPayment(false)}
      />
      <PickerModal
        visible={showAccount}
        title="Select Account"
        options={[
          { label: 'No account', value: '' },
          ...(accounts ?? []).map(a => ({ label: a.name, value: a._id })),
        ]}
        selected={accountId ?? ''}
        onSelect={v => setAccountId(v || undefined)}
        onClose={() => setShowAccount(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  typeToggle: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeIncome: { backgroundColor: colors.income, borderColor: colors.income },
  typeExpense: { backgroundColor: colors.expense, borderColor: colors.expense },
  typeText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  typeTextActive: { color: colors.white },
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
  inputPlaceholder: { fontSize: 15, color: colors.textSecondary },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveDisabled: { opacity: 0.7 },
  saveText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
