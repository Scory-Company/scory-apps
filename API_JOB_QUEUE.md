# Job Queue API Documentation

## Overview

Scory Backend menggunakan **BullMQ + Redis** untuk menangani operasi AI processing secara asynchronous. Ini menghindari blocking request thread dan meningkatkan responsiveness API.

## Architecture

```
Client Request → Controller → Job Queue → Redis → Worker → AI Service → Database
                      ↓                                          ↓
                 Return JobID                              Save Result
                      ↓                                          ↓
              Client Polls Status ← ← ← ← ← ← ← ← ← ← ← Job Completed
```

---

## Endpoints

### 1. Create Simplification Job

**Endpoint:** `POST /api/v1/simplify/external`

**Description:** Create async job untuk simplify paper dari OpenAlex/Google Scholar

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "externalId": "W2741809807",
  "source": "openalex",
  "title": "Deep Learning for Computer Vision",
  "authors": ["Geoffrey Hinton", "Yann LeCun"],
  "year": 2015,
  "abstract": "Optional abstract text...",
  "pdfUrl": "https://example.com/paper.pdf",
  "landingPageUrl": "https://example.com/paper",
  "doi": "10.1000/xyz123",
  "citationCount": 1234,
  "rating": 4.5,
  "readingLevel": "SIMPLE",
  "categoryName": "Computer Science"
}
```

**Response (201 Created) - Job Created:**
```json
{
  "success": true,
  "message": "Simplification job created. Use jobId to poll for status.",
  "data": {
    "jobId": "W2741809807-SIMPLE-1702345678900",
    "status": "pending",
    "isCached": false,
    "statusUrl": "/api/v1/jobs/W2741809807-SIMPLE-1702345678900",
    "estimatedTime": "30-60 seconds",
    "pollingInterval": 3000
  }
}
```

**Response (200 OK) - Cached Result:**
```json
{
  "success": true,
  "message": "Returning cached simplified version",
  "data": {
    "isCached": true,
    "isNewSimplification": false,
    "articleId": "cm123abc",
    "content": [
      {
        "type": "heading",
        "content": "Introduction"
      },
      {
        "type": "paragraph",
        "content": "This paper discusses..."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What is deep learning?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "explanation": "..."
      }
    ],
    "metadata": {
      "extractionMethod": "pdf",
      "aiCost": 0,
      "processingTime": 0,
      "readingLevel": "SIMPLE"
    }
  }
}
```

---

### 2. Get Job Status

**Endpoint:** `GET /api/v1/jobs/:jobId`

**Description:** Poll status job yang sedang/sudah berjalan

**Authentication:** Required (Bearer Token)

**Response (200 OK) - Job Pending/Active:**
```json
{
  "success": true,
  "data": {
    "jobId": "W2741809807-SIMPLE-1702345678900",
    "status": "active",
    "progress": 65,
    "estimatedTimeRemaining": 20,
    "timestamp": 1702345678900,
    "statusUrl": "/api/v1/jobs/W2741809807-SIMPLE-1702345678900"
  }
}
```

**Response (200 OK) - Job Completed:**
```json
{
  "success": true,
  "data": {
    "jobId": "W2741809807-SIMPLE-1702345678900",
    "status": "completed",
    "progress": 100,
    "result": {
      "articleId": "cm123abc",
      "isNewSimplification": true,
      "metadata": {
        "extractionMethod": "pdf",
        "aiCost": 0.0234,
        "processingTime": 45678
      }
    },
    "timestamp": 1702345724578,
    "statusUrl": "/api/v1/jobs/W2741809807-SIMPLE-1702345678900"
  }
}
```

**Response (200 OK) - Job Failed:**
```json
{
  "success": true,
  "data": {
    "jobId": "W2741809807-SIMPLE-1702345678900",
    "status": "failed",
    "progress": 30,
    "error": "AI request timeout after 60 seconds",
    "attemptsMade": 3,
    "timestamp": 1702345724578,
    "statusUrl": "/api/v1/jobs/W2741809807-SIMPLE-1702345678900"
  }
}
```

**Response (404 Not Found) - Job Unknown:**
```json
{
  "success": false,
  "message": "Job not found",
  "data": {
    "jobId": "unknown-job-id",
    "status": "unknown"
  }
}
```

---

### 3. Cancel Job

**Endpoint:** `DELETE /api/v1/jobs/:jobId`

**Description:** Cancel job yang masih waiting (belum diproses)

**Authentication:** Required (Bearer Token)

**Response (200 OK) - Cancelled:**
```json
{
  "success": true,
  "message": "Job cancelled successfully",
  "data": {
    "jobId": "W2741809807-SIMPLE-1702345678900"
  }
}
```

**Response (400 Bad Request) - Cannot Cancel:**
```json
{
  "success": false,
  "message": "Cannot cancel job. Job may be already processing, completed, or not found."
}
```

---

## Job Status Types

| Status | Description | Can Cancel? |
|--------|-------------|-------------|
| `waiting` | Job in queue, belum diproses | ✅ Yes |
| `active` | Job sedang diproses worker | ❌ No |
| `completed` | Job selesai dengan sukses | ❌ No |
| `failed` | Job gagal setelah retries | ❌ No |
| `unknown` | Job ID tidak ditemukan | ❌ No |

---

## Client Implementation Guide

### Frontend Polling Pattern

```typescript
async function simplifyPaper(paperData) {
  // Step 1: Create job
  const createResponse = await fetch('/api/v1/simplify/external', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(paperData)
  });

  const createResult = await createResponse.json();

  // If cached, return immediately
  if (createResult.data.isCached) {
    return createResult.data;
  }

  // Step 2: Poll for status
  const jobId = createResult.data.jobId;
  const pollingInterval = createResult.data.pollingInterval || 3000;

  return new Promise((resolve, reject) => {
    const pollStatus = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/v1/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const statusResult = await statusResponse.json();

        if (statusResult.data.status === 'completed') {
          clearInterval(pollStatus);
          resolve(statusResult.data.result);
        } else if (statusResult.data.status === 'failed') {
          clearInterval(pollStatus);
          reject(new Error(statusResult.data.error));
        }
        // else: still processing, continue polling
      } catch (error) {
        clearInterval(pollStatus);
        reject(error);
      }
    }, pollingInterval);

    // Timeout after 2 minutes
    setTimeout(() => {
      clearInterval(pollStatus);
      reject(new Error('Job timeout'));
    }, 120000);
  });
}

// Usage
try {
  const result = await simplifyPaper({
    externalId: 'W2741809807',
    source: 'openalex',
    title: 'Deep Learning',
    authors: ['Hinton'],
    year: 2015,
    // ... other fields
  });

  console.log('Article ID:', result.articleId);
  console.log('Processing cost:', result.metadata.aiCost);
} catch (error) {
  console.error('Simplification failed:', error);
}
```

---

## Job Queue Configuration

### Environment Variables

```env
# Redis connection for job queue
REDIS_URL="redis://localhost:6379"
```

### Queue Settings

- **Concurrency:** 5 workers (process 5 jobs simultaneously)
- **Rate Limit:** Max 10 jobs per 60 seconds
- **Retry Policy:** 3 attempts with exponential backoff (5s, 10s, 20s)
- **Job Retention:**
  - Completed jobs: 24 hours (max 1000 jobs)
  - Failed jobs: 7 days (for debugging)

### Timeouts

- **AI Request Timeout:** 60 seconds
- **PDF Download Timeout:** 30 seconds
- **Graceful Shutdown Timeout:** 30 seconds

---

## Error Handling

### Common Errors

1. **Redis Connection Failed**
   - Status: 503 Service Unavailable
   - Message: "Job queue service temporarily unavailable"
   - Solution: Check Redis connection

2. **Job Not Found**
   - Status: 404 Not Found
   - Message: "Job not found"
   - Solution: Job may have expired (>24 hours old)

3. **Job Failed After Retries**
   - Status: 200 OK (check `status: "failed"` in response)
   - Possible causes:
     - AI API timeout
     - PDF extraction failed
     - Invalid response from AI
     - Database error

---

## Monitoring & Debugging

### View Queue Stats (Development Only)

```bash
# Connect to Redis CLI
redis-cli

# View all job queues
KEYS bull:simplification:*

# View waiting jobs count
LLEN bull:simplification:wait

# View active jobs count
LLEN bull:simplification:active

# View completed jobs count
ZCARD bull:simplification:completed

# View failed jobs count
ZCARD bull:simplification:failed
```

### Logs

All job queue operations are logged with Winston:

```
[SimplificationQueue] Job added: W2741809807-SIMPLE-1702345678900
[SimplificationWorker] Processing job W2741809807-SIMPLE-1702345678900
[SimplificationWorker] ✅ Job W2741809807-SIMPLE-1702345678900 completed successfully
```

---

## Migration Notes

### Before (Synchronous)

```typescript
// Client had to wait 60+ seconds
POST /api/v1/simplify/external
→ Wait 60s...
← 200 OK { articleId, content, quiz }
```

### After (Asynchronous)

```typescript
// Client gets immediate response
POST /api/v1/simplify/external
← 201 Created { jobId, statusUrl }

// Client polls every 3 seconds
GET /api/v1/jobs/:jobId (every 3s)
← 200 OK { status: "active", progress: 45 }
← 200 OK { status: "active", progress: 78 }
← 200 OK { status: "completed", result: {...} }
```

**Benefits:**
- ✅ No request timeouts
- ✅ Better user experience (progress updates)
- ✅ Horizontal scalability (multiple workers)
- ✅ Automatic retries on failure
- ✅ Graceful shutdown (no lost jobs)

---

## Production Checklist

- [x] Redis connection configured
- [x] Job queue and worker created
- [x] Graceful shutdown implemented
- [x] Error handling and retries
- [x] Job retention policies
- [ ] Redis persistence enabled (RDB/AOF)
- [ ] Monitoring dashboard (BullBoard)
- [ ] Rate limiting per user
- [ ] Dead letter queue for failed jobs
- [ ] Prometheus metrics export

---

## Next Steps

1. **Add BullBoard Dashboard** for visual job monitoring
2. **Implement User Quotas** to prevent abuse
3. **Add Job Priority Tiers** (free vs premium users)
4. **Setup Redis Cluster** for high availability
5. **Add Webhook Notifications** for job completion
