import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { PremiumButton } from './PremiumButton';
import { useTheme } from '../lib/theme';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialog, isDark ? styles.dialogDark : styles.dialogLight]}>
              <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
                {title}
              </Text>
              <Text style={[styles.message, isDark ? styles.messageDark : styles.messageLight]}>
                {message}
              </Text>

              <View style={styles.buttonRow}>
                <View style={styles.buttonWrapper}>
                  <PremiumButton title={cancelLabel} variant="secondary" onPress={onCancel} />
                </View>
                <View style={styles.buttonWrapper}>
                  <PremiumButton title={confirmLabel} variant={variant} onPress={onConfirm} />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  dialogLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
  },
  dialogDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)', // slate-900
    shadowColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.6)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
  },
  textLight: {
    color: '#0f172a', // slate-900
  },
  textDark: {
    color: '#f8fafc', // slate-50
  },
  messageLight: {
    color: '#475569', // slate-600
  },
  messageDark: {
    color: '#94a3b8', // slate-400
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    gap: 12,
  },
  buttonWrapper: {
    minWidth: 120,
    flex: 0,
  },
});
