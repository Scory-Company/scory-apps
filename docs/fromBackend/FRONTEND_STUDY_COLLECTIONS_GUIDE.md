# Study Collections API - Frontend Integration Guide

## 📋 Overview

Study Collections adalah fitur **auto-grouping bookmark** yang secara otomatis mengelompokkan artikel yang di-bookmark berdasarkan kategori. Setiap collection merepresentasikan satu kategori dengan tracking progress membaca.

### Key Features
- ✅ **Auto-create collection** saat bookmark artikel pertama di kategori tertentu
- ✅ **Auto-delete collection** saat un-bookmark artikel terakhir
- ✅ **Progress tracking** otomatis berdasarkan artikel yang sudah dibaca
- ✅ **Icon & color** sudah predefined per kategori

---

## 🌐 Base URL

```
Production: https://your-api.com/api
Development: http://localhost:3000/api
```

---

## 🔐 Authentication

Semua endpoint (kecuali `/category-mappings`) memerlukan authentication:

```typescript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

---

## 📡 API Endpoints

### 1. Get All Collections

**Endpoint:** `GET /collections`

**Description:** Mengambil semua study collections milik user yang sedang login.

**Request:**
```typescript
const response = await fetch('/api/collections', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "collections": [
      {
        "id": "col_123",
        "userId": "user_456",
        "category": "Machine Learning",
        "title": "Machine Learning",
        "icon": "hardware-chip",
        "color": "#4F46E5",
        "articlesCount": 5,
        "progress": 60,
        "createdAt": "2025-12-01T10:00:00Z",
        "updatedAt": "2025-12-11T15:30:00Z"
      }
    ]
  }
}
```

**TypeScript Interface:**
```typescript
interface StudyCollection {
  id: string;
  userId: string;
  category: string;
  title: string;
  icon: string;           // Ionicons name
  color: string;          // Hex color code
  articlesCount: number;
  progress: number;       // 0-100
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp
}
```

---

### 2. Get Collection Details

**Endpoint:** `GET /collections/:collectionId`

**Description:** Mengambil detail collection beserta list artikel yang di-bookmark.

**Request:**
```typescript
const collectionId = 'col_123';
const response = await fetch(`/api/collections/${collectionId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "collection": {
      "id": "col_123",
      "userId": "user_456",
      "category": "Machine Learning",
      "title": "Machine Learning",
      "icon": "hardware-chip",
      "color": "#4F46E5",
      "articlesCount": 5,
      "progress": 60,
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-11T15:30:00Z"
    },
    "articles": [
      {
        "id": "art_789",
        "title": "Introduction to Neural Networks",
        "slug": "intro-neural-networks",
        "excerpt": "Learn the basics...",
        "authorName": "John Doe",
        "authorAvatar": "https://...",
        "imageUrl": "https://...",
        "readTimeMinutes": 10,
        "rating": 4.5,
        "totalRatings": 120,
        "viewCount": 1500,
        "category": {
          "id": "cat_1",
          "name": "Machine Learning",
          "slug": "machine-learning"
        },
        "isRead": true,
        "bookmarkedAt": "2025-12-01T10:00:00Z",
        "lastReadAt": "2025-12-05T14:00:00Z"
      }
    ]
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "error": "Collection not found"
}
```

---

### 3. Bookmark Article

**Endpoint:** `POST /bookmarks`

**Description:** Bookmark artikel dan otomatis menambahkannya ke collection yang sesuai atau membuat collection baru.

**Request:**
```typescript
const response = await fetch('/api/bookmarks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    articleId: 'art_789'
  })
});
```

**Request Body:**
```typescript
interface BookmarkRequest {
  articleId: string;  // UUID of article
}
```

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "bookmark": {
      "articleId": "art_789",
      "bookmarkedAt": "2025-12-11T16:00:00Z"
    },
    "collection": {
      "id": "col_123",
      "category": "Machine Learning",
      "articlesCount": 6,
      "isNew": false
    }
  },
  "message": "Article bookmarked successfully"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "Article already bookmarked"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "error": "Article not found"
}
```

**Backend Behavior:**
1. ✅ Jika collection untuk kategori artikel sudah ada → Tambahkan ke collection existing
2. ✅ Jika collection belum ada → Buat collection baru otomatis dengan icon & color yang sesuai
3. ✅ Update `articlesCount` di collection
4. ✅ Update `bookmarkCount` di artikel

---

### 4. Un-bookmark Article

**Endpoint:** `DELETE /bookmarks/:articleId`

**Description:** Un-bookmark artikel dan otomatis menghapus dari collection, serta cleanup collection jika kosong.

**Request:**
```typescript
const articleId = 'art_789';
const response = await fetch(`/api/bookmarks/${articleId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Response Success (200) - Collection Masih Ada:**
```json
{
  "success": true,
  "data": {
    "articleId": "art_789",
    "collection": {
      "id": "col_123",
      "articlesCount": 5,
      "wasDeleted": false
    }
  },
  "message": "Bookmark removed successfully"
}
```

**Response Success (200) - Collection Dihapus:**
```json
{
  "success": true,
  "data": {
    "articleId": "art_789",
    "collection": {
      "id": "col_123",
      "articlesCount": 0,
      "wasDeleted": true
    }
  },
  "message": "Bookmark removed and collection deleted (no articles remaining)"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "error": "Bookmark not found"
}
```

**Backend Behavior:**
1. ✅ Hapus artikel dari collection
2. ✅ Update `articlesCount` di collection
3. ✅ **Jika articlesCount = 0** → Hapus collection otomatis
4. ✅ **Jika articlesCount > 0** → Recalculate progress

---

### 5. Mark Article as Read

**Endpoint:** `POST /collections/:collectionId/articles/:articleId/read`

**Description:** Menandai artikel sebagai sudah dibaca dan update progress collection.

**Request:**
```typescript
const collectionId = 'col_123';
const articleId = 'art_789';

const response = await fetch(
  `/api/collections/${collectionId}/articles/${articleId}/read`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "articleId": "art_789",
    "isRead": true,
    "lastReadAt": "2025-12-11T16:30:00Z",
    "collection": {
      "id": "col_123",
      "progress": 67
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "error": "Article not found in collection"
}
```

**Backend Behavior:**
1. ✅ Set `isRead = true` untuk artikel
2. ✅ Set `lastReadAt` timestamp
3. ✅ Recalculate `progress` otomatis: `(read articles / total articles) × 100`
4. ✅ Update `updatedAt` di collection

---

### 6. Get Category Mappings

**Endpoint:** `GET /collections/category-mappings`

**Description:** Mengambil predefined category mappings untuk icon dan color.

**⚠️ Note:** Endpoint ini **TIDAK memerlukan authentication**

**Request:**
```typescript
const response = await fetch('/api/collections/category-mappings', {
  method: 'GET'
});
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "mappings": [
      {
        "category": "SAINTEK (Sains & Teknologi)",
        "icon": "flask",
        "color": "#0EA5E9"
      },
      {
        "category": "Machine Learning",
        "icon": "hardware-chip",
        "color": "#4F46E5"
      },
      {
        "category": "Data Science",
        "icon": "analytics",
        "color": "#7C3AED"
      }
    ]
  }
}
```

**Use Case:** Gunakan untuk display preview icon & color sebelum bookmark artikel.

---

## 🔄 User Flow Examples

### Flow 1: User Bookmark Article Pertama Kali

```typescript
// 1. User klik bookmark di artikel "Introduction to ML"
const bookmarkResponse = await bookmarkArticle('art_789');

// Response:
// {
//   "collection": {
//     "isNew": true,  // Collection baru dibuat!
//     "category": "Machine Learning"
//   }
// }

// 2. Refresh collections list
const collectionsResponse = await getAllCollections();

// Response akan include collection baru:
// {
//   "collections": [
//     {
//       "category": "Machine Learning",
//       "articlesCount": 1,
//       "progress": 0
//     }
//   ]
// }
```

### Flow 2: User Mark Article as Read

```typescript
// 1. User buka detail artikel dan baca sampai selesai
// 2. Trigger mark as read
const markReadResponse = await markAsRead('col_123', 'art_789');

// Response:
// {
//   "collection": {
//     "progress": 20  // Progress otomatis update (1/5 = 20%)
//   }
// }

// 3. UI update progress bar otomatis
```

### Flow 3: User Un-bookmark Artikel Terakhir

```typescript
// 1. User un-bookmark artikel terakhir di collection
const unbookmarkResponse = await unbookmarkArticle('art_789');

// Response:
// {
//   "collection": {
//     "wasDeleted": true  // Collection otomatis dihapus!
//   }
// }

// 2. UI hapus collection card dari list
```

---

## 💻 React/React Native Implementation Example

### Custom Hook: `useStudyCollections`

```typescript
import { useState, useEffect } from 'react';

interface UseStudyCollectionsResult {
  collections: StudyCollection[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStudyCollections = (token: string): UseStudyCollectionsResult => {
  const [collections, setCollections] = useState<StudyCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/collections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();
      setCollections(data.data.collections);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [token]);

  return {
    collections,
    loading,
    error,
    refetch: fetchCollections
  };
};
```

### Component: `StudyCollectionCard`

```tsx
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

interface StudyCollectionCardProps {
  collection: StudyCollection;
  onPress: (collectionId: string) => void;
}

export const StudyCollectionCard: React.FC<StudyCollectionCardProps> = ({
  collection,
  onPress
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(collection.id)}
      style={{
        backgroundColor: collection.color + '20', // 20 = opacity
        borderLeftWidth: 4,
        borderLeftColor: collection.color,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons
          name={collection.icon}
          size={24}
          color={collection.color}
        />
        <Text style={{ marginLeft: 12, fontSize: 16, fontWeight: '600' }}>
          {collection.title}
        </Text>
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ color: '#6B7280', fontSize: 14 }}>
          {collection.articlesCount} articles
        </Text>

        {/* Progress Bar */}
        <View style={{
          height: 6,
          backgroundColor: '#E5E7EB',
          borderRadius: 3,
          marginTop: 8,
          overflow: 'hidden'
        }}>
          <View style={{
            height: '100%',
            width: `${collection.progress}%`,
            backgroundColor: collection.color
          }} />
        </View>

        <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>
          {Math.round(collection.progress)}% completed
        </Text>
      </View>
    </TouchableOpacity>
  );
};
```

### API Service Functions

```typescript
// services/collectionService.ts

const API_BASE_URL = 'http://localhost:3000/api';

export const collectionService = {
  // Get all collections
  async getAllCollections(token: string): Promise<StudyCollection[]> {
    const response = await fetch(`${API_BASE_URL}/collections`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch collections');
    }

    const data = await response.json();
    return data.data.collections;
  },

  // Get collection details
  async getCollectionDetails(collectionId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/collections/${collectionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch collection details');
    }

    const data = await response.json();
    return data.data;
  },

  // Bookmark article
  async bookmarkArticle(articleId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/bookmarks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ articleId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to bookmark article');
    }

    return await response.json();
  },

  // Un-bookmark article
  async unbookmarkArticle(articleId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/bookmarks/${articleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove bookmark');
    }

    return await response.json();
  },

  // Mark as read
  async markAsRead(collectionId: string, articleId: string, token: string) {
    const response = await fetch(
      `${API_BASE_URL}/collections/${collectionId}/articles/${articleId}/read`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark article as read');
    }

    return await response.json();
  },

  // Get category mappings
  async getCategoryMappings() {
    const response = await fetch(`${API_BASE_URL}/collections/category-mappings`);

    if (!response.ok) {
      throw new Error('Failed to fetch category mappings');
    }

    const data = await response.json();
    return data.data.mappings;
  }
};
```

---

## 🎨 UI/UX Recommendations

### Empty State
```typescript
if (collections.length === 0) {
  return (
    <View>
      <Ionicons name="bookmark-outline" size={64} color="#9CA3AF" />
      <Text>No collections yet</Text>
      <Text>Bookmark articles to create your first collection</Text>
    </View>
  );
}
```

### Loading State
```typescript
if (loading) {
  return <ActivityIndicator size="large" color="#4F46E5" />;
}
```

### Progress Indicator
- 0-25%: Red (#EF4444)
- 26-50%: Orange (#F97316)
- 51-75%: Blue (#3B82F6)
- 76-100%: Green (#10B981)

### Refresh Trigger
Refresh collections list setelah:
1. ✅ User bookmark/un-bookmark artikel
2. ✅ User mark artikel as read
3. ✅ Screen focus/mount

---

## ⚠️ Important Notes

### 1. Auto-Creation
- Collection **dibuat otomatis** saat bookmark artikel pertama
- **TIDAK ADA** endpoint untuk create collection manual

### 2. Auto-Deletion
- Collection **dihapus otomatis** saat un-bookmark artikel terakhir
- Frontend harus handle UI update untuk removed collection

### 3. Progress Calculation
- Progress **auto-calculated** di backend
- Formula: `(read articles / total articles) × 100`
- Artikel dianggap "read" setelah hit endpoint mark as read

### 4. Category Matching
- Backend melakukan **case-insensitive matching**
- Whitespace otomatis di-trim
- Jika kategori tidak ada di mapping → gunakan default icon & color

### 5. Real-time Updates
- Setelah bookmark/un-bookmark → **Refresh collections list**
- Setelah mark as read → **Update progress** di local state atau refetch

---

## 🐛 Error Handling

### Common Errors

**401 Unauthorized:**
```typescript
{
  "success": false,
  "error": "Unauthorized"
}
```
→ User belum login atau token expired

**404 Not Found:**
```typescript
{
  "success": false,
  "error": "Collection not found"
}
```
→ CollectionId tidak valid

**400 Bad Request:**
```typescript
{
  "success": false,
  "error": "Article already bookmarked"
}
```
→ Artikel sudah di-bookmark sebelumnya

### Error Handling Example

```typescript
try {
  await collectionService.bookmarkArticle(articleId, token);
  showToast('Article bookmarked successfully', 'success');
  refetchCollections();
} catch (error) {
  if (error.message.includes('already bookmarked')) {
    showToast('Article already in your collection', 'info');
  } else if (error.message.includes('Unauthorized')) {
    showToast('Please login again', 'error');
    navigateToLogin();
  } else {
    showToast('Failed to bookmark article', 'error');
  }
}
```

---

## 📞 Support

Jika ada pertanyaan atau issue:
1. Cek dokumentasi lengkap di `docs/requestAPI/API_STUDY_COLLECTIONS.md`
2. Lihat implementation notes di `docs/IMPLEMENTATION_STUDY_COLLECTIONS.md`
3. Contact backend team untuk technical issues

---

**Last Updated:** December 11, 2025
**API Version:** 1.0
**Supported Platforms:** Web, iOS, Android
