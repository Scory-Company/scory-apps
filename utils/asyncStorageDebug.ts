import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug utilities for AsyncStorage
 * Use these in development to manage AsyncStorage
 */

// Clear reading level preference
export const clearReadingLevel = async () => {
  try {
    await AsyncStorage.removeItem('preferredReadingLevel');
    console.log('✅ [Debug] Reading level preference cleared');
  } catch (error) {
    console.error('❌ [Debug] Failed to clear reading level:', error);
  }
};

// Clear all personalization data
export const clearAllPersonalization = async () => {
  try {
    await AsyncStorage.multiRemove([
      'preferredReadingLevel',
      'hasSeenPersonalizationTutorial',
    ]);
    console.log('✅ [Debug] All personalization data cleared');
  } catch (error) {
    console.error('❌ [Debug] Failed to clear personalization:', error);
  }
};

// Clear all app data (use with caution!)
export const clearAllAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('✅ [Debug] All AsyncStorage cleared');
  } catch (error) {
    console.error('❌ [Debug] Failed to clear AsyncStorage:', error);
  }
};

// View all AsyncStorage keys and values
export const viewAllAsyncStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);

    console.log('📦 [Debug] AsyncStorage Contents:');
    console.log('================================');
    items.forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.log('================================');
  } catch (error) {
    console.error('❌ [Debug] Failed to view AsyncStorage:', error);
  }
};

// View specific key
export const viewAsyncStorageKey = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    console.log(`📦 [Debug] ${key}:`, value);
    return value;
  } catch (error) {
    console.error(`❌ [Debug] Failed to get ${key}:`, error);
  }
};
