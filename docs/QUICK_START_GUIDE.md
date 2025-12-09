# 🚀 Quick Start Guide - Search & Simplify Integration

## 📦 What You Got

✅ **UnifiedSearchResultCard** - Single card untuk semua search results
✅ **SimplifyAPI Service** - Backend integration untuk paper simplification
✅ **useSimplifyPaper Hook** - React hook untuk simplify workflow
✅ **SimplifyLoadingModal** - Beautiful loading modal

---

## 🎯 Common Use Cases

### 1️⃣ **Display Search Results**

```tsx
import { UnifiedSearchResultCard } from '@/features/explore/components';

<UnifiedSearchResultCard
  result={{
    id: 'paper-123',
    title: 'Machine Learning in Healthcare',
    authors: ['Dr. Smith', 'Prof. Johnson'],
    year: 2024,
    source: 'openalex', // 'internal' | 'openalex' | 'scholar'
    excerpt: 'Abstract text...',
    pdfUrl: 'https://...',
    doi: '10.1234/example',
    citations: 150,
    metadata: {
      isSimplified: false, // ⭐ Key field!
      isExternal: true,
      externalId: 'https://openalex.org/W123',
      externalSource: 'openalex'
    }
  }}
  highlightText="machine learning"
  onSimplify={() => handleSimplify()}
/>
```

---

### 2️⃣ **Simplify a Paper**

```tsx
import { useSimplifyAndNavigate } from '@/hooks/useSimplifyPaper';
import { SimplifyLoadingModal } from '@/features/shared/components';

function MyComponent() {
  const { simplifyAndNavigate, isSimplifying, progress } = useSimplifyAndNavigate();

  const handleSimplify = () => {
    simplifyAndNavigate({
      externalId: 'https://openalex.org/W123',
      source: 'openalex',
      title: 'Paper Title',
      authors: ['Author 1', 'Author 2'],
      year: 2024,
      abstract: 'Paper abstract...',
      pdfUrl: 'https://...',
      doi: '10.1234/example'
    });
  };

  return (
    <>
      <Button onPress={handleSimplify} disabled={isSimplifying}>
        {isSimplifying ? 'Simplifying...' : 'Simplify Paper'}
      </Button>

      <SimplifyLoadingModal
        visible={isSimplifying}
        step={progress.step}
        message={progress.message}
      />
    </>
  );
}
```

---

### 3️⃣ **Check if Paper Already Simplified**

```tsx
import { simplifyApi } from '@/services';

const checkCacheBeforeSimplify = async (externalId: string) => {
  const cacheCheck = await simplifyApi.checkCache(externalId);

  if (cacheCheck.data.isCached) {
    // Already simplified!
    router.push(`/article/${cacheCheck.data.articleId}`);
  } else {
    // Not simplified, proceed with simplification
    await simplifyPaper();
  }
};
```

---

### 4️⃣ **Get Simplified Article Content**

```tsx
import { simplifyApi } from '@/services';

const loadArticle = async (articleId: string) => {
  const article = await simplifyApi.getArticle(articleId, {
    readingLevel: 'SIMPLE', // 'SIMPLE' | 'STUDENT' | 'ACADEMIC' | 'EXPERT'
    includeQuiz: true,
    includeInsights: true
  });

  console.log('Content blocks:', article.data.content);
  console.log('Quiz questions:', article.data.quiz);
  console.log('Insights:', article.data.insights);
};
```

---

## 🎨 Component Props Reference

### **UnifiedSearchResultCard**

```typescript
interface Props {
  result: UnifiedSearchResult;     // Required: search result data
  highlightText?: string;           // Optional: text to highlight
  onPress?: () => void;             // Optional: card press handler
  onSimplify?: () => void;          // Optional: simplify button handler
  onReadSimplified?: (articleId: string) => void; // Optional: read button handler
}
```

### **SimplifyLoadingModal**

```typescript
interface Props {
  visible: boolean;                 // Required: show/hide modal
  step: 'idle' | 'checking' | 'simplifying' | 'done';
  message?: string;                 // Optional: custom message
}
```

---

## 🔧 API Functions Reference

### **simplifyApi.checkCache()**

```typescript
await simplifyApi.checkCache('https://openalex.org/W123');
// Returns: { isCached: boolean, articleId?: string }
```

### **simplifyApi.simplify()**

```typescript
await simplifyApi.simplify({
  externalId: 'https://openalex.org/W123',
  source: 'openalex',
  title: 'Paper Title',
  authors: ['Author 1'],
  year: 2024
});
// Returns: { articleId: string, content: ContentBlock[], ... }
```

### **simplifyApi.getArticle()**

```typescript
await simplifyApi.getArticle('article-uuid', {
  readingLevel: 'SIMPLE',
  includeQuiz: true,
  includeInsights: true
});
// Returns: { article: {...}, content: [...], quiz: [...], insights: [...] }
```

### **simplifyApi.workflow()** (Recommended!)

```typescript
// Does cache check + simplify in one call
const result = await simplifyApi.workflow({
  externalId: 'https://openalex.org/W123',
  source: 'openalex',
  title: 'Paper Title',
  authors: ['Author 1'],
  year: 2024
});

console.log('Article ID:', result.articleId);
console.log('Was cached?', result.isCached);
```

---

## ⚡ Quick Tips

### **1. Always use `useSimplifyAndNavigate` for simplest integration**

```tsx
// ✅ Good - handles everything
const { simplifyAndNavigate, isSimplifying, progress } = useSimplifyAndNavigate();

// ❌ Don't do this (too much manual work)
const handleSimplify = async () => {
  setLoading(true);
  const cache = await checkCache();
  if (!cache) {
    await simplify();
  }
  navigate();
  setLoading(false);
};
```

### **2. Show loading modal for better UX**

```tsx
// ✅ Always include SimplifyLoadingModal
<SimplifyLoadingModal visible={isSimplifying} step={progress.step} />

// ❌ Don't just disable button without visual feedback
<Button disabled={isSimplifying}>Simplifying...</Button>
```

### **3. Check cache before simplifying to save time**

```tsx
// ✅ Good - checks cache first (instant if cached)
await simplifyApi.workflow({...});

// ⚠️ Not optimal - always simplifies (20-30s even if cached)
await simplifyApi.simplify({...});
```

---

## 🐛 Troubleshooting

### **"Network Error" when simplifying**

```bash
# Check if backend is running
curl http://localhost:5000/api/v1/simplify/health

# Check if you're logged in (token exists)
console.log(await AsyncStorage.getItem('authToken'));
```

### **Badge "Already Simplified" tidak muncul**

```typescript
// Verify backend response includes metadata
console.log(searchResult.metadata?.isSimplified);

// If undefined, backend belum return metadata field
// → Koordinasi dengan backend team
```

### **Simplify process stuck/timeout**

```typescript
// Check backend logs untuk error
// Default timeout: 60 seconds (configured di api.ts)

// If paper sangat besar, mungkin perlu increase timeout:
// File: services/api.ts
const api = axios.create({
  timeout: 120000 // 2 minutes
});
```

---

## 📚 Learn More

- [Full Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Backend API Guide](./fromBackend/FRONTEND_INTEGRATION_GUIDE.md)
- [Search API Docs](./fromBackend/SEARCH_API_DOCUMENTATION.md)

---

**Need Help?** Check console logs atau lihat file example:
- `features/explore/components/UnifiedSearchResultCard.example.tsx`

**Happy Coding!** 🚀
