import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export interface PickerOption<T = string> {
  label: string;
  value: T;
  icon?: string;
}

interface Props<T = string> {
  visible: boolean;
  title: string;
  options: PickerOption<T>[];
  selected?: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

export function PickerModal<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: Props<T>) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={item => item.value}
            style={{ maxHeight: 420 }}
            renderItem={({ item }) => {
              const active = item.value === selected;
              return (
                <Pressable
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                >
                  {item.icon ? <Text style={styles.optionIcon}>{item.icon}</Text> : null}
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {item.label}
                  </Text>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            }}
          />
          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12, textAlign: 'center' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  optionActive: { backgroundColor: '#eff6ff' },
  optionIcon: { fontSize: 16 },
  optionText: { fontSize: 15, color: colors.text, flex: 1 },
  optionTextActive: { color: colors.primary, fontWeight: '600' },
  check: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
});
