# Research: GeekNews Feed MVP

**Date**: 2026-01-21
**Feature**: 001-geeknews-feed-mvp

---

## 1. GeekNews RSS Feed Structure

### Decision
Use the official GeekNews Atom feed at `https://news.hada.io/rss/news`.

### Rationale
- Official feed provided by GeekNews (documented at https://news.hada.io/blog/geeknews_feed)
- Atom format (RFC 4287) with rich metadata
- Reliable and actively maintained
- No rate limiting observed for reasonable fetch intervals

### Feed Details

**URL**: `https://news.hada.io/rss/news`
**Format**: Atom 1.0 (XML namespace: `http://www.w3.org/2005/Atom`)

**Available Fields per Entry**:
| Field | XPath | Description | Maps to Article |
|-------|-------|-------------|-----------------|
| `title` | `entry/title` | Article title (may contain CDATA) | `title` |
| `id` | `entry/id` | Unique identifier (GeekNews topic URL) | `guid` |
| `link[@rel='alternate']` | `entry/link/@href` | GeekNews topic page URL | `geeknews_url` |
| `updated` | `entry/updated` | Last update timestamp (ISO 8601) | `published_at` |
| `published` | `entry/published` | Original publish timestamp | `published_at` (prefer this) |
| `author/name` | `entry/author/name` | Submitter username | (not stored - metadata only) |
| `content` | `entry/content` | HTML summary snippet | (not stored - metadata only) |

**Note**: The `content` field contains HTML with a summary. Per Constitution Principle III (Metadata-Only Storage), we do NOT store this content—only the link for users to click through.

### External Article URL
The feed entries link to GeekNews topic pages (`https://news.hada.io/topic?id=XXXXX`), not the original external articles. To get the original article URL, we would need to:
1. Parse the HTML content field (contains the external link), OR
2. Fetch the topic page and extract the link

**Decision**: For MVP, store only the GeekNews topic URL. Users click through to GeekNews, which then links to the original. This is simpler and avoids additional HTTP requests per article.

### Alternatives Considered
1. **ITCORD mirror feed** (`https://itcord.github.io/geeknews/new.xml`): Third-party mirror, may have delays or availability issues. Rejected.
2. **HTML scraping**: Would violate Constitution Principle II (Feed-First Ingestion). Rejected.

---

## 2. RSS Parsing Library

### Decision
Use `rss-parser` npm package.

### Rationale
- Most popular RSS/Atom parser for Node.js (2M+ weekly downloads)
- TypeScript support with type definitions
- Handles both RSS 2.0 and Atom formats
- Customizable field mapping
- Actively maintained

### Usage Pattern
```typescript
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['published'] // Atom uses 'published' in addition to 'updated'
  }
});

const feed = await parser.parseURL('https://news.hada.io/rss/news');
for (const item of feed.items) {
  // item.title, item.link, item.id (guid), item.isoDate (published/updated)
}
```

### Alternatives Considered
1. **feedparser** (Python): Wrong language. Rejected.
2. **fast-xml-parser**: Lower-level, would need manual Atom handling. More work for no benefit. Rejected.
3. **rss-to-json**: Less maintained, fewer features. Rejected.

---

## 3. Backend Framework

### Decision
Use Express.js with TypeScript.

### Rationale
- Constitution requires TypeScript-first (Principle I)
- Express is the most mature Node.js framework
- Excellent TypeScript support
- Simple to set up, widely documented
- Suitable for MVP scope (4-5 endpoints)

### Alternatives Considered
1. **Fastify**: Faster but more complex setup. Overkill for MVP. Rejected.
2. **NestJS**: Full framework with decorators. Over-engineered for simple CRUD MVP. Rejected.
3. **Hono**: Modern but less ecosystem support. Rejected for MVP.

---

## 4. ORM and Database

### Decision
Use Prisma with PostgreSQL.

### Rationale
- Constitution recommends Postgres + Prisma (Additional Constraints)
- Prisma provides excellent TypeScript integration with generated types
- Declarative schema with migration support
- Built-in upsert for deduplication (Constitution Principle IV)

### Schema Approach
```prisma
model Article {
  id           String   @id @default(uuid())
  source       String   @default("geeknews")
  guid         String   @unique
  title        String
  url          String   // GeekNews topic URL
  publishedAt  DateTime @map("published_at")
  fetchedAt    DateTime @map("fetched_at")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@index([publishedAt(sort: Desc)])
  @@index([source, publishedAt(sort: Desc)])
  @@map("articles")
}
```

### Alternatives Considered
1. **TypeORM**: More complex, decorator-heavy. Prisma is simpler. Rejected.
2. **Drizzle**: Newer, less mature. Rejected for MVP stability.
3. **Kysely**: Query builder only, no migrations. Rejected.

---

## 5. Frontend Framework

### Decision
Use React 18 with Vite.

### Rationale
- React is the most widely used frontend framework
- Vite provides fast HMR and build times
- Excellent TypeScript support
- Large ecosystem for infinite scroll, data fetching

### Alternatives Considered
1. **Next.js**: SSR/SSG overkill for simple SPA feed. Adds complexity. Rejected.
2. **Vue**: Good but React has larger ecosystem. Team preference for React. Rejected.
3. **Svelte**: Smaller ecosystem, less familiar. Rejected for MVP.

---

## 6. Data Fetching (Frontend)

### Decision
Use TanStack Query (React Query) v5.

### Rationale
- Industry standard for React data fetching
- Built-in infinite query support (`useInfiniteQuery`)
- Automatic caching, refetching, error handling
- TypeScript-first design

### Infinite Scroll Pattern
```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['articles'],
  queryFn: ({ pageParam }) => fetchArticles(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

### Alternatives Considered
1. **SWR**: Good but less feature-rich for infinite queries. Rejected.
2. **Apollo Client**: GraphQL-focused, we're using REST. Rejected.
3. **Custom fetch**: Would need to reinvent caching, infinite scroll. Rejected.

---

## 7. Shared Validation (DTOs)

### Decision
Use Zod for schema validation shared between backend and frontend.

### Rationale
- Constitution requires shared types/schemas (Principle I)
- Zod provides runtime validation + TypeScript inference
- Works in both Node.js and browser
- Composable schemas

### Schema Example
```typescript
// shared/schemas/article.ts
import { z } from 'zod';

export const ArticleSchema = z.object({
  id: z.string().uuid(),
  source: z.string(),
  guid: z.string(),
  title: z.string(),
  url: z.string().url(),
  publishedAt: z.string().datetime(),
});

export type Article = z.infer<typeof ArticleSchema>;
```

### Alternatives Considered
1. **io-ts**: More complex FP-style API. Less ergonomic. Rejected.
2. **Yup**: Less TypeScript inference quality. Rejected.
3. **JSON Schema**: No TypeScript inference without codegen. Rejected.

---

## 8. Scheduler Pattern

### Decision
Use node-cron with tick+gate pattern.

### Rationale
- Constitution requires configurable interval without code changes (Principle V)
- node-cron is simple and reliable
- Tick+gate pattern: cron runs every minute, checks if `(now - lastRun) >= interval`

### Implementation Pattern
```typescript
import cron from 'node-cron';

// Run every minute
cron.schedule('* * * * *', async () => {
  const interval = await getSettingValue('ingest_interval_minutes');
  const lastRun = await getLastSuccessfulRun();

  if (shouldRunNow(lastRun, interval)) {
    await runIngestion();
  }
});
```

### Alternatives Considered
1. **Bull/BullMQ**: Requires Redis, overkill for single-job scheduler. Rejected.
2. **Agenda**: Requires MongoDB. Rejected (we use Postgres).
3. **node-schedule**: Similar to node-cron but less maintained. Rejected.

---

## 9. Cursor-Based Pagination

### Decision
Use `published_at` timestamp + `id` as cursor for stable pagination.

### Rationale
- Constitution requires cursor-based pagination (Additional Constraints)
- Timestamp cursor handles new items appearing during scroll
- ID tiebreaker ensures deterministic ordering for same-timestamp items

### Cursor Format
```
Base64(JSON({ publishedAt: ISO8601, id: UUID }))
```

### API Response
```json
{
  "articles": [...],
  "nextCursor": "eyJwdWJsaXNoZWRBdCI6IjIwMjYtMDEtMjFUMTI6MDA6MDBaIiwiaWQiOiJhYmMxMjMifQ==",
  "hasMore": true
}
```

### Alternatives Considered
1. **Offset pagination**: Unreliable with changing data, poor performance. Rejected.
2. **ID-only cursor**: Doesn't handle sorting by non-unique field. Rejected.
3. **Keyset pagination (raw)**: Same as our approach but cursor format is cleaner. Adopted.

---

## 10. Logging and Observability

### Decision
Use pino for structured logging.

### Rationale
- Constitution requires logging ingestion runs (Development Workflow)
- pino is the fastest Node.js logger
- JSON output for structured logging
- Easy to integrate with log aggregators

### Log Format
```json
{
  "level": "info",
  "time": 1706000000000,
  "msg": "Ingestion completed",
  "runId": "abc-123",
  "newCount": 5,
  "updatedCount": 2,
  "durationMs": 1234
}
```

### Alternatives Considered
1. **winston**: Slower, more complex configuration. Rejected.
2. **console.log**: No structure, hard to parse. Rejected.
3. **bunyan**: Less maintained than pino. Rejected.

---

## Summary: Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Language | TypeScript | 5.x |
| Runtime | Node.js | 20 LTS |
| Backend Framework | Express.js | 4.x |
| ORM | Prisma | 5.x |
| Database | PostgreSQL | 15+ |
| RSS Parser | rss-parser | 3.x |
| Scheduler | node-cron | 3.x |
| Validation | Zod | 3.x |
| Frontend Framework | React | 18.x |
| Build Tool | Vite | 5.x |
| Data Fetching | TanStack Query | 5.x |
| Logging | pino | 8.x |
| Testing | Vitest | 1.x |

---

## References

- [GeekNews Feed Documentation](https://news.hada.io/blog/geeknews_feed)
- [Atom Syndication Format (RFC 4287)](https://tools.ietf.org/html/rfc4287)
- [rss-parser npm](https://www.npmjs.com/package/rss-parser)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TanStack Query Infinite Queries](https://tanstack.com/query/latest/docs/react/guides/infinite-queries)
- [Cursor Pagination Best Practices](https://slack.engineering/evolving-api-pagination-at-slack/)
