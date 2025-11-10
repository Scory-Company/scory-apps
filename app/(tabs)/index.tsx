import { Colors, Spacing } from '@/constants/theme';
import {
  CategoryCard,
  HeroBanner,
  PersonalizationCard,
  SectionHeader
} from '@/features/home/components';
import { CardArticle } from '@/features/shared/components/CardArticle';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GreetingsCard } from '@/features/home/components/GreetingsCard';
import { categoryCards, popularArticles } from '@/data/mock';

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
            {categoryCards.map((category) => (
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
