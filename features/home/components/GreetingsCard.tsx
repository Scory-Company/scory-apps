import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Colors, Spacing } from "@/constants/theme";

interface GreetingCardProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export function GreetingsCard({
  title,
  subtitle,
  onPress,
}: GreetingCardProps) {


    return (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <TouchableOpacity onPress={onPress}>
            <View>
              <Image
                source={require('@/assets/images/icon-tab/notif.png')}
                style={{ width: 50, height: 50 }}
                contentFit="contain"
              />
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
});