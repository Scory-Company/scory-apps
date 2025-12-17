import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

import { CustomTabBar } from '@/components/custom-tab-bar';

export default function TabLayout() {
  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { position: 'absolute' },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused
                  ? require('@/assets/images/icon-tab/home-selected.png')
                  : require('@/assets/images/icon-tab/home-not-selected.png')
                }
                style={{ width: 28, height: 28 }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused
                  ? require('@/assets/images/icon-tab/explore-selected.png')
                  : require('@/assets/images/icon-tab/explore-not-selected.png')
                }
                style={{ width: 28, height: 28 }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: 'Learn',
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused
                  ? require('@/assets/images/icon-tab/learn-selected.png')
                  : require('@/assets/images/icon-tab/learn-not-selected.png')
                }
                style={{ width: 28, height: 28 }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused
                  ? require('@/assets/images/icon-tab/profile-selected.png')
                  : require('@/assets/images/icon-tab/profile-not-selected.png')
                }
                style={{ width: 28, height: 28 }}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
