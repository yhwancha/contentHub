# Feature Specification: GeekNews Feed MVP

**Feature Branch**: `001-geeknews-feed-mvp`
**Created**: 2026-01-21
**Status**: Draft
**Input**: User description for ContentHub TypeScript full-stack application

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Latest GeekNews Items (Priority: P1)

As a visitor, I want to browse a feed of the latest GeekNews items on the ContentHub website so I can discover interesting tech content without visiting GeekNews directly.

**Why this priority**: This is the core value proposition—without a browsable feed, the product delivers no value. Everything else depends on content being visible.

**Independent Test**: Can be fully tested by loading the homepage and verifying articles appear in reverse chronological order. Delivers immediate value as a curated tech news reader.

**Acceptance Scenarios**:

1. **Given** the database contains ingested articles, **When** I visit the homepage, **Then** I see a list of articles showing title, published time, and source attribution.
2. **Given** multiple articles exist, **When** I view the feed, **Then** articles are ordered by published date (newest first).
3. **Given** an article in the feed, **When** I click its title or link, **Then** I am taken to the original source URL (external site).

---

### User Story 2 - Infinite Scroll Through Feed (Priority: P2)

As a visitor browsing the feed, I want to scroll down and automatically load more articles so I can continuously discover content without clicking pagination buttons.

**Why this priority**: Infinite scroll dramatically improves UX for content discovery. However, the feed must exist first (P1), making this a natural second priority.

**Independent Test**: Can be tested by scrolling to the bottom of the initial page load and verifying additional articles load automatically without page refresh.

**Acceptance Scenarios**:

1. **Given** I am viewing the feed with more articles available, **When** I scroll to the bottom, **Then** the next batch of articles loads automatically.
2. **Given** articles are loading, **When** I am waiting, **Then** I see a loading indicator (skeleton or spinner).
3. **Given** all articles have been loaded, **When** I scroll to the bottom, **Then** I see an "end of feed" indicator (no infinite loading loop).
4. **Given** a network error occurs during load, **When** I see the error state, **Then** I can retry loading with a visible retry button.

---

### User Story 3 - Automatic Content Ingestion (Priority: P3)

As the system, I want to automatically fetch new GeekNews items on a configurable interval so the feed stays fresh without manual intervention.

**Why this priority**: Automation is essential for a sustainable product, but manual seeding can bootstrap the MVP. This can be developed in parallel once the feed display works.

**Independent Test**: Can be tested by triggering an ingestion run and verifying new items appear in the database without duplicates from previous runs.

**Acceptance Scenarios**:

1. **Given** the ingestion interval has elapsed, **When** the scheduler triggers, **Then** the collector fetches and stores new articles from the GeekNews RSS feed.
2. **Given** an article already exists in the database (by GUID or URL), **When** ingestion runs again, **Then** no duplicate is created.
3. **Given** ingestion completes, **When** I query the ingestion log, **Then** I see a record with start time, end time, status, and counts (new/updated).
4. **Given** the RSS feed is temporarily unavailable, **When** ingestion fails, **Then** the error is logged and the service continues running (no crash).

---

### User Story 4 - Configure Ingestion Interval (Priority: P4)

As an operator, I want to change the ingestion interval via API so I can adjust fetch frequency without redeploying the application.

**Why this priority**: Operational flexibility is valuable but not critical for MVP launch. A sensible default (3 hours) works initially.

**Independent Test**: Can be tested by calling the settings API to change the interval and verifying the next ingestion respects the new value.

**Acceptance Scenarios**:

1. **Given** I have API access, **When** I call `PATCH /api/settings/ingest-interval` with `{ "minutes": 60 }`, **Then** the interval setting is updated in the database.
2. **Given** the interval was changed, **When** the next scheduler tick runs, **Then** it uses the new interval value to determine if ingestion should occur.
3. **Given** I call `GET /api/settings`, **When** the response returns, **Then** I see the current `ingest_interval_minutes` value.

---

### Edge Cases

- **Empty feed**: What happens when the database has no articles? → Display a friendly empty state message.
- **RSS feed unavailable**: What happens if GeekNews RSS is down? → Log error, skip this run, retry on next interval. Do not crash.
- **Malformed RSS items**: What happens if an item lacks required fields? → Skip that item, log warning, continue processing others.
- **Duplicate detection edge case**: What if GUID is missing but URL matches? → Use URL as fallback unique identifier.
- **Cursor invalidation**: What if articles are deleted between pagination requests? → Cursor should gracefully handle missing items (skip gaps).
- **Very large interval**: What if operator sets interval to 0 or negative? → Validate input; reject invalid values with 400 error.
- **Concurrent ingestion runs**: What if a run is still in progress when next tick fires? → Skip if previous run is still active (or use locking).

---

## Requirements *(mandatory)*

### Functional Requirements

#### Ingestion (Collector)

- **FR-001**: System MUST fetch articles from the GeekNews RSS feed (`https://news.hada.io/rss`).
- **FR-002**: System MUST parse RSS items and extract: title, link (canonical URL), published date, and GUID.
- **FR-003**: System MUST upsert articles using GUID as primary deduplication key, falling back to URL if GUID is absent.
- **FR-004**: System MUST record each ingestion run with: start time, end time, status, new count, updated count, and error message (if any).
- **FR-005**: System MUST NOT crash on ingestion failures; errors MUST be logged and the service MUST continue.
- **FR-006**: System MUST implement retry with exponential backoff for transient network failures.
- **FR-007**: System MUST respect configurable timeouts for HTTP requests (default: 30 seconds).

#### Backend API

- **FR-008**: System MUST expose `GET /api/articles` with cursor-based pagination (query params: `cursor`, `limit`).
- **FR-009**: System MUST return articles in reverse chronological order (newest `published_at` first).
- **FR-010**: System MUST expose `GET /api/articles/:id` to fetch a single article by ID.
- **FR-011**: System MUST expose `GET /api/settings` to retrieve current system settings.
- **FR-012**: System MUST expose `PATCH /api/settings/ingest-interval` to update the ingestion interval.
- **FR-013**: System MUST validate interval input (positive integer, reasonable bounds e.g., 1-10080 minutes).
- **FR-014**: All API responses MUST use shared TypeScript DTOs for type safety.

#### Frontend

- **FR-015**: UI MUST display article feed with: title, published time, and source attribution ("GeekNews").
- **FR-016**: UI MUST link article titles to the original external URL (opens in new tab).
- **FR-017**: UI MUST implement infinite scroll that loads more articles when user approaches bottom.
- **FR-018**: UI MUST show loading indicator during data fetches.
- **FR-019**: UI MUST show empty state when no articles exist.
- **FR-020**: UI MUST show error state with retry option when API calls fail.

#### Scheduling

- **FR-021**: System MUST run ingestion based on a DB-backed interval setting (default: 180 minutes).
- **FR-022**: System MUST detect interval changes without requiring restart or redeploy.
- **FR-023**: System MUST use a "tick + gate" pattern: run a frequent check (e.g., every 1 minute) and only ingest when `(now - last_successful_run) >= interval`.

### Key Entities

- **Article**: Represents a single GeekNews item. Key attributes: id (uuid), source, guid, title, url, geeknews_url, published_at, fetched_at, created_at, updated_at.
- **Setting**: Key-value configuration store. Key attributes: key (unique string), value, updated_at. Used for `ingest_interval_minutes`.
- **IngestionRun**: Audit log for each ingestion attempt. Key attributes: id, started_at, finished_at, status, new_count, updated_count, error_message.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Feed page loads and displays articles within 2 seconds on typical connection (initial page load with first batch).
- **SC-002**: Infinite scroll loads next batch within 1 second of trigger.
- **SC-003**: Zero duplicate articles after 10 consecutive ingestion runs (verified by `COUNT(*)` vs `COUNT(DISTINCT guid)`).
- **SC-004**: Ingestion completes successfully 95%+ of runs (failures logged, not crashed).
- **SC-005**: Changing ingestion interval via API reflects in next scheduled run (within 1 tick cycle).
- **SC-006**: 100% of displayed articles include source attribution and working outbound link.
- **SC-007**: API pagination returns consistent results (no gaps or duplicates when scrolling through entire feed).

---

## Constitution Compliance Check

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. TypeScript-First | ✅ | Full-stack TypeScript (backend + frontend), shared DTOs |
| II. Feed-First Ingestion | ✅ | RSS feed as primary source, no HTML scraping |
| III. Metadata-Only Storage | ✅ | Only title, link, published time, source stored |
| IV. Idempotent & Deduplicated | ✅ | GUID/URL unique constraint, upsert logic |
| V. Configurable Scheduling | ✅ | DB-backed setting, tick+gate pattern |

---

## Out of Scope (MVP)

- User accounts, authentication, personalization
- Likes, comments, bookmarks
- Full admin dashboard UI
- Client-side search/filter (deferred to post-MVP)
- Multiple news sources beyond GeekNews
- Full article body storage or display
- WordPress or any CMS integration
