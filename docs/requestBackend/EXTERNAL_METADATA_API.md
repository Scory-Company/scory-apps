# 🔗 External Metadata in Article Response

## Overview
Request untuk menambahkan `externalMetadata` field di article response untuk menampilkan link ke PDF, DOI, dan landing page artikel original.

**Status:** ⏳ Menunggu implementasi backend
**Priority:** 🟡 MEDIUM - Enhancement untuk UX
**Created:** 2025-12-04

---

## Problem Statement

### Current Issue:
Ketika user membaca artikel yang di-simplify dari Google Scholar atau OpenAlex, mereka **tidak bisa akses paper original**.

**Missing information:**
- ❌ Link ke PDF
- ❌ DOI untuk citation
- ❌ Landing page URL
- ❌ Source (Scholar/OpenAlex)

### Desired Solution:
Tampilkan section "Original Source" di article detail page dengan button:
- 📄 **View PDF** - Direct link ke PDF
- 📚 **DOI** - Link ke DOI resolver
- 🌐 **View Online** - Link ke landing page

---

## API Change Required

### Current Article Response:
```json
{
  "data": {
    "id": "abc-123",
    "title": "Article Title",
    "slug": "article-slug",
    "authorName": "John Doe",
    "contents": [...]
  }
}
```

### Updated Article Response (Required):
```json
{
  "data": {
    "id": "abc-123",
    "title": "Article Title",
    "slug": "article-slug",
    "authorName": "John Doe",
    "isExternal": true,
    "externalMetadata": {
      "source": "scholar",
      "externalId": "https://scholar.google.com/...",
      "doi": "10.1234/example.2024",
      "pdfUrl": "https://arxiv.org/pdf/2024.12345.pdf",
      "landingPageUrl": "https://arxiv.org/abs/2024.12345",
      "year": 2024
    },
    "contents": [...]
  }
}
```

---

## Field Specifications

### `isExternal` (Boolean)
**Type:** `boolean`
**Required:** ✅ Yes
**Description:** Flag to indicate if article is from external source (Scholar/OpenAlex)

**Values:**
- `true` - Article from Scholar/OpenAlex (simplified external paper)
- `false` - Native Scory article

**Usage:**
```typescript
if (article.isExternal) {
  // Show external metadata section
}
```

---

### `externalMetadata` (Object)
**Type:** `object | null`
**Required:** ❌ No (only if `isExternal = true`)
**Description:** Metadata tentang paper original

**Fields:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `source` | String (Enum) | ✅ Yes | Source platform | `"scholar"`, `"openalex"` |
| `externalId` | String | ✅ Yes | ID dari source | `"https://openalex.org/W123"` |
| `doi` | String | ❌ No | DOI identifier | `"10.1234/example.2024"` |
| `pdfUrl` | String (URL) | ❌ No | Direct PDF link | `"https://arxiv.org/pdf/..."` |
| `landingPageUrl` | String (URL) | ❌ No | Paper landing page | `"https://arxiv.org/abs/..."` |
| `year` | Number | ✅ Yes | Publication year | `2024` |

**Notes:**
- At least ONE of `pdfUrl` or `landingPageUrl` should be present
- DOI is optional but recommended
- If paper has DOI, construct URL: `https://doi.org/{doi}`

---

## Database Schema

### Table: `articles`

Add these columns:

```sql
ALTER TABLE articles
ADD COLUMN is_external BOOLEAN DEFAULT FALSE,
ADD COLUMN external_source VARCHAR(20),
ADD COLUMN external_id TEXT,
ADD COLUMN doi VARCHAR(255),
ADD COLUMN pdf_url TEXT,
ADD COLUMN landing_page_url TEXT,
ADD COLUMN publication_year INTEGER;

-- Add index for external articles
CREATE INDEX idx_articles_is_external ON articles(is_external);
```

**Or using Prisma:**

```prisma
model Article {
  id                String    @id @default(uuid())
  title             String
  slug              String    @unique
  // ... existing fields ...

  // External metadata
  isExternal        Boolean   @default(false) @map("is_external")
  externalSource    String?   @map("external_source") // 'scholar' | 'openalex'
  externalId        String?   @map("external_id")
  doi               String?
  pdfUrl            String?   @map("pdf_url")
  landingPageUrl    String?   @map("landing_page_url")
  publicationYear   Int?      @map("publication_year")

  @@index([isExternal])
}
```

---

## Implementation Details

### When to Set `externalMetadata`

#### Scenario 1: User simplifies paper from Scholar/OpenAlex
```typescript
// In POST /simplify/external endpoint
const simplifyRequest = {
  externalId: "https://openalex.org/W123",
  source: "openalex",
  title: "Paper Title",
  authors: ["Author"],
  year: 2024,
  pdfUrl: "https://example.com/paper.pdf",
  landingPageUrl: "https://example.com/paper",
  doi: "10.1234/example"
};

// Save to database
await prisma.article.create({
  data: {
    title: simplifyRequest.title,
    // ... other fields ...
    isExternal: true,
    externalSource: simplifyRequest.source,
    externalId: simplifyRequest.externalId,
    doi: simplifyRequest.doi,
    pdfUrl: simplifyRequest.pdfUrl,
    landingPageUrl: simplifyRequest.landingPageUrl,
    publicationYear: simplifyRequest.year
  }
});
```

#### Scenario 2: Native Scory article
```typescript
// For articles created by admin/content team
await prisma.article.create({
  data: {
    title: "Native Article",
    // ... other fields ...
    isExternal: false,
    // externalMetadata fields are NULL
  }
});
```

---

## API Endpoints Affected

### 1. GET /api/v1/articles/{slug}
**Should include:**
```json
{
  "data": {
    "id": "...",
    "isExternal": true,
    "externalMetadata": {
      "source": "scholar",
      "externalId": "...",
      "doi": "...",
      "pdfUrl": "...",
      "landingPageUrl": "...",
      "year": 2024
    }
  }
}
```

### 2. GET /api/v1/articles/by-id/{id}
Same as above.

### 3. GET /api/v1/simplify/{articleId}
Already returns `externalMetadata` ✅ (no change needed)

### 4. POST /api/v1/simplify/external
**Input:** Already receives these fields ✅
**Action:** Save to database when creating article

---

## Frontend Implementation

### Component: `SourceLinks`

Already implemented! ✅

**Location:** `features/article/components/SourceLinks.tsx`

**Usage:**
```tsx
{article.isExternal && article.externalMetadata && (
  <SourceLinks externalMetadata={article.externalMetadata} />
)}
```

**Preview:**

```
┌─────────────────────────────────────────────────┐
│ 🔗 ORIGINAL SOURCE                               │
├─────────────────────────────────────────────────┤
│                                                  │
│  [📄 View PDF]  [📚 DOI]  [🌐 View Online]      │
│                                                  │
│  Source: Google Scholar                          │
└─────────────────────────────────────────────────┘
```

**Features:**
- ✅ Opens PDF in browser/PDF viewer
- ✅ DOI link goes to https://doi.org/{doi}
- ✅ Landing page for non-PDF sources
- ✅ Shows source badge (Scholar/OpenAlex)
- ✅ Error handling if link can't open

---

## Testing

### Test Case 1: External Article (Scholar)

**Setup:**
1. Simplify paper from Google Scholar
2. Paper has PDF URL and DOI

**Expected Response:**
```json
{
  "data": {
    "id": "abc-123",
    "title": "Protist literacy...",
    "isExternal": true,
    "externalMetadata": {
      "source": "scholar",
      "externalId": "https://scholar.google.com/...",
      "doi": "10.1234/example.2024",
      "pdfUrl": "https://example.com/paper.pdf",
      "landingPageUrl": "https://example.com/paper",
      "year": 2024
    }
  }
}
```

**Frontend Result:**
- ✅ Shows "Original Source" section
- ✅ "View PDF" button → opens PDF
- ✅ "DOI" button → opens DOI resolver
- ✅ Shows "Source: Google Scholar"

---

### Test Case 2: External Article (OpenAlex) - No PDF

**Setup:**
1. Simplify paper from OpenAlex
2. Paper only has landing page (no PDF)

**Expected Response:**
```json
{
  "data": {
    "id": "def-456",
    "title": "Research Paper...",
    "isExternal": true,
    "externalMetadata": {
      "source": "openalex",
      "externalId": "https://openalex.org/W123",
      "doi": "10.1234/example.2024",
      "landingPageUrl": "https://example.com/paper",
      "year": 2024
    }
  }
}
```

**Frontend Result:**
- ✅ Shows "Original Source" section
- ✅ "DOI" button → opens DOI resolver
- ✅ "View Online" button → opens landing page
- ✅ Shows "Source: OpenAlex"

---

### Test Case 3: Native Scory Article

**Setup:**
1. Article created by admin (not from external source)

**Expected Response:**
```json
{
  "data": {
    "id": "ghi-789",
    "title": "Native Article",
    "isExternal": false,
    "externalMetadata": null
  }
}
```

**Frontend Result:**
- ✅ NO "Original Source" section shown
- ✅ Article renders normally

---

## curl Test Examples

```bash
# Test external article
curl -X GET http://localhost:5000/api/v1/articles/by-id/ARTICLE_ID \
  -H "Authorization: Bearer TOKEN" | jq '.data.externalMetadata'

# Expected output:
{
  "source": "scholar",
  "externalId": "https://scholar.google.com/...",
  "doi": "10.1234/example.2024",
  "pdfUrl": "https://example.com/paper.pdf",
  "landingPageUrl": "https://example.com/paper",
  "year": 2024
}

# Test native article (should be null)
curl -X GET http://localhost:5000/api/v1/articles/native-article-slug \
  -H "Authorization: Bearer TOKEN" | jq '.data.externalMetadata'

# Expected output:
null
```

---

## Migration Strategy

### Step 1: Add Database Columns
```sql
-- Add columns
ALTER TABLE articles
ADD COLUMN is_external BOOLEAN DEFAULT FALSE,
ADD COLUMN external_source VARCHAR(20),
ADD COLUMN external_id TEXT,
ADD COLUMN doi VARCHAR(255),
ADD COLUMN pdf_url TEXT,
ADD COLUMN landing_page_url TEXT,
ADD COLUMN publication_year INTEGER;

-- Create index
CREATE INDEX idx_articles_is_external ON articles(is_external);
```

### Step 2: Migrate Existing Data

**For existing external articles:**
```sql
-- Mark existing external articles
UPDATE articles
SET is_external = true
WHERE external_id IS NOT NULL;

-- Or manually mark known external articles
UPDATE articles
SET
  is_external = true,
  external_source = 'scholar'
WHERE title LIKE '%from scholar%';
```

### Step 3: Update API Responses
- Modify article serializer to include new fields
- Test with Postman/curl

### Step 4: Deploy & Test
- Deploy to staging
- Test frontend integration
- Deploy to production

---

## Business Value

### User Benefits:
- ✅ **Access Original Paper** - Users can read full paper
- ✅ **Proper Citation** - DOI for academic citation
- ✅ **Verification** - Users can verify simplified content
- ✅ **Further Reading** - Deep dive into methodology

### Platform Benefits:
- ✅ **Trust** - Transparency about sources
- ✅ **Academic Integrity** - Proper attribution
- ✅ **SEO** - External links for credibility
- ✅ **User Engagement** - More ways to interact

---

## Questions for Backend Team

1. ✅ Apakah database schema sudah punya columns ini?
2. ✅ Apakah `POST /simplify/external` sudah simpan metadata ini?
3. ✅ Apakah perlu migration untuk existing articles?
4. ✅ Format URL apa yang preferred untuk PDF hosting?
5. ✅ Apakah perlu validation untuk URL format?

---

## Timeline Estimate

| Task | Time |
|------|------|
| Database migration | 30 min |
| Update article model/serializer | 1 hour |
| Update API responses | 1 hour |
| Testing | 1 hour |
| **Total** | **~3.5 hours** |

---

## Contact

**Frontend Developer:** [Your Name]
**Feature:** Source Links for External Articles
**Related Components:**
- `features/article/components/SourceLinks.tsx`
- `services/articles.ts`
- `app/article/[slug].tsx`

---

**Last Updated:** 2025-12-04
**Status:** ⏳ Waiting for backend
**Priority:** 🟡 MEDIUM
