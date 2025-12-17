import { Colors, Spacing, Typography } from '@/constants/theme';
import {
  LearningStatCard,
  WeeklyGoalCard,
  StudyCollectionCard,
  SectionHeader,
  AddInsightButton,
  AddNoteModal,
  SetWeeklyGoalModal,
  ViewAllPrompt,
  InsightCard,
} from '@/features/learn/components';
import { EmptyState, SkeletonCollectionCard, SkeletonListArticle, SkeletonWeeklyGoalCard } from '@/features/shared/components';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  weeklyGoal as weeklyGoalMock,
  learningStats as learningStatsMock,
} from '@/data/mock';
import { useUserInsights } from '@/hooks/useUserInsights';
import { useStudyCollections } from '@/hooks/useStudyCollections';
import { useGamificationStats } from '@/hooks/useGamificationStats';
import { useWeeklyGoal } from '@/hooks/useWeeklyGoal';
import { useTranslation } from 'react-i18next';

export default function LearnScreen() {
  const { t } = useTranslation();
  const colors = Colors.light;
  const router = useRouter();

  // Fetch user insights from API
  const {
    insights: allInsights,
    isLoading: isLoadingInsights,
    isRefreshing,
    error: insightsError,
    fetchInsights,
    refreshInsights,
    invalidateCache,
  } = useUserInsights();

  // Fetch study collections from API
  const {
    collections: studyCollections,
    isLoading: isLoadingCollections,
    isRefreshing: isRefreshingCollections,
    error: collectionsError,
    refetch: refetchCollections,
    refresh: refreshCollections,
  } = useStudyCollections();

  // Fetch gamification stats from API
  const {
    stats: gamificationStats,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLoading: isLoadingStats,
    isRefreshing: isRefreshingStats,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error: statsError,
    fetchStats,
    refreshStats,
    invalidateCache: invalidateStatsCache,
  } = useGamificationStats();

  // Fetch weekly goal from API
  const {
    goal: weeklyGoal,
    isLoading: isLoadingGoal,
    isRefreshing: isRefreshingGoal,
    error: goalError,
    fetchGoal,
    refreshGoal,
    updateGoal,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    invalidateCache: invalidateGoalCache,
  } = useWeeklyGoal();

  // Modal states
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Refresh data when screen comes into focus (uses cache if still valid)
  // Note: All fetch functions have built-in caching, so they won't refetch unnecessarily
  useFocusEffect(
    React.useCallback(() => {
      fetchInsights(); // Uses cache if age < 30s
      refetchCollections(); // Uses cache if still valid
      fetchStats(); // Uses cache if age < 30s
      fetchGoal(); // Uses cache if age < 60s
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Empty deps - only run on focus, rely on built-in caching
  );

  const learningStats = React.useMemo(() => {
    const statsData = gamificationStats
      ? [
          {
            id: '1',
            icon: 'flame' as const,
            value: gamificationStats.streak.current,
            label: t('learn.stats.dayStreak'),
          },
          {
            id: '2',
            icon: 'book' as const,
            value: gamificationStats.articlesRead.thisWeek,
            label: t('learn.stats.articlesRead'),
          },
          {
            id: '3',
            icon: 'time' as const,
            value: gamificationStats.readingTime.thisWeek,
            label: t('learn.stats.minutes'),
          },
        ]
      : learningStatsMock;

    return statsData.map((stat) => {
      let iconColor = colors.primary;
      let iconBackgroundColor = colors.primary + '20';

      if (stat.icon === 'book') {
        iconColor = colors.warning;
        iconBackgroundColor = '#FEF3E2';
      } else if (stat.icon === 'time') {
        iconColor = colors.info;
        iconBackgroundColor = '#E0F2FE';
      }

      return {
        ...stat,
        iconColor,
        iconBackgroundColor,
      };
    });
  }, [gamificationStats, colors]);

  const recentInsights = allInsights.slice(0, 3);

  const showBottomAddButton = allInsights.length <= 2;
  const showHeaderAddButton = allInsights.length > 2;
  const remainingInsightsCount = allInsights.length > 3 ? allInsights.length - 3 : 0;

  const showInsightsLoading = isLoadingInsights && allInsights.length === 0;
  const showCollectionsLoading = isLoadingCollections && studyCollections.length === 0;

  // Smart sorting for study collections:
  // Priority: In-Progress (1-99%) > Not Started (0%) > Completed (100%)
  const sortedCollections = React.useMemo(() => {
    return [...studyCollections].sort((a, b) => {
      const aCompleted = a.progress >= 100;
      const bCompleted = b.progress >= 100;
      const aInProgress = a.progress > 0 && a.progress < 100;
      const bInProgress = b.progress > 0 && b.progress < 100;
      const aNotStarted = a.progress === 0;
      const bNotStarted = b.progress === 0;

      // Priority 1: In-Progress collections first
      if (aInProgress && !bInProgress) return -1;
      if (!aInProgress && bInProgress) return 1;

      // Priority 2: Not Started over Completed
      if (aNotStarted && bCompleted) return -1;
      if (aCompleted && bNotStarted) return 1;

      // Priority 3: Completed goes to bottom
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;

      // Within same category: sort by progress (higher progress first for in-progress)
      if (aInProgress && bInProgress) {
        return b.progress - a.progress; // Higher progress first
      }

      // Keep original order for same priority
      return 0;
    });
  }, [studyCollections]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('learn.title')}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {t('learn.subtitle')}
          </Text>
        </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isRefreshingCollections || isRefreshingStats || isRefreshingGoal}
            onRefresh={() => {
              refreshInsights();
              refreshCollections();
              refreshStats();
              refreshGoal();
            }}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >

        {/* Learning Stats Cards */}
        <View style={styles.statsContainer}>
          {learningStats.map((stat) => (
            <LearningStatCard
              key={stat.id}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              iconColor={stat.iconColor}
              iconBackgroundColor={stat.iconBackgroundColor}
            />
          ))}
        </View>

        {/* Weekly Reading Goal */}
        <View style={styles.section}>
          <SectionHeader
            title={t('learn.weeklyGoal.title')}
            icon="flag"
            iconColor={colors.info}
            showViewAll={false}
          />

          {isLoadingGoal ? (
            <View style={{ paddingHorizontal: Spacing.lg }}>
              <SkeletonWeeklyGoalCard />
            </View>
          ) : goalError && !weeklyGoal ? (
            <EmptyState
              icon="alert-circle-outline"
              title={t('learn.weeklyGoal.unableToLoad')}
              message={goalError}
            />
          ) : weeklyGoal ? (
            <WeeklyGoalCard
              completed={weeklyGoal.completed}
              target={weeklyGoal.target}
              daysLeft={weeklyGoal.daysLeft}
              onContinuePress={() => {
                // Navigate to explore/articles
                router.push('/(tabs)/explore' as any);
              }}
              onSetGoalPress={() => {
                setShowGoalModal(true);
              }}
            />
          ) : (
            // No goal set yet - show empty state with call to action
            <WeeklyGoalCard
              completed={0}
              target={0}
              daysLeft={7}
              onSetGoalPress={() => {
                setShowGoalModal(true);
              }}
            />
          )}
        </View>

        {/* Study Collections */}
        <View style={styles.section}>
          <SectionHeader
            title={t('learn.collections.title')}
            icon="folder-open"
            iconColor={colors.warning}
            onViewAllPress={() => router.push('/collections' as any)}
          />

          {showCollectionsLoading ? (
            <View style={styles.collectionsContainer}>
              <SkeletonCollectionCard count={2} />
            </View>
          ) : collectionsError && sortedCollections.length === 0 ? (
            <EmptyState
              icon="alert-circle-outline"
              title={t('learn.collections.unableToLoad')}
              message={collectionsError}
            />
          ) : sortedCollections.length > 0 ? (
            <View style={styles.collectionsContainer}>
              {sortedCollections.slice(0, 3).map((collection) => (
                <StudyCollectionCard
                  key={collection.id}
                  title={collection.title}
                  category={collection.category}
                  articlesCount={collection.articlesCount}
                  progress={collection.progress}
                  icon={collection.icon as any}
                  color={collection.color}
                  onPress={() => router.push(`/collection/${collection.id}` as any)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="folder-open-outline"
              title={t('learn.collections.emptyTitle')}
              message={t('learn.collections.emptyMessage')}
            />
          )}
        </View>

        {/* Reading Notes & Insights */}
        <View style={styles.section}>
          <SectionHeader
            title={t('learn.insights.title')}
            icon="bulb"
            iconColor={colors.warning}
            showViewAll={false}
            showAddButton={showHeaderAddButton}
            onAddPress={() => setShowAddNoteModal(true)}
          />

          {showInsightsLoading ? (
            <View style={styles.insightsContainer}>
              <SkeletonListArticle count={2} />
            </View>
          ) : insightsError && allInsights.length === 0 ? (
            <>
              <EmptyState
                icon="alert-circle-outline"
                title={t('learn.insights.unableToLoad')}
                message={insightsError}
              />
              <AddInsightButton onPress={() => setShowAddNoteModal(true)} />
            </>
          ) : recentInsights.length > 0 ? (
            <>
              <View style={styles.insightsContainer}>
                {recentInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onPress={() => router.push(`/insight/${insight.id}` as any)}
                  />
                ))}
              </View>

              {/* Show ViewAllPrompt if there are more insights */}
              {remainingInsightsCount > 0 && (
                <ViewAllPrompt
                  count={remainingInsightsCount}
                  label={t('learn.insights.label')}
                  onPress={() => router.push('/insights' as any)}
                />
              )}

              {/* Show bottom add button only when insights <= 2 */}
              {showBottomAddButton && (
                <AddInsightButton onPress={() => setShowAddNoteModal(true)} />
              )}
            </>
          ) : (
            <>
              <EmptyState
                icon="bulb-outline"
                title={t('learn.insights.emptyTitle')}
                message={t('learn.insights.emptyMessage')}
              />
              <AddInsightButton onPress={() => setShowAddNoteModal(true)} />
            </>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Note Modal */}
      <AddNoteModal
        visible={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
        onNoteAdded={() => {
          invalidateCache();
          refreshInsights();
        }}
      />

      {/* Set Weekly Goal Modal */}
      <SetWeeklyGoalModal
        visible={showGoalModal}
        currentTarget={weeklyGoal?.target}
        onClose={() => setShowGoalModal(false)}
        onGoalSet={async (target) => {
          await updateGoal(target);
          invalidateStatsCache(); // Refresh stats after goal update
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  collectionsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  insightsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  loadingContainer: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
  },
});