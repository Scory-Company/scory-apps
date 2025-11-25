import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { Notification, getTimeAgo } from '@/data/mock';
import { router } from 'expo-router';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationPress?: (notification: Notification) => void;
  onViewAll?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  notifications,
  onNotificationPress,
  onViewAll,
}) => {
  const colors = Colors.light;
  const latestNotifications = notifications.slice(0, 3);

  const handleNotificationPress = (notification: Notification) => {
    if (onNotificationPress) {
      onNotificationPress(notification);
    }

    // Navigate if actionUrl exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
      onClose();
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    }
    router.push('/notifications');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Notification List */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {latestNotifications.length > 0 ? (
              latestNotifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    {
                      backgroundColor: notification.isRead
                        ? colors.background
                        : colors.primaryLight + '15',
                    },
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: notification.iconColor + '20' },
                    ]}
                  >
                    <Ionicons
                      name={notification.icon as any}
                      size={20}
                      color={notification.iconColor}
                    />
                  </View>

                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text
                        style={[
                          styles.notificationTitle,
                          { color: colors.text },
                          !notification.isRead && styles.unreadTitle,
                        ]}
                        numberOfLines={1}
                      >
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]} />
                      )}
                    </View>

                    <Text
                      style={[styles.notificationMessage, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {notification.message}
                    </Text>

                    <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
                      {getTimeAgo(notification.timestamp)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No notifications yet
                </Text>
              </View>
            )}
          </ScrollView>

          {/* View All Link - Simple text */}
          <TouchableOpacity
            style={styles.viewAllLink}
            onPress={handleViewAll}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewAllLinkText, { color: colors.third }]}>
              View All Notifications
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.third} />
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  modalContainer: {
    backgroundColor: Colors.light.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius['2xl'],
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingVertical: Spacing.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border + '30',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  notificationTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.4,
  },
  notificationTime: {
    fontSize: Typography.fontSize.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '500',
  },
  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  viewAllLinkText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
});
