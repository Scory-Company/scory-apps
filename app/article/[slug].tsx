import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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
} from '@/features/article/components';
import { articlesApi, ArticleResponse } from '@/services';

export default function ArticleDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = Colors.light;

  // Article data state
  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reading progress state
  const [readingProgress, setReadingProgress] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  // Fetch article from API
  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
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
  };

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

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.errorSubtitle, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
            Loading article...
          </Text>
        </View>
      </SafeAreaView>
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
            onPress={() => router.back()}
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
          <ArticleContent category={article.category.name} />

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
