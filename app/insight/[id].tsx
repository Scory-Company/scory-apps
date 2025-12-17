import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { notesApi, type Note } from '@/services';
import { useAlert } from '@/features/shared/hooks/useAlert';
import { useToast } from '@/features/shared/hooks/useToast';
import { useTranslation } from 'react-i18next';

function InsightDetailScreen() {
  const { t } = useTranslation();
  const colors = Colors.light;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const alert = useAlert();
  const toast = useToast();

  // State
  const [insight, setInsight] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch insight detail
  useEffect(() => {
    if (!id) {
      setError(t('insightDetail.errors.idRequired'));
      setIsLoading(false);
      return;
    }

    fetchInsightDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchInsightDetail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await notesApi.getNoteById(id as string);

      if (response.success && response.data) {
        setInsight(response.data);
        setEditedContent(response.data.content);
        setEditedTitle(response.data.title || '');
      } else {
        setError(response.message || t('insightDetail.errors.loadFailed'));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('insightDetail.errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!insight) return;

    if (editedContent.trim().length === 0) {
      alert.error('Error', t('insightDetail.errors.emptyContent'));
      return;
    }

    setIsSaving(true);

    try {

      // Prepare update data
      const updateData: { content: string; title?: string } = {
        content: editedContent.trim(),
      };

      // Only include title for standalone notes
      if (!insight.articleSlug) {
        updateData.title = editedTitle.trim() || undefined;
      }

      const response = await notesApi.updateNote(id as string, updateData);

      if (response.success && response.data) {
        setInsight(response.data);
        setIsEditing(false);
        toast.success(t('insightDetail.success.updated'));
      } else {
        alert.error('Error', response.message || t('insightDetail.errors.updateFailed'));
      }
    } catch (err: any) {
      alert.error('Error', err.response?.data?.message || t('insightDetail.errors.updateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    alert.confirm(
      t('insightDetail.confirm.deleteTitle'),
      t('insightDetail.confirm.deleteMessage'),
      confirmDelete
    );
  };

  const confirmDelete = async () => {
    if (!insight) return;

    setIsDeleting(true);

    try {
      const response = await notesApi.deleteNote(id as string);

      if (response.success) {
        toast.success(t('insightDetail.success.deleted'));
        setTimeout(() => {
          router.back();
        }, 1000);
      } else {
        alert.error('Error', response.message || t('insightDetail.errors.deleteFailed'));
        setIsDeleting(false);
      }
    } catch (err: any) {
      alert.error('Error', err.response?.data?.message || t('insightDetail.errors.deleteFailed'));
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(insight?.content || '');
    setEditedTitle(insight?.title || '');
    setIsEditing(false);
  };

  // Check if there are any unsaved changes
  const hasUnsavedChanges = () => {
    if (!insight) return false;

    const contentChanged = editedContent.trim() !== insight.content.trim();
    const titleChanged = editedTitle.trim() !== (insight.title || '').trim();

    return contentChanged || titleChanged;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Set both dates to start of day (midnight) for accurate day comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffInMs = nowOnly.getTime() - dateOnly.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return t('insightCard.dates.today');
    } else if (diffInDays === 1) {
      return t('insightCard.dates.yesterday');
    } else if (diffInDays < 7) {
      return t('insightCard.dates.daysAgo', { days: diffInDays });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('insightDetail.title')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('insightDetail.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !insight) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('insightDetail.title')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>{t('insightDetail.errors.unableToLoad')}</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error || t('insightDetail.errors.notFound')}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchInsightDetail}
          >
            <Text style={styles.retryButtonText}>{t('insightDetail.buttons.tryAgain')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Note Details</Text>

        {!isEditing && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIsEditing(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleDelete}
              disabled={isDeleting}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Ionicons name="trash-outline" size={24} color={colors.error} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {isEditing && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={hasUnsavedChanges() ? handleSave : handleCancel}
              disabled={isSaving || (hasUnsavedChanges() && editedContent.trim().length === 0)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : hasUnsavedChanges() ? (
                <Text style={[styles.saveText, { color: colors.primary }]}>
                  {t('insightDetail.buttons.save')}
                </Text>
              ) : (
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                  {t('insightDetail.buttons.cancel')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Article Info (if article note) */}
        {insight.articleSlug && (
          <TouchableOpacity
            style={[styles.articleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(`/article/${insight.articleSlug}`)}
            activeOpacity={0.7}
          >
            <View style={styles.articleIconContainer}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
            </View>
            <View style={styles.articleInfo}>
              <Text style={[styles.articleLabel, { color: colors.textSecondary }]}>
                {t('insightDetail.labels.fromArticle')}
              </Text>
              <Text
                style={[styles.articleTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {insight.articleTitle || t('insightDetail.labels.untitledArticle')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Note Title (standalone notes) */}
        {!insight.articleSlug && (
          <>
            {!isEditing ? (
              // View mode - only show if title exists
              insight.title && (
                <View style={styles.titleCard}>
                  <Text style={[styles.noteTitle, { color: colors.text }]}>
                    {insight.title}
                  </Text>
                </View>
              )
            ) : (
              // Edit mode - always show title input for standalone notes
              <View style={styles.titleEditContainer}>
                <Text style={[styles.editLabel, { color: colors.textSecondary }]}>
                  {t('insightDetail.labels.noteTitleOptional')}
                </Text>
                <TextInput
                  style={[
                    styles.titleInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  placeholder={t('insightDetail.labels.titlePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  maxLength={255}
                />
              </View>
            )}
          </>
        )}

        {/* Note Content */}
        <View style={[styles.contentCard, Shadows.sm, { backgroundColor: colors.surface }]}>
          {!isEditing ? (
            <>
              <Text style={[styles.contentText, { color: colors.text }]}>
                {insight.content}
              </Text>
            </>
          ) : (
            <View style={styles.editContainer}>
              <Text style={[styles.editLabel, { color: colors.textSecondary }]}>
                {t('insightDetail.labels.noteContent')}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                value={editedContent}
                onChangeText={setEditedContent}
                multiline
                placeholder={t('insightDetail.labels.contentPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                autoFocus={!!insight.articleSlug} // Only autofocus if article note
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                {t('insightDetail.labels.charactersCount', { count: editedContent.length })}
              </Text>
            </View>
          )}
        </View>

        {/* Metadata */}
        <View style={styles.metadataCard}>
          <View style={styles.metadataRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>
              {t('insightDetail.labels.created')}
            </Text>
            <Text style={[styles.metadataValue, { color: colors.text }]}>
              {formatDate(insight.createdAt)}
            </Text>
          </View>

          {insight.updatedAt !== insight.createdAt && (
            <View style={styles.metadataRow}>
              <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>
                {t('insightDetail.labels.lastEdited')}
              </Text>
              <Text style={[styles.metadataValue, { color: colors.text }]}>
                {formatDate(insight.updatedAt)}
              </Text>
            </View>
          )}

          <View style={styles.metadataRow}>
            <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>
              {t('insightDetail.labels.type')}
            </Text>
            <Text style={[styles.metadataValue, { color: colors.text }]}>
              {insight.articleSlug ? t('insightDetail.labels.articleNote') : t('insightDetail.labels.standaloneNote')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Alert & Toast Components */}
      <alert.AlertComponent />
      <toast.ToastComponent />
    </SafeAreaView>
  );
}

// Export as default
export default InsightDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  cancelText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '500',
  },
  saveText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  articleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleInfo: {
    flex: 1,
  },
  articleLabel: {
    fontSize: Typography.fontSize.xs,
    marginBottom: 2,
  },
  articleTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  titleCard: {
    marginBottom: Spacing.lg,
  },
  noteTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    lineHeight: 32,
  },
  titleEditContainer: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
  },
  contentCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  contentText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },
  editContainer: {
    gap: Spacing.sm,
  },
  editLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    minHeight: 200,
    maxHeight: 400,
  },
  charCount: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'right',
  },
  metadataCard: {
    gap: Spacing.md,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metadataLabel: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  metadataValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  errorMessage: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
});
