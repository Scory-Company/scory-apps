/**
 * SourceLinks Component
 *
 * Shows links to original paper sources (PDF, DOI)
 * Only visible for external articles (from Scholar/OpenAlex)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useToast } from '@/features/shared/hooks/useToast';

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
  const toast = useToast();

  if (!externalMetadata) {
    return null;
  }

  const handleOpenLink = async (url: string, label: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        toast.error(`Unable to open ${label}`, 2500);
      }
    } catch (error) {
      console.error(`Error opening ${label}:`, error);
      toast.error(`Failed to open ${label}`, 2500);
    }
  };

  const { pdfUrl, doi, landingPageUrl } = externalMetadata;

  // If no links available, don't render
  if (!pdfUrl && !doi && !landingPageUrl) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.linksRow}>
          {/* PDF Link */}
          {pdfUrl && (
            <TouchableOpacity
              style={[styles.linkButton, {
                backgroundColor: colors.background,
                borderColor: colors.primary,
                borderWidth: 1.5,
              }]}
              onPress={() => handleOpenLink(pdfUrl, 'PDF')}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={16} color={colors.primary} />
              <Text style={[styles.linkText, { color: colors.primary }]}>
                PDF
              </Text>
            </TouchableOpacity>
          )}

          {/* DOI Link */}
          {doi && (
            <TouchableOpacity
              style={[styles.linkButton, {
                backgroundColor: colors.background,
                borderColor: colors.primary,
                borderWidth: 1.5,
              }]}
              onPress={() => handleOpenLink(`https://doi.org/${doi}`, 'DOI')}
              activeOpacity={0.7}
            >
              <Ionicons name="link-outline" size={16} color={colors.primary} />
              <Text style={[styles.linkText, { color: colors.primary }]}>
                DOI
              </Text>
            </TouchableOpacity>
          )}

          {/* Landing Page Link - Only show if no PDF */}
          {landingPageUrl && !pdfUrl && !doi && (
            <TouchableOpacity
              style={[styles.linkButton, {
                backgroundColor: colors.background,
                borderColor: colors.primary,
                borderWidth: 1.5,
              }]}
              onPress={() => handleOpenLink(landingPageUrl, 'Paper Website')}
              activeOpacity={0.7}
            >
              <Ionicons name="globe-outline" size={16} color={colors.primary} />
              <Text style={[styles.linkText, { color: colors.primary }]}>
                View Paper
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Toast Notifications */}
      <toast.ToastComponent />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  linksRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    gap: Spacing.xs - 2,
  },
  linkText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});
