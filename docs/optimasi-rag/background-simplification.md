# 🚀 Background Simplification with Toast Notifications

**Konsep:** User bisa simplify paper di background sambil explore hal lain. Tidak blocking UI!

---

## 🎯 Problem & Solution

### ❌ Problem (Current):
```
User klik "Simplify"
  → Loading screen (blocking)
  → User STUCK, gabisa ngapa-ngapain
  → Harus nunggu 30-60 detik
```

### ✅ Solution (New):
```
User klik "Simplify"
  → Toast notification: "Simplifying in background..."
  → User BEBAS:
     - Search jurnal lain
     - Buka PDF
     - Scroll-scroll
  → Toast update progress real-time
  → Selesai → Toast: "Done! Tap to open"
```

---

## 📋 Implementation Phases

### **Phase 1: Backend (Already Done ✅)**
- [✅] Streaming progress via SSE
- [✅] Rate limiting (3 concurrent, 30 daily)
- [✅] Background job processing
- [✅] `/jobs/:jobId/stream` endpoint

**Status:** Production ready!

---

### **Phase 2: Frontend - Core Features**

#### **Step 1: Toast System**
- [ ] Install toast library (react-hot-toast / sonner)
- [ ] Create toast wrapper component
- [ ] Add progress toast variant

#### **Step 2: Use the Hook in Your Component** ✅

```typescript
// Example: In Explore page
import { useBackgroundSimplify } from '@/features/simplify/hooks/useBackgroundSimplify';

function ExploreScreen() {
  const { startSimplification, ToastContainer } = useBackgroundSimplify();

  const handleSimplifyClick = async (paper) => {
    // Start background job
    const jobId = await startSimplification({
      externalId: paper.id,
      title: paper.title,
      readingLevel: 'SIMPLE', // or from user preference
    });

    if (jobId) {
      // Job started! User can continue exploring
      // Toast will show progress automatically
    }
  };

  return (
    <View>
      {/* Your explore UI */}
      <Button onPress={() => handleSimplifyClick(paper)}>
        Simplify
      </Button>

      {/* IMPORTANT: Add ToastContainer once */}
      <ToastContainer />
    </View>
  );
}
```

**That's it!** 🎉 BackgroundJobManager handles everything:
- ✅ Rate limit checking
- ✅ SSE connection & progress tracking
- ✅ Toast notifications
- ✅ Error handling
- ✅ Auto navigation when done

#### **Step 3: Advanced Usage (Optional)**

```typescript
// Get active jobs info
const { getActiveJobsCount, getActiveJobs, cancelJob } = useBackgroundSimplify();

// Check how many jobs running
const activeCount = getActiveJobsCount(); // e.g., 2

// Get all active jobs details
const jobs = getActiveJobs();
// [{jobId, externalId, title, toastId, eventSource}, ...]

// Cancel a specific job
await cancelJob('job-123');
```

---

### **Phase 3: Optional Enhancements**

#### **Feature 1: Jobs Panel (Queue Manager)**
```typescript
// components/JobsPanel.tsx
const JobsPanel = () => {
  const { data } = useQuery('active-jobs', () =>
    api.get('/api/v1/jobs/my-active')
  );

  return (
    <Sheet>
      <SheetTrigger>
        <Badge>
          {data.count} Active
        </Badge>
      </SheetTrigger>
      <SheetContent>
        <h3>Active Simplifications</h3>
        <p>Limit: {data.count}/{data.limits.maxConcurrent}</p>

        {data.activeJobs.map(job => (
          <JobCard key={job.id}>
            <h4>{job.data.title}</h4>
            <Progress value={job.progress} />
            <Button onClick={() => cancelJob(job.id)}>
              Cancel
            </Button>
          </JobCard>
        ))}
      </SheetContent>
    </Sheet>
  );
};
```

#### **Feature 2: Persistent State**
```typescript
// Handle app reload - restore active jobs
useEffect(() => {
  const restoreActiveJobs = async () => {
    const response = await api.get('/api/v1/jobs/my-active');

    response.data.activeJobs.forEach(job => {
      if (job.state === 'active') {
        // Re-attach SSE listener
        backgroundJobManager.trackJob(
          job.id,
          `/api/v1/jobs/${job.id}/stream`,
          toast.loading('Resuming...')
        );
      }
    });
  };

  restoreActiveJobs();
}, []);
```

#### **Feature 3: Notification Badge**
```typescript
// Show active jobs count in navbar
<Bell>
  {activeJobsCount > 0 && (
    <Badge variant="destructive">{activeJobsCount}</Badge>
  )}
</Bell>
```

---

## 🎨 UX Flow

### **Happy Path:**
```
1. User di Explore → klik "Simplify" on Paper A
2. Toast muncul: "📄 Simplifying Paper A... 0%"
3. User scroll ke bawah, klik "Simplify" on Paper B
4. Toast kedua: "📄 Simplifying Paper B... 0%"
5. User buka PDF Paper C (explore)
6. Toast update: "📄 Paper A... 45%" → "📄 Paper A... 85%"
7. Toast Paper A: "✅ Done! Tap to open"
8. User tap → redirect ke simplified article
9. Paper B selesai → toast notification
```

### **Error Handling:**
```
1. User klik simplify ke-4
2. Toast: "❌ Max 3 papers at once. [View Queue]"
3. User tap "View Queue" → panel muncul
4. User cancel 1 job → slot available
5. User simplify lagi → success
```

---

## ✅ Implementation Checklist

### **Phase 2: Core (Priority HIGH)**
- [✅] ~~Install toast library~~ (Upgraded existing toast!)
- [✅] Create `BackgroundJobManager` service
- [✅] Implement `startSimplification()` method
- [✅] Implement `trackJob()` with SSE
- [✅] Add rate limit check before submit
- [✅] Handle 429 errors gracefully
- [✅] Create `useBackgroundSimplify` hook
- [ ] Integrate ke Explore page
- [ ] Test concurrent jobs (3 papers)
- [ ] Test toast notifications

### **Phase 3: Enhancements (Priority MEDIUM)**
- [ ] Create Jobs Panel component
- [ ] Add persistent state (restore on reload)
- [ ] Add notification badge di navbar
- [ ] Add cancel job functionality
- [ ] Add job history

### **Testing:**
- [ ] Simplify 3 papers simultaneously
- [ ] Try simplify 4th → blocked
- [ ] Check toast progress updates
- [ ] Test "Tap to open" action
- [ ] Test app reload with active jobs
- [ ] Test daily limit (30 jobs)

---

## 🔧 Tech Stack

- **Toast:** `react-hot-toast` or `sonner`
- **State:** `zustand` or `React Context`
- **SSE:** Native `EventSource` API
- **Storage:** `localStorage` (persistent state)

---

## 📊 Success Metrics

- ✅ User dapat simplify multiple papers sekaligus
- ✅ User tidak stuck di loading screen
- ✅ Progress tracking real-time
- ✅ Rate limiting prevent abuse
- ✅ Better UX → higher engagement

---

## 🚀 Next Steps

1. **Week 1:** Implement Phase 2 (core features)
2. **Week 2:** Testing + bug fixes
3. **Week 3:** Phase 3 (enhancements)
4. **Week 4:** Production deploy + monitoring

---

**Status:** 📝 **Design Complete - Ready to Build!**
**Created:** 2025-01-17
