# Microservices Architecture - Scory Backend

## Overview

Dokumentasi ini menjelaskan **microservices architecture** untuk Scory backend yang terdiri dari 2 backend terpisah:
1. **Main Backend** - Handle core application logic
2. **AI Backend** - Handle AI processing untuk academic paper simplification

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App (React Native)              │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             │ HTTP/REST                      │ HTTP/REST
             │                                │
   ┌─────────▼──────────┐          ┌─────────▼──────────┐
   │  Main Backend      │          │  AI Backend        │
   │  (Node.js/NestJS)  │◄────────►│  (Python/FastAPI)  │
   │  Port: 5000        │   HTTP   │  Port: 8000        │
   └─────────┬──────────┘          └─────────┬──────────┘
             │                               │
             │                               │
   ┌─────────▼──────────┐          ┌────────▼───────────┐
   │  PostgreSQL        │          │  Redis Cache       │
   │  (Main Database)   │          │  (AI Cache)        │
   │  Port: 5432        │          │  Port: 6379        │
   └────────────────────┘          └────────────────────┘
             │                               │
             │                               │
   ┌─────────▼───────────────────────────────▼──────────┐
   │              Message Queue (RabbitMQ)              │
   │              Port: 5672                            │
   └────────────────────────────────────────────────────┘
```

---

## 📦 Backend Services Overview

### 1. **Main Backend** (Node.js + NestJS)

**Responsibilities:**
- User authentication & authorization
- Article CRUD operations
- Category & topic management
- Personalization & recommendations
- Google Scholar API integration
- Request routing to AI backend

**Tech Stack:**
- **Runtime:** Node.js 20+
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL 15
- **ORM:** Prisma
- **Auth:** JWT + Passport.js
- **Validation:** class-validator
- **API Docs:** Swagger/OpenAPI

**Port:** `5000`
**Base URL:** `http://localhost:5000/api/v1`

---

### 2. **AI Backend** (Python + FastAPI)

**Responsibilities:**
- AI paper simplification (OpenAI GPT)
- PDF text extraction
- Natural Language Processing
- Result caching (Redis)
- Queue job processing
- Cost tracking & analytics

**Tech Stack:**
- **Runtime:** Python 3.11+
- **Framework:** FastAPI
- **AI SDK:** OpenAI Python SDK
- **Alternative AI:** Anthropic Claude SDK
- **Cache:** Redis
- **Queue:** Celery + RabbitMQ
- **PDF Processing:** PyPDF2, pdfplumber
- **API Docs:** FastAPI auto-generated (Swagger)

**Port:** `8000`
**Base URL:** `http://localhost:8000/api/ai`

---

## 🔄 Communication Flow

### Flow 1: User Requests Simplification

```
Mobile App
    │
    │ POST /api/v1/academic/simplify
    │ { scholar_id, reading_level }
    ▼
Main Backend
    │
    ├─► Check cache in PostgreSQL
    │   └─► If cached: Return immediately ⚡
    │
    ├─► If not cached:
    │   │
    │   │ POST http://ai-backend:8000/api/ai/simplify
    │   │ { scholar_id, reading_level, paper_content }
    │   ▼
    │   AI Backend
    │       │
    │       ├─► Check Redis cache
    │       │   └─► If cached: Return from Redis
    │       │
    │       ├─► If not cached:
    │       │   │
    │       │   ├─► Add job to Celery queue
    │       │   │
    │       │   ├─► Worker picks up job
    │       │   │
    │       │   ├─► Call OpenAI API
    │       │   │
    │       │   ├─► Save to Redis cache
    │       │   │
    │       │   └─► Return result
    │       │
    │       └─► Return to Main Backend
    │
    └─► Save to PostgreSQL
    │
    └─► Return to Mobile App
```

---

## 📁 Project Structure

### Main Backend Structure

```
scory-main-backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── dto/
│   │   ├── articles/
│   │   │   ├── articles.controller.ts
│   │   │   ├── articles.service.ts
│   │   │   └── dto/
│   │   ├── academic/
│   │   │   ├── academic.controller.ts
│   │   │   ├── academic.service.ts
│   │   │   ├── scholar.service.ts
│   │   │   ├── ai-client.service.ts  ← Calls AI Backend
│   │   │   └── dto/
│   │   ├── users/
│   │   ├── categories/
│   │   └── personalization/
│   ├── common/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── filters/
│   ├── config/
│   │   ├── database.config.ts
│   │   └── app.config.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── docker-compose.yml
```

### AI Backend Structure

```
scory-ai-backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── simplify.py
│   │   │   │   └── health.py
│   │   │   └── router.py
│   │   └── dependencies.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── logging.py
│   ├── services/
│   │   ├── openai_service.py
│   │   ├── claude_service.py
│   │   ├── cache_service.py
│   │   └── pdf_extractor.py
│   ├── workers/
│   │   ├── celery_app.py
│   │   └── tasks.py
│   ├── models/
│   │   ├── request.py
│   │   └── response.py
│   ├── prompts/
│   │   ├── beginner.py
│   │   ├── intermediate.py
│   │   └── advanced.py
│   └── main.py
├── tests/
├── requirements.txt
├── .env
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

---

## 🔌 API Specifications

### Main Backend APIs

#### 1. POST /api/v1/academic/simplify

Request simplification dari AI backend.

**Request:**
```json
{
  "scholar_id": "abc123xyz",
  "reading_level": "beginner"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Simplified title",
    "summary": "Easy to understand summary...",
    "key_points": ["Point 1", "Point 2", "Point 3"]
  },
  "metadata": {
    "from_cache": false,
    "processing_time_ms": 3450,
    "ai_backend_time_ms": 3200,
    "source": "ai-backend"
  }
}
```

#### 2. GET /api/v1/academic/:scholar_id

Get academic paper details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "scholar_id": "abc123",
    "title": "Paper title",
    "authors": ["Author 1"],
    "simplified_versions": {
      "beginner": { ... },
      "intermediate": { ... }
    }
  }
}
```

---

### AI Backend APIs

#### 1. POST /api/ai/simplify

Process paper simplification dengan AI.

**Request:**
```json
{
  "scholar_id": "abc123xyz",
  "reading_level": "beginner",
  "paper_content": {
    "title": "Original paper title",
    "abstract": "Original abstract...",
    "authors": ["Author 1", "Author 2"],
    "year": 2024
  },
  "force_refresh": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Simplified title",
    "summary": "Easy summary...",
    "key_points": ["Point 1", "Point 2"],
    "glossary": {
      "term1": "definition"
    }
  },
  "metadata": {
    "from_cache": false,
    "ai_model": "gpt-4o-mini",
    "tokens_used": 520,
    "processing_time_ms": 2800,
    "cost_usd": 0.0012
  }
}
```

#### 2. GET /api/ai/health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "cache": {
    "redis_connected": true,
    "cached_papers": 1523
  },
  "queue": {
    "pending_jobs": 5,
    "active_workers": 3
  }
}
```

#### 3. GET /api/ai/stats

Get AI processing statistics.

**Response:**
```json
{
  "total_requests": 15234,
  "cache_hit_rate": 78.5,
  "total_tokens_used": 8500000,
  "total_cost_usd": 12.45,
  "average_processing_time_ms": 2450,
  "by_model": {
    "gpt-4o-mini": {
      "requests": 14500,
      "cost_usd": 11.20
    },
    "claude-haiku": {
      "requests": 734,
      "cost_usd": 1.25
    }
  }
}
```

---

## 🔐 Inter-Service Communication

### Method 1: Direct HTTP (Synchronous)

**Main Backend → AI Backend**

```typescript
// main-backend/src/modules/academic/ai-client.service.ts

import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiClientService {
  private aiBackendUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.aiBackendUrl = this.configService.get('AI_BACKEND_URL');
  }

  async simplifyPaper(scholarId: string, level: string, paperContent: any) {
    try {
      const response = await this.httpService.post(
        `${this.aiBackendUrl}/api/ai/simplify`,
        {
          scholar_id: scholarId,
          reading_level: level,
          paper_content: paperContent,
        },
        {
          timeout: 30000, // 30 seconds
          headers: {
            'X-API-Key': this.configService.get('AI_BACKEND_API_KEY'),
          },
        }
      ).toPromise();

      return response.data;
    } catch (error) {
      throw new Error(`AI Backend error: ${error.message}`);
    }
  }
}
```

### Method 2: Message Queue (Asynchronous)

**For background processing**

```typescript
// main-backend: Publish to queue
await this.queueService.publish('simplify-queue', {
  scholar_id: scholarId,
  reading_level: level,
  user_id: userId,
});

// ai-backend: Consume from queue
@Consumer('simplify-queue')
async processSimplification(job: Job) {
  const { scholar_id, reading_level } = job.data;
  const result = await this.openaiService.simplify(...);

  // Notify main backend via webhook
  await this.httpClient.post(
    `${mainBackendUrl}/api/v1/academic/webhook`,
    { scholar_id, result }
  );
}
```

---

## 🗄️ Database Schemas

### Main Backend (PostgreSQL)

```prisma
// prisma/schema.prisma

model AcademicPaper {
  id               String   @id @default(uuid())
  scholarId        String   @unique @map("scholar_id")
  title            String
  authors          String[]
  abstract         String?
  publicationYear  Int?     @map("publication_year")
  publicationInfo  String?  @map("publication_info")
  citedBy          Int      @default(0) @map("cited_by")
  pdfUrl           String?  @map("pdf_url")
  scholarLink      String?  @map("scholar_link")

  // Simplified versions (JSON)
  simplifiedVersions Json?   @map("simplified_versions")

  // Processing status
  isProcessed      Boolean  @default(false) @map("is_processed")
  processingStatus String   @default("pending") @map("processing_status")
  processingError  String?  @map("processing_error")

  // Cache stats
  accessCount      Int      @default(0) @map("access_count")
  lastAccessedAt   DateTime? @map("last_accessed_at")

  // Timestamps
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  @@map("academic_papers")
  @@index([scholarId])
  @@index([accessCount])
  @@index([isProcessed])
}

model SimplificationRequest {
  id              String   @id @default(uuid())

  userId          String   @map("user_id")
  academicPaperId String   @map("academic_paper_id")
  scholarId       String   @map("scholar_id")
  readingLevel    String   @map("reading_level")

  fromCache       Boolean  @default(false) @map("from_cache")
  processingTimeMs Int?    @map("processing_time_ms")

  aiModel         String?  @map("ai_model")
  tokensUsed      Int?     @map("tokens_used")
  aiCost          Decimal? @map("ai_cost") @db.Decimal(10, 6)

  createdAt       DateTime @default(now()) @map("created_at")

  user            User     @relation(fields: [userId], references: [id])

  @@map("simplification_requests")
  @@index([userId])
  @@index([academicPaperId])
  @@index([createdAt])
}
```

### AI Backend (Redis Cache)

```python
# Redis key structure

# Cache key format
key = f"simplified:{scholar_id}:{reading_level}"

# Value structure (JSON)
{
  "title": "Simplified title",
  "summary": "Summary text...",
  "key_points": ["Point 1", "Point 2"],
  "glossary": {"term": "definition"},
  "processed_at": "2025-11-27T10:00:00Z",
  "ai_model": "gpt-4o-mini",
  "tokens_used": 500,
  "cost_usd": 0.001
}

# TTL: 7 days (604800 seconds)
```

---

## 🐳 Docker Deployment

### Docker Compose for All Services

```yaml
# docker-compose.yml

version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: scory-postgres
    environment:
      POSTGRES_DB: scory
      POSTGRES_USER: scory
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - scory-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: scory-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - scory-network

  # RabbitMQ Message Queue
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: scory-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: scory
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    ports:
      - "5672:5672"   # AMQP port
      - "15672:15672" # Management UI
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - scory-network

  # Main Backend (Node.js)
  main-backend:
    build:
      context: ./scory-main-backend
      dockerfile: Dockerfile
    container_name: scory-main-backend
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://scory:${POSTGRES_PASSWORD}@postgres:5432/scory
      AI_BACKEND_URL: http://ai-backend:8000
      AI_BACKEND_API_KEY: ${AI_BACKEND_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      RABBITMQ_URL: amqp://scory:${RABBITMQ_PASSWORD}@rabbitmq:5672
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - rabbitmq
    networks:
      - scory-network
    restart: unless-stopped

  # AI Backend (Python)
  ai-backend:
    build:
      context: ./scory-ai-backend
      dockerfile: Dockerfile
    container_name: scory-ai-backend
    environment:
      ENVIRONMENT: production
      PORT: 8000
      REDIS_URL: redis://redis:6379/0
      RABBITMQ_URL: amqp://scory:${RABBITMQ_PASSWORD}@rabbitmq:5672
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      API_KEY: ${AI_BACKEND_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - redis
      - rabbitmq
    networks:
      - scory-network
    restart: unless-stopped

  # Celery Worker (AI Background Jobs)
  celery-worker:
    build:
      context: ./scory-ai-backend
      dockerfile: Dockerfile
    container_name: scory-celery-worker
    command: celery -A app.workers.celery_app worker --loglevel=info
    environment:
      REDIS_URL: redis://redis:6379/0
      RABBITMQ_URL: amqp://scory:${RABBITMQ_PASSWORD}@rabbitmq:5672
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    depends_on:
      - redis
      - rabbitmq
    networks:
      - scory-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:

networks:
  scory-network:
    driver: bridge
```

---

## 🚀 Deployment Guide

### Step 1: Setup Environment Variables

**Main Backend (.env):**
```env
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://scory:password@localhost:5432/scory

# AI Backend
AI_BACKEND_URL=http://localhost:8000
AI_BACKEND_API_KEY=your-secure-api-key

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# RabbitMQ
RABBITMQ_URL=amqp://scory:password@localhost:5672

# Google Scholar
SERPAPI_KEY=aa2ac5239676cd359d6a0da68a1f57cbbe232ed6d3d5dfa7220d76ae222ae303
```

**AI Backend (.env):**
```env
ENVIRONMENT=production
PORT=8000

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_TTL=604800

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1500

# Claude (Fallback)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-haiku-20240307

# RabbitMQ
RABBITMQ_URL=amqp://scory:password@localhost:5672

# API Security
API_KEY=your-secure-api-key
```

### Step 2: Build & Run

```bash
# Clone repositories
git clone <main-backend-repo>
git clone <ai-backend-repo>

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f main-backend
docker-compose logs -f ai-backend

# Run migrations
docker-compose exec main-backend npm run prisma:migrate

# Health check
curl http://localhost:5000/health
curl http://localhost:8000/api/ai/health
```

---

## 📊 Monitoring & Logging

### Health Checks

```bash
# Main Backend
curl http://localhost:5000/health

# AI Backend
curl http://localhost:8000/api/ai/health

# RabbitMQ Management UI
open http://localhost:15672
# Login: scory / password
```

### Logging Strategy

**Main Backend (Winston):**
```typescript
import * as winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

**AI Backend (Python logging):**
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai-backend.log'),
        logging.StreamHandler()
    ]
)
```

---

## 💰 Infrastructure Cost Estimate

### Cloud Hosting (Monthly)

**Option 1: AWS**
```
- EC2 t3.medium (Main Backend): $30
- EC2 t3.small (AI Backend): $20
- RDS PostgreSQL db.t3.micro: $15
- ElastiCache Redis t3.micro: $12
- Application Load Balancer: $20
- Data Transfer: $10
Total: ~$107/month
```

**Option 2: DigitalOcean**
```
- Droplet 4GB (Main Backend): $24
- Droplet 2GB (AI Backend): $12
- Managed PostgreSQL: $15
- Managed Redis: $10
- Load Balancer: $12
Total: ~$73/month
```

**Option 3: Self-hosted VPS**
```
- VPS 8GB RAM: $40
- (Run all services on one VPS with Docker)
Total: ~$40/month
```

---

## 🔒 Security Best Practices

### 1. API Authentication

**Main Backend ↔ Mobile App:** JWT tokens
**Main Backend ↔ AI Backend:** API Key

```typescript
// AI Backend request
headers: {
  'X-API-Key': process.env.AI_BACKEND_API_KEY
}

// AI Backend validation
if (req.headers['x-api-key'] !== process.env.API_KEY) {
  throw new UnauthorizedException();
}
```

### 2. Rate Limiting

```typescript
// Main Backend
@UseGuards(ThrottlerGuard)
@Throttle(20, 60) // 20 requests per minute
async simplify() { ... }

// AI Backend (FastAPI)
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/api/ai/simplify")
@limiter.limit("10/minute")
async def simplify() { ... }
```

### 3. CORS Configuration

```typescript
// Main Backend
app.enableCors({
  origin: ['https://app.scory.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});

// AI Backend - Only allow Main Backend
origins = [
    "http://main-backend:5000",
    "https://api.scory.com"
]
```

---

## 🧪 Testing Strategy

### Main Backend Tests

```typescript
// academic.service.spec.ts

describe('AcademicService', () => {
  it('should return cached result if available', async () => {
    const result = await service.simplify('abc123', 'beginner');
    expect(result.metadata.from_cache).toBe(true);
  });

  it('should call AI backend if not cached', async () => {
    jest.spyOn(aiClient, 'simplifyPaper').mockResolvedValue({...});
    const result = await service.simplify('xyz789', 'beginner');
    expect(aiClient.simplifyPaper).toHaveBeenCalled();
  });
});
```

### AI Backend Tests

```python
# test_simplify.py

def test_simplify_with_cache():
    response = client.post("/api/ai/simplify", json={
        "scholar_id": "cached-123",
        "reading_level": "beginner"
    })
    assert response.json()["metadata"]["from_cache"] == True

def test_simplify_without_cache():
    response = client.post("/api/ai/simplify", json={
        "scholar_id": "new-paper-456",
        "reading_level": "beginner"
    })
    assert response.json()["metadata"]["ai_model"] == "gpt-4o-mini"
```

---

## 📈 Scalability Plan

### Phase 1: Single Instance (MVP)
```
1x Main Backend
1x AI Backend
1x PostgreSQL
1x Redis
Cost: ~$40/month
Handles: 1k users
```

### Phase 2: Horizontal Scaling
```
2x Main Backend (Load Balanced)
3x AI Backend (Load Balanced)
1x PostgreSQL (with read replicas)
1x Redis Cluster
Cost: ~$150/month
Handles: 50k users
```

### Phase 3: Auto-scaling
```
Auto-scaling groups for both backends
Managed database services
CDN for static assets
Cost: ~$500/month
Handles: 500k+ users
```

---

## 🎯 Success Metrics

**Target KPIs:**
- Main Backend uptime: > 99.9%
- AI Backend uptime: > 99.5%
- API response time (cached): < 100ms
- API response time (AI): < 5s
- Cache hit rate: > 80%
- Error rate: < 0.5%

---

## 📚 Additional Resources

- **NestJS Docs:** https://docs.nestjs.com
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Prisma Docs:** https://www.prisma.io/docs
- **OpenAI API:** https://platform.openai.com/docs
- **Docker Compose:** https://docs.docker.com/compose

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Status:** 📋 Ready for Implementation
**Architecture Type:** Microservices (2 Backends)
**Estimated Setup Time:** 2-3 weeks
**Maintenance Complexity:** Medium-High

---

**Next Steps:**
1. ✅ Setup GitHub repositories (main-backend, ai-backend)
2. ✅ Initialize NestJS project
3. ✅ Initialize FastAPI project
4. ✅ Setup Docker Compose
5. ✅ Implement authentication
6. ✅ Implement inter-service communication
7. ✅ Deploy to staging
8. ✅ Load testing
9. ✅ Production deployment

Good luck! 🚀
