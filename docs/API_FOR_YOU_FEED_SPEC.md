# For You Feed API - Backend Specification

**Date:** November 25, 2025
**Priority:** 🟡 MEDIUM (After personalization bug fix)
**Status:** 📝 Specification - Not Implemented Yet

---

## 📋 Overview

The "For You" Feed API provides personalized article recommendations based on:
1. User's reading level (from personalization)
2. User's category interests (from topic interests)
3. Article popularity and recency

This endpoint powers the **ForYouSection** component on the Home screen.

---

## 🎯 Business Logic

### Personalization Algorithm

```
For each user:
  1. Get user's reading level (SIMPLE, STUDENT, ACADEMIC, EXPERT)
  2. Get user's category interests (minimum 3 categories)
  3. Query articles WHERE:
     - categoryId IN user's interested categories
     - difficulty = user's reading level
     - isPublished = true
     - isActive = true
  4. Order by:
     - viewCount DESC (popular articles first)
     - createdAt DESC (recent articles)
  5. Return top 10 articles
```

### Fallback Behavior

If user has no personalization:
- Return popular articles from all categories
- Mixed difficulty levels
- Encourage user to complete personalization

---

## 🔧 Endpoint Specification

### Get Personalized Feed

**Endpoint:** `GET /api/v1/articles/for-you`

**Authentication:** Required (JWT Bearer token)

**Description:** Returns personalized article recommendations based on user's reading level and category interests.

#### Request Headers
```http
Authorization: Bearer <jwt_token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 10 | Number of articles per page (max 50) |

#### Example Request
```bash
curl -X GET 'http://localhost:5000/api/v1/articles/for-you?page=1&limit=10' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ✅ Response (Success - 200 OK)

### Case 1: User Has Personalization

```json
{
  "success": true,
  "message": "Personalized articles retrieved successfully",
  "data": {
    "articles": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Introduction to Machine Learning",
        "slug": "intro-machine-learning",
        "description": "A beginner-friendly guide to understanding ML concepts",
        "imageUrl": "https://images.example.com/ml-intro.jpg",
        "authorId": "author-uuid",
        "authorName": "Dr. Sarah Johnson",
        "categoryId": "tech-category-uuid",
        "category": {
          "id": "tech-category-uuid",
          "name": "Technology",
          "slug": "technology"
        },
        "difficulty": "STUDENT",
        "readingLevel": "student",
        "viewCount": 2500,
        "rating": 4.7,
        "createdAt": "2025-11-20T10:00:00.000Z",
        "updatedAt": "2025-11-24T15:30:00.000Z"
      },
      {
        "id": "660f9511-f39c-52e5-b827-557766551001",
        "title": "Understanding Climate Change",
        "slug": "understanding-climate-change",
        "description": "Explore the science behind global warming",
        "imageUrl": "https://images.example.com/climate.jpg",
        "authorId": "author-uuid-2",
        "authorName": "Prof. James Lee",
        "categoryId": "science-category-uuid",
        "category": {
          "id": "science-category-uuid",
          "name": "Science",
          "slug": "science"
        },
        "difficulty": "STUDENT",
        "readingLevel": "student",
        "viewCount": 1800,
        "rating": 4.5,
        "createdAt": "2025-11-18T08:00:00.000Z",
        "updatedAt": "2025-11-22T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    },
    "personalization": {
      "readingLevel": "STUDENT",
      "categoryInterests": ["Technology", "Science", "Health"],
      "isPersonalized": true
    }
  }
}
```

### Case 2: User Has No Personalization

```json
{
  "success": true,
  "message": "Popular articles retrieved (complete personalization for better recommendations)",
  "data": {
    "articles": [
      {
        "id": "article-uuid",
        "title": "Most Popular Article",
        "slug": "most-popular",
        "imageUrl": "https://...",
        "category": { "name": "General" },
        "difficulty": "STUDENT",
        "viewCount": 5000,
        "rating": 4.8
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    },
    "personalization": {
      "readingLevel": null,
      "categoryInterests": [],
      "isPersonalized": false
    }
  }
}
```

---

## ❌ Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": ["No token provided"]
}
```

### 400 Bad Request (Invalid Parameters)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "limit",
      "message": "Limit must be between 1 and 50"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve articles",
  "errors": ["Database connection error"]
}
```

---

## 🔧 Backend Implementation Guide

### Step 1: Service Function

```typescript
// services/articlesService.ts

export const getForYouArticles = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<any> => {
  // 1. Get user's personalization
  const personalization = await prisma.userPersonalization.findUnique({
    where: { userId }
  });

  // 2. Get user's category interests
  const categoryInterests = await prisma.userCategoryInterest.findMany({
    where: { userId },
    include: { category: true }
  });

  // 3. Build query filters
  const whereClause: any = {
    isPublished: true,
    isActive: true
  };

  // If user has personalization, apply filters
  if (personalization && categoryInterests.length > 0) {
    whereClause.categoryId = {
      in: categoryInterests.map(ci => ci.categoryId)
    };
    whereClause.difficulty = personalization.readingLevel;
  }

  // 4. Query articles
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            fullName: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { viewCount: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.article.count({ where: whereClause })
  ]);

  // 5. Transform response
  return {
    articles: articles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      description: article.description,
      imageUrl: article.imageUrl,
      authorId: article.author.id,
      authorName: article.author.fullName,
      categoryId: article.category.id,
      category: article.category,
      difficulty: article.difficulty,
      readingLevel: article.difficulty?.toLowerCase(),
      viewCount: article.viewCount,
      rating: article.rating,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    },
    personalization: {
      readingLevel: personalization?.readingLevel || null,
      categoryInterests: categoryInterests.map(ci => ci.category.name),
      isPersonalized: !!(personalization && categoryInterests.length > 0)
    }
  };
};
```

### Step 2: Controller

```typescript
// controllers/articlesController.ts

export const getForYouArticlesHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user.id;  // From JWT middleware
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    // Validate parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be greater than 0'
      });
    }

    const result = await getForYouArticles(userId, page, limit);

    res.json({
      success: true,
      message: result.personalization.isPersonalized
        ? 'Personalized articles retrieved successfully'
        : 'Popular articles retrieved (complete personalization for better recommendations)',
      data: result
    });
  } catch (error) {
    console.error('Error getting for-you articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve articles',
      errors: [error.message]
    });
  }
};
```

### Step 3: Route

```typescript
// routes/articles.routes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getForYouArticlesHandler } from '../controllers/articlesController';

const router = Router();

// GET /api/v1/articles/for-you
router.get('/for-you', authenticate, getForYouArticlesHandler);

export default router;
```

---

## 📊 Database Schema Requirements

### Articles Table

Must have these fields:
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  author_id UUID REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  difficulty VARCHAR(20),  -- 'SIMPLE', 'STUDENT', 'ACADEMIC', 'EXPERT'
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_articles_category_difficulty ON articles(category_id, difficulty);
CREATE INDEX idx_articles_view_count ON articles(view_count DESC);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
```

### User Personalization (Already exists)
```sql
CREATE TABLE user_personalizations (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  reading_level VARCHAR(20) NOT NULL,  -- 'SIMPLE', 'STUDENT', 'ACADEMIC', 'EXPERT'
  purpose VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### User Category Interests (After bug fix)
```sql
CREATE TABLE user_category_interests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);
```

---

## 🧪 Testing

### Test Case 1: User with Full Personalization

**Setup:**
- User has reading level: `STUDENT`
- User interested in: `Technology`, `Science`, `Health`

**Request:**
```bash
GET /api/v1/articles/for-you?page=1&limit=5
Authorization: Bearer <token>
```

**Expected:**
- Articles ONLY from Technology, Science, Health categories
- Articles ONLY with difficulty = `STUDENT`
- Ordered by viewCount DESC, createdAt DESC
- `isPersonalized: true`

### Test Case 2: User without Personalization

**Setup:**
- User has NO reading level
- User has NO category interests

**Request:**
```bash
GET /api/v1/articles/for-you?page=1&limit=5
Authorization: Bearer <token>
```

**Expected:**
- Articles from ALL categories
- Mixed difficulty levels
- Ordered by viewCount DESC (most popular)
- `isPersonalized: false`

### Test Case 3: Pagination

**Request:**
```bash
GET /api/v1/articles/for-you?page=2&limit=10
```

**Expected:**
- Skip first 10 articles
- Return next 10 articles
- `pagination.page = 2`
- `pagination.hasPrev = true`

---

## 🔗 Related APIs

### Dependencies
1. `GET /api/v1/personalization` - Get user's reading level
2. `GET /api/v1/personalization/topics` - Get user's category interests
3. `GET /api/v1/categories` - Categories reference

### Frontend Integration
- **Component:** `features/home/components/ForYouSection.tsx`
- **Service:** `services/articles.ts` (needs new function)
- **Usage:** Home screen after user completes personalization

---

## 📝 Frontend Integration Example

```typescript
// services/articles.ts
export const articlesApi = {
  // ... existing methods

  // NEW: Get personalized "For You" feed
  getForYou: (params: { page?: number; limit?: number }) =>
    api.get('/articles/for-you', { params }),
};

// ForYouSection.tsx
const [articles, setArticles] = useState([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  fetchForYouArticles();
}, [readingLevel]);

const fetchForYouArticles = async () => {
  try {
    setIsLoading(true);
    const response = await articlesApi.getForYou({ page: 1, limit: 5 });
    const articlesData = response.data?.data?.articles || [];
    setArticles(articlesData);
  } catch (error) {
    console.error('Failed to fetch For You articles');
    // Fallback to mock data
  } finally {
    setIsLoading(false);
  }
};
```

---

## ⏰ Implementation Priority

**Phase 1: MVP (After personalization bug fix)**
- ✅ Basic filtering by category + reading level
- ✅ Order by viewCount + createdAt
- ✅ Pagination support
- ✅ Fallback to popular articles

**Phase 2: Enhancement (Future)**
- ⏳ Machine learning recommendations
- ⏳ Collaborative filtering (users with similar interests)
- ⏳ Track user interactions (clicks, reads)
- ⏳ A/B testing for recommendation algorithms

---

## 📞 Contact

**Frontend Team:** Habdil
**Project:** Scory Apps
**Sprint:** API Integration Sprint 1

For questions, contact frontend or backend team leads.

---

**Status:** 📝 **SPEC READY - Awaiting Backend Implementation**
**Priority:** 🟡 **MEDIUM** (After personalization topics bug fix)
**Estimated Time:** 2-3 hours

---

**Last Updated:** November 25, 2025
