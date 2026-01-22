# Quickstart: GeekNews Feed MVP

**Date**: 2026-01-21
**Feature**: 001-geeknews-feed-mvp

---

## Prerequisites

- **Node.js**: 20.x LTS
- **pnpm**: 8.x+ (or npm/yarn)
- **PostgreSQL**: 15+ (local or Docker)
- **Git**: For version control

---

## Environment Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repo-url>
cd contentHub

# Install dependencies
pnpm install
```

### 2. Environment Variables

Create `.env` files for backend and frontend:

```bash
# backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/contenthub?schema=public"
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# RSS Feed Configuration
RSS_FEED_URL=https://news.hada.io/rss/news
RSS_FETCH_TIMEOUT_MS=30000

# frontend/.env
VITE_API_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Option A: Using Docker
docker run -d \
  --name contenthub-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=contenthub \
  -p 5432:5432 \
  postgres:15

# Option B: Local PostgreSQL
createdb contenthub
```

### 4. Run Migrations

```bash
cd backend

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed default settings
pnpm prisma db seed
```

---

## Development

### Start Backend

```bash
cd backend
pnpm dev
# Server runs at http://localhost:3000
```

### Start Frontend

```bash
cd frontend
pnpm dev
# App runs at http://localhost:5173
```

### Run Both (Recommended)

```bash
# From project root
pnpm dev
# Uses turborepo/concurrently to run both
```

---

## Verify Installation

### 1. Check API Health

```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok"}
```

### 2. Trigger Manual Ingestion

```bash
# Run ingestion manually (development only)
curl -X POST http://localhost:3000/api/admin/ingest
# Expected: {"status":"started","runId":"..."}
```

### 3. Fetch Articles

```bash
curl http://localhost:3000/api/articles?limit=5
# Expected: {"articles":[...],"nextCursor":"...","hasMore":true}
```

### 4. View Frontend

Open http://localhost:5173 in browser. You should see the article feed.

---

## Project Structure

```
contentHub/
├── backend/
│   ├── src/
│   │   ├── api/           # Express routes
│   │   ├── services/      # Business logic
│   │   ├── jobs/          # Scheduler
│   │   ├── models/        # Zod schemas
│   │   └── lib/           # Utilities
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── lib/
│   └── tests/
├── shared/
│   └── schemas/           # Shared Zod schemas
└── specs/
    └── 001-geeknews-feed-mvp/
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development servers |
| `pnpm build` | Build for production |
| `pnpm test` | Run all tests |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm prisma studio` | Open Prisma database GUI |
| `pnpm prisma migrate dev` | Create/apply migrations |

---

## Troubleshooting

### Database Connection Failed

```
Error: P1001: Can't reach database server
```

**Solution**: Ensure PostgreSQL is running and `DATABASE_URL` is correct.

```bash
# Check if PostgreSQL is running
docker ps | grep contenthub-db

# Or for local PostgreSQL
pg_isready -h localhost -p 5432
```

### RSS Feed 403 Error

```
Error: Request failed with status code 403
```

**Solution**: The GeekNews RSS feed may block certain user agents. The collector uses a browser-like user agent header. If issues persist, check if the feed URL has changed.

### Port Already in Use

```
Error: listen EADDRINUSE :::3000
```

**Solution**: Kill the process using the port or use a different port.

```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

---

## Next Steps

1. Review the [Implementation Plan](./plan.md)
2. Check the [API Contracts](./contracts/openapi.yaml)
3. Run `/speckit.tasks` to generate task list
4. Start implementation with Phase 1: Setup
