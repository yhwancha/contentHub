# Implementation Plan: GeekNews Feed MVP

**Branch**: `001-geeknews-feed-mvp` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-geeknews-feed-mvp/spec.md`

## Summary

Build a TypeScript full-stack web application that periodically ingests GeekNews RSS feed items into a PostgreSQL database and displays them via an infinite-scrolling feed UI. The system uses a tick+gate scheduler pattern for configurable ingestion intervals and enforces deduplication at the database layer.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20 LTS)
**Primary Dependencies**:
- Backend: Express.js (API), node-cron (scheduler), rss-parser (RSS parsing), Prisma (ORM)
- Frontend: React 18 with Vite, TanStack Query (data fetching)
- Shared: Zod (validation/DTOs)

**Storage**: PostgreSQL 15+ with Prisma migrations
**Testing**: Vitest (unit/integration), Playwright (E2E optional)
**Target Platform**: Linux server (Docker), modern browsers
**Project Type**: Web application (backend + frontend)
**Performance Goals**:
- API response < 200ms p95 for paginated queries
- Feed page initial load < 2s
- Infinite scroll batch load < 1s

**Constraints**:
- Metadata-only storage (no full article bodies)
- RSS-first ingestion (no HTML scraping)
- Cursor-based pagination for infinite scroll

**Scale/Scope**:
- Single news source (GeekNews)
- ~50-100 articles/day ingestion
- MVP: single-user read-only feed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation |
|-----------|--------|----------------|
| I. TypeScript-First (NON-NEGOTIABLE) | ✅ PASS | Full-stack TypeScript, shared Zod schemas for DTOs |
| II. Feed-First Ingestion | ✅ PASS | RSS feed (`https://news.hada.io/rss`) as sole source |
| III. Metadata-Only Storage (NON-NEGOTIABLE) | ✅ PASS | Article model stores only: title, url, published_at, source |
| IV. Idempotent & Deduplicated Ingestion | ✅ PASS | UNIQUE constraint on guid/url, Prisma upsert |
| V. Configurable Scheduling | ✅ PASS | DB-backed `Setting` table, tick+gate pattern |

**Additional Constraints Check**:
- Database: ✅ PostgreSQL + Prisma migrations
- Pagination: ✅ Cursor-based API design
- Attribution: ✅ UI displays "GeekNews" + outbound links
- Security: ✅ `.claude/` in `.gitignore`, env vars for secrets
- Rate Limits: ✅ Timeouts, exponential backoff in collector

## Project Structure

### Documentation (this feature)

```text
specs/001-geeknews-feed-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI spec)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # Prisma schema types, Zod DTOs
│   ├── services/        # Business logic (collector, articles, settings)
│   ├── api/             # Express routes and middleware
│   ├── jobs/            # Scheduler (tick+gate ingestion)
│   └── lib/             # Utilities (logger, rss-parser wrapper)
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Migration files
└── tests/
    ├── unit/            # Service unit tests
    └── integration/     # API integration tests

frontend/
├── src/
│   ├── components/      # React components (ArticleCard, Feed, etc.)
│   ├── pages/           # Page components (HomePage)
│   ├── services/        # API client (TanStack Query hooks)
│   ├── types/           # Shared types (imported from backend or duplicated)
│   └── lib/             # Utilities (date formatting, etc.)
└── tests/
    └── components/      # Component tests

shared/
└── schemas/             # Zod schemas shared between backend/frontend
    ├── article.ts
    ├── setting.ts
    └── api.ts           # Request/response DTOs
```

**Structure Decision**: Web application structure (Option 2) with an additional `shared/` directory for TypeScript schemas that are consumed by both backend and frontend, ensuring type safety across the stack per Constitution Principle I.

## Complexity Tracking

> No violations to justify - all constitution principles satisfied.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |
