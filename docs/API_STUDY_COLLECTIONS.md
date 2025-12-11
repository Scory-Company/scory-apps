# Study Collections API Documentation

## Overview
Study Collections adalah fitur yang secara otomatis mengelompokkan artikel yang di-bookmark oleh user berdasarkan kategori artikel. Setiap collection merepresentasikan satu kategori dengan semua artikel bookmark di dalamnya.

## Business Logic

### Auto-Grouping Mechanism
1. **Saat user bookmark artikel:**
   - System membaca kategori dari artikel yang di-bookmark
   - Jika collection dengan kategori tersebut sudah ada → tambahkan artikel ke collection yang ada
   - Jika collection dengan kategori tersebut belum ada → buat collection baru otomatis

2. **Saat user un-bookmark artikel:**
   - Artikel dihapus dari collection
   - Jika collection menjadi kosong (articlesCount = 0) → collection otomatis dihapus

3. **Progress Calculation:**
   - Progress = (jumlah artikel yang sudah dibaca / total artikel dalam collection) × 100
   - Artikel dianggap "dibaca" jika user pernah membuka detail artikel tersebut

---

## Data Models

### Collection Object
```typescript
interface StudyCollection {
  id: string;                    // Unique identifier
  userId: string;                // Owner of the collection
  category: string;              // Category name (from article)
  title: string;                 // Display title (same as category)
  icon: string;                  // Icon name for UI (Ionicons)
  color: string;                 // Hex color code
  articlesCount: number;         // Total bookmarked articles
  progress: number;              // Reading progress (0-100)
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

### Bookmarked Article in Collection
```typescript
interface BookmarkedArticle {
  articleId: string;             // Reference to article
  bookmarkedAt: string;          // ISO timestamp
  isRead: boolean;               // Has user read this article?
  lastReadAt?: string;           // ISO timestamp (optional)
}
```

### Category Mapping (Predefined)
```typescript
interface CategoryMapping {
  category: string;              // Category name
  icon: string;                  // Ionicons name
  color: string;                 // Hex color code
}

// Default mappings
const defaultCategoryMappings: CategoryMapping[] = [
  { category: "Machine Learning", icon: "hardware-chip", color: "#4F46E5" },
  { category: "Data Science", icon: "analytics", color: "#7C3AED" },
  { category: "Web Development", icon: "code-slash", color: "#2563EB" },
  { category: "Mobile Development", icon: "phone-portrait", color: "#059669" },
  { category: "Cloud Computing", icon: "cloud", color: "#0891B2" },
  { category: "Cybersecurity", icon: "shield-checkmark", color: "#DC2626" },
  { category: "AI & Robotics", icon: "construct", color: "#EA580C" },
  { category: "Blockchain", icon: "link", color: "#65A30D" },
  { category: "DevOps", icon: "git-branch", color: "#0D9488" },
  { category: "Default", icon: "folder-open", color: "#6B7280" } // Fallback
];
```

---

## API Endpoints

### 1. Get All Study Collections
**GET** `/api/collections`

Mengambil semua study collections milik user yang sedang login.

#### Headers
```
Authorization: Bearer {token}
```

#### Response Success (200)
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
      },
      {
        "id": "col_124",
        "userId": "user_456",
        "category": "Data Science",
        "title": "Data Science",
        "icon": "analytics",
        "color": "#7C3AED",
        "articlesCount": 3,
        "progress": 33,
        "createdAt": "2025-12-05T08:00:00Z",
        "updatedAt": "2025-12-10T12:00:00Z"
      }
    ]
  }
}
```

#### Response Error (401)
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

### 2. Get Collection Details with Articles
**GET** `/api/collections/{collectionId}`

Mengambil detail collection beserta list artikel yang di-bookmark.

#### Headers
```
Authorization: Bearer {token}
```

#### Response Success (200)
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
        "authors": ["John Doe"],
        "year": 2024,
        "abstract": "This paper introduces...",
        "category": "Machine Learning",
        "isRead": true,
        "bookmarkedAt": "2025-12-01T10:00:00Z",
        "lastReadAt": "2025-12-05T14:00:00Z"
      },
      {
        "id": "art_790",
        "title": "Deep Learning Fundamentals",
        "authors": ["Jane Smith"],
        "year": 2024,
        "abstract": "An overview of...",
        "category": "Machine Learning",
        "isRead": false,
        "bookmarkedAt": "2025-12-03T11:00:00Z",
        "lastReadAt": null
      }
    ]
  }
}
```

#### Response Error (404)
```json
{
  "success": false,
  "error": "Collection not found"
}
```

---

### 3. Bookmark Article (Auto-create/update Collection)
**POST** `/api/bookmarks`

Bookmark artikel dan otomatis menambahkannya ke collection yang sesuai atau membuat collection baru.

#### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body
```json
{
  "articleId": "art_789"
}
```

#### Backend Process:
1. Ambil data artikel untuk mendapatkan `category`
2. Cek apakah user sudah punya collection dengan `category` tersebut
3. **Jika collection ada:**
   - Tambahkan artikel ke collection
   - Update `articlesCount`
   - Update `updatedAt`
4. **Jika collection tidak ada:**
   - Buat collection baru
   - Set icon & color dari category mapping
   - Tambahkan artikel pertama

#### Response Success (201)
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

#### Response Error (400)
```json
{
  "success": false,
  "error": "Article already bookmarked"
}
```

---

### 4. Un-bookmark Article (Auto-cleanup Collection)
**DELETE** `/api/bookmarks/{articleId}`

Un-bookmark artikel dan otomatis menghapus dari collection, serta cleanup collection jika kosong.

#### Headers
```
Authorization: Bearer {token}
```

#### Backend Process:
1. Hapus artikel dari bookmarks user
2. Hapus artikel dari collection
3. Update `articlesCount` di collection
4. **Jika articlesCount = 0:**
   - Hapus collection otomatis
5. **Jika articlesCount > 0:**
   - Update `progress`
   - Update `updatedAt`

#### Response Success (200)
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

#### Response with Collection Deleted (200)
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

---

### 5. Mark Article as Read
**POST** `/api/collections/{collectionId}/articles/{articleId}/read`

Menandai artikel sebagai sudah dibaca dan update progress collection.

#### Headers
```
Authorization: Bearer {token}
```

#### Backend Process:
1. Update `isRead = true` untuk artikel tersebut
2. Set `lastReadAt` timestamp
3. Recalculate `progress` untuk collection
4. Update `updatedAt` collection

#### Response Success (200)
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

---

### 6. Get Category Mappings
**GET** `/api/collections/category-mappings`

Mengambil predefined category mappings untuk icon dan color.

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "mappings": [
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

---

## Database Schema Recommendations

### Table: `study_collections`
```sql
CREATE TABLE study_collections (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  articles_count INT DEFAULT 0,
  progress DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_user_category (user_id, category),
  INDEX idx_user_id (user_id)
);
```

### Table: `collection_articles`
```sql
CREATE TABLE collection_articles (
  id VARCHAR(255) PRIMARY KEY,
  collection_id VARCHAR(255) NOT NULL,
  article_id VARCHAR(255) NOT NULL,
  bookmarked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMP NULL,

  UNIQUE KEY unique_collection_article (collection_id, article_id),
  FOREIGN KEY (collection_id) REFERENCES study_collections(id) ON DELETE CASCADE,
  INDEX idx_collection_id (collection_id)
);
```

---

## Implementation Notes

### 1. Progress Calculation Logic
```
progress = (count of articles where is_read = true) / articles_count * 100
```

### 2. Category Normalization
- Normalize category names (trim, lowercase comparison)
- Handle missing categories → gunakan "Default" mapping

### 3. Concurrency Handling
- Handle race conditions saat multiple bookmarks dengan kategori baru secara bersamaan
- Use database transactions untuk bookmark operations

### 4. Performance Optimization
- Cache category mappings di memory
- Index pada `user_id` dan `category` untuk query cepat

---

## Frontend Integration Points

### File yang Perlu Update:
1. **`services/api.ts`** - Tambahkan API calls untuk collections
2. **`hooks/useStudyCollections.ts`** - Custom hook untuk fetch collections (buat baru)
3. **`app/(tabs)/learn.tsx`** - Replace mock data dengan real API
4. **`features/learn/components/StudyCollectionCard.tsx`** - Pastikan compatible dengan data struktur API

### Expected Behavior di Frontend:
1. Fetch collections saat screen focus
2. Show loading state saat fetch
3. Show empty state jika tidak ada collections
4. Refresh collections setelah bookmark/un-bookmark artikel
5. Navigate ke collection detail saat card di-press

---

## Testing Scenarios

### Test Case 1: First Bookmark
- User bookmark artikel pertama dengan kategori "Machine Learning"
- **Expected:** Collection baru dibuat dengan articlesCount = 1, progress = 0

### Test Case 2: Bookmark Same Category
- User bookmark artikel kedua dengan kategori yang sama
- **Expected:** Artikel ditambahkan ke collection yang ada, articlesCount = 2

### Test Case 3: Bookmark Different Category
- User bookmark artikel dengan kategori baru
- **Expected:** Collection baru dibuat untuk kategori tersebut

### Test Case 4: Mark as Read
- User membaca 1 dari 2 artikel dalam collection
- **Expected:** Progress = 50

### Test Case 5: Un-bookmark Last Article
- User un-bookmark artikel terakhir dalam collection
- **Expected:** Collection otomatis dihapus

### Test Case 6: Un-bookmark One of Many
- User un-bookmark 1 artikel, masih ada artikel lain
- **Expected:** articlesCount berkurang, collection tetap ada

---

## Questions for Backend Team

1. **Article Category Source:**
   - Apakah setiap artikel sudah punya field `category`?
   - Jika artikel tidak punya category, gunakan "Default"?

2. **User Authentication:**
   - Sistem auth sudah pakai JWT/Bearer token?

3. **Read Status Tracking:**
   - Apakah sudah ada mekanisme track artikel yang sudah dibaca user?
   - Atau perlu ditambahkan endpoint baru untuk mark as read?

4. **Category Customization:**
   - Apakah user boleh mengubah icon/color collection?
   - Atau stick dengan predefined mappings?

5. **Pagination:**
   - Untuk collection dengan banyak artikel, perlu pagination di endpoint detail?

---

## Version History
- **v1.0** (2025-12-11): Initial documentation
