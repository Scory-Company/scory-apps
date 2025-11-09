import { Colors, Spacing, Typography } from '@/constants/theme';
import {
  CategoryFilterChips,
  RecentlyAddedCard,
  SearchBar,
  SectionHeader,
  TopRatedCard,
  TrendingTopicCard,
  PersonalizationPrompt
} from '@/features/explore/components';
import { CardArticle } from '@/features/shared/CardArticle';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const colors = Colors.light;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const hasPersonalizationData = false;

  const categories = [
    'All',
    'Science',
    'Health',
    'Technology',
    'Business',
    'Finance',
    'Education',
    'Environment',
  ];

  const trendingTopics = [
    {
      id: 1,
      keyword: 'AI in Healthcare',
      count: '234 articles',
      icon: 'medical' as const,
      gradientColors: ['#667eea', '#764ba2'] as [string, string]
    },
    {
      id: 2,
      keyword: 'Climate Change',
      count: '189 articles',
      icon: 'leaf' as const,
      gradientColors: ['#f093fb', '#f5576c'] as [string, string]
    },
    {
      id: 3,
      keyword: 'Blockchain',
      count: '156 articles',
      icon: 'cube' as const,
      gradientColors: ['#4facfe', '#00f2fe'] as [string, string]
    },
    {
      id: 4,
      keyword: 'Mental Health',
      count: '142 articles',
      icon: 'heart' as const,
      gradientColors: ['#43e97b', '#38f9d7'] as [string, string]
    },
  ];

  const forYouData = [
    {
      id: 1,
      image: require('@/assets/images/dummy/news/education.png'),
      title: 'The Future of Artificial Intelligence in Medical Diagnosis',
      author: 'Dr. Sarah Johnson',
      category: 'Health',
      rating: 4.8,
      reads: '12k',
    },
    {
      id: 2,
      image: require('@/assets/images/dummy/news/blockchain.png'),
      title: 'Sustainable Energy Solutions for Developing Countries',
      author: 'Prof. Michael Chen',
      category: 'Environment',
      rating: 4.6,
      reads: '8.5k',
    },
    {
      id: 3,
      image: require('@/assets/images/dummy/news/mental-health.png'),
      title: 'Understanding Quantum Computing: A Beginner Guide',
      author: 'Dr. Emily Rodriguez',
      category: 'Technology',
      rating: 4.9,
      reads: '15k',
    },
  ];

  const recentlyAddedData = [
    {
      id: 1,
      image: require('@/assets/images/dummy/news/education.png'),
      title: 'Machine Learning in Finance',
      author: 'Alex Thompson',
      category: 'Finance',
      rating: 4.5,
      date: '2 days ago',
    },
    {
      id: 2,
      image: require('@/assets/images/dummy/news/blockchain.png'),
      title: 'Neuroplasticity and Learning',
      author: 'Dr. Lisa Wang',
      category: 'Education',
      rating: 4.7,
      date: '3 days ago',
    },
  ];

  const topRatedData = [
    {
      id: 1,
      title: 'The Impact of Social Media on Mental Health',
      author: 'Dr. James Wilson',
      rating: 4.9,
      category: 'Health',
    },
    {
      id: 2,
      title: 'Cryptocurrency and the Future of Finance',
      author: 'Sarah Martinez',
      rating: 4.8,
      category: 'Finance',
    },
    {
      id: 3,
      title: 'Renewable Energy Technologies',
      author: 'Prof. David Lee',
      rating: 4.8,
      category: 'Science',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Explore</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Discover new research & insights
        </Text>
      </View>

      {/* Search Bar - Fixed */}
      <View style={[styles.searchBarContainer, { backgroundColor: colors.background }]}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search journals, topics, authors..."
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Filter Chips */}
        <CategoryFilterChips
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Trending Topics */}
        <View style={styles.section}>
          <SectionHeader
            title="Trending Now"
            icon="flame"
            iconColor={colors.error}
            onViewAllPress={() => console.log('View all trending')}
          />

          <View style={styles.trendingGrid}>
            {trendingTopics.slice(0, 4).map((topic) => (
              <TrendingTopicCard
                key={topic.id}
                keyword={topic.keyword}
                count={topic.count}
                icon={topic.icon}
                gradientColors={topic.gradientColors}
                onPress={() => console.log('Trending topic pressed:', topic.keyword)}
              />
            ))}
          </View>
        </View>

        {/* For You Section - Conditional based on personalization */}
        {hasPersonalizationData ? (
          <View style={styles.section}>
            <SectionHeader
              title="For You"
              icon="sparkles"
              iconColor={colors.warning}
              onViewAllPress={() => console.log('View all for you')}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.forYouScrollContent}
            >
              {forYouData.map((item) => (
                <CardArticle
                  key={item.id}
                  image={item.image}
                  title={item.title}
                  author={item.author}
                  category={item.category}
                  rating={item.rating}
                  reads={item.reads}
                  onPress={() => console.log('For you card pressed:', item.title)}
                />
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.section}>
            <PersonalizationPrompt
              onSetupPress={() => console.log('Setup personalization')}
            />
          </View>
        )}

        {/* Top Rated This Week */}
        <View style={styles.section}>
          <SectionHeader
            title="Top Rated This Week"
            icon="trophy"
            iconColor={colors.warning}
            onViewAllPress={() => console.log('View all top rated')}
          />

          <View style={styles.topRatedList}>
            {topRatedData.map((item, index) => (
              <TopRatedCard
                key={item.id}
                rank={index + 1}
                title={item.title}
                author={item.author}
                category={item.category}
                rating={item.rating}
                onPress={() => console.log('Top rated card pressed:', item.title)}
              />
            ))}
          </View>
        </View>

        {/* Recently Added */}
        <View style={styles.section}>
          <SectionHeader
            title="Recently Added"
            icon="time"
            iconColor={colors.info}
            onViewAllPress={() => console.log('View all recently added')}
          />

          <View style={styles.recentlyAddedList}>
            {recentlyAddedData.map((item) => (
              <RecentlyAddedCard
                key={item.id}
                image={item.image}
                title={item.title}
                author={item.author}
                category={item.category}
                rating={item.rating}
                date={item.date}
                onPress={() => console.log('Recently added card pressed:', item.title)}
              />
            ))}
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
  },
  searchBarContainer: {
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  trendingGrid: {
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  forYouScrollContent: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xl,
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  topRatedList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  recentlyAddedList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
});
