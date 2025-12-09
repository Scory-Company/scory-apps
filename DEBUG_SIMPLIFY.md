# 🐛 Debug Guide: Simplify Paper Flow

## Overview
This guide helps debug the "Article Not Found" issue after simplifying a paper.

## Debug Logs Added

### 1. **Simplify Workflow** ([useSimplifyPaper.ts](hooks/useSimplifyPaper.ts))
```
[🔍 SIMPLIFY DEBUG] Starting simplify workflow
[📋 STEP 1] Checking cache...
[📋 STEP 1] Cache check result: {...}
[✅ CACHE HIT] or [📝 STEP 2] Not in cache
[✅ SUCCESS] Returning articleId: xxx
```

### 2. **Navigation** ([useSimplifyPaper.ts](hooks/useSimplifyPaper.ts))
```
[🚀 NAVIGATE DEBUG] Starting simplify and navigate workflow
[📡 STEP 3] Fetching article details...
[📡 STEP 3] Article details received: {...}
[🎯 NAVIGATION] Navigating to: /article/{slug}
[✅ NAVIGATION] Navigation triggered successfully!
```

### 3. **Article Page** ([app/article/[slug].tsx](app/article/[slug].tsx))
```
[📄 ARTICLE PAGE] Fetching article...
[📄 ARTICLE PAGE] Slug/ID parameter: xxx
[🔍 ATTEMPT 1] Trying getBySlug...
[✅ SUCCESS] Article fetched by slug!
OR
[⚠️ ATTEMPT 1 FAILED] Slug fetch failed
[🔍 ATTEMPT 2] Trying getById...
[✅ SUCCESS] Article fetched by ID!
```

## How to Debug

### Step 1: Open React Native Debugger
```bash
# In your terminal, watch the logs
npx react-native log-android
# or
npx react-native log-ios
```

### Step 2: Trigger Simplify
1. Search for a paper
2. Click "Simplify" button
3. **Watch the console logs carefully**

### Step 3: Check Each Stage

#### Stage 1: Simplify Request
Look for:
```
[🔍 SIMPLIFY DEBUG] Starting simplify workflow
[🔍 SIMPLIFY DEBUG] Request: {
  "externalId": "...",
  "source": "...",
  "title": "..."
}
```

**Expected:** Request should have all required fields

#### Stage 2: Backend Response
Look for:
```
[📝 STEP 2] Simplify result: {
  "articleId": "123e4567-e89b-12d3-a456-426614174000",
  "isCached": false,
  "isNewSimplification": true
}
```

**Expected:** Should return a valid UUID articleId

#### Stage 3: Fetch Article Details
Look for:
```
[📡 STEP 3] Article details received: {
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "slug": "protist-literacy-novel-concept",
  "title": "Protist literacy: A novel concept...",
  "hasSlug": true
}
```

**Expected:** Should have a valid slug

#### Stage 4: Navigation
Look for:
```
[🎯 NAVIGATION] Navigating to: /article/protist-literacy-novel-concept
[🎯 NAVIGATION] Using SLUG: protist-literacy-novel-concept
```

**Expected:** Should navigate to slug, not ID

#### Stage 5: Article Page Fetch
Look for:
```
[📄 ARTICLE PAGE] Slug/ID parameter: protist-literacy-novel-concept
[🔍 ATTEMPT 1] Trying getBySlug...
[✅ SUCCESS] Article fetched by slug!
```

**Expected:** Should successfully fetch article

## Common Issues & Solutions

### Issue 1: Network Error
```
[❌ ERROR] Error message: Network Error
```

**Solution:**
- Backend server not running → Start backend
- Wrong IP address → Check `services/api.ts` line 6
- Timeout too short → Already increased to 60s

### Issue 2: Article ID but No Slug
```
[📡 STEP 3] Article details received: {
  "hasSlug": false
}
```

**Solution:**
- Backend not returning slug → Check backend `/simplify/{id}` endpoint
- Need to add slug generation in backend

### Issue 3: 404 on Article Fetch
```
[⚠️ ATTEMPT 1 FAILED] Slug fetch failed
[⚠️ ERROR] Status: 404
```

**Solution:**
- Article not found by slug → Check if article exists in DB
- Try getById (should auto-fallback)
- Check backend endpoint `/articles/by-id/{id}` exists

### Issue 4: Navigate to ID Instead of Slug
```
[🎯 NAVIGATION] Fallback path: /article/123e4567-e89b-12d3-a456-426614174000
```

**Solution:**
- Backend not returning slug in simplify response
- Check backend code for slug generation
- Verify article has slug in database

## Backend Requirements

### Endpoint: `POST /api/v1/simplify/external`
**Response must include:**
```json
{
  "success": true,
  "data": {
    "articleId": "uuid-here",
    "isNewSimplification": true,
    "isCached": false
  }
}
```

### Endpoint: `GET /api/v1/simplify/{articleId}`
**Response must include:**
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "uuid-here",
      "slug": "article-slug-here",  // ⚠️ REQUIRED!
      "title": "Article Title"
    }
  }
}
```

### Endpoint: `GET /api/v1/articles/by-id/{id}`
**Must be implemented!** This is the fallback endpoint.

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "slug": "article-slug",
    "title": "Article Title",
    "contents": [...]
  }
}
```

## Quick Test

Run this to verify your setup:

```bash
# 1. Check backend is running
curl http://192.168.1.53:5000/api/v1/simplify/health

# 2. Test simplify endpoint (replace with real data)
curl -X POST http://192.168.1.53:5000/api/v1/simplify/external \
  -H "Content-Type: application/json" \
  -d '{
    "externalId": "test-id",
    "source": "scholar",
    "title": "Test Paper",
    "authors": ["Test Author"],
    "year": 2024
  }'

# 3. Test get article by ID (use real articleId from step 2)
curl http://192.168.1.53:5000/api/v1/simplify/{articleId}

# 4. Test get article by ID endpoint
curl http://192.168.1.53:5000/api/v1/articles/by-id/{articleId}
```

## Files Modified

1. ✅ [services/api.ts](services/api.ts#L15) - Timeout increased to 60s
2. ✅ [services/articles.ts](services/articles.ts#L107-108) - Added `getById` function
3. ✅ [services/simplifyApi.ts](services/simplifyApi.ts#L156-176) - Added detailed logging
4. ✅ [hooks/useSimplifyPaper.ts](hooks/useSimplifyPaper.ts) - Added debug logs + fetch slug before navigate
5. ✅ [app/article/[slug].tsx](app/article/[slug].tsx#L59-129) - Added fallback to getById + logging

## Next Steps

1. **Run the app** with React Native debugger open
2. **Try to simplify a paper**
3. **Copy ALL console logs** from start to finish
4. **Share the logs** so we can see exactly where it fails

The logs will show us:
- ✅ If backend is responding
- ✅ What articleId is returned
- ✅ If slug is present in response
- ✅ What path we navigate to
- ✅ What error occurs on article page

---

**Created:** 2025-12-04
**Last Updated:** 2025-12-04
