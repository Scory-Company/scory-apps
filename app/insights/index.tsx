import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { InsightCard } from '@/features/learn/components';
import { EmptyState } from '@/features/shared/components';
import { useUserInsights } from '@/hooks/useUserInsights';
import { useTranslation } from 'react-i18next';

export default function AllInsightsScreen() {
  const { t } = useTranslation();
  const colors = Colors.light;
  const router = useRouter();

  // Fetch user insights from API
  const {
    insights: allInsights,
    isLoading: isLoadingInsights,
    isRefreshing,
    error: insightsError,
    refreshInsights,
    invalidateCache,
  } = useUserInsights();

  // Filter state
  const [filterType, setFilterType] = useState<'all' | 'article' | 'standalone'>('all');

  // Refresh insights when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      invalidateCache();
      refreshInsights();
    }, [invalidateCache, refreshInsights])
  );

  // Filter insights based on type
  const filteredInsights = allInsights.filter((insight) => {
    if (filterType === 'article') return insight.articleId !== null;
    if (filterType === 'standalone') return insight.articleId === null;
    return true; // 'all'
  });

  const articleNotesCount = allInsights.filter((i) => i.articleId !== null).length;
  const standaloneNotesCount = allInsights.filter((i) => i.articleId === null).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('allInsights.title')}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {t('allInsights.total', {
              count: allInsights.length,
              label: allInsights.length === 1 ? t('allInsights.note') : t('allInsights.note_plural')
            })}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterType === 'all' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setFilterType('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              { color: filterType === 'all' ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {t('allInsights.filters.all')} ({allInsights.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filterType === 'article' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setFilterType('article')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              { color: filterType === 'article' ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {t('allInsights.filters.article')} ({articleNotesCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filterType === 'standalone' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setFilterType('standalone')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              { color: filterType === 'standalone' ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {t('allInsights.filters.personal')} ({standaloneNotesCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshInsights}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {isLoadingInsights ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t('allInsights.loading')}
            </Text>
          </View>
        ) : insightsError ? (
          <EmptyState
            icon="alert-circle-outline"
            title={t('allInsights.errors.unableToLoad')}
            message={insightsError}
            actionLabel={t('allInsights.errors.tryAgain')}
            onActionPress={refreshInsights}
          />
        ) : filteredInsights.length > 0 ? (
          <View style={styles.insightsContainer}>
            {filteredInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onPress={() => router.push(`/insight/${insight.id}` as any)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="document-text-outline"
            title={
              filterType === 'article'
                ? t('allInsights.emptyStates.noArticleNotes')
                : filterType === 'standalone'
                ? t('allInsights.emptyStates.noPersonalNotes')
                : t('allInsights.emptyStates.noNotes')
            }
            message={
              filterType === 'article'
                ? t('allInsights.emptyStates.noArticleNotesMessage')
                : filterType === 'standalone'
                ? t('allInsights.emptyStates.noPersonalNotesMessage')
                : t('allInsights.emptyStates.noNotesMessage')
            }
            actionLabel={t('allInsights.emptyStates.goBack')}
            onActionPress={() => router.back()}
          />
        )}

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
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
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  insightsContainer: {
    gap: Spacing.md,
  },
  loadingContainer: {
    paddingVertical: Spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
  },
});
