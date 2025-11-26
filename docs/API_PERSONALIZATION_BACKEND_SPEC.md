# Personalization API - Backend Implementation Specification

**Date:** November 25, 2025
**Status:** ✅ Backend IMPLEMENTED
**Priority:** HIGH
**Last Updated:** November 25, 2025 (Updated with actual backend endpoints)

---

## 📋 Overview

The Personalization API allows users to save their reading level preferences and topic interests after completing the onboarding quiz. This data will be used to personalize the "For You" feed and content recommendations.

### Frontend Status
- ✅ **Quiz Flow:** Complete with 3 questions
- ✅ **Topic Selection:** Users select minimum 3 categories
- ✅ **API Integration:** Ready to call backend endpoints
- ✅ **Data Format:** Sending correct UUIDs and reading levels
- ❌ **Endpoints:** Return 404 (not implemented)

---

## 🔧 Backend Endpoints (IMPLEMENTED ✅)

### 1. Save Reading Level Settings

**Endpoint:** `POST /api/v1/personalization`

**Authentication:** Required (JWT Bearer token)

**Description:** Saves the user's preferred reading level based on quiz results.

**⚠️ IMPORTANT CHANGES:**
- Endpoint path: `/personalization` (NOT `/personalization/settings`)
- Reading level must be **UPPERCASE**: `"SIMPLE"`, `"STUDENT"`, `"ACADEMIC"`, `"EXPERT"`
- Additional field: `purpose` (optional)

#### Request Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "readingLevel": "STUDENT",
  "purpose": "curious"
}
```

**Field Validation:**
- `readingLevel` (string, required)
  - Allowed values: `"SIMPLE"`, `"STUDENT"`, `"ACADEMIC"`, `"EXPERT"`
  - **Must be UPPERCASE** (case-sensitive)
  - Must be one of the four reading levels

- `purpose` (string, optional)
  - Free text describing user's purpose
  - Examples: `"curious"`, `"student"`, `"professional"`, `"researcher"`

#### Response (Success - 200 OK)
```json
{
  "success": true,
  "message": "Personalization saved successfully",
  "data": {
    "id": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "readingLevel": "STUDENT",
    "purpose": "curious",
    "createdAt": "2025-11-25T10:30:00.000Z",
    "updatedAt": "2025-11-25T10:30:00.000Z"
  }
}
```

#### Response (Error - 400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "readingLevel",
      "message": "readingLevel must be one of SIMPLE, STUDENT, ACADEMIC, EXPERT"
    }
  ]
}
```

#### Response (Error - 401 Unauthorized)
```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": ["Invalid or expired token"]
}
```

#### Database Schema Suggestion
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reading_level VARCHAR(20) NOT NULL CHECK (reading_level IN ('simple', 'student', 'academic', 'expert')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

---

### 2. Save Topic Interests

**Endpoint:** `POST /api/v1/personalization/topics`

**Authentication:** Required (JWT Bearer token)

**Description:** Saves the user's selected topic interests (minimum 3 topics required).

**⚠️ IMPORTANT CHANGES:**
- Endpoint path: `/personalization/topics` (NOT `/personalization/topic-interests`)
- Field name: `topicIds` (array of topic UUIDs)
- Old interests will be **REPLACED** (not appended)

#### Request Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "topicIds": [
    "54d0e37a-1e04-4268-82c2-0c2c8602983c",
    "59cdb5f1-7b60-4d84-b2dc-2785201b16d2",
    "c092c2fa-b47c-47e0-891f-f6a88c6f10cf"
  ]
}
```

**Field Validation:**
- `topicIds` (array of strings, required)
  - Must contain at least 3 valid category UUIDs
  - Each UUID must reference an existing category in `categories` table
  - Maximum recommended: 8 categories (all available)

#### Response (Success - 200 OK)
```json
{
  "success": true,
  "message": "Topic interests saved successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "categoryIds": [
      "54d0e37a-1e04-4268-82c2-0c2c8602983c",
      "59cdb5f1-7b60-4d84-b2dc-2785201b16d2",
      "c092c2fa-b47c-47e0-891f-f6a88c6f10cf"
    ],
    "count": 3,
    "updatedAt": "2025-11-25T10:30:00.000Z"
  }
}
```

#### Response (Error - 400 Bad Request - Insufficient Topics)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "At least 3 topic IDs are required"
  ]
}
```

#### Response (Error - 400 Bad Request - Invalid UUID)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Category with ID '54d0e37a-1e04-4268-82c2-0c2c8602983c' does not exist"
  ]
}
```

#### Response (Error - 401 Unauthorized)
```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": ["Invalid or expired token"]
}
```

#### Database Schema Suggestion
```sql
CREATE TABLE user_category_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

CREATE INDEX idx_user_category_interests_user_id ON user_category_interests(user_id);
CREATE INDEX idx_user_category_interests_category_id ON user_category_interests(category_id);
```

**Implementation Notes:**
- When saving new interests, **DELETE** old interests first, then insert new ones
- Use a transaction to ensure atomicity
- Validate all category UUIDs exist before deleting old data

**Example Transaction Flow:**
```sql
BEGIN;
  DELETE FROM user_category_interests WHERE user_id = $1;
  INSERT INTO user_category_interests (user_id, category_id)
  VALUES
    ($1, $2),
    ($1, $3),
    ($1, $4);
COMMIT;
```

---

## 🔄 Integration Flow

### User Journey
1. User opens app for the first time
2. Home screen shows "Personalize Your Experience" card
3. User clicks card → navigates to `/personalization`
4. User answers 3 quiz questions
5. User selects minimum 3 topics/categories
6. User sees recommended reading level result
7. User clicks "Get Started" button
8. Frontend calls:
   - `POST /personalization/settings` with reading level
   - `POST /personalization/topic-interests` with category UUIDs
9. Backend saves both settings
10. User returns to Home screen with personalized feed

### Frontend Implementation (Current)
```typescript
const handleConfirm = async () => {
  const recommendedLevel = calculateLevel(answers);

  try {
    // Save reading level
    await personalizationApi.saveSettings(recommendedLevel);

    // Save topic interests
    await personalizationApi.saveTopicInterests(selectedTopics);

    // Mark tutorial as seen locally
    await AsyncStorage.setItem('hasSeenPersonalizationTutorial', 'true');

    router.back();
  } catch (error) {
    console.error('Error saving personalization:', error);
  }
};
```

---

## 📊 Test Data Examples

### Example 1: Simple Reading Level + 3 Topics
**Reading Level Request:**
```json
{
  "readingLevel": "simple"
}
```

**Topic Interests Request:**
```json
{
  "topicIds": [
    "c092c2fa-b47c-47e0-891f-f6a88c6f10cf",  // Science
    "54d0e37a-1e04-4268-82c2-0c2c8602983c",  // Health
    "59cdb5f1-7b60-4d84-b2dc-2785201b16d2"   // Technology
  ]
}
```

### Example 2: Expert Reading Level + All Topics
**Reading Level Request:**
```json
{
  "readingLevel": "expert"
}
```

**Topic Interests Request:**
```json
{
  "topicIds": [
    "c092c2fa-b47c-47e0-891f-f6a88c6f10cf",  // Science
    "54d0e37a-1e04-4268-82c2-0c2c8602983c",  // Health
    "59cdb5f1-7b60-4d84-b2dc-2785201b16d2",  // Technology
    "7f9e4e0a-8b3c-4d2e-9a1f-5c6d7e8f9a0b",  // Business
    "8a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d",  // Finance
    "9b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e",  // Education
    "0c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f",  // Environment
    "1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a"   // Social
  ]
}
```

---

## 🧪 Testing Checklist for Backend

### Endpoint: POST /personalization/settings
- [ ] Returns 200 for valid reading level
- [ ] Returns 400 for invalid reading level (`"invalid"`)
- [ ] Returns 400 for missing `readingLevel` field
- [ ] Returns 401 for missing/invalid JWT token
- [ ] Updates existing record if user already has settings
- [ ] Creates new record if user doesn't have settings

### Endpoint: POST /personalization/topic-interests
- [ ] Returns 200 for valid category UUIDs (3+)
- [ ] Returns 400 for less than 3 category IDs
- [ ] Returns 400 for invalid/non-existent category UUID
- [ ] Returns 401 for missing/invalid JWT token
- [ ] Deletes old interests and inserts new ones
- [ ] Transaction rollback works if category validation fails

---

## 🚀 Current Frontend Test Results

### Categories Fetch (Success ✅)
```
LOG  [Personalization] Fetching categories...
LOG  [Personalization] ✅ Loaded categories: 8
```

### Save Personalization (404 ❌)
```
LOG  [Personalization API] 💾 Saving personalization...
LOG  [Personalization API] Reading level: student
LOG  [Personalization API] Selected topic IDs: [
  "54d0e37a-1e04-4268-82c2-0c2c8602983c",
  "59cdb5f1-7b60-4d84-b2dc-2785201b16d2",
  "c092c2fa-b47c-47e0-891f-f6a88c6f10cf"
]
ERROR [Personalization API] ❌ Error saving personalization
ERROR [Personalization API] Error: Request failed with status code 404
```

**Analysis:**
- ✅ Reading level correctly detected: `"student"`
- ✅ Topic IDs are valid UUIDs from database
- ❌ Endpoints not implemented (404)

---

## 📝 Implementation Priority

### Phase 1: Core Functionality (Required)
1. ✅ Implement `POST /personalization/settings`
2. ✅ Implement `POST /personalization/topic-interests`
3. ✅ Database migrations for `user_settings` and `user_category_interests`

### Phase 2: Retrieval (Nice to Have)
4. ⏳ Implement `GET /personalization/settings` (retrieve user's reading level)
5. ⏳ Implement `GET /personalization/topic-interests` (retrieve user's selected topics)

### Phase 3: Usage (Future)
6. ⏳ Use personalization data in "For You" feed algorithm
7. ⏳ Use reading level to filter article content difficulty

---

## 🔗 Related APIs

### Categories API (Already Implemented ✅)
- `GET /api/v1/categories` - Fetch all categories
- Used by frontend to display topic selection

### User Profile API (Already Implemented ✅)
- `GET /api/v1/users/profile` - Get user profile
- Used to retrieve authenticated user ID

---

## 📧 Questions or Issues?

**Frontend Developer:** Habdil
**Project:** Scory Apps - Academic Journals Reader
**Sprint:** API Integration Sprint 1

If you need clarification on any endpoint specification, please contact the frontend team.

---

## ✅ Acceptance Criteria

Backend implementation will be considered complete when:

1. ✅ Both POST endpoints return 200 for valid requests
2. ✅ Data is persisted in database correctly
3. ✅ JWT authentication is enforced
4. ✅ Input validation works as specified
5. ✅ Error responses match the documentation
6. ✅ Frontend can successfully save user preferences without 404 errors
7. ✅ Transaction handling ensures data consistency

---

**Last Updated:** November 25, 2025
**Version:** 1.0
**Status:** Waiting for Backend Implementation
