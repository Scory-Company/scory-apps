# 🐛 Backend Bug Report: Personalization Topic Interests

**Date:** November 25, 2025
**Priority:** 🔴 HIGH - Blocking Personalization Feature
**Status:** ❌ Backend Bug - Needs Immediate Fix
**Reporter:** Frontend Team (Habdil)

---

## 📋 Summary

The `POST /api/v1/personalization/topics` endpoint is failing with a **500 Internal Server Error** due to a foreign key constraint violation. The backend is incorrectly expecting **Topic IDs** when it should accept **Category IDs**.

---

## 🔴 Current Error

### Frontend Error Log
```
ERROR [Personalization API] ❌ Error saving personalization
ERROR [Personalization API] Error: Request failed with status code 500
```

### Backend Error Log
```
Set topic interests error: PrismaClientKnownRequestError:
Invalid `prisma.userTopicInterest.createMany()` invocation in
E:\01_KULIAH\SEMESTER 5\Pengembangan Aplikasi Bergerak\scory\scory-backend\src\services\personalizationService.ts:53:34

Foreign key constraint violated on the constraint: `user_topic_interests_topic_id_fkey`

Error Code: P2003
Meta: {
  modelName: 'UserTopicInterest',
  constraint: 'user_topic_interests_topic_id_fkey'
}
```

---

## 🔍 Root Cause Analysis

### The Problem

**Frontend sends Category IDs:**
```json
{
  "topicIds": [
    "54d0e37a-1e04-4268-82c2-0c2c8602983c",  // Health Category
    "59cdb5f1-7b60-4d84-b2dc-2785201b16d2",  // Technology Category
    "c092c2fa-b47c-47e0-891f-f6a88c6f10cf"   // Science Category
  ]
}
```

**Backend tries to insert into:**
```sql
user_topic_interests (
  user_id,
  topic_id  -- ❌ WRONG: Expects topic IDs, but receives category IDs
)
```

**Foreign key constraint fails because:**
- Category IDs don't exist in the `topics` table
- They exist in the `categories` table

### Why Frontend Sends Category IDs

The Personalization screen UI shows **8 main categories**:
- Science
- Health
- Technology
- Business
- Finance
- Education
- Environment
- Social

Users select from these **categories**, NOT from specific topics like "Climate Change" or "Artificial Intelligence".

---

## ✅ Required Fix

### Option 1: Change Database Schema (RECOMMENDED)

Rename table and change foreign key to use `category_id` instead of `topic_id`.

#### 1.1. Database Migration

```sql
-- Step 1: Rename table
ALTER TABLE user_topic_interests
RENAME TO user_category_interests;

-- Step 2: Rename column
ALTER TABLE user_category_interests
RENAME COLUMN topic_id TO category_id;

-- Step 3: Drop old foreign key constraint
ALTER TABLE user_category_interests
DROP CONSTRAINT user_topic_interests_topic_id_fkey;

-- Step 4: Add new foreign key constraint
ALTER TABLE user_category_interests
ADD CONSTRAINT user_category_interests_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES categories(id)
ON DELETE CASCADE;

-- Step 5: Update indexes
DROP INDEX IF EXISTS idx_user_topic_interests_user_id;
DROP INDEX IF EXISTS idx_user_topic_interests_topic_id;

CREATE INDEX idx_user_category_interests_user_id
ON user_category_interests(user_id);

CREATE INDEX idx_user_category_interests_category_id
ON user_category_interests(category_id);
```

#### 1.2. Prisma Schema Update

**File:** `prisma/schema.prisma`

**Before (WRONG):**
```prisma
model UserTopicInterest {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  topicId   String   @map("topic_id")
  createdAt DateTime @default(now()) @map("created_at")

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  topic Topic @relation(fields: [topicId], references: [id], onDelete: Cascade)

  @@unique([userId, topicId])
  @@map("user_topic_interests")
}
```

**After (CORRECT):**
```prisma
model UserCategoryInterest {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  categoryId String   @map("category_id")
  createdAt  DateTime @default(now()) @map("created_at")

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@unique([userId, categoryId])
  @@map("user_category_interests")
}
```

**Also update Category model:**
```prisma
model Category {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  // ... other fields ...

  // Add this relation
  userInterests UserCategoryInterest[]
}
```

**And User model:**
```prisma
model User {
  id       String   @id @default(uuid())
  email    String   @unique
  // ... other fields ...

  // Update this relation name
  categoryInterests UserCategoryInterest[]  // Changed from topicInterests
}
```

#### 1.3. Service Update

**File:** `src/services/personalizationService.ts`

**Before (WRONG):**
```typescript
export const setTopicInterests = async (
  userId: string,
  topicIds: string[]
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    // Delete old interests
    await tx.userTopicInterest.deleteMany({
      where: { userId },
    });

    // Create new interests
    await tx.userTopicInterest.createMany({
      data: topicIds.map((topicId) => ({
        userId,
        topicId,  // ❌ WRONG
      })),
    });
  });
};
```

**After (CORRECT):**
```typescript
export const setCategoryInterests = async (
  userId: string,
  categoryIds: string[]
): Promise<void> => {
  // Validate that category IDs exist
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });

  if (categories.length !== categoryIds.length) {
    const foundIds = categories.map(c => c.id);
    const missingIds = categoryIds.filter(id => !foundIds.includes(id));
    throw new Error(`Category IDs not found: ${missingIds.join(', ')}`);
  }

  // Perform transaction
  await prisma.$transaction(async (tx) => {
    // Delete old interests
    await tx.userCategoryInterest.deleteMany({
      where: { userId },
    });

    // Create new interests
    await tx.userCategoryInterest.createMany({
      data: categoryIds.map((categoryId) => ({
        userId,
        categoryId,  // ✅ CORRECT
      })),
    });
  });
};
```

#### 1.4. Controller Update

**File:** `src/controllers/personalizationController.ts`

**Before (WRONG):**
```typescript
export const setTopicInterestsHandler = async (req: Request, res: Response) => {
  const { topicIds } = req.body;
  const userId = req.user.id;

  await setTopicInterests(userId, topicIds);  // ❌ WRONG function name

  res.json({
    success: true,
    message: 'Topic interests saved successfully',
  });
};
```

**After (CORRECT):**
```typescript
export const setTopicInterestsHandler = async (req: Request, res: Response) => {
  const { topicIds } = req.body;  // Keep param name for backward compatibility
  const userId = req.user.id;

  // Validate minimum 3 categories
  if (!topicIds || topicIds.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [
        {
          field: 'topicIds',
          message: 'At least 3 category IDs are required',
        },
      ],
    });
  }

  try {
    await setCategoryInterests(userId, topicIds);  // ✅ CORRECT function name

    res.json({
      success: true,
      message: 'Topic interests saved successfully',
      data: await getUserCategoryInterests(userId),  // Return saved data
    });
  } catch (error: any) {
    if (error.message.includes('Category IDs not found')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    throw error;
  }
};
```

#### 1.5. Add GET Endpoint for Category Interests

**File:** `src/services/personalizationService.ts`

```typescript
export const getUserCategoryInterests = async (userId: string) => {
  return await prisma.userCategoryInterest.findMany({
    where: { userId },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
};
```

**File:** `src/controllers/personalizationController.ts`

```typescript
export const getTopicInterestsHandler = async (req: Request, res: Response) => {
  const userId = req.user.id;

  const interests = await getUserCategoryInterests(userId);

  res.json({
    success: true,
    message: 'Topic interests retrieved successfully',
    data: interests,
  });
};
```

---

### Option 2: Frontend Changes (NOT RECOMMENDED)

Frontend would need to fetch **topics** instead of **categories**, but this doesn't match the UI design where users select broad categories, not specific topics.

**Why this is bad:**
- UX confusion: Users expect to select "Science", not "Climate Change"
- More API calls needed
- Doesn't match the Personalization quiz flow

---

## 🧪 Testing After Fix

### Test Case 1: Valid Category IDs

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/personalization/topics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicIds": [
      "54d0e37a-1e04-4268-82c2-0c2c8602983c",
      "59cdb5f1-7b60-4d84-b2dc-2785201b16d2",
      "c092c2fa-b47c-47e0-891f-f6a88c6f10cf"
    ]
  }'
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Topic interests saved successfully",
  "data": [
    {
      "id": "...",
      "userId": "...",
      "categoryId": "54d0e37a-1e04-4268-82c2-0c2c8602983c",
      "category": {
        "id": "54d0e37a-1e04-4268-82c2-0c2c8602983c",
        "name": "Health",
        "slug": "health"
      },
      "createdAt": "2025-11-25T10:30:00.000Z"
    }
  ]
}
```

### Test Case 2: Invalid Category ID

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/personalization/topics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicIds": [
      "invalid-uuid-1",
      "invalid-uuid-2",
      "invalid-uuid-3"
    ]
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Category IDs not found: invalid-uuid-1, invalid-uuid-2, invalid-uuid-3"
}
```

### Test Case 3: Less Than 3 Categories

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/personalization/topics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topicIds": [
      "54d0e37a-1e04-4268-82c2-0c2c8602983c"
    ]
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "topicIds",
      "message": "At least 3 category IDs are required"
    }
  ]
}
```

---

## 📊 Impact Analysis

### Current State
- ❌ Personalization feature completely blocked
- ❌ Users cannot save their preferences
- ❌ 500 error on production

### After Fix
- ✅ Users can complete onboarding quiz
- ✅ Category interests saved correctly
- ✅ "For You" feed can use personalization data
- ✅ No more foreign key errors

---

## 📝 Summary of Changes

| File | Action | Description |
|------|--------|-------------|
| Database | Migration | Rename table, change foreign key |
| `prisma/schema.prisma` | Update | Change model and relations |
| `personalizationService.ts` | Refactor | Use `categoryId` instead of `topicId` |
| `personalizationController.ts` | Update | Add validation, error handling |

---

## ⏰ Timeline

**Estimated Time:** 30-45 minutes

1. **Database Migration:** 10 minutes
2. **Prisma Schema Update:** 5 minutes
3. **Service & Controller Update:** 15 minutes
4. **Testing:** 10 minutes
5. **Deployment:** 5 minutes

---

## 🔗 Related Documentation

- Frontend API Integration: `docs/API_PERSONALIZATION_BACKEND_SPEC.md`
- Frontend Implementation: `app/personalization.tsx` (lines 168-203)
- Frontend Service: `services/personalization.ts`

---

## 📞 Contact

**Frontend Team Lead:** Habdil
**Project:** Scory Apps - Academic Journals Reader
**Sprint:** API Integration Sprint 1

For questions or clarification, please reach out to the frontend team.

---

## ✅ Acceptance Criteria

Fix is considered complete when:

1. ✅ Database migration successfully applied
2. ✅ Prisma schema updated and migrated
3. ✅ Service functions use `categoryId`
4. ✅ Controller validates minimum 3 categories
5. ✅ Error messages are clear and helpful
6. ✅ All test cases pass
7. ✅ Frontend can save personalization without 500 errors
8. ✅ GET endpoint returns saved category interests

---

**Priority:** 🔴 **URGENT - BLOCKING**
**Status:** 🔧 **Awaiting Backend Fix**
**Last Updated:** November 25, 2025
