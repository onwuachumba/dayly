# DAYLY — TRD (Technical Requirements Document) — Phase 2

**Status:** Guide for building. Phase 1 (`index.html`, `design.html`, `PRD.md`) stays untouched and working.
**Decision (locked):** Next.js + TypeScript app on **Netlify**, **Netlify Database** (managed Postgres) for data, **Better Auth** (email + password, Prisma adapter) for users, **Netlify Blobs** for files. No Supabase, no Firebase, no Neon Auth, no Stack Auth, no Clerk, no self-built password auth, no VPS.

Source of truth for product: `docs/PRODUCT REQUIREMENTS DOCUMENT (PRD).md` + root `PRD.md` (Lesson 6 roadmap).

> History: an early Express + self-hosted Postgres scaffold (`phase2/api`, plus the VPS `docker-compose.yml`) was removed once the Next.js app covered the API design. Auth moved from Neon Auth (Stack) to Better Auth with no separate auth provider. The active architecture is Next.js + Prisma + Netlify Database + Better Auth + Netlify only.

---

## 1. Phase 2 Goal

Turn the Phase 1 mock-data prototype into a real full-stack app:

- Persist tasks, daily plans, goals, habits, reminders per user in Netlify Database
- Authentication via Better Auth email + password (sessions in our own database; no external auth provider)
- File uploads in Netlify Blobs (Netlify has no persistent local disk — `./uploads` will NOT work there)
- One Next.js codebase: UI + API routes/server actions; deployed to Netlify from GitHub `main`

Non-goals for TRD v1: AI planner, calendar sync, weekly planning, insights. Routes are shaped so those can be added without re-platforming.

## 2. Locked Stack (Netlify + Netlify Database + Better Auth)

- **Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS, at the **project root** (`app/`, `lib/`, `prisma/`). Earlier Lesson 6 static materials live in `coursework/`.
- **Runtime/Hosting:** Netlify (GitHub-connected, auto-deploy on `main`). Build: `npx prisma generate && npm run build`. Base directory: project root.
- **Database:** Netlify Database (managed Postgres, Neon-powered). Runtime connection resolves via `getConnectionString()` (`NETLIFY_DB_URL`, per deploy branch) with `DATABASE_URL` fallback for plain local runs — see `lib/db.ts` `dbUrl()`. Schema ships as SQL under `netlify/database/migrations/`, applied automatically on deploy (and locally via `netlify database migrations apply`).
- **ORM:** Prisma 5 pointed at Netlify Database. Tables: users (+ Better Auth `sessions`/`accounts`/`verification`) and DAYLY tasks/plans (+plan_items)/goals/habits/reminders/files. `users` rows are created by Better Auth sign-up; no `passwordHash`, no custom JWT code.
- **Auth:** Better Auth v1 (`better-auth` + `@better-auth/prisma-adapter`, email + password). Server instance in `lib/auth.ts` (null when `BETTER_AUTH_SECRET` is absent so the app boots instead of crashing); handlers at `app/api/auth/[...all]`; client in `lib/auth-client.ts`; sign-in/up pages at `/sign-in`, `/sign-up`; dashboard uses `useSession` + `signOut`. Server code reads the session via `auth.api.getSession()` — never any custom JWT. If auth env is absent, the app boots in **setup mode** (clear setup banner + static DAYLY preview) instead of crashing.
- **User sync:** Better Auth owns the `users` row (created at sign-up); API routes resolve it via `lib/auth.ts` `requireAppUser()`. All data access is scoped to that row.
- **File storage:** Netlify Blobs (`@netlify/blobs`), 5 MB cap, allowlist png/jpg/pdf. File rows in Neon store the blob key + metadata.
- **Validation:** zod, shared between client forms and server actions/API routes.

Why this shape: one repo, one host, one database project (Neon holds data + auth config), zero servers to manage. Fits DAYLY's relational data and keeps secrets to Neon/Netlify dashboards.

## 3. Topology

```
Browser → Netlify CDN → Next.js (SSR + API routes/server actions)
                              ↓
                    Netlify Database (managed Postgres URL at runtime)
                    Better Auth (sessions in our database; email + password)
                    Netlify Blobs (attachments)
```

No code change between preview and production except env values. Deploy previews can point at a Neon dev branch.

## 4. Data Model (Prisma — Netlify Database Postgres)

Tables (all with `id UUID PK`, `userId FK → users`, `createdAt`, `updatedAt`):

- `users`: Better Auth identity (`email UNIQUE`, `emailVerified`, `image?`) + DAYLY profile (`name`, `workStart`, `workEnd`); related `sessions`, `accounts`
- `sessions` / `accounts` / `verification`: Better Auth tables (tokens, OAuth/provider accounts, verification values)
- `tasks`: `title`, `detail?`, `timeLabel?`, `priority` enum (HIGH/MEDIUM/LOW), `status` enum (PLANNED/DONE/MOVED), `dueDate?`, `durationMin?`, `category?`
- `plans`: `date DATE`, `summary?` + join `plan_items` (`planId`, `taskId`, `sortOrder`); unique `(userId, date)`
- `goals`: `title`, `target?`, `progress 0–100`, `status` (ACTIVE/DONE/ARCHIVED)
- `habits`: `title`, `frequency` (DAILY/WEEKLY), `streak`, `lastDoneAt?`
- `reminders`: `taskId?`, `remindAt`, `channel` (IN_APP), `sent`
- `files`: `originalName`, `blobKey`, `mime`, `size`, `taskId?`

Indexes: `(userId, status)`, `(userId, dueDate)`, `(userId, date)`. Every query is scoped by the authenticated user id resolved server-side — never trust a client-supplied `userId`.

Seed: mirror Phase 1 mocks (proposal 9AM HIGH, client calls 11AM MEDIUM, meeting 2PM HIGH, groceries 4PM LOW, exercise 6PM LOW) against a Neon dev branch (never production).

## 5. API Contract (Next.js App Router)

Auth is enforced by middleware + server-side session (no bearer tokens in client code):

- `GET /api/v1/tasks?status=&priority=&take=&skip=` / `POST /api/v1/tasks` / `PATCH /api/v1/tasks/:id` / `DELETE /api/v1/tasks/:id`
- `GET /api/v1/plans?date=YYYY-MM-DD` / `POST /api/v1/plans {date, summary?, taskIds[]}` / `DELETE /api/v1/plans/:id`
- `GET|POST /api/v1/goals`, `PATCH|DELETE /api/v1/goals/:id`
- `GET|POST /api/v1/habits`, `POST /api/v1/habits/:id/checkin`, `DELETE /api/v1/habits/:id`
- `GET /api/v1/reminders?upcoming=1`, `POST /api/v1/reminders`, `DELETE /api/v1/reminders/:id`
- `GET /api/v1/files`, `POST /api/v1/files` (multipart `file`, optional `taskId`) → `{item, url}` (Blob URL)
- `GET /api/health` → `{ok:true}` (Netlify/uptime checks; no DB write)

Validation: zod on all inputs. Errors: `{error:{code,message}}` with 400/401/403/404/409/413/500.

UI mapping: `/today` (task list + plan + progress), `/goals`, `/habits`, reminders panel, evening-review section — same content model as `index.html`.

## 6. Auth & Security Rules

- Passwords are hashed by Better Auth (never in our code). Sessions verified server-side via `auth.api.getSession()` in server components and API routes.
- Every DB query includes the server-resolved user id. Plan/task/file ownership re-checked on write (403 on cross-user access).
- Uploads: 5 MB cap, MIME+extension allowlist (png/jpg/pdf), random blob keys, no executable content.
- Secrets: never committed. Only `.env.example` in repo. Real values live in Netlify env + local `.env` (gitignored): `BETTER_AUTH_SECRET` (32+ chars), `BETTER_AUTH_URL`, `DATABASE_URL`/`DIRECT_URL` (local Prisma tooling fallback; hosting uses `NETLIFY_DB_URL`).

## 7. Local Run (now)

1. `npm install && cp .env.example .env` (from the project root) — set `BETTER_AUTH_SECRET` (random 32+ chars) and `BETTER_AUTH_URL`; database resolves automatically under `netlify dev`, or set `DATABASE_URL` for plain runs. Database URLs: under `netlify dev` the connection is automatic (`NETLIFY_DB_URL`); for plain `npm run dev`, set `DATABASE_URL` to the Neon **dev-branch** pooled URL (never production).
2. Schema changes ship as SQL files under `netlify/database/migrations/` (authored from Prisma via `prisma migrate diff ... --script`, saved UTF-8 without BOM). Netlify applies them automatically on deploy; locally run `netlify database migrations apply`. Never run `prisma migrate deploy/push` against a hosted URL.
3. `npm run dev` (or `netlify dev` for the full local DB) → `http://localhost:3000` — full journey: sign up/in → dashboard → tasks CRUD → sign out.
4. **Without Neon credentials** the dev server still boots and renders a local visual: a setup banner (exact missing env names) plus the static DAYLY dashboard preview. API routes return `503 AUTH_NOT_CONFIGURED` / `503 DB_NOT_CONFIGURED` instead of fake data — live tests stay blocked until creds exist.

## 8. Netlify Deploy (connected repo)

1. Netlify site ← GitHub `onwuachumba/dayly`, root base directory, build `npx prisma generate && npm run build`, publish `.next`.
2. Env in Netlify dashboard: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (+ site URL). Database needs no manual URL: the Netlify Database integration provides `NETLIFY_DB_URL` per deploy context (production branch + automatic preview branches). `lib/db.ts` resolves it via `getConnectionString()` with `DATABASE_URL` fallback.
3. Auto-deploy on `main` applies `netlify/database/migrations/*.sql` before publish; deploy previews get their own database branch automatically.
4. Nightly backups: Neon point-in-time recovery + scheduled `pg_dump` if needed.

## 9. Build Order (for the agent)

1. Root-level scaffold: Next.js + TS + Tailwind, `lib/db.ts` (Prisma singleton), `prisma/schema.prisma` (Netlify Database, Better Auth identity), `.env.example`, `netlify.toml`. — DONE (build PASS)
2. Better Auth wiring: `lib/auth.ts` instance + `lib/auth-client.ts`, `api/auth/[...all]` handlers, `/sign-in` + `/sign-up` pages, `lib/auth.ts` session lookup, dashboard `useSession`/`signOut`. Graceful setup mode when env is absent.
3. Routes per §5 (`me`, `tasks`, `plans`, `goals`, `habits`+checkin, `reminders`, `files` via Blobs, `health` with DB status) + UI pages reusing the `design.html` system.
4. Dev-branch test: login → CRUD tasks → plan → habits checkin → upload → health. Record in §11.

## 10. Acceptance Criteria

- [ ] `npm run dev` (Neon dev branch) → all §5 routes work, strictly user-scoped.
- [ ] Seed reproduces Phase 1 mocks on dev branch; UI reads/writes Neon, not memory.
- [ ] Upload round-trip lands in Blobs; file rows store blob keys.
- [ ] No secrets in git; `.env` gitignored; only `.env.example` committed.
- [ ] Netlify deploy from `main` succeeds; previews work against dev branch.
- [ ] Phase 1 files (`index.html`, `design.html`, `PRD.md`, docs PRD, README) still open/work unchanged.

## 11. Test Log

| Date | Check | Result |
|------|-------|--------|
| 2026-10-04 | Early Express scaffold: `npm install` + `prisma generate` + `tsc build` | PASS (scaffold removed after Next.js covered it) |
| 2026-10-04 | Early Express scaffold server boot | PASS (scaffold removed after Next.js covered it) |
| 2026-10-04 | Stack-based wiring: `prisma generate` + `next build` (17 routes, types + lint) | PASS at the time (later replaced by Better Auth) |
| 2026-10-04 | Local visual `npm run dev` (no creds): `/` → 200 setup banner + preview; `/api/health` → 200 `db:not-configured`; `/api/v1/*` → 503 | PASS — setup mode verified end-to-end |
| 2026-10-04 | Better Auth migration: Stack removed, `better-auth` + Prisma adapter wired (`api/auth/[...all]`, `/sign-in`, `/sign-up`, session lookup); migration regenerated (auth tables); `next build` | PASS — 19 routes, types + lint clean; applied locally, 11/11 tables verified |
| — | sign-up/in (Better Auth) → tasks CRUD + scoping | BLOCKED — needs `BETTER_AUTH_SECRET` + database (local `netlify dev` or Netlify env) |
| 2026-10-04 | Restructure: Next.js app to root, Lesson 6 to `coursework/`; root `npm install` + `prisma generate` + `next build` | PASS — 17 routes, types + lint clean |
| 2026-10-04 | Netlify DB fix: planets removed; DAYLY migration generated from Prisma schema (UTF-8); applied to local DB via `migrations apply` | PASS — 8/8 tables verified (`User`, `Task`, `Plan`, `PlanItem`, `Goal`, `Habit`, `Reminder`, `File`), no planets remnants |
| 2026-10-04 | Prisma ↔ Netlify connection: `lib/db.ts` `dbUrl()` (`getConnectionString()` + `DATABASE_URL` fallback) + `datasourceUrl` override; `next build` | PASS — types + lint clean; setup-mode guards preserved |
| — | sign-up/in (Better Auth) → tasks CRUD + scoping | BLOCKED — needs `BETTER_AUTH_SECRET` + database (local `netlify dev` or Netlify env) |
| — | plans + goals + habits + reminders + Blobs upload | — |
| — | Netlify deploy from `main` | — |
