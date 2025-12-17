import React from 'react';
import { BottomSheetModal } from '@/features/shared/components/BottomSheetModal';
import { LanguageSelector } from './LanguageSelector';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LanguageModal({ visible, onClose }: LanguageModalProps) {
  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      height="75%"
      showHandle={true}
      enableSwipeToDismiss={true}
    >
      <View style={styles.container}>
        <LanguageSelector />
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    minHeight: '70%',
  },
});
