import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { notifications, getTimeAgo, Notification } from '@/data/mock';
import { router } from 'expo-router';

export default function NotificationsScreen() {
  const colors = Colors.light;
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Filter notifications based on selected filter
  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [filter]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationPress = (notification: Notification) => {
    // Navigate if actionUrl exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: Notification[] } = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Older: [],
    };

    const now = Date.now();
    const oneDayMs = 1000 * 60 * 60 * 24;

    filteredNotifications.forEach((notification) => {
      const notificationTime = new Date(notification.timestamp).getTime();
      const diffDays = Math.floor((now - notificationTime) / oneDayMs);

      if (diffDays === 0) {
        groups.Today.push(notification);
      } else if (diffDays === 1) {
        groups.Yesterday.push(notification);
      } else if (diffDays <= 7) {
        groups['This Week'].push(notification);
      } else {
        groups.Older.push(notification);
      }
    });

    return groups;
  }, [filteredNotifications]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'all' && { borderBottomColor: colors.third, borderBottomWidth: 2 },
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === 'all' ? colors.third : colors.textSecondary },
            ]}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'unread' && { borderBottomColor: colors.third, borderBottomWidth: 2 },
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === 'unread' ? colors.third : colors.textSecondary },
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredNotifications.length > 0 ? (
          Object.keys(groupedNotifications).map((groupKey) => {
            const groupNotifications = groupedNotifications[groupKey];
            if (groupNotifications.length === 0) return null;

            return (
              <View key={groupKey} style={styles.notificationGroup}>
                <Text style={[styles.groupTitle, { color: colors.textMuted }]}>{groupKey}</Text>

                {groupNotifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      {
                        backgroundColor: notification.isRead
                          ? colors.surface
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
                        size={22}
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
                ))}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {filter === 'unread'
                ? 'All caught up! Check back later.'
                : "We'll notify you when something important happens"}
            </Text>
          </View>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
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
    paddingBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    marginBottom: Spacing.md,
  },
  filterTab: {
    paddingBottom: Spacing.sm,
  },
  filterText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  notificationGroup: {
    marginBottom: Spacing.lg,
  },
  groupTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    marginBottom: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
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
    fontSize: Typography.fontSize.base,
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
    lineHeight: Typography.fontSize.sm * 1.5,
  },
  notificationTime: {
    fontSize: Typography.fontSize.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
});
