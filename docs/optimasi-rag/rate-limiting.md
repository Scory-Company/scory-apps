# 🛡️ Rate Limiting Implementation

## ✅ Implemented (2025-01-16)

Rate limiting untuk prevent abuse dan resource management.

---

## 📊 Limits

| Limit Type | Free User | Premium User | Reason |
|------------|-----------|--------------|--------|
| **Concurrent Jobs** | 3 | 3 | Balance produktivitas & resource |
| **Daily Jobs** | 30 | 100 | Normal usage + buffer |
| **Timeout per Job** | 5 minutes | 5 minutes | Prevent stuck jobs |

---

## 🔌 New Endpoints

### **GET** `/api/v1/jobs/my-active`

Get user's active jobs (untuk check limits sebelum submit)

**Response:**
```json
{
  "success": true,
  "data": {
    "activeJobs": [
      {
        "id": "job123",
        "state": "active",
        "progress": 45,
        "data": {
          "externalId": "W123",
          "title": "Paper Title",
          "readingLevel": "SIMPLE"
        },
        "createdAt": 1705416000000
      }
    ],
    "count": 1,
    "limits": {
      "maxConcurrent": 3,
      "maxDaily": 30,
      "remainingConcurrent": 2,
      "remainingDaily": 18,
      "currentDaily": 12
    }
  }
}
```

---

## 🚫 Rate Limit Errors

### **Error 1: Too Many Concurrent Jobs**

**HTTP 429 - Too Many Requests**

```json
{
  "success": false,
  "error": "TOO_MANY_CONCURRENT_JOBS",
  "message": "You can only have 3 active simplification jobs at once. Please wait for one to complete or cancel it.",
  "limits": {
    "maxConcurrent": 3,
    "currentActive": 3,
    "availableSlots": 0
  },
  "suggestion": "Wait for a job to complete or cancel one via DELETE /api/v1/jobs/:jobId"
}
```

**Headers:**
```
X-RateLimit-Limit-Concurrent: 3
X-RateLimit-Remaining-Concurrent: 0
```

---

### **Error 2: Daily Limit Reached**

**HTTP 429 - Too Many Requests**

```json
{
  "success": false,
  "error": "DAILY_LIMIT_REACHED",
  "message": "Daily limit of 30 simplifications reached. Try again tomorrow or upgrade to premium.",
  "limits": {
    "maxDaily": 30,
    "currentUsage": 30,
    "resetsIn": "24 hours"
  },
  "suggestion": "Upgrade to premium for 100+ daily simplifications"
}
```

**Headers:**
```
X-RateLimit-Limit-Daily: 30
X-RateLimit-Remaining-Daily: 0
```

---

## 💻 Frontend Integration

### **1. Check Limits Before Submit**

```typescript
// Check user's active jobs before creating new one
const checkLimits = async () => {
  const response = await api.get('/api/v1/jobs/my-active');
  const { count, limits } = response.data;

  if (count >= limits.maxConcurrent) {
    toast.error(
      `Maximum ${limits.maxConcurrent} papers can be simplified at once. Please wait...`,
      {
        action: {
          label: "View Queue",
          onClick: () => openJobsPanel()
        }
      }
    );
    return false;
  }

  if (limits.currentDaily >= limits.maxDaily) {
    toast.error(
      `Daily limit of ${limits.maxDaily} simplifications reached. Try again tomorrow.`,
      {
        action: {
          label: "Upgrade",
          onClick: () => openUpgradeModal()
        }
      }
    );
    return false;
  }

  return true;
};

// Use before submitting
const handleSimplify = async () => {
  const canProceed = await checkLimits();
  if (!canProceed) return;

  // Proceed with simplification
  const response = await api.post('/simplify/external', paperData);
  // ...
};
```

---

### **2. Handle Rate Limit Errors**

```typescript
try {
  const response = await api.post('/simplify/external', paperData);
  // Success
} catch (error) {
  if (error.response?.status === 429) {
    const data = error.response.data;

    switch (data.error) {
      case 'TOO_MANY_CONCURRENT_JOBS':
        toast.error(data.message, {
          description: `Active jobs: ${data.limits.currentActive}/${data.limits.maxConcurrent}`,
          action: {
            label: "Manage Queue",
            onClick: () => router.push('/jobs')
          }
        });
        break;

      case 'DAILY_LIMIT_REACHED':
        toast.error(data.message, {
          description: `Limit resets in ${data.limits.resetsIn}`,
          action: {
            label: "Upgrade to Premium",
            onClick: () => router.push('/upgrade')
          }
        });
        break;
    }
  }
}
```

---

### **3. Display Rate Limit Info**

```typescript
// Show limits in UI
const { data } = await api.get('/api/v1/jobs/my-active');

return (
  <div>
    <Badge>
      Active: {data.count}/{data.limits.maxConcurrent}
    </Badge>
    <Badge variant="secondary">
      Daily: {data.limits.currentDaily}/{data.limits.maxDaily}
    </Badge>
  </div>
);
```

---

### **4. Jobs Manager Panel (Optional)**

```typescript
// Show all active jobs with cancel option
const JobsManager = () => {
  const { data } = useQuery('active-jobs', () =>
    api.get('/api/v1/jobs/my-active')
  );

  return (
    <div>
      <h3>Active Simplifications ({data.count}/{data.limits.maxConcurrent})</h3>
      {data.activeJobs.map(job => (
        <JobCard key={job.id}>
          <h4>{job.data.title}</h4>
          <ProgressBar value={job.progress} />
          <Button
            variant="destructive"
            onClick={() => cancelJob(job.id)}
          >
            Cancel
          </Button>
        </JobCard>
      ))}
    </div>
  );
};
```

---

## 🔧 Backend Implementation Details

### **Middlewares Applied:**

```typescript
// src/routes/simplificationRoute.ts

router.post(
  '/external',
  authenticate,              // Auth check
  checkJobLimits,           // ← NEW: Rate limiting (3 concurrent, 30 daily)
  aiLimiter,                // Existing AI rate limiter (20/hour)
  validate(...),
  simplifyExternalPaperHandler
);
```

### **Middleware Order (Important!):**
1. `authenticate` - Check auth first
2. `checkJobLimits` - Check concurrent + daily limits
3. `aiLimiter` - Existing rate limiter
4. `validate` - Input validation
5. Handler - Process request

---

## 📈 Monitoring

### **Metrics to Track:**

1. **Rate Limit Hits:**
   - Count 429 errors per user
   - Identify power users
   - Adjust limits if needed

2. **Queue Status:**
   - Average concurrent jobs
   - Peak usage times
   - Daily job trends

3. **Conversion:**
   - Free users hitting limits
   - Upgrade rate after limit hit

---

## ⚙️ Configuration

Current limits defined in `src/middlewares/jobRateLimiter.ts`:

```typescript
const RATE_LIMITS = {
  MAX_CONCURRENT_JOBS: 3,      // Max 3 concurrent jobs per user
  MAX_DAILY_JOBS: 30,           // Max 30 jobs per day per user
  MAX_DAILY_JOBS_PREMIUM: 100,  // Max 100 jobs per day for premium
};
```

To change limits, update these constants and redeploy.

---

## 🆘 Troubleshooting

### **Q: Frontend masih kena 429 padahal sudah check limits?**
A: Race condition - check limits tepat sebelum POST, atau handle 429 gracefully.

### **Q: User complain limit terlalu kecil?**
A: Monitor usage patterns, adjust sesuai data. Atau promote premium.

### **Q: Bagaimana reset daily limit?**
A: Automatic - dihitung dari 24 jam terakhir (rolling window).

---

## ✅ Testing Checklist

- [✅] Middleware created
- [✅] Endpoint `/my-active` works
- [✅] 429 error returned when limit exceeded
- [✅] Rate limit headers included
- [✅] Build successful
- [ ] Frontend integration tested
- [ ] Load testing dengan concurrent requests
- [ ] Monitor production metrics

---

**Status:** ✅ **Production Ready!**
**Deployed:** 2025-01-16
