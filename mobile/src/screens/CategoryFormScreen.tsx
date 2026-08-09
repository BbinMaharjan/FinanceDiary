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
import { useCategories, useCategory, useCreateCategory, useUpdateCategory } from '../api/hooks';
import { PickerModal } from '../components/PickerModal';
import { colors } from '../theme';
import type { MoreStackParamList } from '../navigation/types';
import type { TransactionType } from '../api/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'CategoryForm'>;

const EMOJI_OPTIONS = ['📄', '🍔', '🛒', '🏠', '💡', '📱', '🚗', '💊', '🎁', '✈️', '👕', '🎓', '💰', '🏦', '💼', '📈', '🍎', '☕'];

export function CategoryFormScreen({ navigation, route }: Props) {
  const id = route.params?.id;
  const isEdit = !!id;
  const { data: existing, isLoading: existingLoading } = useCategory(id);
  const { data: categories } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(route.params?.type ?? 'expense');
  const [icon, setIcon] = useState('📄');
  const [showIcons, setShowIcons] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setType(existing.type);
      setIcon(existing.icon || '📄');
    }
  }, [existing]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Category name is required');
      return;
    }
    const duplicate = (categories ?? []).find(
      c => c.name.toLowerCase() === name.trim().toLowerCase() && c.type === type && c._id !== id,
    );
    if (duplicate) {
      Alert.alert('Validation', 'A category with this name already exists');
      return;
    }
    const payload = { name: name.trim(), type, icon };
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
        <Text style={styles.label}>Category Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Groceries"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Type</Text>
        <View style={styles.typeToggle}>
          {(['expense', 'income'] as TransactionType[]).map(t => (
            <Pressable
              key={t}
              style={[styles.typeBtn, type === t && (t === 'income' ? styles.typeIncome : styles.typeExpense)]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                {t === 'income' ? '+ Income' : '- Expense'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Icon</Text>
        <Pressable style={styles.input} onPress={() => setShowIcons(true)}>
          <Text style={styles.inputText}>{icon}</Text>
        </Pressable>

        <Pressable style={[styles.saveBtn, saving && styles.saveDisabled]} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveText}>{isEdit ? 'Update Category' : 'Save Category'}</Text>
          )}
        </Pressable>
      </ScrollView>

      <PickerModal
        visible={showIcons}
        title="Choose an Icon"
        options={EMOJI_OPTIONS.map(e => ({ label: e, value: e }))}
        selected={icon}
        onSelect={setIcon}
        onClose={() => setShowIcons(false)}
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
  inputText: { fontSize: 15, color: colors.text },
  typeToggle: { flexDirection: 'row', gap: 10, marginBottom: 12 },
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
  saveBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  saveDisabled: { opacity: 0.7 },
  saveText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
