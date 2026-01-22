# ContentHub

A TypeScript full-stack web application that aggregates GeekNews RSS feed and displays articles in an infinite-scrolling feed.

## Features

- **RSS Feed Ingestion**: Automatically fetches articles from GeekNews RSS feed
- **Infinite Scroll Feed**: Browse articles with smooth infinite scrolling
- **Configurable Scheduling**: Adjust ingestion interval via API without redeployment
- **Deduplication**: GUID-based deduplication prevents duplicate articles
- **Cursor Pagination**: Stable cursor-based pagination for reliable infinite scroll

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, Vite, TanStack Query, TypeScript
- **Shared**: Zod schemas for type-safe validation

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment

```bash
# Copy example env file
cp backend/.env.example backend/.env

# Edit .env with your database connection
# DATABASE_URL="postgresql://user:password@localhost:5432/contenthub"
```

### 3. Setup Database

```bash
# Start PostgreSQL (using Docker)
docker run -d \
  --name contenthub-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=contenthub \
  -p 5432:5432 \
  postgres:15

# Run migrations
pnpm db:migrate

# Seed default settings
pnpm db:seed
```

### 4. Start Development

```bash
# Start both backend and frontend
pnpm dev

# Or start individually
pnpm dev:backend  # Backend at http://localhost:3000
pnpm dev:frontend # Frontend at http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/articles` | List articles (cursor pagination) |
| GET | `/api/articles/:id` | Get single article |
| GET | `/api/settings` | Get all settings |
| PATCH | `/api/settings/ingest-interval` | Update ingestion interval |
| POST | `/api/admin/ingest` | Manual ingestion trigger (dev only) |

## Project Structure

```
contentHub/
├── backend/           # Express API server
│   ├── src/
│   │   ├── api/       # Route handlers
│   │   ├── services/  # Business logic
│   │   ├── jobs/      # Scheduler
│   │   └── lib/       # Utilities
│   └── prisma/        # Database schema
├── frontend/          # React application
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── shared/            # Shared Zod schemas
    └── schemas/
```

## License

MIT
