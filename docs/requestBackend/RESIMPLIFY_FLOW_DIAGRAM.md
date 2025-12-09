# 🔄 Re-Simplify Flow Diagram

Visual flow untuk memahami bagaimana re-simplify feature bekerja dari frontend ke backend.

---

## 1. User Journey Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant AI as AI Service
    participant DB as Database

    Note over U,DB: Initial Simplify (User gets EXPERT level)
    U->>F: Search & select paper from Scholar
    F->>B: POST /simplify/external (no level specified)
    B->>AI: Generate content (default: EXPERT)
    AI-->>B: Return EXPERT content
    B->>DB: Save article + EXPERT content
    DB-->>B: articleId
    B-->>F: articleId
    F->>F: Navigate to /article/{articleId}
    F->>B: GET /articles/by-id/{articleId}
    B->>DB: Query article with contents
    DB-->>B: Article + [EXPERT content only]
    B-->>F: Article data
    F->>F: Check user preference (STUDENT)
    F->>F: Detect mismatch (want STUDENT, have EXPERT)
    F->>U: Show banner "Student level not available"

    Note over U,DB: User Triggers Re-Simplify
    U->>F: Click "Generate Student" button
    F->>F: Show loading state
    F->>B: POST /simplify/{articleId}/resimplify<br/>{"readingLevel": "STUDENT"}
    B->>DB: Check if STUDENT content exists
    DB-->>B: Not found

    Note over B,AI: Generate New Level
    B->>AI: Generate STUDENT content<br/>(20-30 seconds)
    AI-->>B: Return STUDENT content
    B->>DB: Save new content<br/>(article_id + STUDENT level)
    DB-->>B: Success
    B-->>F: Success + content

    Note over F,U: Update UI
    F->>F: Hide loading
    F->>B: GET /articles/by-id/{articleId}
    B->>DB: Query article
    DB-->>B: Article + [EXPERT, STUDENT]
    B-->>F: Article with both levels
    F->>F: Display STUDENT content
    F->>U: Show article at STUDENT level ✅
```

---

## 2. Backend Logic Flow

```mermaid
flowchart TD
    Start[POST /simplify/:articleId/resimplify] --> Auth{Check Auth}
    Auth -->|Invalid| Error1[401 Unauthorized]
    Auth -->|Valid| ValidateBody{Validate Request Body}

    ValidateBody -->|Invalid level| Error2[400 Bad Request]
    ValidateBody -->|Valid| CheckArticle{Article exists?}

    CheckArticle -->|No| Error3[404 Not Found]
    CheckArticle -->|Yes| CheckLevel{Level already<br/>exists?}

    CheckLevel -->|Yes| ReturnCached[Return cached content<br/>isCached: true]
    CheckLevel -->|No| GetMetadata[Get article metadata<br/>title, authors, etc.]

    GetMetadata --> CallAI[Call AI Service<br/>Generate content]
    CallAI --> ParseContent[Parse & structure<br/>content blocks]
    ParseContent --> GenerateQuiz[Generate quiz<br/>questions]
    GenerateQuiz --> GenerateInsights[Generate insights]
    GenerateInsights --> SaveDB[Save to database<br/>article_contents table]
    SaveDB --> ReturnNew[Return new content<br/>isNewSimplification: true]

    ReturnCached --> End[200 OK Response]
    ReturnNew --> End
    Error1 --> End
    Error2 --> End
    Error3 --> End

    style CallAI fill:#ff9999
    style SaveDB fill:#99ff99
    style End fill:#9999ff
```

---

## 3. Database Structure

```mermaid
erDiagram
    ARTICLES ||--o{ ARTICLE_CONTENTS : has
    ARTICLES {
        uuid id PK
        string title
        string slug
        string excerpt
        string author_name
        uuid category_id FK
        timestamp created_at
    }

    ARTICLE_CONTENTS {
        uuid id PK
        uuid article_id FK
        enum reading_level
        jsonb blocks
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIES ||--o{ ARTICLES : categorizes
    CATEGORIES {
        uuid id PK
        string name
        string slug
    }
```

**Key Constraints:**
- `UNIQUE(article_id, reading_level)` → Prevents duplicate levels
- `reading_level ENUM` → Only allows: SIMPLE, STUDENT, ACADEMIC, EXPERT

---

## 4. Frontend State Management

```mermaid
stateDiagram-v2
    [*] --> Loading: User opens article

    Loading --> CheckingLevel: Article loaded

    CheckingLevel --> DisplayContent: Level available
    CheckingLevel --> ShowBanner: Level NOT available

    ShowBanner --> Resimplifying: User clicks button
    Resimplifying --> Loading: Re-fetch article
    Loading --> DisplayContent: New level ready

    DisplayContent --> [*]

    note right of ShowBanner
        Banner shows:
        "Student level not available"
        [Generate Student] button
    end note

    note right of Resimplifying
        Loading state:
        "Simplifying to STUDENT level..."
        (20-30 seconds)
    end note
```

---

## 5. API Response Comparison

### Initial Simplify Response:
```json
{
  "data": {
    "articleId": "abc-123",
    "contents": [
      {
        "readingLevel": "EXPERT",
        "blocks": [...]
      }
    ]
  }
}
```
**Problem:** Only 1 level available ❌

### After Re-Simplify:
```json
{
  "data": {
    "articleId": "abc-123",
    "contents": [
      {
        "readingLevel": "EXPERT",
        "blocks": [...]
      },
      {
        "readingLevel": "STUDENT",
        "blocks": [...]
      }
    ]
  }
}
```
**Solution:** Multiple levels available ✅

---

## 6. Cache Strategy

```mermaid
flowchart LR
    Request[Re-simplify Request] --> Check{Level exists<br/>in cache?}
    Check -->|Yes| Return1[Return immediately<br/>~100ms]
    Check -->|No| Generate[Generate with AI<br/>~25 seconds]
    Generate --> Save[Save to DB]
    Save --> Return2[Return new content]

    style Return1 fill:#99ff99
    style Generate fill:#ff9999
```

**Benefits:**
- ✅ Fast for repeated requests (100ms vs 25s)
- ✅ Saves AI cost ($0.05 per generation)
- ✅ Consistent results

---

## 7. Error Handling Flow

```mermaid
flowchart TD
    Request[Re-simplify Request] --> Validate{Validation}

    Validate -->|Invalid level| E1[400: INVALID_READING_LEVEL]
    Validate -->|Article not found| E2[404: ARTICLE_NOT_FOUND]
    Validate -->|AI service down| E3[500: AI_SERVICE_ERROR]
    Validate -->|Timeout > 60s| E4[504: GATEWAY_TIMEOUT]
    Validate -->|Rate limit exceeded| E5[429: TOO_MANY_REQUESTS]

    Validate -->|All OK| Process[Process Request]
    Process --> Success[200: Success]

    E1 --> Frontend[Frontend Error Handler]
    E2 --> Frontend
    E3 --> Retry[Retry with<br/>exponential backoff]
    E4 --> Queue[Add to background queue]
    E5 --> Wait[Wait & retry]

    Retry --> Success
    Queue --> Notify[Notify user when done]
    Wait --> Success

    Frontend --> ShowError[Show error to user]
    ShowError --> AllowRetry[Allow manual retry]

    style Success fill:#99ff99
    style Frontend fill:#ff9999
```

---

## 8. Performance Metrics

### Target Metrics:
```
┌──────────────────────────────────────────────────┐
│ Metric                 │ Target    │ Acceptable  │
├──────────────────────────────────────────────────┤
│ New level generation   │ 20-25s    │ < 30s       │
│ Cached response        │ < 500ms   │ < 1s        │
│ Success rate           │ > 95%     │ > 90%       │
│ AI cost per request    │ $0.03-0.05│ < $0.10     │
│ Concurrent requests    │ 10-20     │ > 5         │
└──────────────────────────────────────────────────┘
```

### Monitoring Dashboard:
```
Re-Simplify Metrics (Last 24h)
─────────────────────────────────────
Total Requests:          127
  ├─ New generations:     45 (35%)
  ├─ Cached responses:    82 (65%)
  └─ Failed:               0 (0%)

Avg Response Time:      8.5s
  ├─ New:              24.2s
  └─ Cached:           0.3s

AI Cost:               $2.25
Success Rate:          100%
```

---

## 9. Deployment Checklist

```
┌─ Pre-Deployment ──────────────────────────────┐
│ ☐ Database migration executed                 │
│ ☐ Unique constraint added                     │
│ ☐ Index created                                │
│ ☐ API endpoints implemented                   │
│ ☐ Unit tests passed (>80% coverage)          │
│ ☐ Integration tests passed                    │
└───────────────────────────────────────────────┘

┌─ Staging Tests ───────────────────────────────┐
│ ☐ Test re-simplify to STUDENT                │
│ ☐ Test re-simplify to ACADEMIC               │
│ ☐ Test cached response                        │
│ ☐ Test error cases                            │
│ ☐ Performance test (< 30s)                   │
│ ☐ Load test (10 concurrent)                  │
└───────────────────────────────────────────────┘

┌─ Production Deployment ───────────────────────┐
│ ☐ Deploy to production                        │
│ ☐ Monitor error rate                          │
│ ☐ Monitor response time                       │
│ ☐ Monitor AI cost                             │
│ ☐ Enable frontend feature                     │
│ ☐ Document in API docs                        │
└───────────────────────────────────────────────┘
```

---

## 10. Example Scenarios

### Scenario 1: Happy Path
```
User (STUDENT preference)
  └─> Opens article (only EXPERT available)
      └─> Sees banner "Student level not available"
          └─> Clicks "Generate Student"
              └─> Waits 25 seconds
                  └─> Article reloads
                      └─> Shows STUDENT content ✅
```

### Scenario 2: Already Cached
```
User (STUDENT preference)
  └─> Opens article (has EXPERT + STUDENT)
      └─> Directly shows STUDENT content ✅
      └─> No banner shown
```

### Scenario 3: Network Error
```
User (STUDENT preference)
  └─> Opens article (only EXPERT available)
      └─> Clicks "Generate Student"
          └─> Network timeout after 60s ❌
              └─> Shows error alert
                  └─> Allows retry
                      └─> Success on retry ✅
```

---

**Last Updated:** 2025-12-04
**Related Docs:**
- [Full API Spec](./RESIMPLIFY_AND_ARTICLE_BY_ID_API.md)
- [Quick Summary](./QUICK_API_REQUEST_SUMMARY.md)
- [Test Examples](./API_TEST_EXAMPLES.sh)
