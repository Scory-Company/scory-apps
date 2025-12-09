/**
 * SourceLinks Component
 *
 * Shows links to original paper sources (PDF, DOI, Landing Page)
 * Only visible for external articles (from Scholar/OpenAlex)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

interface SourceLinksProps {
  externalMetadata?: {
    source: 'openalex' | 'scholar';
    externalId: string;
    doi?: string;
    pdfUrl?: string;
    landingPageUrl?: string;
    year: number;
  };
}

export function SourceLinks({ externalMetadata }: SourceLinksProps) {
  const colors = Colors.light;

  if (!externalMetadata) {
    return null;
  }

  const handleOpenLink = async (url: string, label: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot Open Link', `Unable to open ${label}`);
      }
    } catch (error) {
      console.error(`Error opening ${label}:`, error);
      Alert.alert('Error', `Failed to open ${label}`);
    }
  };

  const { pdfUrl, doi, landingPageUrl, source } = externalMetadata;

  // If no links available, don't render
  if (!pdfUrl && !doi && !landingPageUrl) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="link-outline" size={16} color={colors.textMuted} />
        <Text style={[styles.headerText, { color: colors.textMuted }]}>
          Original Source
        </Text>
      </View>

      <View style={styles.linksContainer}>
        {/* PDF Link */}
        {pdfUrl && (
          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
            onPress={() => handleOpenLink(pdfUrl, 'PDF')}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text" size={18} color={colors.primary} />
            <Text style={[styles.linkText, { color: colors.primary }]}>
              View PDF
            </Text>
            <Ionicons name="open-outline" size={14} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* DOI Link */}
        {doi && (
          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: colors.secondary + '15', borderColor: colors.secondary }]}
            onPress={() => handleOpenLink(`https://doi.org/${doi}`, 'DOI')}
            activeOpacity={0.7}
          >
            <Ionicons name="journal" size={18} color={colors.secondary} />
            <Text style={[styles.linkText, { color: colors.secondary }]}>
              DOI
            </Text>
            <Ionicons name="open-outline" size={14} color={colors.secondary} />
          </TouchableOpacity>
        )}

        {/* Landing Page Link */}
        {landingPageUrl && !pdfUrl && (
          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: colors.accent + '15', borderColor: colors.accent }]}
            onPress={() => handleOpenLink(landingPageUrl, 'Paper Website')}
            activeOpacity={0.7}
          >
            <Ionicons name="globe-outline" size={18} color={colors.accent} />
            <Text style={[styles.linkText, { color: colors.accent }]}>
              View Online
            </Text>
            <Ionicons name="open-outline" size={14} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      {/* Source Badge */}
      <View style={styles.sourceBadge}>
        <Text style={[styles.sourceBadgeText, { color: colors.textMuted }]}>
          Source: {source === 'scholar' ? 'Google Scholar' : 'OpenAlex'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.light.background,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  linkText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  sourceBadge: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  sourceBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontStyle: 'italic',
  },
});
