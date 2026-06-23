# Chat MVP — Working Instructions

## Project Context

- Masterschool Fellowship (AI Software Engineering); ongoing multi-week project.
- Current phase: **Week 5 (MongoDB persistence via Mongoose)**.
- This file tracks stable engineering principles, cross-week goals, and the
  current week's requirements.

## How to Use This Document

- `CLAUDE.md` = execution source of truth; `ARCHITECTURE.md` = architecture;
  `API_CONTRACT.md` = endpoint contract.
- On conflict: follow `CLAUDE.md` acceptance criteria, then `ARCHITECTURE.md`
  structure, and keep `API_CONTRACT.md` aligned.

## AI Engineering Policy

The AI ownership protocol lives in [AGENTS.md](AGENTS.md): the human owns system
design, tradeoffs, and final decisions; agents restate the task, surface options
for important decisions, keep diffs small (≤ ~3 files / ~150 lines before
pausing), verify with lint/typecheck/tests, and pause at
architecture/data-model/API/auth/migration decision points. See
[AGENTS.md](AGENTS.md) for the full text.

## Learning Mode (grill-me)

- Interactive learning project: the developer owns every crucial decision. Never
  silently make important design choices; never implement on a guess.
- Pause and ask a multiple-choice `AskQuestion` when a crucial/architectural
  decision is in play (data-model boundaries, error handling, auth/security,
  module boundaries, new dependency, public-contract change, anything hard to
  reverse) or the prompt is ambiguous.
- After a non-trivial change, ask 1-3 short Socratic questions so the developer
  can defend the code. Skip checkpoints only for trivial, reversible choices.
- Present options recommended-first with a one-line rationale; one decision at a
  time; investigate the codebase before asking. See
  `.cursor/skills/grill-me/SKILL.md`.

## Shared Engineering Principles (All Weeks)

1. Always use curly braces for every `if` statement, including one-liners.
2. Remove pass-through handlers; call the original function directly when no extra logic is added.
3. Never fail validation silently; always return or show a clear error.
4. Keep validation behavior consistent across similar flows.
5. Prefer clear variable names (`inputValue`, `value`) over vague names.
6. Derive critical values from latest state in functional updates when relevant.
7. Use typed arrays + `.map()` for repeated options or repeated UI/logic branches.
8. Add edge-case tests for mutation paths (for example, non-existent IDs).
9. Keep formatting conventions strict (EOF newline, lint and format clean).
10. Use `type` aliases for object/data shapes instead of `interface`.
11. Keep a single source of truth for shared state.
12. Guard against stale async results before writing state.
13. Keep leaf/presentational components decoupled from infra concerns.
14. Do not silently substitute fallback values that mask bugs; fail visibly.
15. Keep clear layering: NestJS module -> controller -> service -> DbService (DAO) -> MongoDB.
16. Keep transport/framework types at the edges (controllers, guards, pipes). Services and DAOs stay framework-agnostic.
17. Use one consistent error envelope shape across the app.
18. Use async/await consistently; do not mix callback style in new code.
19. Validate inputs before business logic (`class-validator` DTOs + global `ValidationPipe`).
20. Logging should include enough context (method, path, status, duration, key IDs when relevant).
21. Never store or log secrets or plaintext passwords; hash with bcrypt and load secrets (`JWT_SECRET`, `MONGO_URI`) from env only.
22. No `any`; declare explicit return types on every function and method.

## Naming and Commit Conventions

- One logical concern per commit; do not combine unrelated areas.
- Message format: `<file/topic>: <message>` — lowercase verb, ≤ 72 chars, end
  with a period (e.g. `users: back users with mongodb and a unique email index.`).
  New files/modules: `<topic>: initial commit.`
- Branch: `feature/<domain>/<scope>`, kebab-case (e.g. `feature/backend/week-5-db`).
- Run `npm run typecheck`, `npm run lint`, and tests before pushing.
- Order commits so code is in its final shape by the time it lands. Reviewers
  read commits chronologically, so do not let an early commit introduce code that
  a later commit in the same PR rewrites. When squashing or reordering, fold the
  fix into the commit that introduces the code (or place it immediately after) so
  intermediate states never show superseded logic — this avoids "Outdated"
  review comments on code that no longer exists.

## Shared Long-Term Goals

- Build a production-minded chat system iteratively; each week additive, not a rewrite.
- Contract-first between frontend and backend; preserve maintainable module boundaries.
- Keep type safety and predictable error handling across the stack.

## Week-by-Week Scope

### Weeks 2-4 (Completed)

- **Week 2** — React + Vite + TS chat UI on a mocked API: conversation list +
  thread/composer, optimistic sends with rollback, loading/empty/success/error
  states, cursor pagination in the mock.
- **Week 3** — Express + TS REST API (in-memory), router -> controller -> service
  layering, input validation, consistent error envelope, CORS for the FE.
- **Week 4** — NestJS refactor + JWT auth (Passport, bcrypt, `@UseGuards`,
  `@CurrentUser`), `class-validator` DTOs, participant authorization (403), FE
  login/signup/logout. API contract preserved.

### Week 5 (Current) — MongoDB Persistence (Mongoose)

#### Data Model Decision (PR defense)

Rule: **reference high-volume/mutable data; denormalize only the small, read-hot
scalars the conversation list needs.**

- **Messages -> referenced.** Own collection linked by `conversationId`. Threads
  grow unbounded, so embedding would hit the 16MB document cap and break cursor
  pagination. Reference scales; embed does not.
- **Conversations -> denormalize `lastMessageAt` + `lastMessagePreview`.** The
  sidebar lists conversations newest-first with a snippet. An index on the
  messages collection cannot sort the *conversations* collection by a field that
  lives in messages, so storing these two scalars on the conversation turns the
  list into one indexed query (`find({ participantIds }).sort({ lastMessageAt: -1 })`).
  Cost: each send updates them on the parent conversation (the spec requires it).
- **Users -> referenced** (`senderId`), not embedded on messages. The FE loads
  the user directory once (`/users`) and resolves names client-side, so embedding
  names would be duplicated, stale-prone data with no payoff.
- **Single uuid string `_id`** across all three collections (seeds use pinned
  uuids; creates/signups generate uuids).

#### DAO/DTO Glossary (PR defense)

- **DAO / repository** -> `*DbService` classes + Mongoose `*.schema.ts`. Only
  DbServices touch Mongoose; domain services depend on DbServices.
- **Request DTOs** -> `*.dto.ts` `class-validator` classes, validated by the
  global `ValidationPipe`.
- **Response DTOs** -> shared `@chat/contract` types; controllers return these,
  never raw Mongoose documents.
- **DAO -> DTO boundary** -> mapper functions (`toPublicUser`, `toMessage`,
  `toConversation`) strip `_id -> id` and drop `__v`/`passwordHash`.

#### Spec summary

Replace the in-memory layer with MongoDB. Collections + indexes: `users`
(unique `email`), `conversations` (`participantIds, lastMessageAt desc`),
`messages` (`conversationId, createdAt desc`). Cursor pagination (not offset);
atomic send (message insert + conversation `lastMessageAt` update); DAO/DTO
separation (no `_id`/`__v` in responses); Week-4 authorization preserved; data
survives restart; `tsc`/`build` pass. (Full assignment text is in the course brief.)

#### Status

All acceptance criteria are met. Implemented and resolved: users/conversations/
messages on Mongo with a single uuid `_id`; all required indexes; index-backed
keyset cursor pagination (verified on a 150-message thread + same-`createdAt`
tiebreak); **atomic send via a Mongo transaction** (single-node replica set via
`docker-compose.yml`, `MONGO_URI` uses `?replicaSet=rs0`); `E11000 -> 409`;
new-conversation ordering (`lastMessageAt` set on create); hardened message
schema (required fields, `createdAt` as `Date`); out-of-band seeding via
`npm run seed` (never on boot, so data survives restart); `zod` removed;
per-file test DB isolation so the API suite is deterministic (each test file
gets its own database instead of sharing `chat-test`).

#### Tech Constraints

- `@nestjs/mongoose` + mongoose; one model per domain via
  `MongooseModule.forFeature` in its module; `forRoot`/`forRootAsync` only in
  `AppModule`.
- Keep the DbService (DAO) seam; services stay framework/DB-agnostic.
- No `any`; explicit return types; preserve the error envelope and DTO contract.
- Mongo must run as a replica set (`docker compose up -d`); seed via `npm run seed`.

## Backend Architecture and Clean Code

### Layering and responsibilities

- **Module** declares controllers/providers and wires `imports`/`exports`; a
  module consumes another's provider only when it is exported.
- **Controller** is the only layer touching request/response: read the validated
  DTO and `@CurrentUser()`, call a service, return a DTO. No business logic.
- **Service** owns business logic/orchestration; framework- and DB-agnostic.
- **DbService (DAO)** owns persistence (Mongoose models); services never touch
  Mongoose directly.
- **Guard / Strategy / Decorator** own authentication and identity extraction.
- Inject dependencies via constructors; never `new` providers manually.

### Auth and authorization

- `JwtAuthGuard` on every protected route; missing/invalid token -> `401`.
- Participant rule: read/post only in conversations you belong to, else `403`
  (never leak data or fall back to `404`).
- Derive identity from the verified token (`@CurrentUser()`), never the body.

### Error handling

- One envelope `{ error: { code, message, details? } }` via the Nest exception
  filter. Map: auth -> `401`, authorization -> `403`, duplicate/`E11000` -> `409`,
  validation -> `400`.

### Config, secrets, validation

- `@nestjs/config`; `JWT_SECRET`, `BCRYPT_ROUNDS`, `MONGO_URI` required from env.
  Commit `.env.example`, never a real `.env`.
- Hash passwords with bcrypt (`BCRYPT_ROUNDS` 10-12); compare with
  `bcrypt.compare`; never return/log the hash.
- `class-validator` + global `ValidationPipe` (`whitelist`,
  `forbidNonWhitelisted`). Use `@Length(min, max)` when both bounds matter, else
  one-sided `@MinLength`/`@MaxLength`; `@Min`/`@Max` with `@IsInt` for numbers;
  avoid unnecessary bounds.

## Good Habits

- Clear layering; framework types only at the edges; consistent naming across layers.
- Single source of truth for validation and error shapes; preserve the error
  envelope so the FE contract holds.
- Derive UI labels from runtime API data, not hardcoded lookup tables.
- One scenario per `it(...)`; add edge-case tests for mutation paths.
- async/await consistently; correct status codes and REST semantics; log with context.
- Keep DbServices injectable; keep `AppError` static factories for readable errors.
- Run typecheck + lint before pushing; keep README setup/run steps current.

## Code Smells to Avoid

- Fat controllers with business logic; passing `Request`/`Response` into services or DAOs.
- Inconsistent JSON/error shapes; wrong status codes; trusting `req.body` without validation.
- Plaintext passwords stored/returned/logged; hardcoded `JWT_SECRET` or a committed `.env`.
- Unprotected chat routes; authorization failures returning data or `404` instead of `403`; identity from the body.
- Manually instantiating providers; DTOs that skip validation or accept unknown fields.
- Changing the error envelope and breaking the FE contract; ignoring lint/typecheck.

## Change Log

- Weeks 2-4 completed. Week 5 (MongoDB persistence) implemented; all acceptance
  criteria and the Jun-16 bug/smell review items resolved (see Week 5 Status).
- Add future weeks as new sections without removing shared principles.
