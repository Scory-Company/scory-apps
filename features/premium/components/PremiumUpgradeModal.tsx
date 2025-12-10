import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumFeature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

interface PremiumUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  triggerFeature?: string; // Feature that triggered the modal (e.g., "Re-simplify Article")
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    icon: 'layers',
    title: 'All Reading Levels',
    description: 'Akses semua level: Simple, Student, Academic, Expert',
  },
  {
    icon: 'refresh',
    title: 'Unlimited Re-simplify',
    description: 'Re-simplify artikel ke level berbeda tanpa batas',
  },
  {
    icon: 'document-text',
    title: 'Priority Processing',
    description: 'Simplify artikel lebih cepat dengan priority queue',
  },
  {
    icon: 'bookmarks',
    title: 'Unlimited Bookmarks',
    description: 'Simpan artikel favorit tanpa batas',
  },
  {
    icon: 'analytics',
    title: 'Advanced Insights',
    description: 'Akses analytics dan progress tracking lengkap',
  },
  {
    icon: 'download',
    title: 'Offline Access',
    description: 'Download artikel untuk dibaca offline',
  },
];

export function PremiumUpgradeModal({
  visible,
  onClose,
  onUpgrade,
  triggerFeature,
}: PremiumUpgradeModalProps) {
  const colors = Colors.light;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>

          {/* Header with Gradient */}
          <LinearGradient
            colors={['#FF6B6B', '#FFA500', '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.crownContainer}>
              <Ionicons name="diamond" size={64} color="#FFF" />
            </View>
            <Text style={styles.headerTitle}>Upgrade ke Premium</Text>
            <Text style={styles.headerSubtitle}>
              Unlock semua fitur dan tingkatkan pengalaman belajar Anda
            </Text>
          </LinearGradient>

          {/* Triggered Feature Banner (if applicable) */}
          {triggerFeature && (
            <View style={[styles.triggerBanner, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="lock-closed" size={20} color={colors.primary} />
              <Text style={[styles.triggerText, { color: colors.text }]}>
                <Text style={{ fontWeight: '700' }}>{triggerFeature}</Text> memerlukan Premium
              </Text>
            </View>
          )}

          {/* Features List */}
          <ScrollView
            style={styles.featuresContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Yang Anda Dapatkan:
            </Text>

            {PREMIUM_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={feature.icon} size={24} color={colors.primary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    {feature.title}
                  </Text>
                  <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                    {feature.description}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
            ))}

            {/* Pricing Section */}
            <View style={styles.pricingSection}>
              <Text style={[styles.pricingTitle, { color: colors.text }]}>
                Pilihan Paket:
              </Text>

              {/* Monthly Plan */}
              <TouchableOpacity
                style={[styles.pricingCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={onUpgrade}
              >
                <View style={styles.pricingHeader}>
                  <Text style={[styles.pricingName, { color: colors.text }]}>Bulanan</Text>
                </View>
                <View style={styles.pricingPrice}>
                  <Text style={[styles.priceAmount, { color: colors.text }]}>Rp 49.000</Text>
                  <Text style={[styles.pricePeriod, { color: colors.textMuted }]}>/bulan</Text>
                </View>
                <Text style={[styles.pricingDescription, { color: colors.textSecondary }]}>
                  Langganan bulanan, cancel kapan saja
                </Text>
              </TouchableOpacity>

              {/* Yearly Plan - Best Value */}
              <TouchableOpacity
                style={[
                  styles.pricingCard,
                  styles.pricingCardFeatured,
                  { backgroundColor: colors.primary + '10', borderColor: colors.primary }
                ]}
                onPress={onUpgrade}
              >
                <View style={[styles.bestValueBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.bestValueText}>HEMAT 40%</Text>
                </View>
                <View style={styles.pricingHeader}>
                  <Text style={[styles.pricingName, { color: colors.text }]}>Tahunan</Text>
                  <Ionicons name="trophy" size={20} color={colors.primary} />
                </View>
                <View style={styles.pricingPrice}>
                  <Text style={[styles.priceAmount, { color: colors.text }]}>Rp 349.000</Text>
                  <Text style={[styles.pricePeriod, { color: colors.textMuted }]}>/tahun</Text>
                </View>
                <Text style={[styles.pricingDescription, { color: colors.textSecondary }]}>
                  Hemat Rp 239.000 per tahun!
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Padding */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Fixed Bottom CTA */}
          <View style={[styles.bottomCTA, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
              onPress={onUpgrade}
            >
              <Ionicons name="diamond" size={20} color={colors.text} />
              <Text style={[styles.upgradeButtonText, { color: colors.text }]}>
                Mulai Premium Sekarang
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.maybeLaterButton} onPress={onClose}>
              <Text style={[styles.maybeLaterText, { color: colors.textMuted }]}>
                Nanti Saja
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.9,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header
  headerGradient: {
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  crownContainer: {
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    color: '#FFF',
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: Typography.fontFamily.regular,
  },
  // Trigger Banner
  triggerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  triggerText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  // Features
  featuresContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily.bold,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: Typography.fontFamily.semiBold,
  },
  featureDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  // Pricing
  pricingSection: {
    marginTop: Spacing.xl,
  },
  pricingTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily.bold,
  },
  pricingCard: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 2,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  pricingCardFeatured: {
    borderWidth: 2,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    right: Spacing.lg,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
  bestValueText: {
    color: '#FFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  pricingName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
  },
  pricingPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  priceAmount: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
  },
  pricePeriod: {
    fontSize: Typography.fontSize.sm,
    marginLeft: Spacing.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  pricingDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  // Bottom CTA
  bottomCTA: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    ...Shadows.md,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  upgradeButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
  },
  maybeLaterButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  maybeLaterText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
});
