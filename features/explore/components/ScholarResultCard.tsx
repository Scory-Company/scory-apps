/**
 * ScholarResultCard Component
 *
 * Displays Google Scholar search results with distinct styling
 * to differentiate from local database articles
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ScholarArticle, citationsToRating } from '@/data/mock/scholar/scholar-results';

interface ScholarResultCardProps {
  article: ScholarArticle;
  highlightText?: string;
}

export const ScholarResultCard: React.FC<ScholarResultCardProps> = ({ article, highlightText }) => {
  const rating = citationsToRating(article.citations);

  const handleOpenUrl = async () => {
    if (article.pdfUrl) {
      await Linking.openURL(article.pdfUrl);
    } else if (article.url) {
      await Linking.openURL(article.url);
    }
  };

  const handleOpenDoi = async () => {
    if (article.doi) {
      await Linking.openURL(`https://doi.org/${article.doi}`);
    }
  };

  // Highlight matching text in title
  const renderHighlightedTitle = () => {
    if (!highlightText || highlightText.trim() === '') {
      return <Text style={styles.title} numberOfLines={2}>{article.title}</Text>;
    }

    const parts = article.title.split(new RegExp(`(${highlightText})`, 'gi'));
    return (
      <Text style={styles.title} numberOfLines={2}>
        {parts.map((part, i) =>
          part.toLowerCase() === highlightText.toLowerCase() ? (
            <Text key={i} style={styles.highlight}>
              {part}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleOpenUrl} activeOpacity={0.7}>
      {/* External Source Badge */}
      <View style={styles.badgeContainer}>
        <Ionicons name="globe-outline" size={12} color="#6366F1" />
        <Text style={styles.badgeText}>Google Scholar</Text>
      </View>

      {/* Title */}
      {renderHighlightedTitle()}

      {/* Authors */}
      <Text style={styles.authors} numberOfLines={1}>
        {article.authors.join(', ')}
      </Text>

      {/* Journal & Year */}
      <View style={styles.metaRow}>
        {article.journal && (
          <View style={styles.journalBadge}>
            <Text style={styles.journalText} numberOfLines={1}>
              {article.journal}
            </Text>
          </View>
        )}
        <Text style={styles.year}>{article.year}</Text>
      </View>

      {/* Abstract */}
      <Text style={styles.abstract} numberOfLines={3}>
        {article.abstract}
      </Text>

      {/* Footer: Citations & Rating */}
      <View style={styles.footer}>
        <View style={styles.citationsContainer}>
          <Ionicons name="document-text-outline" size={14} color="#64748B" />
          <Text style={styles.citationsText}>
            {article.citations} citations
          </Text>
        </View>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FCD34D" />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {article.pdfUrl && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOpenUrl}
            activeOpacity={0.7}
          >
            <Ionicons name="document-outline" size={16} color="#6366F1" />
            <Text style={styles.actionText}>PDF</Text>
          </TouchableOpacity>
        )}

        {article.doi && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOpenDoi}
            activeOpacity={0.7}
          >
            <Ionicons name="link-outline" size={16} color="#6366F1" />
            <Text style={styles.actionText}>DOI</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleOpenUrl}
          activeOpacity={0.7}
        >
          <Ionicons name="open-outline" size={16} color="#6366F1" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E7FF', // Subtle purple border to indicate external source
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 22,
  },
  authors: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  journalBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flex: 1,
  },
  journalText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  year: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  abstract: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 12,
  },
  citationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  citationsText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  highlight: {
    fontWeight: '700',
    backgroundColor: '#FCD34D30',
    borderRadius: 2,
  },
});
