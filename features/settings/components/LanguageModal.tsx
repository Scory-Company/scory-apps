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
    <BottomSheetModal visible={visible} onClose={onClose} height="auto">
      <View style={styles.container}>
        <LanguageSelector />
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});
