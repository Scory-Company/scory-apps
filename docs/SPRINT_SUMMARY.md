# Sprint 2 & 3 - Quick Reference

**PM:** Habdil Iqrawardana | **Tech Lead:** Tiko
**Created:** December 3, 2025

---

## 📊 Sprint Overview

| Sprint | Duration | Features | Status |
|--------|----------|----------|--------|
| **Sprint 2** | 2-3 weeks (Dec 2025) | User Engagement | 🔵 Planning |
| **Sprint 3** | 3-4 weeks (Jan 2026) | Advanced Features | 🔵 Planning |

**Total Timeline:** 6-7 weeks
**Total Features:** 9 major features
**Total API Endpoints:** ~45 new endpoints

---

## 🚀 Sprint 2: User Engagement (Dec 2025)

### Features (4)
1. ⭐ **Bookmarking System** - Save articles (3-4 days)
2. ⭐ **Quiz & Insights** - Tests + notes (5-6 days)
3. 🔥 **Trending Now** - Popular content (2-3 days)
4. 📚 **Learn Page** - Stats, goals, collections (5-6 days)

**Total:** 15-19 days

### Key Deliverables
- Bookmark articles from anywhere
- Take quizzes after reading
- Create personal insight notes
- See trending articles
- Track reading stats (streak, minutes)
- Set weekly reading goals
- Create study collections

---

## 🔬 Sprint 3: Advanced Features (Jan 2026)

### Features (5)
1. 🔍 **Advanced Search** - Google Scholar (4-5 days)
2. 🔔 **Notifications** - Push alerts (4-5 days)
3. 👤 **Profile** - Complete stats (3-4 days)
4. 📸 **Avatar Upload** - Profile pics (2-3 days)
5. ⭐⭐ **PDF & DOI** - Upload + simplify (7-10 days)

**Total:** 20-27 days

### Key Deliverables
- Search external sources (Google Scholar)
- Receive push notifications
- Full profile with achievements
- Upload custom avatar
- Upload PDF journals
- Search articles by DOI
- AI-powered simplification (4 levels)

---

## 🎯 Priority Matrix

### Must-Have (Do First)
1. PDF Upload & DOI Search ⭐⭐
2. Bookmarking System ⭐
3. Quiz & Insight Notes ⭐
4. Learn Page Integration ⭐
5. Profile Completion ⭐

### Should-Have (Important)
6. Advanced Search 🔍
7. Trending Now 🔥

### Nice-to-Have (If Time Permits)
8. Push Notifications 🔔
9. Avatar Upload 📸

---

## 📋 Backend Requirements (For Tiko)

### Sprint 2 APIs (~20 endpoints)
- **Bookmarks:** POST, GET, DELETE bookmarks
- **Quiz:** GET questions, POST submit, GET results
- **Insights:** CRUD operations for notes
- **Trending:** GET trending articles
- **Stats:** GET reading stats, POST goals
- **Collections:** CRUD operations

### Sprint 3 APIs (~25 endpoints)
- **Search:** Google Scholar integration
- **Notifications:** Register tokens, send, get history
- **Profile:** GET stats, achievements, activity
- **Avatar:** Upload, delete images
- **PDF:** Upload, process, extract text
- **DOI:** Search, fetch metadata
- **Simplify:** AI-powered content simplification

---

## 🔧 External Integrations Needed

### Sprint 2
- None (all internal APIs)

### Sprint 3
1. **Google Scholar API** - Academic search
2. **CrossRef API** - DOI metadata
3. **Unpaywall API** - Free PDF access
4. **OpenAI API / Claude** - Text simplification
5. **Expo Push Notifications** - Mobile notifications
6. **File Storage** - AWS S3 or Cloudinary

---

## ⚠️ Technical Challenges

### High Complexity
1. **AI Simplification** - Need robust NLP model
2. **PDF Processing** - Text extraction + parsing
3. **Google Scholar** - Rate limiting, scraping

### Medium Complexity
4. **Push Notifications** - Multi-platform delivery
5. **DOI Integration** - Multiple API sources
6. **Search Merging** - Combine local + external results

### Low Complexity
7. Bookmarks, Quiz, Insights (standard CRUD)

---

## 📅 Recommended Timeline

```
Week 1-2 (Dec 2-15)
├── Bookmarking System
├── Trending Now
└── Quiz System foundation

Week 2-3 (Dec 16-29)
├── Insight Notes
└── Learn Page (stats + collections)

Week 4-5 (Jan 1-15)
├── Profile Completion
├── Avatar Upload
└── Advanced Search

Week 6-7 (Jan 16-31)
├── Push Notifications
├── PDF Upload
└── DOI Search + AI Simplification
```

---

## ✅ Success Criteria

### Sprint 2 Done When:
- ✅ Users can bookmark articles
- ✅ Quizzes work with scoring
- ✅ Insights saved and displayed
- ✅ Trending articles show correctly
- ✅ Learn page tracks all stats
- ✅ Collections functional
- ✅ Zero critical bugs

### Sprint 3 Done When:
- ✅ External search working
- ✅ Notifications delivered
- ✅ Profile shows all data
- ✅ Avatar upload successful
- ✅ PDFs processed correctly
- ✅ DOI search accurate
- ✅ Simplification produces quality results
- ✅ Zero critical bugs

---

## 📞 Communication

**Daily Standup Questions:**
1. What did you complete yesterday?
2. What will you work on today?
3. Any blockers?

**Weekly Review:**
- Friday EOD: Progress check
- Adjust timeline if needed

**Handoff Points:**
- Frontend → Backend: API specs needed
- Backend → Frontend: API ready for integration

---

## 🎓 For Mahasiswa (Students)

**Sprint 2** focuses on making the app more engaging:
- Save favorite articles
- Test your knowledge with quizzes
- Take personal notes
- Track your reading progress

**Sprint 3** brings advanced capabilities:
- Search external academic sources
- Upload your own journals
- Simplify complex texts
- Get personalized notifications

---

**Full Details:** See [`SPRINT_PLAN.md`](./SPRINT_PLAN.md)
**Questions?** Ask Habdil or Tiko
