# Popular Articles API - Backend Request

## Overview

Request untuk membuat **dedicated endpoint** untuk menampilkan artikel-artikel paling populer dengan algoritma yang lebih baik dan informasi yang lebih lengkap.

---

## Current Implementation Issues

Saat ini, frontend menggunakan endpoint `/articles?sort=popular` yang memiliki beberapa kekurangan:

1. **Tidak optimal** - Menggunakan endpoint general articles dengan parameter sort
2. **Tidak transparan** - Frontend tidak tahu algoritma apa yang digunakan untuk menentukan "popular"
3. **Kurang informasi** - Tidak ada metadata seperti popularity score, rank, atau trending indicator
4. **Performance** - Sulit untuk di-cache karena mixed dengan endpoint articles biasa

---

## Requested Endpoint

### **Endpoint Baru**

```
GET /api/v1/articles/popular
```

### **Query Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Halaman pagination |
| `limit` | number | No | 20 | Jumlah artikel per halaman |
| `timeframe` | string | No | 'all' | Timeframe untuk popularity: `'7d'`, `'30d'`, `'all'` |

**Contoh Request:**
```
GET /api/v1/articles/popular?page=1&limit=20&timeframe=30d
```

---

## Response Structure

### **Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Popular articles retrieved successfully",
  "data": {
    "articles": [
      {
        "id": "article-uuid-123",
        "title": "Understanding Machine Learning Basics",
        "slug": "understanding-machine-learning-basics",
        "excerpt": "A comprehensive guide to getting started with ML...",
        "imageUrl": "https://cdn.scory.app/images/article-123.jpg",
        "authorName": "John Doe",
        "authorAvatar": "https://cdn.scory.app/avatars/john-doe.jpg",
        "category": {
          "id": "cat-uuid-456",
          "name": "Technology",
          "slug": "technology"
        },
        "rating": 4.5,
        "totalRatings": 1234,
        "viewCount": 50000,
        "popularityScore": 85.5,
        "popularityRank": 1,
        "readTimeMinutes": 5,
        "publishedAt": "2025-11-20T10:00:00.000Z",
        "isFeatured": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    },
    "meta": {
      "algorithm": "weighted_score",
      "timeframe": "30d",
      "lastUpdated": "2025-11-27T08:00:00.000Z"
    }
  }
}
```

### **Error Response (4xx/5xx)**

```json
{
  "success": false,
  "message": "Error message here",
  "error": {
    "code": "INVALID_PARAMETER",
    "details": "Timeframe must be one of: 7d, 30d, all"
  }
}
```

---

## New Fields Explanation

### `popularityScore` (number)
- **Range:** 0-100
- **Description:** Skor popularitas berdasarkan algoritma weighted score
- **Purpose:** Memberikan indikator numerik seberapa populer artikel tersebut

### `popularityRank` (number)
- **Description:** Ranking artikel dalam list popular (1 = paling populer)
- **Purpose:** Untuk menampilkan badge "Top 10", "Trending #1", dll

### `meta.algorithm` (string)
- **Description:** Nama algoritma yang digunakan untuk menghitung popularity
- **Purpose:** Transparansi untuk debugging dan analytics

### `meta.timeframe` (string)
- **Description:** Timeframe yang digunakan untuk kalkulasi
- **Purpose:** Membedakan trending vs all-time popular

### `meta.lastUpdated` (ISO 8601 datetime)
- **Description:** Kapan terakhir kali popularity score di-update
- **Purpose:** Untuk caching strategy di frontend

---

## Recommended Popularity Algorithm

### **Weighted Score Formula**

```
popularityScore = normalize(
  (viewCount * 0.4) +
  (rating * totalRatings * 0.3) +
  (recentViews * 0.3)
) * decayFactor
```

### **Components:**

1. **View Count (40%)** - Total views all-time
   - Menunjukkan engagement level

2. **Rating × Total Ratings (30%)** - Quality indicator
   - `rating * totalRatings` untuk menghindari artikel dengan 5 star tapi cuma 1 vote

3. **Recent Views (30%)** - Trending indicator
   - Views dalam `timeframe` yang dipilih (7d, 30d)

4. **Decay Factor** - Time-based decay
   - Artikel lama (>6 bulan) mendapat penalty 0.7-0.9
   - Artikel baru (<1 bulan) mendapat boost 1.1-1.2
   - Agar fresh content tetap punya kesempatan

### **Normalization**
- Scale hasil ke range 0-100 untuk consistency

---

## Implementation Notes

### **Database Optimization**

1. **Create Index:**
```sql
CREATE INDEX idx_articles_popularity
ON articles (view_count DESC, rating DESC, published_at DESC);
```

2. **Materialized View (Optional):**
```sql
CREATE MATERIALIZED VIEW popular_articles_cache AS
SELECT
  id,
  title,
  slug,
  -- ... other fields
  calculate_popularity_score(view_count, rating, total_ratings, published_at) as popularity_score
FROM articles
ORDER BY popularity_score DESC;

-- Refresh setiap 1 jam
```

### **Caching Strategy**

- Cache hasil selama **15 menit** untuk mengurangi load
- Invalidate cache saat ada article baru yang masuk top 20
- Gunakan Redis untuk distributed caching

### **Performance Target**

- Response time: < 200ms (P95)
- Support up to 1000 req/min
- Cache hit rate: > 90%

---

## Example Usage (Frontend)

### **Current (Suboptimal)**
```typescript
// Using general articles endpoint
const response = await api.get('/articles', {
  params: { sort: 'popular', page: 1, limit: 50 }
});
```

### **New (Recommended)**
```typescript
// Using dedicated popular endpoint
const response = await api.get('/articles/popular', {
  params: {
    page: 1,
    limit: 20,
    timeframe: '30d' // Get trending in last 30 days
  }
});

// Access popularity metadata
const { popularityScore, popularityRank } = response.data.articles[0];
console.log(`Article ranked #${popularityRank} with score ${popularityScore}`);
```

---

## Benefits

✅ **Better Performance** - Dedicated endpoint dapat di-optimize dan di-cache lebih agresif

✅ **More Informative** - Frontend mendapat data `popularityScore` dan `popularityRank` untuk UI yang lebih rich

✅ **Flexible Sorting** - Parameter `timeframe` memungkinkan tampilan "Trending This Week" vs "All-Time Popular"

✅ **Transparent Algorithm** - Frontend tahu bagaimana popularity dihitung lewat `meta.algorithm`

✅ **Better UX** - Bisa tampilkan badge "Top 10", "Trending #1", progress bar popularity, dll

✅ **Scalable** - Dengan caching yang tepat, bisa handle traffic tinggi

---

## Priority

**Priority Level:** 🔴 **HIGH**

**Reasoning:**
- Popular articles adalah salah satu main feature di app
- Current implementation kurang optimal dan tidak scalable
- Improvement ini akan significantly enhance user experience

---

## Timeline Suggestion

- **Design & Review:** 1-2 days
- **Implementation:** 2-3 days
- **Testing & QA:** 1-2 days
- **Total:** ~1 week

---

## Questions?

Jika ada pertanyaan atau butuh klarifikasi lebih lanjut, silakan hubungi:
- **Frontend Team:** Habdil (Mobile App)
- **Meeting:** Bisa diskusi di daily standup atau buat meeting khusus

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Author:** Frontend Team (Mobile App)
