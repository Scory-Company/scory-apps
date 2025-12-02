import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  clearReadingLevel,
  clearAllPersonalization,
  clearAllAsyncStorage,
  viewAllAsyncStorage,
  viewAsyncStorageKey,
} from '@/utils/asyncStorageDebug';

export default function DebugScreen() {
  const colors = Colors.light;

  const debugActions = [
    {
      title: 'View All AsyncStorage',
      icon: 'eye-outline' as const,
      action: viewAllAsyncStorage,
      color: colors.primary,
    },
    {
      title: 'View Reading Level',
      icon: 'book-outline' as const,
      action: () => viewAsyncStorageKey('preferredReadingLevel'),
      color: '#3498db',
    },
    {
      title: 'Clear Reading Level',
      icon: 'close-circle-outline' as const,
      action: clearReadingLevel,
      color: '#e67e22',
    },
    {
      title: 'Clear All Personalization',
      icon: 'trash-outline' as const,
      action: clearAllPersonalization,
      color: '#e74c3c',
    },
    {
      title: 'Clear ALL AsyncStorage',
      icon: 'nuclear-outline' as const,
      action: clearAllAsyncStorage,
      color: '#c0392b',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Debug Tools</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.warning, { color: colors.error, backgroundColor: '#fee' }]}>
          ⚠️ Development Only - These tools modify app storage
        </Text>

        {debugActions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.button, { borderColor: item.color }]}
            onPress={item.action}
          >
            <Ionicons name={item.icon} size={24} color={item.color} />
            <Text style={[styles.buttonText, { color: colors.text }]}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        <View style={styles.info}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>How to Use:</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            1. Tap "View All AsyncStorage" to see current storage
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            2. Check console logs for detailed output
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            3. Use clear buttons to reset specific data
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  warning: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.surface,
  },
  buttonText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginLeft: Spacing.md,
  },
  info: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.lg,
  },
  infoTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
});
