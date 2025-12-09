# 📋 Backend API Requests

Folder ini berisi dokumentasi request API yang dibutuhkan oleh frontend team ke backend team.

## 📁 Files

### 1. **RESIMPLIFY_AND_ARTICLE_BY_ID_API.md**
📄 **Full Documentation**

Dokumentasi lengkap untuk 2 endpoint baru yang dibutuhkan:
- `POST /api/v1/simplify/{articleId}/resimplify` - Re-generate content ke reading level berbeda
- `GET /api/v1/articles/by-id/{id}` - Fetch article by ID

**Includes:**
- ✅ Problem statement & solution
- ✅ API specification (request/response)
- ✅ Database schema
- ✅ Error handling
- ✅ Testing strategy
- ✅ Performance considerations
- ✅ Migration plan
- ✅ Timeline estimate

**Read this for:** Complete understanding of requirements

---

### 2. **QUICK_API_REQUEST_SUMMARY.md**
⚡ **Quick Reference**

Summary singkat untuk quick reference.

**Includes:**
- ✅ TL;DR problem & solution
- ✅ API request/response examples
- ✅ Database schema
- ✅ Backend checklist
- ✅ Timeline estimate

**Read this for:** Quick overview before implementation

---

### 3. **API_TEST_EXAMPLES.sh**
🧪 **Test Script**

Bash script dengan curl commands untuk testing semua endpoints.

**Includes:**
- ✅ Test cases untuk happy path
- ✅ Error test cases
- ✅ Performance test
- ✅ Health check

**Usage:**
```bash
# 1. Edit TOKEN and ARTICLE_ID in script
# 2. Make executable
chmod +x API_TEST_EXAMPLES.sh

# 3. Run all tests
./API_TEST_EXAMPLES.sh

# Or run individual tests
bash API_TEST_EXAMPLES.sh
```

---

## 🎯 Current Requests

### ⏳ Pending

#### 1. Re-Simplify Feature
**Status:** Frontend ready, waiting backend
**Priority:** 🔴 HIGH
**Endpoints needed:**
1. `POST /api/v1/simplify/{articleId}/resimplify`
2. `GET /api/v1/articles/by-id/{id}`

**Why needed:**
Users can't access their preferred reading level. Currently showing fallback level which is too difficult/easy.

**Impact:**
- 🎯 Better UX - Users get content at their level
- 💰 Business - Users more likely to engage
- 🚀 Feature complete - Re-simplify is ready on frontend

**Timeline:** ~1.5 days

**Docs:**
- [Full Docs](./RESIMPLIFY_AND_ARTICLE_BY_ID_API.md)
- [Quick Summary](./QUICK_API_REQUEST_SUMMARY.md)
- [Test Script](./API_TEST_EXAMPLES.sh)
- [Flow Diagram](./RESIMPLIFY_FLOW_DIAGRAM.md)

---

#### 2. External Metadata in Article Response
**Status:** Frontend ready, waiting backend
**Priority:** 🟡 MEDIUM
**Changes needed:**
- Add `isExternal` and `externalMetadata` fields to article response

**Why needed:**
Users can't access original paper (PDF, DOI) when reading simplified articles from Scholar/OpenAlex.

**Impact:**
- 📄 Access to original papers
- 📚 Proper citation (DOI)
- ✅ Transparency & trust
- 🎓 Academic integrity

**Timeline:** ~3.5 hours

**Docs:**
- [Full Docs](./EXTERNAL_METADATA_API.md)

---

### ✅ Completed

#### Simplify External Paper
**Endpoint:** `POST /api/v1/simplify/external`
**Status:** ✅ Implemented
**Docs:** [AI_SIMPLIFICATION_FEATURE.md](./AI_SIMPLIFICATION_FEATURE.md)

#### Popular Articles API
**Endpoint:** `GET /api/v1/articles/popular`
**Status:** ✅ Implemented
**Docs:** [POPULAR_ARTICLES_API.md](./POPULAR_ARTICLES_API.md)

---

## 🔄 Workflow

### For Frontend Team:

1. **Identify need** for new API endpoint
2. **Create documentation** in this folder:
   - Full spec document (detailed)
   - Quick summary (TL;DR)
   - Test examples (curl commands)
3. **Update this README** with new request
4. **Notify backend team** via Slack/Discord/Email
5. **Wait for implementation**
6. **Test with provided curl examples**
7. **Mark as completed** when deployed

### For Backend Team:

1. **Check this folder** for pending requests
2. **Read full documentation** to understand requirements
3. **Ask questions** if anything unclear
4. **Implement** based on spec
5. **Test** using provided test script
6. **Deploy** to staging/production
7. **Notify frontend team** when ready

---

## 📞 Contact

**Frontend Team:**
- Slack: #frontend-team
- Email: frontend@scory.app

**Backend Team:**
- Slack: #backend-team
- Email: backend@scory.app

---

## 📝 Template

When creating new API request documentation, use this structure:

```markdown
# [Feature Name] API Request

## Overview
- Status: ⏳ Pending / ✅ Completed
- Priority: 🔴 HIGH / 🟡 MEDIUM / 🟢 LOW
- Date: YYYY-MM-DD

## Problem Statement
[Describe the problem]

## Solution
[Describe the solution]

## API Specification

### Endpoint 1:
**Request:**
```
POST /api/v1/...
```

**Response:**
```json
{}
```

### Endpoint 2:
...

## Database Schema
[SQL or Prisma schema]

## Testing
[Test cases and examples]

## Timeline
[Estimate]
```

---

**Last Updated:** 2025-12-04
