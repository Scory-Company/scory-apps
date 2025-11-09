import { Colors, Spacing } from '@/constants/theme';
import {
  CategoryCard,
  HeroBanner,
  PersonalizationCard,
  SectionHeader
} from '@/features/home/components';
import { CardArticle } from '@/features/shared/CardArticle';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GreetingsCard } from '@/features/home/components/GreetingsCard';

const categories = [
  { id: 1, icon: require('@/assets/images/icon-categories/finance.png'), label: 'Finance' },
  { id: 2, icon: require('@/assets/images/icon-categories/health.png'), label: 'Health' },
  { id: 3, icon: require('@/assets/images/icon-categories/business.png'), label: 'Business' },
  { id: 4, icon: require('@/assets/images/icon-categories/science.png'), label: 'Science' },
  { id: 5, icon: require('@/assets/images/icon-categories/technology.png'), label: 'Technology' },
  { id: 6, icon: require('@/assets/images/icon-categories/education.png'), label: 'Education' },
  { id: 7, icon: require('@/assets/images/icon-categories/environment.png'), label: 'Environment' },
  { id: 8, icon: require('@/assets/images/icon-categories/social.png'), label: 'Social' },
];

const popularArticles = [
    {
      id: 1,
      image: require('@/assets/images/dummy/news/education.png'),
      title: 'The Future of Artificial Intelligence in Medical Diagnosis',
      author: 'Dr. Sarah Johnson',
      category: 'Health',
      rating: 4.8,
      badge: 'Trending',
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

export default function HomeScreen() {
  const colors = Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <GreetingsCard
          title={'Hello, Habdil🖐️'}
          subtitle={'What do you want to learn today?'}
          onPress={() => console.log('Notifications pressed')}
        />

        {/* Hero Banner - Large with Gradient */}
        <View style={styles.heroSection}>
          <HeroBanner
            title={'Discover Your Next\nResearch Journey'}
            subtitle="Transform complex journals into engaging learning"
            onPress={() => console.log('Hero banner pressed')}
          />
        </View>

        {/* Personalization Card */}
        <View style={styles.personalizationSection}>
          <PersonalizationCard onPress={() => console.log('Start personalization')} />
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>

          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                icon={category.icon}
                label={category.label}
                onPress={() => console.log(`${category.label} pressed`)}
              />
            ))}
          </View>
        </View>

        {/* Most Popular Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Most Popular"
            actionText="View All"
            onActionPress={() => console.log('View all popular')}
          />

          <View style={styles.popularScrollWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularScrollContent}
            >
              {popularArticles.map((article) => (
                <View key={article.id} style={styles.popularCardWrapper}>
                  {article.badge && (
                    <View style={[styles.bestSellerBadge, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.bestSellerText, { color: colors.text }]}>
                        {article.badge}
                      </Text>
                    </View>
                  )}
                  <CardArticle
                    image={article.image}
                    title={article.title}
                    author={article.author}
                    category={article.category}
                    rating={article.rating}
                    reads={article.reads}
                    onPress={() => console.log(`${article.title} pressed`)}
                  />
                </View>
              ))}
            </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 30,
  },
  heroSection: {
    marginBottom: Spacing.lg,
  },
  continueLearningSection: {
    marginBottom: Spacing.lg,
  },
  personalizationSection: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Popular Section Styles
  popularScrollWrapper: {
    marginHorizontal: -Spacing.lg,
  },
  popularScrollContent: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing['2xl'],
  },
  popularCardWrapper: {
    position: 'relative',
    width: 240,
  },
  bestSellerBadge: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  bestSellerText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
});
