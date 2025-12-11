# 🚨 URGENT: External Metadata Tidak Muncul di Frontend

## ❌ Problem

**Article detail API tidak mengirim `externalMetadata` object**, padahal artikel sudah di-mark `isExternal: true`.

### Current API Response:
```json
{
  "data": {
    "id": "abc-123",
    "title": "Affordances and Effects...",
    "isExternal": true,
    "externalMetadata": undefined  // ❌ INI MASALAHNYA!
  }
}
```

### Expected API Response:
```json
{
  "data": {
    "id": "abc-123",
    "title": "Affordances and Effects...",
    "isExternal": true,
    "externalMetadata": {           // ✅ HARUS ADA INI!
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

---

## 🔍 Root Cause

Kemungkinan masalah:

1. **Database belum punya kolom ini** ❓
2. **Data tidak disave saat simplify** ❓
3. **Serializer/Response tidak include field ini** ❓

---

## ✅ Quick Fix Guide

### Step 1: Check Database Schema

Apakah table `articles` sudah punya kolom berikut?

```sql
SELECT
  is_external,
  external_source,
  external_id,
  doi,
  pdf_url,
  landing_page_url,
  publication_year
FROM articles
WHERE is_external = true
LIMIT 5;
```

**Jika kolom tidak ada**, jalankan migration ini:

```sql
ALTER TABLE articles
ADD COLUMN is_external BOOLEAN DEFAULT FALSE,
ADD COLUMN external_source VARCHAR(20),
ADD COLUMN external_id TEXT,
ADD COLUMN doi VARCHAR(255),
ADD COLUMN pdf_url TEXT,
ADD COLUMN landing_page_url TEXT,
ADD COLUMN publication_year INTEGER;

CREATE INDEX idx_articles_is_external ON articles(is_external);
```

---

### Step 2: Update API Serializer

Di article serializer/response builder, pastikan include fields ini:

**Python (Flask/FastAPI):**
```python
def serialize_article(article):
    result = {
        "id": article.id,
        "title": article.title,
        "slug": article.slug,
        # ... other fields ...
        "isExternal": article.is_external,
    }

    # ✅ ADD THIS:
    if article.is_external:
        result["externalMetadata"] = {
            "source": article.external_source,
            "externalId": article.external_id,
            "doi": article.doi,
            "pdfUrl": article.pdf_url,
            "landingPageUrl": article.landing_page_url,
            "year": article.publication_year
        }
    else:
        result["externalMetadata"] = None

    return result
```

**Node.js (Express/NestJS):**
```javascript
function serializeArticle(article) {
  const result = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    // ... other fields ...
    isExternal: article.isExternal,
  };

  // ✅ ADD THIS:
  if (article.isExternal) {
    result.externalMetadata = {
      source: article.externalSource,
      externalId: article.externalId,
      doi: article.doi,
      pdfUrl: article.pdfUrl,
      landingPageUrl: article.landingPageUrl,
      year: article.publicationYear
    };
  } else {
    result.externalMetadata = null;
  }

  return result;
}
```

---

### Step 3: Save Metadata Saat Simplify

Di endpoint `POST /api/v1/simplify/external`, pastikan metadata disimpan:

```javascript
// When creating article from Scholar/OpenAlex
const article = await prisma.article.create({
  data: {
    title: scholarData.title,
    slug: generateSlug(scholarData.title),
    authorName: scholarData.authors.join(", "),
    // ... other fields ...

    // ✅ ADD THESE:
    isExternal: true,
    externalSource: "scholar", // or "openalex"
    externalId: scholarData.link,
    doi: scholarData.doi || null,
    pdfUrl: scholarData.pdfUrl || null,
    landingPageUrl: scholarData.landingPageUrl || null,
    publicationYear: scholarData.year
  }
});
```

---

## 🧪 Testing

### Test 1: Check Database
```sql
SELECT id, title, is_external, doi, pdf_url
FROM articles
WHERE is_external = true
LIMIT 3;
```

**Expected:** Harus ada data di kolom `doi` dan `pdf_url`.

---

### Test 2: Check API Response

```bash
# Replace with actual article ID
curl -X GET "http://10.252.0.51:5000/api/v1/articles/by-id/ARTICLE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.data.externalMetadata'
```

**Expected Output:**
```json
{
  "source": "scholar",
  "externalId": "https://scholar.google.com/...",
  "doi": "10.1234/example",
  "pdfUrl": "https://example.com/paper.pdf",
  "landingPageUrl": "https://example.com/paper",
  "year": 2024
}
```

**Current Output (WRONG):**
```json
null
```

---

### Test 3: Frontend Check

Setelah fix backend, buka artikel external di app:

1. Scroll ke bawah metadata (Author, Rating, etc.)
2. **Harus muncul section "ORIGINAL SOURCE"** dengan button:
   - 📄 View PDF
   - 📚 DOI
   - 🌐 View Online

**Jika tidak muncul**, berarti `externalMetadata` masih `null`/`undefined`.

---

## 📋 Checklist

- [ ] Database columns sudah ada
- [ ] Data ter-save saat simplify article
- [ ] API response include `externalMetadata` object
- [ ] Test dengan curl/Postman
- [ ] Test di frontend app

---

## 🎯 Affected Endpoints

### 1. `GET /api/v1/articles/{slug}`
**Status:** ❌ Tidak return `externalMetadata`
**Action:** Update serializer

### 2. `GET /api/v1/articles/by-id/{id}`
**Status:** ❌ Tidak return `externalMetadata`
**Action:** Update serializer

### 3. `POST /api/v1/simplify/external`
**Status:** ❓ Unclear if saving metadata
**Action:** Verify data is saved to database

---

## 📦 Example Data

Untuk artikel yang di-simplify dari Scholar, seharusnya tersimpan data seperti ini:

| Field | Value |
|-------|-------|
| `title` | "Affordances and effects of promoting eparticipation..." |
| `is_external` | `true` |
| `external_source` | `"scholar"` |
| `external_id` | `"https://scholar.google.com/scholar?q=..."` |
| `doi` | `"10.1234/example.2024"` |
| `pdf_url` | `"https://arxiv.org/pdf/2401.00001.pdf"` |
| `landing_page_url` | `"https://arxiv.org/abs/2401.00001"` |
| `publication_year` | `2024` |

---

## 🆘 Help Needed

**Frontend sudah siap** ✅
- Komponen `SourceLinks` sudah dibuat
- Type definitions sudah ada
- UI sudah di-design

**Backend belum kirim data** ❌
- `externalMetadata` selalu `undefined`
- PDF/DOI links tidak bisa ditampilkan

---

## 📞 Contact

**Reporter:** Frontend Developer
**Date:** 2025-12-11
**Priority:** 🔴 HIGH - Feature tidak berfungsi
**Related Docs:**
- [EXTERNAL_METADATA_API.md](./EXTERNAL_METADATA_API.md) (full spec)

---

## 🔧 Temporary Fix (Frontend)

Sementara backend belum fix, frontend menggunakan **mock data** untuk testing:

```typescript
// app/article/[slug].tsx line 128-143
if (articleData.isExternal && !articleData.externalMetadata && __DEV__) {
  // Mock data for testing UI
  articleData.externalMetadata = { ... };
}
```

**Mock ini harus di-remove** setelah backend fix!

---

**Last Updated:** 2025-12-11
**Status:** ⏳ Waiting for backend fix
