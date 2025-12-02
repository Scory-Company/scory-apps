import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, NativeScrollEvent, NativeSyntheticEvent, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArticleHero,
  ArticleMetadata,
  ArticleContent,
  RelatedArticles,
  ReadingProgressBar,
  InsightNoteFAB,
  ComprehensionSection,
} from '@/features/article/components';
import { articlesApi, ArticleResponse, ReadingLevel, ArticleContent as ArticleContentType } from '@/services';
import { SkeletonArticleDetail } from '@/features/shared/components';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    if (!slug) return;

    setIsLoading(true);
    console.log('Fetching article with slug:', slug);
    try {
      const response = await articlesApi.getBySlug(slug as string);
      console.log('Article API Response:', response.data);
      if (response.data?.data) {
        setArticle(response.data.data);
        setError(false);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to fetch article:', err);
      setError(true);
    } finally {
      setIsLoading(false);
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

  const handleSaveReflection = (reflection: string) => {
    console.log('Reflection saved:', reflection);
    // TODO: Save to storage/API
  };

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

          {/* Comprehension Section */}
          <ComprehensionSection
            category={article.category.name}
            onSaveReflection={handleSaveReflection}
          />

          {/* Related Articles - TODO: Fetch from API */}
          <RelatedArticles articles={[]} category={article.category.name} />

          {/* Bottom Padding for FAB */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Floating Action Button for Insight Notes */}
      <InsightNoteFAB articleTitle={article.title} onSaveNote={handleSaveNote} />
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
});
