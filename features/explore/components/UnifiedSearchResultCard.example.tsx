/**
 * Example Usage of UnifiedSearchResultCard
 *
 * This file demonstrates how to use the UnifiedSearchResultCard component
 * with different types of search results.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { UnifiedSearchResultCard, UnifiedSearchResult } from './UnifiedSearchResultCard';
import { router } from 'expo-router';

export function UnifiedSearchResultCardExample() {
  // Example 1: Internal article (from database)
  const internalArticle: UnifiedSearchResult = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Understanding Machine Learning in Healthcare',
    excerpt: 'A comprehensive guide to applying ML techniques in medical diagnosis...',
    authors: ['Dr. Sarah Johnson', 'Prof. Michael Chen'],
    year: 2024,
    source: 'internal',
    type: 'article',
    image: require('@/assets/images/article-placeholder.png'),
    category: 'Technology',
    rating: 4.5,
    reads: '12.5k reads',
    metadata: {
      isSimplified: false,
      isExternal: false,
    },
  };

  // Example 2: OpenAlex paper (not simplified yet)
  const openAlexPaper: UnifiedSearchResult = {
    id: 'https://openalex.org/W2741809807',
    title: 'Deep Learning for Computer Vision: A Survey',
    excerpt: 'We present a comprehensive survey of deep learning methods...',
    authors: ['Alice Johnson', 'Bob Williams', 'Carol Davis'],
    year: 2023,
    source: 'openalex',
    type: 'journal-article',
    pdfUrl: 'https://arxiv.org/pdf/1234.5678.pdf',
    doi: '10.1234/example',
    citations: 150,
    isOpenAccess: true,
    publisher: 'Nature',
    journal: 'Nature Machine Intelligence',
    metadata: {
      isSimplified: false,
      isExternal: true,
      externalId: 'https://openalex.org/W2741809807',
      externalSource: 'openalex',
    },
  };

  // Example 3: OpenAlex paper (ALREADY SIMPLIFIED)
  const simplifiedPaper: UnifiedSearchResult = {
    id: 'https://openalex.org/W9876543210',
    title: 'Climate Change Impact on Biodiversity',
    excerpt: 'This study examines the effects of climate change on species diversity...',
    authors: ['Dr. Emma Green', 'Prof. David Brown'],
    year: 2024,
    source: 'openalex',
    type: 'journal-article',
    pdfUrl: 'https://example.com/paper.pdf',
    doi: '10.5678/climate',
    citations: 89,
    isOpenAccess: true,
    journal: 'Science',
    metadata: {
      isSimplified: true, // ⭐ Already simplified!
      isExternal: true,
      articleId: '456e7890-a12b-34c5-d678-901234567890', // Simplified article ID
      externalId: 'https://openalex.org/W9876543210',
      externalSource: 'openalex',
    },
  };

  // Example 4: Google Scholar result
  const scholarPaper: UnifiedSearchResult = {
    id: 'scholar-abc123',
    title: 'Artificial Intelligence in Education: Challenges and Opportunities',
    excerpt: 'This paper explores the integration of AI technologies in modern educational systems, discussing both the potential benefits and challenges...',
    authors: ['Prof. Lisa Anderson', 'Dr. James Miller'],
    year: 2023,
    source: 'scholar',
    type: 'article',
    pdfUrl: 'https://example.com/ai-education.pdf',
    doi: '10.1234/ai-edu',
    citations: 42,
    journal: 'Journal of Educational Technology',
    metadata: {
      isSimplified: false,
      isExternal: true,
      externalId: 'scholar-abc123',
      externalSource: 'scholar',
    },
  };

  // Handlers
  const handleSimplify = (result: UnifiedSearchResult) => {
    console.log('Simplifying paper:', result.title);
    // TODO: Implement simplify workflow
    // 1. Check cache
    // 2. Call /simplify/external endpoint
    // 3. Navigate to simplified article
  };

  const handleReadSimplified = (articleId: string) => {
    console.log('Reading simplified article:', articleId);
    router.push(`/article/${articleId}` as any);
  };

  const handlePressInternal = () => {
    console.log('Opening internal article');
    router.push(`/article/${internalArticle.id}` as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        {/* Internal Article */}
        <UnifiedSearchResultCard
          result={internalArticle}
          highlightText="Machine Learning"
          onPress={handlePressInternal}
        />

        {/* OpenAlex Paper (Not Simplified) */}
        <UnifiedSearchResultCard
          result={openAlexPaper}
          highlightText="Deep Learning"
          onSimplify={() => handleSimplify(openAlexPaper)}
        />

        {/* OpenAlex Paper (Already Simplified) */}
        <UnifiedSearchResultCard
          result={simplifiedPaper}
          highlightText="Climate"
          onReadSimplified={handleReadSimplified}
        />

        {/* Google Scholar Result */}
        <UnifiedSearchResultCard
          result={scholarPaper}
          highlightText="Artificial Intelligence"
          onSimplify={() => handleSimplify(scholarPaper)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  section: {
    gap: 12,
  },
});
