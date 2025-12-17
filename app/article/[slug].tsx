import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, NativeScrollEvent, NativeSyntheticEvent, LayoutChangeEvent, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArticleHero,
  ArticleMetadata,
  ArticleContent,
  RelatedArticles,
  ReadingProgressBar,
  InsightNoteFAB,
  ComprehensionSection,
  SourceLinks,
  ArticleFeedbackModal,
  ArticleQuickFeedback,
  FeedbackPromptCard,
} from '@/features/article/components';
import { articlesApi, ArticleResponse, ReadingLevel, ArticleContent as ArticleContentType } from '@/services';
import { SkeletonArticleDetail } from '@/features/shared/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useResimplify } from '@/hooks/useResimplify';
import { collectionService } from '@/services/collectionService';
import { useToast } from '@/features/shared/hooks/useToast';
import * as BookmarkCache from '@/utils/bookmarkCache';
import { useGamificationStats } from '@/hooks/useGamificationStats';
import { useWeeklyGoal } from '@/hooks/useWeeklyGoal';
import { invalidateForYouCache } from '@/hooks/useForYouArticles';
import type { GamificationResult } from '@/types/gamification';
import { useArticleFeedback } from '@/features/article/hooks/useArticleFeedback';
import { useExitIntent } from '@/features/article/hooks/useExitIntent';

export default function ArticleDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = Colors.light;

  // Article data state
  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reading level state
  const [selectedReadingLevel, setSelectedReadingLevel] = useState<ReadingLevel>(ReadingLevel.SIMPLE);
  const [isReadingLevelLoaded, setIsReadingLevelLoaded] = useState(false);

  // Reading progress state
  const [readingProgress, setReadingProgress] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [contentHeight, setContentHeight] = useState(0);

  // Quiz availability state
  const [isQuizAvailable, setIsQuizAvailable] = useState<boolean>(true);

  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Reading time tracking (for gamification)
  const [readingStartTime] = useState<number>(Date.now());

  // Toast hook
  const toast = useToast();

  // Track if we've already attempted auto-resimplify for this article+level combo
  // This prevents infinite loops when backend doesn't actually create the content
  const autoResimplifyAttempted = React.useRef<string | null>(null);

  // Re-simplify hook with error handling via toast
  const { resimplify, resimplifyManual, isResimplifying, progress: resimplifyProgress, PremiumModal } = useResimplify({
    onError: (message) => toast.error(message),
    onSuccess: (message) => toast.success(message),
  });

  // Gamification hooks (for cache invalidation)
  const { invalidateCache: invalidateStatsCache } = useGamificationStats();
  const { invalidateCache: invalidateGoalCache } = useWeeklyGoal();

  // Reading time tracking state (for feedback)
  const [currentReadingTime, setCurrentReadingTime] = useState(0);

  // Track reading time
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - readingStartTime) / 1000);
      setCurrentReadingTime(elapsedSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [readingStartTime]);

  // Article feedback hook
  const {
    showFeedbackModal,
    showQuickFeedback,
    feedbackTrigger,
    hasFeedback,
    triggerFeedbackAfterQuiz,
    triggerQuickFeedback,
    triggerManualFeedback,
    handleFeedbackSubmit,
    handleQuickFeedbackSubmit,
    closeFeedbackModal,
    closeQuickFeedback,
  } = useArticleFeedback({
    articleId: article?.id || '',
    readingTime: currentReadingTime,
  });

  // Exit intent hook (for quick feedback on back button)
  const { allowNavigation } = useExitIntent({
    enabled: !showFeedbackModal && !showQuickFeedback,
    onExitIntent: triggerQuickFeedback,
  });

  // Handle gamification result from quiz completion
  const handleGamificationResult = useCallback((result: GamificationResult) => {

    // Invalidate all gamification caches to refresh stats and For You feed
    invalidateStatsCache();
    invalidateGoalCache();
    invalidateForYouCache(); // This will auto-refresh For You with new random articles!

    // Show appropriate feedback based on completion type and streak
    if (result.completionType === 'verified' && result.streakUpdated && result.newStreak) {
      // Streak celebration 🔥
      toast.success(`🔥 ${result.newStreak} day streak!`, 2000);
    } else if (result.completionType === 'verified') {
      // Completed but streak didn't update (already completed today)
      toast.success('Article completed!', 1500);
    } else if (result.completionType === 'basic') {
      // Too fast - didn't meet verification criteria
      toast.warning('⚡ Read carefully to earn streak points!', 2500);
    } else if (result.completionType === 'rejected') {
      // Rejected (shouldn't happen in normal flow)
      toast.info('Complete the article to track progress', 2000);
    }

    // Show weekly goal progress if available
    if (result.weeklyGoalProgress) {
      const { completed, target } = result.weeklyGoalProgress;
      if (completed === target) {
        // Goal achieved! 🎉
        setTimeout(() => {
          toast.success(`🎯 Weekly goal achieved! ${completed}/${target} articles`, 3000);
        }, 500);
      }
    }

    // Trigger feedback modal after quiz completion
    triggerFeedbackAfterQuiz();
  }, [invalidateStatsCache, invalidateGoalCache, toast, triggerFeedbackAfterQuiz]);

  // Load user's preferred reading level from storage
  const loadPreferredReadingLevel = useCallback(async () => {
    try {
      const storedLevel = await AsyncStorage.getItem('preferredReadingLevel');
      if (storedLevel && Object.values(ReadingLevel).includes(storedLevel as ReadingLevel)) {
        setSelectedReadingLevel(storedLevel as ReadingLevel);
      }
    } catch (err) {
      console.error('Failed to load preferred reading level:', err);
    } finally {
      // Mark as loaded even if there's an error (use default SIMPLE)
      setIsReadingLevelLoaded(true);
    }
  }, []);

  // Re-load reading level preference when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPreferredReadingLevel();
    }, [loadPreferredReadingLevel])
  );

  const fetchArticle = useCallback(async () => {
    if (!slug) return;

    setIsLoading(true);

    try {
      let response;
      try {
        response = await articlesApi.getBySlug(slug as string);
      } catch (slugError: any) {
        // If slug fails, try by ID (for simplified articles)
        if (slugError.response?.status === 404) {
          response = await articlesApi.getById(slug as string);
        } else {
          throw slugError;
        }
      }

      if (response.data?.data) {
        setArticle(response.data.data);
        setError(false);
      } else {
        setError(true);
      }
    } catch (err: any) {
      console.error('Failed to fetch article:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  // Load preferred reading level on mount (before fetching article)
  useEffect(() => {
    loadPreferredReadingLevel();
  }, [loadPreferredReadingLevel]);

  // Fetch article from API
  useEffect(() => {
    if (slug) {
      // Reset auto-resimplify flag when navigating to a new article
      autoResimplifyAttempted.current = null;
      fetchArticle();
    }
  }, [slug, fetchArticle]);

  // Check bookmark status from cache when article loads
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (article?.id) {
        const cached = await BookmarkCache.isArticleBookmarked(article.id);
        setIsBookmarked(cached);
      }
    };

    checkBookmarkStatus();
  }, [article?.id]);

  // Get content for selected reading level with fallback
  const getDisplayContent = (): ArticleContentType | null => {
    if (!article?.contents || article.contents.length === 0) {
      return null;
    }

    // Try to find content for selected reading level
    const preferredContent = article.contents.find(
      (content) => content.readingLevel === selectedReadingLevel
    );
    if (preferredContent) {
      return preferredContent;
    }

    // Fallback priority: SIMPLE > STUDENT > ACADEMIC > EXPERT > First Available
    const fallbackOrder = [ReadingLevel.SIMPLE, ReadingLevel.STUDENT, ReadingLevel.ACADEMIC, ReadingLevel.EXPERT];

    for (const level of fallbackOrder) {
      const fallbackContent = article.contents.find(content => content.readingLevel === level);
      if (fallbackContent) {
        return fallbackContent;
      }
    }

    // Last fallback: return first available content
    return article.contents[0] || null;
  };

  const displayContent = getDisplayContent();

  // Check if preferred reading level is available
  const isPreferredLevelAvailable = article?.contents?.some(
    (content) => content.readingLevel === selectedReadingLevel
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      const scrollableHeight = contentSize.height - layoutMeasurement.height;
      if (scrollableHeight > 0) {
        const progress = contentOffset.y / scrollableHeight;
        setReadingProgress(Math.min(Math.max(progress, 0), 1));
      }
    },
    []
  );

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  }, []);

  const handleSaveNote = () => {
    // TODO: Save to storage/API
  };

  // Handle bookmark toggle with optimistic updates
  const handleBookmark = useCallback(async () => {
    if (!article?.id || isBookmarking) return;

    // Store original state for rollback
    const previousState = isBookmarked;

    // OPTIMISTIC UPDATE: Update UI immediately
    setIsBookmarked(!isBookmarked);
    setIsBookmarking(true);

    try {
      if (previousState) {
        // Un-bookmark
        await BookmarkCache.removeFromBookmarkCache(article.id);
        const result = await collectionService.unbookmarkArticle(article.id);

        // Show feedback
        if (result.collection.wasDeleted) {
          toast.success('Bookmark removed and collection deleted', 2000);
        } else {
          toast.success('Bookmark removed', 2000);
        }
      } else {
        // Bookmark
        await BookmarkCache.addToBookmarkCache(article.id);
        const result = await collectionService.bookmarkArticle(article.id);

        // Show feedback
        if (result.collection.isNew) {
          toast.success(`Added to new "${result.collection.category}" collection!`, 2500);
        } else {
          toast.success(`Added to "${result.collection.category}"`, 2000);
        }
      }
    } catch (err: any) {
      console.error('Bookmark error:', err);

      // ROLLBACK: Revert UI on error
      setIsBookmarked(previousState);

      // Rollback cache
      if (previousState) {
        await BookmarkCache.addToBookmarkCache(article.id);
      } else {
        await BookmarkCache.removeFromBookmarkCache(article.id);
      }

      // Handle specific errors
      if (err.message.includes('already bookmarked')) {
        toast.warning('Already in your collection', 2000);
        setIsBookmarked(true);
        await BookmarkCache.addToBookmarkCache(article.id);
      } else if (err.message.includes('Unauthorized')) {
        toast.error('Please login to bookmark', 2500);
      } else {
        toast.error(err.message || 'Failed to update bookmark', 2500);
      }
    } finally {
      setIsBookmarking(false);
    }
  }, [article?.id, isBookmarked, isBookmarking, toast]);

  // Handle auto re-simplify
  const handleResimplify = useCallback(async () => {
    if (!article?.id) return;

    // Convert to string for API
    const success = await resimplify(article.id, selectedReadingLevel as string);

    if (success) {
      // ✅ OPTIMIZED: Directly fetch article instead of router.replace
      // This is faster because backend already cached the result
      await fetchArticle();
    }
  }, [article?.id, selectedReadingLevel, resimplify, fetchArticle]);

  // Handle manual re-simplify (requires premium)
  const handleManualResimplify = useCallback(async () => {
    if (!article?.id) return;

    // Mark that we're attempting resimplify for this combo (prevent auto-trigger after manual)
    const attemptKey = `${article.id}-${selectedReadingLevel}`;
    autoResimplifyAttempted.current = attemptKey;

    // Convert to string for API
    const success = await resimplifyManual(article.id, selectedReadingLevel as string);

    if (success) {
      // ✅ OPTIMIZED: Directly fetch article instead of router.replace
      // This is faster because backend already cached the result
      await fetchArticle();
    }
  }, [article?.id, selectedReadingLevel, resimplifyManual, fetchArticle]);

  // Auto-trigger resimplify when preferred reading level is not available
  useEffect(() => {
    // Create a unique key for this article + reading level combination
    const attemptKey = `${article?.id}-${selectedReadingLevel}`;
    
    // Only trigger if:
    // 1. Article is loaded
    // 2. Not already resimplifying
    // 3. Not loading article
    // 4. Preferred level is not available
    // 5. Article has at least some content (to avoid triggering on empty articles)
    // 6. We haven't already attempted resimplify for this article+level combo
    // 7. Reading level has been loaded from storage (IMPORTANT!)
    if (
      article &&
      !isResimplifying &&
      !isLoading &&
      !isPreferredLevelAvailable &&
      article.contents &&
      article.contents.length > 0 &&
      autoResimplifyAttempted.current !== attemptKey &&
      isReadingLevelLoaded  // ✅ WAIT for reading level to be loaded!
    ) {
      // Mark that we've attempted resimplify for this combo
      autoResimplifyAttempted.current = attemptKey;
      
      // Trigger resimplify automatically
      console.log('[ArticleDetail] Auto-triggering resimplify for:', attemptKey);
      handleResimplify();
    }
  }, [article, isResimplifying, isLoading, isPreferredLevelAvailable, selectedReadingLevel, isReadingLevelLoaded, handleResimplify]);

  // Loading state with skeleton
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <SkeletonArticleDetail />
        </ScrollView>
      </View>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Article Not Found</Text>
          <Text style={[styles.errorSubtitle, { color: colors.textMuted }]}>
            The article you&apos;re looking for doesn&apos;t exist.
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Reading Progress Bar */}
      <ReadingProgressBar progress={readingProgress} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={(_, height) => setContentHeight(height)}
      >
        {/* Hero Image with Header */}
        <ArticleHero
          image={{ uri: article.imageUrl || 'https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?w=600' }}
          onBookmark={handleBookmark}
          onShare={() => {/* TODO: Implement share */}}
          isBookmarked={isBookmarked}
          isBookmarking={isBookmarking}
        />

        {/* Content Container */}
        <View
          style={[styles.contentContainer, { backgroundColor: colors.background }]}
          onLayout={handleContentLayout}
        >
          {/* Article Metadata */}
          <ArticleMetadata
            category={article.category.name}
            title={article.title}
            author={article.authorName}
            rating={article.rating}
            reads={
              article.viewCount >= 1000
                ? `${(article.viewCount / 1000).toFixed(1)}k reads`
                : `${article.viewCount || 0} reads`
            }
            readTime={`${article.readTimeMinutes || 5} min read`}
          />

          {/* Source Links (PDF, DOI) - Show if external metadata exists */}
          {article.externalMetadata && (
            <SourceLinks externalMetadata={article.externalMetadata} />
          )}

          {/* Auto Re-simplifying Loading Banner */}
          {isResimplifying && (
            <View style={[styles.levelMismatchBanner, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
              <View style={styles.bannerContent}>
                <ActivityIndicator size="small" color={colors.primary} />
                <View style={styles.bannerTextContainer}>
                  <Text style={[styles.bannerTitle, { color: colors.text }]}>
                    {resimplifyProgress.message}
                  </Text>
                  <Text style={[styles.bannerSubtitle, { color: colors.textMuted }]}>
                    This may take 20-30 seconds...
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Article Content */}
          {displayContent && displayContent.blocks.length > 0 ? (
            <ArticleContent blocks={displayContent.blocks} />
          ) : (
            <Text style={[styles.noContentText, { color: colors.textMuted }]}>
              No content available for this reading level.
            </Text>
          )}

          {/* Manual Re-simplify Card - After Content (Only show if quiz not available) */}
          {!isResimplifying && displayContent && !isQuizAvailable && (
            <View style={[styles.resimplifyCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
              <View style={styles.resimplifyCardHeader}>
                <Ionicons name="sparkles" size={24} color={colors.primary} />
                <Text style={[styles.resimplifyCardTitle, { color: colors.text }]}>
                  Want a different perspective?
                </Text>
              </View>
              <Text style={[styles.resimplifyCardDescription, { color: colors.textMuted }]}>
                Re-simplify this article to match your preferred {selectedReadingLevel.charAt(0) + selectedReadingLevel.slice(1).toLowerCase()} reading level for better understanding.
              </Text>
              <TouchableOpacity
                style={[styles.resimplifyCardButton, { backgroundColor: colors.primary }]}
                onPress={handleManualResimplify}
              >
                <Ionicons name="refresh" size={18} color={colors.textwhite} />
                <Text style={[styles.resimplifyCardButtonText, { color: colors.textwhite }]}>
                  Re-simplify Now
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Comprehension Section */}
          <ComprehensionSection
            articleSlug={article.slug}
            category={article.category.name}
            readingLevel={selectedReadingLevel}
            onQuizAvailabilityChange={setIsQuizAvailable}
            readingStartTime={readingStartTime}
            onGamificationResult={handleGamificationResult}
          />

          {/* Feedback Prompt Card */}
          <FeedbackPromptCard
            onPress={triggerManualFeedback}
            visible={!hasFeedback}
          />

          {/* Related Articles - TODO: Fetch from API */}
          <RelatedArticles articles={[]} category={article.category.name} />

          {/* Bottom Padding for FAB */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Floating Action Button for Insight Notes */}
      <InsightNoteFAB
        articleSlug={article.slug}
        articleTitle={article.title}
        onSaveNote={handleSaveNote}
      />

      {/* Premium Upgrade Modal */}
      <PremiumModal />

      {/* Article Feedback Modal (after quiz completion) */}
      <ArticleFeedbackModal
        visible={showFeedbackModal}
        onClose={closeFeedbackModal}
        onSubmit={handleFeedbackSubmit}
        trigger={feedbackTrigger || 'quiz_completion'}
      />

      {/* Quick Feedback (on exit intent) */}
      <ArticleQuickFeedback
        visible={showQuickFeedback}
        onClose={() => {
          closeQuickFeedback();
          allowNavigation();
        }}
        onSubmit={handleQuickFeedbackSubmit}
      />

      {/* Toast Notifications */}
      <toast.ToastComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    marginTop: -20,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  noContentText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    marginVertical: Spacing.xl,
    fontStyle: 'italic',
  },
  // Reading Level Mismatch Banner
  levelMismatchBanner: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bannerTextContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  bannerTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: Typography.fontSize.xs,
  },
  resimplifyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  resimplifyButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  // Debug Badge (only in dev mode)
  debugBadge: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  debugText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorSubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  backButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  // Re-simplify Card (after content)
  resimplifyCard: {
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resimplifyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  resimplifyCardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
  },
  resimplifyCardDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  resimplifyCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  resimplifyCardButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semiBold,
  },
  premiumBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  premiumBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
