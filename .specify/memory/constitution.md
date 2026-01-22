<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.0.1 (PATCH)
Amendment date: 2026-01-21

Changes in this version:
- Standardized bullet characters (• → -)
- Replaced non-standard horizontal rules (⸻ → ---)
- Added proper markdown headings (#, ##, ###)
- Fixed nested list indentation in Quality gates and Observability
- Strengthened language: added MUST where appropriate
- Normalized "Non-negotiable" → "NON-NEGOTIABLE" for consistency

Modified principles: None (formatting only)
Added sections: None
Removed sections: None

Templates requiring updates:
- plan-template.md: ✅ No update needed (references constitution generically)
- spec-template.md: ✅ No update needed
- tasks-template.md: ✅ No update needed
- checklist-template.md: ✅ No update needed
- agent-file-template.md: ✅ No update needed

Follow-up TODOs: None
-->

# ContentHub Constitution

## Core Principles

### I. TypeScript-First (NON-NEGOTIABLE)

Frontend and backend must be written in TypeScript. Shared types and schemas should be reused across the stack (DTOs, validators) to prevent drift.

### II. Feed-First Ingestion (Respectful Collection)

Prefer official/public feeds (RSS) over HTML scraping when available. Minimize requests, use sane timeouts, retries with exponential backoff, and never cause undue load.

### III. Metadata-Only Storage (NON-NEGOTIABLE)

Store and display only metadata needed for discovery:
- title
- original link (or GeekNews link)
- published time
- source

Do not copy full article bodies from third-party sites.

### IV. Idempotent & Deduplicated Ingestion

Every ingestion run must be idempotent: reruns must not create duplicates. Deduplication must be enforced at the database layer (unique constraint on stable identifiers such as RSS GUID and/or canonical link).

### V. Configurable Scheduling (Interval as Data)

Default ingestion interval is 3 hours, but must be configurable as a variable stored in the system (DB-backed setting). Interval changes should take effect without code changes; if cron can’t be updated dynamically, use a frequent tick + “last_run + interval” gate.

---

## Additional Constraints

- **Database**: Postgres (recommended) with a proper migration workflow (Prisma recommended).
- **Pagination**: API MUST support cursor-based pagination for infinite scrolling.
- **Attribution**: UI MUST clearly attribute source and link out to the original.
- **Security**: Never commit credentials. `.claude/` MUST be in `.gitignore`. Avoid storing secrets in repo.
- **Rate Limits**: Cap outbound fetch frequency, set timeouts, retry with backoff, and handle failures gracefully.

---

## Development Workflow

- **Incremental delivery**: Implement in small slices (ingestion → API → UI) and keep changes reviewable.
- **Quality gates**:
  - Lint + format MUST pass.
  - Basic automated tests for RSS parsing and dedup logic are required.
  - Integration test coverage for "ingest → DB → API returns feed" is strongly preferred for MVP stability.
- **Observability**:
  - Log each ingestion run: start/end, number of new/updated items, and errors.
  - Errors MUST NOT crash the service; failures should be reported and retried safely.

---

## Governance

- This Constitution supersedes other ad-hoc practices.
- Any change that affects data collection, storage scope, or scheduling behavior MUST include:
  1. rationale,
  2. migration/compatibility plan (if needed),
  3. updated tests where applicable.
- Security and "metadata-only" rules are non-negotiable.

Version: 1.0.1 | Ratified: 2026-01-21 | Last Amended: 2026-01-21