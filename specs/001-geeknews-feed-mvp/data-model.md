# Data Model: GeekNews Feed MVP

**Date**: 2026-01-21
**Feature**: 001-geeknews-feed-mvp

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Article                              │
├─────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                               │
│ source: String [default: "geeknews"]                        │
│ guid: String (UNIQUE) ─────────────────────┐                │
│ title: String                               │ Deduplication │
│ url: String ───────────────────────────────┘   Key          │
│ published_at: DateTime                                       │
│ fetched_at: DateTime                                        │
│ created_at: DateTime                                        │
│ updated_at: DateTime                                        │
├─────────────────────────────────────────────────────────────┤
│ Indexes:                                                    │
│  - published_at DESC (feed ordering)                        │
│  - (source, published_at DESC) (filtered queries)           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         Setting                              │
├─────────────────────────────────────────────────────────────┤
│ key: String (PK)                                            │
│ value: String                                               │
│ updated_at: DateTime                                        │
├─────────────────────────────────────────────────────────────┤
│ Default Rows:                                               │
│  - key: "ingest_interval_minutes", value: "180"             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      IngestionRun                            │
├─────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                               │
│ started_at: DateTime                                        │
│ finished_at: DateTime (nullable)                            │
│ status: Enum [running, success, failed]                     │
│ new_count: Integer [default: 0]                             │
│ updated_count: Integer [default: 0]                         │
│ error_message: Text (nullable)                              │
├─────────────────────────────────────────────────────────────┤
│ Indexes:                                                    │
│  - started_at DESC (recent runs query)                      │
│  - (status, started_at DESC) (last success lookup)          │
└─────────────────────────────────────────────────────────────┘
```

---

## Entity Details

### Article

Represents a single news item ingested from GeekNews RSS feed.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Internal unique identifier |
| `source` | String | NOT NULL, default "geeknews" | Content source identifier (for future multi-source) |
| `guid` | String | UNIQUE, NOT NULL | RSS entry ID (deduplication key) |
| `title` | String | NOT NULL | Article title from feed |
| `url` | String | NOT NULL | GeekNews topic page URL |
| `published_at` | DateTime | NOT NULL | Original publish timestamp from feed |
| `fetched_at` | DateTime | NOT NULL | When we ingested this item |
| `created_at` | DateTime | NOT NULL, auto | Record creation timestamp |
| `updated_at` | DateTime | NOT NULL, auto | Record last update timestamp |

**Constitution Compliance**:
- Principle III (Metadata-Only): Only stores title, url, timestamps, source
- Principle IV (Idempotent): UNIQUE constraint on `guid` prevents duplicates

**Validation Rules**:
- `title`: Max 500 characters, trimmed whitespace
- `url`: Valid URL format
- `guid`: Non-empty string
- `published_at`: Must be valid ISO 8601 datetime

---

### Setting

Key-value store for system configuration.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `key` | String | PK | Setting identifier |
| `value` | String | NOT NULL | Setting value (stored as string) |
| `updated_at` | DateTime | NOT NULL, auto | Last modification timestamp |

**Known Settings**:
| Key | Type | Default | Valid Range | Description |
|-----|------|---------|-------------|-------------|
| `ingest_interval_minutes` | Integer | 180 | 1-10080 | Minutes between ingestion runs |

**Constitution Compliance**:
- Principle V (Configurable Scheduling): DB-backed setting for interval

**Validation Rules**:
- `ingest_interval_minutes`: Positive integer, 1 ≤ value ≤ 10080 (1 week max)

---

### IngestionRun

Audit log for each ingestion attempt.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Run identifier |
| `started_at` | DateTime | NOT NULL | When run began |
| `finished_at` | DateTime | nullable | When run completed (null if running) |
| `status` | Enum | NOT NULL | Current state: `running`, `success`, `failed` |
| `new_count` | Integer | NOT NULL, default 0 | Number of new articles inserted |
| `updated_count` | Integer | NOT NULL, default 0 | Number of existing articles updated |
| `error_message` | Text | nullable | Error details if failed |

**Status Transitions**:
```
         ┌──────────┐
         │ running  │
         └────┬─────┘
              │
       ┌──────┴──────┐
       ▼             ▼
  ┌─────────┐   ┌────────┐
  │ success │   │ failed │
  └─────────┘   └────────┘
```

**Constitution Compliance**:
- Development Workflow (Observability): Logs each run with counts and errors

---

## Prisma Schema

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Article {
  id          String   @id @default(uuid())
  source      String   @default("geeknews")
  guid        String   @unique
  title       String
  url         String
  publishedAt DateTime @map("published_at")
  fetchedAt   DateTime @map("fetched_at")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([publishedAt(sort: Desc)])
  @@index([source, publishedAt(sort: Desc)])
  @@map("articles")
}

model Setting {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("settings")
}

enum IngestionStatus {
  running
  success
  failed
}

model IngestionRun {
  id           String          @id @default(uuid())
  startedAt    DateTime        @map("started_at")
  finishedAt   DateTime?       @map("finished_at")
  status       IngestionStatus
  newCount     Int             @default(0) @map("new_count")
  updatedCount Int             @default(0) @map("updated_count")
  errorMessage String?         @map("error_message")

  @@index([startedAt(sort: Desc)])
  @@index([status, startedAt(sort: Desc)])
  @@map("ingestion_runs")
}
```

---

## Seed Data

```typescript
// backend/prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Default settings
  await prisma.setting.upsert({
    where: { key: 'ingest_interval_minutes' },
    update: {},
    create: {
      key: 'ingest_interval_minutes',
      value: '180', // 3 hours default
    },
  });

  console.log('Seed data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Query Patterns

### Feed Query (Cursor Pagination)

```sql
-- First page
SELECT * FROM articles
ORDER BY published_at DESC, id DESC
LIMIT 20;

-- Subsequent pages (cursor = { publishedAt, id })
SELECT * FROM articles
WHERE (published_at, id) < ($1, $2)
ORDER BY published_at DESC, id DESC
LIMIT 20;
```

### Upsert for Deduplication

```sql
INSERT INTO articles (id, source, guid, title, url, published_at, fetched_at, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
ON CONFLICT (guid) DO UPDATE SET
  title = EXCLUDED.title,
  url = EXCLUDED.url,
  updated_at = NOW();
```

### Last Successful Run

```sql
SELECT * FROM ingestion_runs
WHERE status = 'success'
ORDER BY started_at DESC
LIMIT 1;
```

---

## Migration Strategy

1. **Initial Migration**: Create all three tables with indexes
2. **Seed Migration**: Insert default settings
3. **Future Migrations**: Add columns as needed (e.g., `external_url` for original article links)

All migrations managed via `prisma migrate` workflow as per Constitution Additional Constraints.
