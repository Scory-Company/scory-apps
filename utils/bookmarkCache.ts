/**
 * Bookmark Cache Utility
 * Local cache untuk bookmark status agar UI bisa cepat tanpa hit API
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARK_CACHE_KEY = '@scory_bookmarks_cache';

interface BookmarkCache {
  [articleId: string]: boolean;
}

/**
 * Get all bookmarked article IDs from cache
 */
export async function getBookmarkCache(): Promise<BookmarkCache> {
  try {
    const cache = await AsyncStorage.getItem(BOOKMARK_CACHE_KEY);
    return cache ? JSON.parse(cache) : {};
  } catch (error) {
    console.error('[BookmarkCache] Error getting cache:', error);
    return {};
  }
}

/**
 * Check if article is bookmarked (from cache)
 */
export async function isArticleBookmarked(articleId: string): Promise<boolean> {
  const cache = await getBookmarkCache();
  return cache[articleId] === true;
}

/**
 * Add article to bookmark cache
 */
export async function addToBookmarkCache(articleId: string): Promise<void> {
  try {
    const cache = await getBookmarkCache();
    cache[articleId] = true;
    await AsyncStorage.setItem(BOOKMARK_CACHE_KEY, JSON.stringify(cache));
    console.log('[BookmarkCache] Added:', articleId);
  } catch (error) {
    console.error('[BookmarkCache] Error adding to cache:', error);
  }
}

/**
 * Remove article from bookmark cache
 */
export async function removeFromBookmarkCache(articleId: string): Promise<void> {
  try {
    const cache = await getBookmarkCache();
    delete cache[articleId];
    await AsyncStorage.setItem(BOOKMARK_CACHE_KEY, JSON.stringify(cache));
    console.log('[BookmarkCache] Removed:', articleId);
  } catch (error) {
    console.error('[BookmarkCache] Error removing from cache:', error);
  }
}

/**
 * Sync cache with server data (call this after fetching collections)
 */
export async function syncBookmarkCache(bookmarkedArticleIds: string[]): Promise<void> {
  try {
    const cache: BookmarkCache = {};
    bookmarkedArticleIds.forEach(id => {
      cache[id] = true;
    });
    await AsyncStorage.setItem(BOOKMARK_CACHE_KEY, JSON.stringify(cache));
    console.log('[BookmarkCache] Synced:', bookmarkedArticleIds.length, 'articles');
  } catch (error) {
    console.error('[BookmarkCache] Error syncing cache:', error);
  }
}

/**
 * Clear all bookmark cache (for logout)
 */
export async function clearBookmarkCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BOOKMARK_CACHE_KEY);
    console.log('[BookmarkCache] Cleared');
  } catch (error) {
    console.error('[BookmarkCache] Error clearing cache:', error);
  }
}
