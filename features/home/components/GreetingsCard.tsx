/* eslint-disable @typescript-eslint/no-unused-vars */
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Colors, Spacing, Radius } from "@/constants/theme";

interface GreetingCardProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
  unreadCount?: number; // Badge count for notifications
}

export function GreetingsCard({
  title,
  subtitle,
  onPress,
  unreadCount = 0,
}: GreetingCardProps) {


    return (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <TouchableOpacity onPress={onPress} style={styles.notificationButton}>
            <View>
              {/* <Image
                source={require('@/assets/images/icon-tab/notif.png')}
                style={{ width: 50, height: 50 }}
                contentFit="contain"
              /> */}
              {/* Badge indicator for unread notifications */}
              {/* {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: Colors.light.error }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )} */}
            </View>
          </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    headerLeft: {
        flex: 1,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
        color: Colors.light.text,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: Colors.light.textSecondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: Spacing.md,

    },
    notificationButton: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        minWidth: 18,
        height: 18,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: Colors.light.background,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
});