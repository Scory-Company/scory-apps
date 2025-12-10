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
} from '@/features/article/components';
import { articlesApi, ArticleResponse, ReadingLevel, ArticleContent as ArticleContentType } from '@/services';
import { SkeletonArticleDetail, SimplifyLoadingModal } from '@/features/shared/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useResimplify } from '@/hooks/useResimplify';

export default function ArticleDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = Colors.light;

  // Article data state
  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reading level state
  const [selectedReadingLevel, setSelectedReadingLevel] = useState<ReadingLevel>(ReadingLevel.SIMPLE);

  // Reading progress state
  const [readingProgress, setReadingProgress] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  // Quiz availability state
  const [isQuizAvailable, setIsQuizAvailable] = useState<boolean>(true);

  // Re-simplify hook
  const { resimplify, resimplifyManual, isResimplifying, progress: resimplifyProgress, PremiumModal } = useResimplify();

  // Load user's preferred reading level from storage
  const loadPreferredReadingLevel = useCallback(async () => {
    try {
      const storedLevel = await AsyncStorage.getItem('preferredReadingLevel');
      console.log('🔍 [DEBUG] Loaded from AsyncStorage:', storedLevel || 'null (default: SIMPLE)');
      if (storedLevel && Object.values(ReadingLevel).includes(storedLevel as ReadingLevel)) {
        setSelectedReadingLevel(storedLevel as ReadingLevel);
        console.log('✅ [DEBUG] Reading level set to:', storedLevel);
      } else {
        console.log('⚠️ [DEBUG] Using default reading level: SIMPLE');
      }
    } catch (err) {
      console.error('❌ [DEBUG] Failed to load preferred reading level:', err);
    }
  }, []);

  // Re-load reading level preference when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPreferredReadingLevel();
    }, [loadPreferredReadingLevel])
  );

  const fetchArticle = useCallback(async () => {
    if (!slug) {
      console.log('[❌ FETCH] No slug provided');
      return;
    }

    setIsLoading(true);
    console.log('='.repeat(60));
    console.log('[📄 ARTICLE PAGE] Fetching article...');
    console.log('[📄 ARTICLE PAGE] Slug/ID parameter:', slug);
    console.log('='.repeat(60));

    try {
      // Try fetching by slug first
      let response;
      try {
        console.log('[🔍 ATTEMPT 1] Trying getBySlug...');
        response = await articlesApi.getBySlug(slug as string);
        console.log('[✅ SUCCESS] Article fetched by slug!');
        console.log('[✅ SUCCESS] Article data:', JSON.stringify({
          id: response.data?.data?.id,
          slug: response.data?.data?.slug,
          title: response.data?.data?.title,
          hasContents: !!response.data?.data?.contents,
          contentsCount: response.data?.data?.contents?.length,
        }, null, 2));
      } catch (slugError: any) {
        // If slug fails, try by ID (for simplified articles)
        console.log('[⚠️ ATTEMPT 1 FAILED] Slug fetch failed');
        console.log('[⚠️ ERROR] Status:', slugError.response?.status);
        console.log('[⚠️ ERROR] Message:', slugError.message);

        if (slugError.response?.status === 404) {
          console.log('[🔍 ATTEMPT 2] Trying getById...');
          response = await articlesApi.getById(slug as string);
          console.log('[✅ SUCCESS] Article fetched by ID!');
          console.log('[✅ SUCCESS] Article data:', JSON.stringify({
            id: response.data?.data?.id,
            slug: response.data?.data?.slug,
            title: response.data?.data?.title,
            hasContents: !!response.data?.data?.contents,
            contentsCount: response.data?.data?.contents?.length,
          }, null, 2));
        } else {
          throw slugError;
        }
      }

      if (response.data?.data) {
        console.log('[✅ FINAL] Setting article state');
        setArticle(response.data.data);
        setError(false);
      } else {
        console.log('[❌ FINAL] No data in response');
        setError(true);
      }
    } catch (err: any) {
      console.log('='.repeat(60));
      console.error('[❌ FETCH FAILED] Failed to fetch article!');
      console.error('[❌ FETCH FAILED] Error:', err);
      console.error('[❌ FETCH FAILED] Error message:', err.message);
      console.error('[❌ FETCH FAILED] Error response:', err.response?.data);
      console.error('[❌ FETCH FAILED] Error status:', err.response?.status);
      console.log('='.repeat(60));
      setError(true);
    } finally {
      setIsLoading(false);
      console.log('[📄 ARTICLE PAGE] Fetch complete');
      console.log('='.repeat(60));
    }
  }, [slug]);

  // Fetch article from API
  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug, fetchArticle]);

  // Get content for selected reading level with fallback
  const getDisplayContent = (): ArticleContentType | null => {
    if (!article?.contents || article.contents.length === 0) {
      console.log('🔍 [DEBUG] No contents available in article');
      return null;
    }

    console.log('🔍 [DEBUG] Selected Reading Level:', selectedReadingLevel);
    console.log('🔍 [DEBUG] Available Levels:', article.contents.map(c => c.readingLevel));

    // Try to find content for selected reading level
    const preferredContent = article.contents.find(
      (content) => content.readingLevel === selectedReadingLevel
    );
    if (preferredContent) {
      console.log('✅ [DEBUG] Using preferred level:', preferredContent.readingLevel);
      return preferredContent;
    }

    // Fallback priority: SIMPLE > STUDENT > ACADEMIC > EXPERT > First Available
    const fallbackOrder = [ReadingLevel.SIMPLE, ReadingLevel.STUDENT, ReadingLevel.ACADEMIC, ReadingLevel.EXPERT];

    for (const level of fallbackOrder) {
      const fallbackContent = article.contents.find(content => content.readingLevel === level);
      if (fallbackContent) {
        console.log(`⚠️ [DEBUG] Fallback to ${level} (${selectedReadingLevel} not found)`);
        return fallbackContent;
      }
    }

    // Last fallback: return first available content
    console.log('⚠️ [DEBUG] Using first available:', article.contents[0]?.readingLevel);
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

  const handleSaveNote = (note: string) => {
    console.log('Insight note saved:', note);
    // TODO: Save to storage/API
  };

  // Handle auto re-simplify
  const handleResimplify = useCallback(async () => {
    if (!article?.id) {
      console.error('[RESIMPLIFY] No article ID available');
      return;
    }

    console.log('[RESIMPLIFY] Starting auto re-simplify for level:', selectedReadingLevel);
    // Convert to string for API
    const success = await resimplify(article.id, selectedReadingLevel as string);

    if (success) {
      console.log('[RESIMPLIFY] Success! Reloading article...');
      // Reload article to get the new content
      await fetchArticle();
    }
  }, [article?.id, selectedReadingLevel, resimplify, fetchArticle]);

  // Handle manual re-simplify (requires premium)
  const handleManualResimplify = useCallback(async () => {
    if (!article?.id) {
      console.error('[MANUAL-RESIMPLIFY] No article ID available');
      return;
    }

    console.log('[MANUAL-RESIMPLIFY] User triggered manual re-simplify for level:', selectedReadingLevel);
    // Convert to string for API
    const success = await resimplifyManual(article.id, selectedReadingLevel as string);

    if (success) {
      console.log('[MANUAL-RESIMPLIFY] Success! Reloading article...');
      // Reload article to get the new content
      await fetchArticle();
    }
  }, [article?.id, selectedReadingLevel, resimplifyManual, fetchArticle]);

  // Auto-trigger resimplify when preferred reading level is not available
  useEffect(() => {
    // Only trigger if:
    // 1. Article is loaded
    // 2. Not already resimplifying
    // 3. Not loading article
    // 4. Preferred level is not available
    // 5. Article has at least some content (to avoid triggering on empty articles)
    if (
      article &&
      !isResimplifying &&
      !isLoading &&
      !isPreferredLevelAvailable &&
      article.contents &&
      article.contents.length > 0
    ) {
      console.log('[AUTO-RESIMPLIFY] Preferred level not available, auto-triggering resimplify...');
      console.log('[AUTO-RESIMPLIFY] Preferred:', selectedReadingLevel);
      console.log('[AUTO-RESIMPLIFY] Available:', article.contents.map(c => c.readingLevel));

      // Trigger resimplify automatically
      handleResimplify();
    }
  }, [article, isResimplifying, isLoading, isPreferredLevelAvailable, selectedReadingLevel, handleResimplify]);

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
          onBookmark={() => console.log('Bookmark')}
          onShare={() => console.log('Share')}
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
            reads={`${(article.viewCount / 1000).toFixed(1)}k`}
            readTime={`${article.readTimeMinutes} min read`}
          />

          {/* Source Links (PDF, DOI) - Only for external articles */}
          {article.isExternal && article.externalMetadata && (
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
                Re-simplify this article to match your preferred {selectedReadingLevel} reading level for better understanding.
              </Text>
              <TouchableOpacity
                style={[styles.resimplifyCardButton, { backgroundColor: colors.primary }]}
                onPress={handleManualResimplify}
              >
                <Ionicons name="refresh" size={18} color={colors.textwhite} />
                <Text style={[styles.resimplifyCardButtonText, { color: colors.textwhite }]}>
                  Re-simplify Now
                </Text>
                <View style={[styles.premiumBadge, { backgroundColor: colors.textwhite + '30' }]}>
                  <Text style={[styles.premiumBadgeText, { color: colors.textwhite }]}>PREMIUM</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Comprehension Section */}
          <ComprehensionSection
            articleSlug={article.slug}
            category={article.category.name}
            onQuizAvailabilityChange={setIsQuizAvailable}
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
    flex: 1,
    textAlign: 'center',
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
