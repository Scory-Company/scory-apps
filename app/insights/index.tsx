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

export default function AllInsightsScreen() {
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
      console.log('[ALL_INSIGHTS] Screen focused - refreshing insights');
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>All Notes</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {allInsights.length} {allInsights.length === 1 ? 'note' : 'notes'} total
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
            All ({allInsights.length})
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
            Article ({articleNotesCount})
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
            Personal ({standaloneNotesCount})
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
              Loading your notes...
            </Text>
          </View>
        ) : insightsError ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Unable to Load Notes"
            message={insightsError}
            actionLabel="Try Again"
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
                ? 'No Article Notes'
                : filterType === 'standalone'
                ? 'No Personal Notes'
                : 'No Notes Yet'
            }
            message={
              filterType === 'article'
                ? 'Start taking notes while reading articles'
                : filterType === 'standalone'
                ? 'Create personal notes to capture your thoughts'
                : 'Start capturing your insights and ideas'
            }
            actionLabel="Go Back"
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
