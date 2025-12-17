import { Colors, Spacing, Typography } from '@/constants/theme';
import { CollectionHeader, SectionHeader } from '@/features/learn/components';
import { EmptyState } from '@/features/shared/components';
import { useCollectionDetail } from '@/hooks/useCollectionDetail';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function CollectionDetailScreen() {
  const { t } = useTranslation();
  const colors = Colors.light;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    collection,
    articles,
    isLoading,
    isRefreshing,
    error,
    refresh,
    markAsRead,
    unbookmarkArticle,
  } = useCollectionDetail(id || '');

  // Handle unbookmark with confirmation
  const handleUnbookmark = (articleId: string, articleTitle: string) => {
    Alert.alert(
      t('collectionDetail.confirm.removeTitle'),
      t('collectionDetail.confirm.removeMessage', { title: articleTitle }),
      [
        {
          text: t('collectionDetail.confirm.cancel'),
          style: 'cancel',
        },
        {
          text: t('collectionDetail.confirm.remove'),
          style: 'destructive',
          onPress: async () => {
            await unbookmarkArticle(articleId);

            // If no articles left, navigate back
            if (articles.length <= 1) {
              router.back();
            }
          },
        },
      ]
    );
  };

  // Handle article press - navigate to article detail
  const handleArticlePress = async (articleSlug: string, articleId: string) => {
    // Mark as read (optimistic update)
    if (collection) {
      await markAsRead(articleId);
    }

    // Navigate to article detail
    router.push(`/article/${articleSlug}` as any);
  };

  // Loading state
  if (isLoading && !collection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('collectionDetail.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !collection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('collectionDetail.title')}</Text>
        </View>

        <View style={styles.errorContainer}>
          <EmptyState
            icon="alert-circle-outline"
            title={t('collectionDetail.errors.unableToLoad')}
            message={error}
          />
        </View>
      </SafeAreaView>
    );
  }

  // No collection found (shouldn't happen, but just in case)
  if (!collection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('collectionDetail.title')}</Text>
        </View>

        <View style={styles.errorContainer}>
          <EmptyState
            icon="folder-open-outline"
            title={t('collectionDetail.errors.notFound')}
            message={t('collectionDetail.errors.notFoundMessage')}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Separate read and unread articles
  const unreadArticles = articles.filter((article) => !article.isRead);
  const readArticles = articles.filter((article) => article.isRead);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('collectionDetail.title')}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Collection Header */}
        <View style={styles.section}>
          <CollectionHeader
            title={collection.title}
            category={collection.category}
            icon={collection.icon as any}
            color={collection.color}
            articlesCount={collection.articlesCount}
            progress={collection.progress}
          />
        </View>

        {/* Articles List */}
        {articles.length > 0 ? (
          <>
            {/* Unread Articles Section */}
            {unreadArticles.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title={t('collectionDetail.sections.toRead', { count: unreadArticles.length })}
                  icon="book-outline"
                  iconColor={colors.primary}
                  showViewAll={false}
                />

                <View style={styles.articlesContainer}>
                  {unreadArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onPress={() => handleArticlePress(article.slug, article.id)}
                      onUnbookmark={() => handleUnbookmark(article.id, article.title)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Read Articles Section */}
            {readArticles.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title={t('collectionDetail.sections.completed', { count: readArticles.length })}
                  icon="checkmark-circle-outline"
                  iconColor={colors.success}
                  showViewAll={false}
                />

                <View style={styles.articlesContainer}>
                  {readArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      isRead
                      onPress={() => handleArticlePress(article.slug, article.id)}
                      onUnbookmark={() => handleUnbookmark(article.id, article.title)}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.section}>
            <EmptyState
              icon="folder-open-outline"
              title={t('collectionDetail.emptyState.title')}
              message={t('collectionDetail.emptyState.message')}
            />
          </View>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Article Card Component
interface ArticleCardProps {
  article: any;
  isRead?: boolean;
  onPress: () => void;
  onUnbookmark: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, isRead = false, onPress, onUnbookmark }) => {
  const { t } = useTranslation();
  const colors = Colors.light;

  return (
    <View style={[styles.articleCard, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={styles.articleCardContent}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Article Image */}
        <Image
          source={{ uri: article.imageUrl }}
          style={[styles.articleImage, isRead && styles.articleImageRead]}
        />

        {/* Article Info */}
        <View style={styles.articleInfo}>
          {/* Read Badge */}
          {isRead && (
            <View style={[styles.readBadge, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={12} color={colors.success} />
              <Text style={[styles.readBadgeText, { color: colors.success }]}>{t('collectionDetail.articleCard.read')}</Text>
            </View>
          )}

          {/* Title */}
          <Text
            style={[styles.articleTitle, { color: colors.text }, isRead && styles.articleTitleRead]}
            numberOfLines={2}
          >
            {article.title}
          </Text>

          {/* Author */}
          <Text style={[styles.articleAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
            {article.authorName}
          </Text>

          {/* Stats */}
          <View style={styles.articleStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {article.rating.toFixed(1)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {article.viewCount}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {article.readTimeMinutes} {t('collectionDetail.articleCard.min')}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Unbookmark Button */}
      <TouchableOpacity
        style={styles.unbookmarkButton}
        onPress={onUnbookmark}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="bookmark" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
  },
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
  },
  errorContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  articlesContainer: {
    gap: Spacing.md,
  },
  articleCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleCardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  articleImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  articleImageRead: {
    opacity: 0.6,
  },
  articleInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  readBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  articleTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    lineHeight: 18,
  },
  articleTitleRead: {
    opacity: 0.7,
  },
  articleAuthor: {
    fontSize: Typography.fontSize.xs,
  },
  articleStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: Typography.fontSize.xs,
  },
  unbookmarkButton: {
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
