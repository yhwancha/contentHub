# Tasks: GeekNews Feed MVP

**Input**: Design documents from `/specs/001-geeknews-feed-mvp/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/openapi.yaml

**Tests**: Tests are NOT explicitly requested in the spec. Test tasks are omitted per task generation rules.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`, `shared/schemas/`
- Paths follow the structure defined in plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure

- [x] T001 Create monorepo structure with backend/, frontend/, shared/ directories
- [x] T002 Initialize backend Node.js project with TypeScript in backend/package.json
- [x] T003 [P] Initialize frontend Vite + React project with TypeScript in frontend/package.json
- [x] T004 [P] Initialize shared package for Zod schemas in shared/package.json
- [x] T005 [P] Configure ESLint and Prettier for monorepo in root .eslintrc.js and .prettierrc
- [x] T006 [P] Create root package.json with workspace scripts (dev, build, lint)
- [x] T007 [P] Add .gitignore with node_modules, .env, dist, .claude/ entries
- [x] T008 Create backend/.env.example with DATABASE_URL, PORT, RSS_FEED_URL placeholders

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create Prisma schema with Article, Setting, IngestionRun models in backend/prisma/schema.prisma
- [ ] T010 Run initial Prisma migration to create database tables
- [x] T011 Create seed script with default ingest_interval_minutes setting in backend/prisma/seed.ts
- [x] T012 [P] Create Article Zod schema in shared/schemas/article.ts
- [x] T013 [P] Create Setting Zod schema in shared/schemas/setting.ts
- [x] T014 [P] Create API response schemas (ArticleListResponse, ErrorResponse) in shared/schemas/api.ts
- [x] T015 Create Express app entry point with CORS and JSON middleware in backend/src/index.ts
- [x] T016 [P] Create pino logger utility in backend/src/lib/logger.ts
- [x] T017 [P] Create Prisma client singleton in backend/src/lib/prisma.ts
- [x] T018 Create React app entry point with TanStack Query provider in frontend/src/main.tsx
- [x] T019 [P] Create API client base with fetch wrapper in frontend/src/services/api.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Browse Latest GeekNews Items (Priority: P1)

**Goal**: Display a feed of articles showing title, published time, and source attribution with links to original content

**Independent Test**: Load homepage and verify articles appear in reverse chronological order with source attribution and working outbound links

### Implementation for User Story 1

- [x] T020 [US1] Create ArticleService with findMany (paginated) method in backend/src/services/article.service.ts
- [x] T021 [US1] Implement cursor encoding/decoding utility in backend/src/lib/cursor.ts
- [x] T022 [US1] Create GET /api/articles route with cursor pagination in backend/src/api/articles.routes.ts
- [x] T023 [US1] Create GET /api/articles/:id route in backend/src/api/articles.routes.ts
- [x] T024 [US1] Register article routes in Express app in backend/src/index.ts
- [x] T025 [P] [US1] Create ArticleCard component displaying title, time, source in frontend/src/components/ArticleCard.tsx
- [x] T026 [P] [US1] Create date formatting utility (relative time) in frontend/src/lib/date.ts
- [x] T027 [US1] Create useArticles hook with TanStack Query in frontend/src/services/articles.ts
- [x] T028 [US1] Create Feed component that renders list of ArticleCards in frontend/src/components/Feed.tsx
- [x] T029 [US1] Create HomePage with Feed component in frontend/src/pages/HomePage.tsx
- [x] T030 [US1] Add routing and render HomePage as default in frontend/src/App.tsx

**Checkpoint**: User Story 1 complete - feed displays articles with attribution and outbound links

---

## Phase 4: User Story 2 - Infinite Scroll Through Feed (Priority: P2)

**Goal**: Automatically load more articles when user scrolls to bottom with loading, error, and empty states

**Independent Test**: Scroll to bottom of feed and verify additional articles load automatically without page refresh

### Implementation for User Story 2

- [x] T031 [US2] Upgrade useArticles to useInfiniteQuery with getNextPageParam in frontend/src/services/articles.ts
- [x] T032 [P] [US2] Create LoadingSpinner component in frontend/src/components/LoadingSpinner.tsx
- [x] T033 [P] [US2] Create EmptyState component with friendly message in frontend/src/components/EmptyState.tsx
- [x] T034 [P] [US2] Create ErrorState component with retry button in frontend/src/components/ErrorState.tsx
- [x] T035 [US2] Create useIntersectionObserver hook for scroll detection in frontend/src/hooks/useIntersectionObserver.ts
- [x] T036 [US2] Update Feed component with infinite scroll trigger element in frontend/src/components/Feed.tsx
- [x] T037 [US2] Add loading, error, empty states to Feed component in frontend/src/components/Feed.tsx
- [x] T038 [US2] Add "end of feed" indicator when hasMore is false in frontend/src/components/Feed.tsx

**Checkpoint**: User Story 2 complete - infinite scroll works with all UI states

---

## Phase 5: User Story 3 - Automatic Content Ingestion (Priority: P3)

**Goal**: Automatically fetch and store new GeekNews items on configurable interval with deduplication

**Independent Test**: Trigger ingestion run and verify new items appear in database without duplicates

### Implementation for User Story 3

- [x] T039 [US3] Create RSS parser wrapper with rss-parser in backend/src/lib/rss-parser.ts
- [x] T040 [US3] Create CollectorService with fetchAndParse method in backend/src/services/collector.service.ts
- [x] T041 [US3] Implement upsert logic with GUID deduplication in CollectorService in backend/src/services/collector.service.ts
- [x] T042 [US3] Create IngestionRunService to log run outcomes in backend/src/services/ingestion-run.service.ts
- [x] T043 [US3] Implement exponential backoff retry utility in backend/src/lib/retry.ts
- [x] T044 [US3] Add error handling and logging to CollectorService in backend/src/services/collector.service.ts
- [x] T045 [US3] Create SettingsService with getValue method in backend/src/services/settings.service.ts
- [x] T046 [US3] Create scheduler with tick+gate pattern using node-cron in backend/src/jobs/scheduler.ts
- [x] T047 [US3] Implement shouldRunNow logic checking last successful run in backend/src/jobs/scheduler.ts
- [x] T048 [US3] Initialize scheduler on app startup in backend/src/index.ts
- [x] T049 [US3] Add manual trigger endpoint POST /api/admin/ingest (dev only) in backend/src/api/admin.routes.ts

**Checkpoint**: User Story 3 complete - ingestion runs automatically on schedule

---

## Phase 6: User Story 4 - Configure Ingestion Interval (Priority: P4)

**Goal**: Allow operators to change ingestion interval via API without redeploy

**Independent Test**: Call settings API to change interval and verify next ingestion respects new value

### Implementation for User Story 4

- [x] T050 [US4] Add updateInterval method to SettingsService in backend/src/services/settings.service.ts
- [x] T051 [US4] Add getAllSettings method to SettingsService in backend/src/services/settings.service.ts
- [x] T052 [US4] Create GET /api/settings route in backend/src/api/settings.routes.ts
- [x] T053 [US4] Create PATCH /api/settings/ingest-interval route with validation in backend/src/api/settings.routes.ts
- [x] T054 [US4] Register settings routes in Express app in backend/src/index.ts
- [x] T055 [US4] Update scheduler to read interval from SettingsService on each tick in backend/src/jobs/scheduler.ts

**Checkpoint**: User Story 4 complete - interval changes take effect without restart

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and documentation

- [x] T056 [P] Add health check endpoint GET /api/health in backend/src/api/health.routes.ts
- [x] T057 [P] Add request logging middleware in backend/src/middleware/request-logger.ts
- [x] T058 [P] Add global error handler middleware in backend/src/middleware/error-handler.ts
- [x] T059 [P] Create basic CSS styling for feed in frontend/src/index.css
- [x] T060 Update README.md with local development instructions
- [x] T061 Verify all lint and format checks pass

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    │
    ▼
Phase 2: Foundational ──────────────────────────────────┐
    │                                                    │
    ▼                                                    │
Phase 3: US1 (Browse Feed) ◄─────────────────────────────┤
    │                                                    │
    ▼                                                    │
Phase 4: US2 (Infinite Scroll) ◄─────────────────────────┤
    │                                                    │
    │   Phase 5: US3 (Ingestion) ◄───────────────────────┤
    │       │                                            │
    │       ▼                                            │
    │   Phase 6: US4 (Settings) ◄────────────────────────┘
    │       │
    ▼       ▼
Phase 7: Polish (depends on all desired stories)
```

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Foundational (Phase 2) - can start immediately after
- **User Story 2 (P2)**: Depends on US1 (extends Feed component)
- **User Story 3 (P3)**: Depends only on Foundational (Phase 2) - can run parallel to US1/US2
- **User Story 4 (P4)**: Depends on US3 (SettingsService already created in US3)

### Within Each User Story

- Models/utilities before services
- Services before routes/endpoints
- Backend endpoints before frontend consumers
- Core components before composed components

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T001 (structure)
  │
  ├──► T002 (backend init)
  ├──► T003 [P] (frontend init)
  ├──► T004 [P] (shared init)
  ├──► T005 [P] (eslint/prettier)
  ├──► T006 [P] (root package.json)
  └──► T007 [P] (.gitignore)
```

**Phase 2 (Foundational)**:
```
T009 (prisma schema) ──► T010 (migration) ──► T011 (seed)

T012 [P] (article schema)  ─┐
T013 [P] (setting schema)   ├──► T014 (api schemas)
                           ─┘

T015 (express app) ──► T016 [P] (logger)
                  └──► T017 [P] (prisma client)

T018 (react app) ──► T019 [P] (api client)
```

**Phase 3 (US1)** - after T024:
```
T025 [P] [US1] (ArticleCard)  ─┐
T026 [P] [US1] (date utils)    ├──► T027 (useArticles) ──► T028 (Feed) ──► T029 (HomePage)
                              ─┘
```

**Phase 4 (US2)**:
```
T032 [P] [US2] (LoadingSpinner)  ─┐
T033 [P] [US2] (EmptyState)       ├──► T036-T038 (Feed updates)
T034 [P] [US2] (ErrorState)      ─┘
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test feed display independently
5. Manually seed database with test articles if needed

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo (basic feed)
3. Add User Story 2 → Test independently → Demo (infinite scroll)
4. Add User Story 3 → Test independently → Demo (auto-ingestion)
5. Add User Story 4 → Test independently → Demo (configurable interval)
6. Polish phase → Production-ready

### Parallel Development Strategy

With two developers:
- **Developer A**: US1 (Feed display) → US2 (Infinite scroll)
- **Developer B**: US3 (Ingestion) → US4 (Settings)

Both can start after Foundational phase completes.

---

## Task Summary

| Phase | Story | Task Count | Parallel Tasks |
|-------|-------|------------|----------------|
| Phase 1: Setup | - | 8 | 6 |
| Phase 2: Foundational | - | 11 | 7 |
| Phase 3: US1 | Browse Feed | 11 | 2 |
| Phase 4: US2 | Infinite Scroll | 8 | 3 |
| Phase 5: US3 | Ingestion | 11 | 0 |
| Phase 6: US4 | Settings | 6 | 0 |
| Phase 7: Polish | - | 6 | 4 |
| **Total** | | **61** | **22** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US3 (Ingestion) can be developed in parallel with US1/US2 after Foundational completes
