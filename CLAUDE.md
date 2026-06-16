# Chat MVP — Multi-Week Working Instructions

## Project Context

- **Program:** Masterschool Fellowship (AI Software Engineering)
- **Project:** Chat MVP (ongoing, multi-week)
- **Current phase:** Week 4 (NestJS backend + JWT auth)
- **Score weight:** 100 per week

This project continues across multiple weeks. This file tracks:

- shared engineering principles that stay stable
- project goals that span weeks
- clear separation between completed work and current requirements

## How to Use This Document

- Keep `CLAUDE.md` as the execution source of truth.
- Keep `ARCHITECTURE.md` as the architecture source of truth.
- Keep `API_CONTRACT.md` as the endpoint contract source of truth.
- Do not duplicate architecture details here that belong in `ARCHITECTURE.md`.

Recommended planning flow:

1. Define or confirm endpoint shapes in `API_CONTRACT.md`.
2. Define structural/data-flow decisions in `ARCHITECTURE.md`.
3. Execute implementation using constraints and acceptance criteria in `CLAUDE.md`.

If there is a conflict:

1. Follow acceptance requirements in `CLAUDE.md`.
2. Follow structural design decisions from `ARCHITECTURE.md`.
3. Keep `API_CONTRACT.md` aligned with architecture and implementation.

---

## Learning Mode: Decision Checkpoints (`grill-me` Skill)

This is an interactive Fellowship learning project. The developer must retain full
ownership of every crucial decision. The agent must never silently make important
design choices, and must never implement on a guess.

**Always pause and ask the developer a multiple-choice question (using the
`AskQuestion` tool) when either is true:**

- A crucial design or architectural decision is in play — for example: type or
  data-model boundaries, error-handling strategy, auth/security choices, module
  boundaries, adding a dependency, changing a public contract, or any change that
  is hard to reverse.
- The prompt is ambiguous or under-specified, or the agent is unsure what the
  developer means.

**Also quiz the developer with understanding-checks (not only at decisions).**
After implementing or changing a non-trivial piece of code (a new module, hook,
auth/security mechanism, data-flow, or tricky fix), pause and ask 1-3 short
Socratic questions so the developer can defend the code, for example:

- "Why this approach over <alternative>?"
- "What breaks if <X>?" / "What happens when <edge case>?"
- "Where in the request/render flow does <Y> run?"

Keep these grounded in the code just written. Use plain text for open-ended
"explain in your own words" questions, or `AskQuestion` for multiple-choice. If
an answer is shaky, correct the misconception in one line and ask one sharper
follow-up. Do not quiz on trivial changes.

**How to ask (decisions):**

- Present concrete options. Put the recommended option first and label it
  "(Recommended)", with a one-line rationale for each option.
- Ask one focused decision at a time; resolve dependent decisions in order.
- If the answer is discoverable in the codebase, investigate instead of asking.
- Skip the checkpoint only for trivial, reversible choices (naming, formatting):
  make those and note them briefly.

The goal is twofold: make the best decision when it matters most, and keep the
developer synchronized with — and in control of — their own code. See
`.cursor/skills/grill-me/SKILL.md` for the questioning style.

## Shared Engineering Principles (All Weeks)

These rules apply across frontend and backend work unless explicitly superseded.

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
15. Keep clear layering and separation of concerns. Express (Week 3): router -> controller -> service -> DbService -> store. NestJS (Week 4): module -> controller -> service (provider) -> DbService (provider) -> store.
16. Keep transport/framework types at the edges (controllers, guards, middleware/pipes). Services and repositories stay framework-agnostic.
17. Use one consistent error envelope shape across the app.
18. Use async/await consistently; do not mix callback style in new code.
19. Validate inputs before business logic (Zod middleware in Week 3; `class-validator` DTOs + `ValidationPipe` in Week 4).
20. Logging should include enough context (method, path, status, duration, key IDs when relevant).
21. Never store or log secrets or plaintext passwords; hash passwords (bcrypt) and load secrets (`JWT_SECRET`) from env only.
22. No `any`; declare explicit return types on every function and method.

## Naming and Commit Conventions

### Commit structure

Each commit should represent one logical concern and be reviewable on its own.
Do not combine unrelated areas in one commit (for example, tooling + middleware + data layer in the same commit).

### Commit messages

- Format: `<file/topic>: <message>`
- Start with a lowercase verb.
- Maximum length: 72 characters.
- End with a period.
- Example: `user.dto: add eduEmail field to StudentInformation.`
- For new files/modules, use: `<file/topic>: initial commit.`

Recommended commit slicing for Express backend work (Week 3):

- tooling/config only
- error infrastructure only (`AppError`, codes, error middleware)
- data layer only (stores + DbServices)
- middleware only
- app wiring only (`app.ts`, `index.ts`, env)

Recommended commit slicing for NestJS backend work (Week 4):

- Nest scaffold/tooling only (project, scripts, `tsconfig`, `@nestjs/config`)
- shared infra only (exception filter for the error envelope, `ValidationPipe` wiring)
- `UsersModule` only (user repository + password hashing)
- `AuthModule` only (DTOs, signup/login, JWT strategy, guard, `@CurrentUser`)
- `ConversationsModule`/`MessagesModule` only (guard coverage + authorization rule)
- FE auth only (login/signup screens, token storage, `Authorization` header, logout)

### Branch naming

- Convention: `feature/<domain>/<scope>`
- Use kebab-case.
- Add a subfolder segment for scoped subdomains.
- Examples:
  - `feature/backend/edu-email-visibility`
  - `feature/frontend/auth/login-redirect`

---

## Shared Long-Term Project Goals

- Build a production-minded chat system iteratively.
- Keep contract-first development between frontend and backend.
- Make each week additive, not a rewrite.
- Preserve maintainable module boundaries as complexity grows.
- Keep type safety and predictable error handling across the stack.

---

## Week-by-Week Scope

### Week 2 (Completed) — Frontend Chat MVP + Mock Backend

#### Week 2 TL;DR

Ship a chat UI in React + Vite + TypeScript against a mocked API:

- conversation list on the left
- message thread + composer on the right
- optimistic sends
- explicit loading, empty, success, and error states

#### Week 2 Deliverables (implemented baseline)

- Frontend Chat MVP shipped with mocked API behavior.
- Contract-first API documented for backend implementation.
- Core UI states and optimistic messaging behavior implemented.
- Baseline tests and type-safe frontend flow established.

#### Week 2 Acceptance Criteria Status

- [x] All UI states (loading, empty, success, error) are visibly handled.
- [x] Optimistic send works and rolls back on simulated failure.
- [x] Auto-scroll keeps the latest message in view.
- [x] Cursor-style pagination is supported in API mock.
- [x] At least one custom hook + at least one `useReducer` usage.
- [x] At least 5 unit/component tests with Vitest + React Testing Library.
- [x] `npx tsc --noEmit` passes.
- [x] `API_CONTRACT.md` documents every endpoint with request/response shapes.

---

### Week 3 (Completed) — Express REST API for Chat MVP

**Course:** Backend  •  **Week:** 3  •  **Score weight:** 100

#### Week 3 TL;DR

Ship a clean Express + TypeScript REST API that powers the Week 2 Frontend Chat MVP.

- In-memory storage only (no DB yet)
- Conversations + messages CRUD surface
- Validated inputs
- Consistent error responses
- CORS configured for frontend integration

#### Week 3 Learning Goals

- Build a clean REST API in Node + Express + TypeScript.
- Apply correct HTTP semantics (methods and status codes).
- Separate concerns into router -> controller -> service layers.
- Return consistent error responses the frontend can rely on.
- Make Week 2 frontend run end-to-end against a real backend.

#### Week 3 Required Spec

Implement the API contract documented in `API_CONTRACT.md` from Week 2.
Minimum endpoints:

- `POST /auth/login` — accept `{ userId }`, return fake token + user.
- `GET /conversations` — list conversations for current user, sorted by last message timestamp.
- `POST /conversations` — create a new conversation.
- `GET /conversations/:id/messages?cursor=...&limit=...` — paginated message history.
- `POST /conversations/:id/messages` — create a message in a conversation.

Operational requirements:

- request logging middleware
- JSON body parsing middleware
- input validation (Zod or manual)
- consistent error shape: `{ "error": { "code": "...", "message": "...", "details": ... } }`
- CORS configured to allow frontend dev origin (`http://localhost:5173`)

#### Week 3 Tech Constraints

- Node.js + Express + TypeScript (strict mode).
- In-memory storage only (module-level `Map`/array is acceptable).
- Clean layering: routes call controllers, controllers call services, services own business logic.
- No business logic inside route handlers.
- No `any`; explicit function return types.
- No NestJS in Week 3.

#### Week 3 Acceptance Criteria

- [x] All endpoints implemented and matching `API_CONTRACT.md`.
- [x] Router -> controller -> service layering enforced.
- [x] Inputs validated; invalid inputs return `400` with consistent error shape.
- [x] Correct status codes used (`201`, `204`, `404`, `409`, etc.).
- [x] Request logging middleware logs method + path + status + duration.
- [x] CORS works with the frontend dev server.
- [x] Frontend Week 2 app runs end-to-end against this backend with mock removed.
- [x] `npx tsc --noEmit` passes.

#### Week 3 Submission

- PR on assigned GitHub repo.
- PR description includes: summary, list of endpoints, notable design choices.
- Repo runs end-to-end: backend and frontend in separate terminals.
- Real chat interaction works between two browser tabs.
- Mentor reviews PR on Sunday.

---

### Week 4 (Current) — NestJS Chat Backend with JWT Auth

**Course:** Backend  •  **Week:** 4  •  **Score weight:** 100

#### Week 4 TL;DR

Refactor the Week 3 Express chat backend into a NestJS project. Add real signup,
login, and JWT-protected routes via the Passport JWT strategy and Nest Guards.
Hash passwords with bcrypt. The FE keeps working — extend it with login/signup
screens, token storage, and a logout button.

#### Week 4 Learning Goals

- Apply NestJS architecture: modules, providers, controllers, services, DTOs, DI.
- Implement JWT authentication using Passport in NestJS.
- Use `@UseGuards`, custom decorators (`@CurrentUser`), and the request pipeline
  (pipes, guards) correctly.
- Hash passwords with bcrypt and store users securely.
- Preserve the API contract so the FE keeps working with minimal changes.

#### Week 4 Required Spec

Refactor the Week 3 backend into a Nest project with feature modules:

- `UsersModule` — owns user data and password hashing.
- `AuthModule` — owns signup, login, JWT issuance, Passport strategy, and Guards.
- `ConversationsModule` — owns conversations + messages (split further if preferred).
- `AppModule` — root module wiring everything.

New / changed endpoints:

- `POST /auth/signup` — `{ email, password, name }` -> `{ token, user }`. Reject
  duplicate emails with `409`.
- `POST /auth/login` — `{ email, password }` -> `{ token, user }`. Reject bad
  credentials with `401`.
- `GET /me` — returns the current authenticated user.
- All `/conversations/*` and `/messages/*` endpoints require a valid JWT in
  `Authorization: Bearer <token>`. Missing/invalid token -> `401`.

Authorization rule:

- A user can only read or post in conversations they are a participant in.
  Accessing someone else's conversation returns `403` (never the data).

FE changes (part of the submission):

- Signup screen and Login screen.
- Token stored client-side (localStorage is acceptable for the Bootcamp).
- Token sent on every request via the `Authorization` header.
- Logout button that clears the token.
- FE must show informative validation error messages (for example, too-short
  password/name, invalid email, unknown/extra fields) instead of a generic
  failure message.

#### Week 4 Tech Constraints

- NestJS + TypeScript (strict mode).
- `@nestjs/passport`, `@nestjs/jwt`, `passport-jwt`, `bcrypt` for auth.
- `class-validator` + `class-transformer` for DTOs and validation.
- Storage: still in-memory this week (Mongo arrives next week). Use injectable
  repository services so the swap is easy.
- `@nestjs/config` for env vars. `JWT_SECRET` and `BCRYPT_ROUNDS` must come from env; commit `.env.example`.
- No `any`. Explicit return types everywhere.

#### Week 4 Acceptance Criteria

- [x] Project structured into clean feature modules with proper imports/exports.
- [x] DTOs validate every incoming request body / query.
- [x] JWT signup + login work end to end. Bad creds -> `401`. Duplicate signup -> `409`.
- [x] `@UseGuards(JwtAuthGuard)` protects every chat endpoint.
- [x] A `@CurrentUser()` decorator extracts the authenticated user in controllers.
- [x] Passwords are hashed with bcrypt — no plaintext anywhere.
- [x] `JWT_SECRET` is loaded from env, not hardcoded. `.env.example` checked in.
- [x] FE has signup + login screens and sends the token on every request.
- [x] Authorization rule enforced: cross-user access returns `403`, never the data.
- [x] `npx tsc --noEmit` passes; `npm run build` (Nest) passes.

#### Week 4 Submission

- PR on the assigned GitHub repo.
- PR description includes: summary, module diagram (text or screenshot), security
  checklist (bcrypt, env secret, guard coverage), and key tradeoffs.
- Repo runs end-to-end: BE + FE locally with the full auth flow.
- Mentor reviews the PR on Sunday.

---

### Week 5 (Current) — MongoDB Persistence (Mongoose)

**Course:** Backend • **Week:** 5 • **Score weight:** 100

#### Week 5 Data Model Decision (locked — PR defense)

Rule: **reference high-volume/mutable data; denormalize only the small, read-hot
scalars the conversation list needs.**

- **Messages → referenced.** Own collection linked by `conversationId`. Threads
  grow unbounded (thousands–millions), so embedding them in a conversation would
  hit the 16MB document cap and break cursor pagination. Reference scales; embed
  does not.
- **Conversations → denormalize `lastMessageAt` + `lastMessagePreview`.** The
  sidebar lists conversations newest-first with a snippet. An index on the
  messages collection only speeds up "newest message of *one* conversation"; it
  cannot sort the *conversations* collection by a field that lives in messages.
  Storing these two scalars on the conversation turns the list into one indexed
  query (`find({ participantIds }).sort({ lastMessageAt: -1 })`). Cost: each send
  updates them on the parent conversation (the spec requires this anyway).
- **Users → referenced** (`senderId`), not embedded on messages. The FE already
  loads the user directory once (`/users`) and resolves names client-side, so
  embedding names on messages would be duplicated, stale-prone data with no
  read-perf payoff.

#### Week 5 Naming Glossary (DAO/DTO mapping — PR defense)

The codebase satisfies the spec's "DAO/DTO separation" using the project's own
vocabulary (kept consistent with Weeks 3–4 rather than renamed). Mapping:

- **DAO / repository** → `*DbService` classes (`UsersDbService`,
  `MessagesDbService`, `ConversationsDbService`) plus the Mongoose `*.schema.ts`
  models/documents. Only DbServices touch Mongoose; domain services depend on
  DbServices, not Mongoose. (`DbService` keeps the Week 3 name for the role the
  spec calls a repository.)
- **Request DTOs** → `*.dto.ts` `class-validator` classes (`SignupDto`,
  `CreateMessageDto`, …), validated by the global `ValidationPipe` at controllers.
- **Response DTOs** → the shared `@chat/contract` types (`User`, `Message`,
  `Conversation`, …). Deliberately shared with the FE as the single source of
  truth; controllers return these, never raw Mongoose documents.
- **DAO → DTO boundary** → mapper functions in the DbServices (`toPublicUser`,
  `toMessage`) strip `_id → id` and drop `__v`/`passwordHash`.
- **Server-only DAO type** → `StoredUser` (`User` + `passwordHash`), lives in
  `users.dbService.ts`; never returned to clients.

#### Week 5 Official Instructions (source of truth)

> Verbatim assignment spec. Our working progress and gaps are tracked in the
> "In-Scope" and "Open Concerns" subsections below.

**TL;DR:** Replace the in-memory data layer in your Week 4 chat backend with
MongoDB. Design clean Users / Conversations / Messages schemas, add the right
indexes, implement cursor-paginated message history. The FE keeps working — data
now survives server restarts.

**Learning goals:**

- Design MongoDB schemas for a real product (Users, Conversations, Messages).
- Decide between embedding and referencing based on read/write workloads.
- Use indexes to back the chat app's hot queries.
- Implement cursor-based pagination for message history.
- Separate database access (DAOs) from API contracts (DTOs) — no Mongo internals
  leaking into responses.

**Spec — replace the in-memory repository services with MongoDB-backed ones.**

Required collections (suggested — defend choices in the PR):

- `users` — `{ _id, email, name, passwordHash, createdAt }`, unique index on `email`.
- `conversations` — `{ _id, participantIds, lastMessageAt, createdAt }`, index on
  `(participantIds, lastMessageAt desc)`.
- `messages` — `{ _id, conversationId, senderId, content, createdAt }`, index on
  `(conversationId, createdAt desc)`.

Required queries:

- "List my conversations sorted by last activity" (uses participantIds +
  lastMessageAt index).
- "Message history for conversation X with cursor pagination"
  (`?cursor=<messageId>&limit=N`, returns messages older than the cursor).
- "Send message" — write the message AND update the parent conversation's
  `lastMessageAt` atomically.

Required architecture:

- DAO layer (Mongoose models) lives in dedicated DB services (e.g.
  `MessagesDbService`).
- Domain services depend on DAOs, not on Mongoose directly.
- Controllers return DTOs, never raw Mongoose documents. Strip `_id` → `id`,
  drop `__v`.

**Tech constraints:**

- NestJS + `@nestjs/mongoose` + Mongoose.
- MongoDB running locally — Docker or a free MongoDB Atlas cluster.
- `MONGO_URI` from env; `.env.example` updated.
- Cursor pagination, not offset.
- API contract preserved — FE needs no changes beyond pointing at the new backend.
- No `any`.

**Acceptance criteria:**

- [ ] Schema designed with explicit reasoning in the PR (embedding vs referencing).
- [ ] All required indexes created (via Mongoose `index()` calls / schemas).
- [ ] "My conversations" sorted correctly by last activity.
- [ ] Cursor-paginated message history works on a thread of 100+ messages.
- [ ] Sending a message updates `lastMessageAt` on the parent conversation.
- [ ] DAO/DTO separation enforced — no `_id`, no `__v` in API responses.
- [ ] Authorization rule from Week 4 still enforced (no cross-user access).
- [ ] Data survives server restart.
- [ ] `npx tsc --noEmit` passes; `npm run build` passes.

**Submission:** PR with summary, schema diagram (text fine), index list with the
query each backs, embedding-vs-referencing reasoning, key tradeoffs. Repo runs
end-to-end with MongoDB. Mentor reviews on Sunday.

#### Week 5 TL;DR

Swap the in-memory chat storage for MongoDB via Mongoose, starting with the
messages domain. Keep the controller/DTO contract unchanged so the FE keeps
working. Use an injectable repository (`MessagesDbService`) so services never
touch Mongoose directly.

#### Week 5 In-Scope (must-have)

- [x] `MessagesDbService` uses a Mongoose model instead of the in-memory `Map`.
- [x] `MessagesService` depends on the DbService, not on Mongoose.
- [x] Controllers/DTO contract unchanged (FE keeps working).
- [x] Reads and writes point to the same store; seeding (`resetStore` +
      `MessagesDbService.reset`) migrated so the suite passes.
- [x] `MONGO_URI` loaded from `@nestjs/config`, validated, and in `.env.example`.

#### Week 5 Open Concerns (must resolve before the PR)

> Goal: the PR opens with **no open concerns**. Track and clear each item below.

- [x] **Destructive seed on boot — RESOLVED.** `main.ts` seeds nothing on boot.
      All data lives in Mongo and is seeded out-of-band via `npm run seed`
      (`src/scripts/seed.ts`, a standalone Nest context), so persisted data
      survives restarts.
- [x] **Shared test database — RESOLVED.** `vitest.config.ts` sets
      `fileParallelism: false` + `maxWorkers: 1`, so test files run sequentially
      in one worker and never race on the shared `chat-test` DB. `npm run test`
      is green by default (no CLI flag needed).
- [x] **Mixed-store state — RESOLVED.** All three domains (users, conversations,
      messages) live in Mongo with a single uuid string `_id` format (messages
      were migrated from the default ObjectId `_id` to a uuid for consistency). No
      in-memory stores remain (`users.store.ts`, `conversations.store.ts`,
      `messages.store.ts` all deleted); `resetStore` is gone. Nothing seeds on
      boot — data survives restart.
- [x] **`lastMessageAt` on message create — RESOLVED.** Conversations are in Mongo
      with matching uuid ids, so sending a message now updates the parent
      conversation's `lastMessageAt` + `lastMessagePreview`
      (`ConversationsService.recordMessageActivity` →
      `ConversationsDbService.updateLastMessage`). Covered by a test that asserts
      `updatedAt` advances, the preview updates, and the conversation sorts to the
      top. (Two sequential writes — not a true transaction; see resilience note.)
- [ ] **Unconstrained message schema:** `conversationId/senderId/content/createdAt`
      are bare optional `@Prop()` strings. Decide required/validation rules (and
      whether `createdAt` should be a real `Date`/`timestamps`) for data integrity.
- [ ] **Connection resilience:** `MongooseModule.forRootAsync` has no explicit
      failure messaging/retry. Confirm a clear startup error if Mongo is
      unreachable, and document the expected local Mongo setup in the README.
- [x] **Conversation schema vs. contract — RESOLVED.** `conversation.schema.ts`
      now carries `title`, `lastMessagePreview`, `lastMessageAt` (Date),
      `participantIds`, `createdAt`. The DAO maps `lastMessageAt → updatedAt`
      (ISO, falling back to `createdAt`) in the response DTO, so the FE contract
      is unchanged. Index `(participantIds, lastMessageAt desc)` added.
- [x] **Index-backed message pagination — RESOLVED.** `MessagesService.listMessages`
      now uses `getMessagePage` (keyset, index-backed); the full-fetch
      `listByConversationId` and JS paging were removed. Cursor stays an opaque
      base64 token at the edge (FE unchanged); cursor `id` is validated as a
      uuid. Verified by a 150-message pagination test (walks all pages).

#### Week 5 Deferred (bugs/smells — address after open ends)

> Found in the Jun 16 deep review. Intentionally deferred until open ends are done.

- [x] **B2 — atomic message send — RESOLVED.** The message insert and the parent
      conversation's `lastMessageAt`/preview update now run in one Mongo
      transaction (`connection.transaction(...)`, session threaded through the
      DAOs). Requires Mongo as a replica set: `docker-compose.yml` runs a
      self-initializing single-node `rs0`, and `MONGO_URI` uses `?replicaSet=rs0`.
- [x] **B3 — duplicate-key (`E11000`) → 409 — RESOLVED.** `AllExceptionsFilter`
      maps Mongo `E11000` to `409 EMAIL_ALREADY_EXISTS`; the signup `findByEmail`
      pre-check was dropped so the unique index is the single source of truth.
- [x] **B4 — new-conversation ordering — RESOLVED.** `ConversationsDbService.create`
      sets `lastMessageAt = now`, so a new conversation sorts by creation time and
      matches its displayed `updatedAt`.
- [x] **S2 — date typing — RESOLVED.** `message.createdAt` is now a `Date`
      (DAO maps it to an ISO string in the DTO), consistent with conversations/users.
- [x] **S3 — message schema hardened — RESOLVED.** `conversationId/senderId/content`
      are `required`; `createdAt` is a required `Date`.
- [x] **S4 — validation stack unified — RESOLVED.** Cursor parsing no longer uses
      `zod` (manual uuid check); the `zod` dependency was removed.
- [x] **Tiebreak coverage — RESOLVED.** Added a same-`createdAt` pagination test
      asserting the `_id` tiebreak yields no dupes/skips.
- [ ] **Test-infra flake (rare).** ~<5% of runs a request-based test fails
      transiently (connection churn on the shared `chat-test` DB). Tried a shared
      app-per-file harness; it didn't fully eliminate it, so reverted to the simple
      app-per-test harness and accepted the rare flake. Details in the local
      (gitignored) `KNOWN_ISSUES.local.md`. Fix later via per-file DB isolation.

#### Week 5 Tech Constraints

- `@nestjs/mongoose` + `mongoose`; one model per domain registered via
  `MongooseModule.forFeature` inside the owning feature module.
- `MongooseModule.forRoot`/`forRootAsync` only in `AppModule`.
- Keep the repository (`DbService`) seam; services stay framework/DB-agnostic.
- No `any`; explicit return types; preserve the error envelope and DTO contract.

---

## Week 4 Study Summary (Core Concepts)

### NestJS architecture

- Modules group related providers/controllers and declare `imports`/`exports`.
- Providers (services, repositories, strategies) are injected via DI; never `new`
  them manually inside consumers.
- Controllers stay thin: parse the validated DTO, call a service, return data.
- A module only consumes another module's provider when that provider is exported.

### Request pipeline order

- Middleware -> Guards -> Pipes -> Interceptors -> Controller handler -> Filters
  (on the way out). Auth lives in Guards; validation lives in Pipes.

### JWT + Passport

- `passport-jwt` extracts the bearer token, verifies the signature with
  `JWT_SECRET`, and exposes the decoded payload.
- The strategy's `validate(payload)` loads/returns the user, which Nest attaches
  to the request; `@CurrentUser()` reads it in controllers.
- `JwtAuthGuard` (extends `AuthGuard('jwt')`) protects routes via `@UseGuards`.

### Password security

- Hash with bcrypt on signup, using a `BCRYPT_ROUNDS` cost loaded from env (use a
  reasonable cost, e.g. 10-12; never 1-4).
- Compare on login with `bcrypt.compare` — never re-hash the input and compare
  strings.
- Never return or log the password hash; strip it before returning a `User`.

### Validation with DTOs

- `class-validator` decorators define rules; `class-transformer` shapes payloads.
- A global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`)
  rejects unknown fields — the Nest equivalent of Week 3's `.strict()` schemas.
- DTO decorator convention:
  - use `@Length(min, max)` when both min and max matter for a string field
  - use `@MinLength(...)` only when only a minimum matters for a string field
  - use `@MaxLength(...)` only when only a maximum matters for a string field
  - use `@Min(...)`/`@Max(...)` for numeric bounds with `@IsInt`
  - do not invent unnecessary bounds
  - do not use both `@MinLength` and `@MaxLength` when one `@Length(min, max)`
    can express the rule

---

## Architecture and Clean Code Expectations (Week 4 Focus)

### Modules and responsibilities

- **Module:** declares controllers/providers, wires `imports`/`exports`.
- **Controller:** maps HTTP route to a handler, reads the validated DTO and the
  `@CurrentUser()`, calls a service, returns data. The only layer touching
  request/response concerns.
- **Service (provider):** business logic and orchestration; framework-agnostic.
- **DbService (provider):** in-memory persistence helpers behind an injectable
  class so the Week 5 Mongo swap is local. Services never touch raw `Map`s.
  (Fills the role the Week 4 spec calls a "repository"; the DbService name
  keeps the Week 3 vocabulary.)
- **Guard / Strategy / Decorator:** authentication and identity extraction live
  here, not in services.

### Auth and authorization

- Authentication (`JwtAuthGuard`): valid JWT required on every protected route;
  missing/invalid -> `401`.
- Authorization (participant rule): a user may only read/post in conversations
  they belong to; otherwise `403` (do not leak data or fall back to `404`).
- Derive identity from the verified token (`@CurrentUser()`), never from the body.

### Error handling (keep the envelope)

- Keep the single error envelope `{ error: { code, message, details? } }` from
  Week 3 via a Nest exception filter so the FE contract does not change.
- Map auth failures to `401`, authorization failures to `403`, duplicate signup to
  `409`, and validation failures to `400`.

### Config and secrets

- `@nestjs/config` loads env; `JWT_SECRET` and `BCRYPT_ROUNDS` are required and
  never hardcoded.
- Commit `.env.example` with placeholder values; never commit a real `.env`.

### Node.js runtime model

- Single-threaded event loop.
- Non-blocking I/O.
- Callback, Promise, and async/await flow control.

### HTTP basics

- Request line, headers, body.
- Status codes and method semantics.
- Common methods: `GET`, `POST`, `PUT`, `PATCH`.
- `Content-Type` and `Accept` headers.

### REST API design

- Resource-oriented paths and collections:
  - `/users`
  - `/conversations`
  - `/messages`
- Standard verbs:
  - `GET /resource` -> list
  - `GET /resource/:id` -> get one
  - `POST /resource` -> create
  - `PATCH /resource/:id` -> partial update
- Status codes: `200`, `201`, `204`, `400`, `404`, `409`, `500`.
- Use `Location` header with `201 Created` where relevant.

### Express basics

- Create app with `express()`.
- Middleware (`express.json()`, request logging, error handler).
- Route registration with `app.get`, `app.post`, `app.patch`, `app.delete`.
- Use of `req.params`, `req.query`, `req.body`.

---

## Architecture and Clean Code Expectations (Week 3 Focus)

### Layering and responsibilities

- **Router:** map HTTP path + method to controller.
- **Controller:** read validated input, call service, map domain outcomes/errors to HTTP responses.
- **Service:** own business logic and orchestration.
- **DbService (in-memory):** persistence-oriented CRUD helpers (`findById`, `create`, `update`, `delete`, `listByConversationId`).
- **Store:** low-level in-memory `Map` ownership and seed bootstrap.

### In-memory store rules

- Data is stored in process memory (`Map`/array), not a database.
- DbService functions encapsulate access.
- Services do not directly mutate raw arrays or Maps.
- Do not export raw Maps directly; expose store operations through functions.
- Keep store modules focused by domain when scale/noise justifies it.

### Validation and error handling

- Validate required fields for `POST` and `PATCH`.
- Validate types and constraints (for example, non-empty strings).
- Return `400 Bad Request` on invalid input.
- Use consistent error envelope:
  - `{ "error": { "code": "RESOURCE_NOT_FOUND", "message": "Message not found" } }`
- Add global error middleware (`app.use(...)`) to catch, log, and map errors.

### CORS and frontend integration

- Allow origin `http://localhost:5173`.
- Configure allowed methods and headers.
- Replace frontend mock fetcher with real API calls.
- Verify URL, method, status code, and JSON shape through network tab + backend logs.

---

## Good Habits to Keep

- Clear separation: routes -> controllers -> services -> DbServices -> store.
- No Express types outside controllers.
- Consistent naming across route/controller/service/DbService/store layers.
- Single source of truth for validation and error shapes.
- Use one validation pattern per module (`validate(...)` middleware + `getValidated(...)` in controllers).
- Use `.strict()` on request schemas to reject unexpected fields.
- Keep `AppError` static factory methods for readable, consistent error creation.
- Derive display names and other UI labels from runtime API data, not hardcoded parallel lookup tables.
- Keep tests focused: one scenario per `it(...)` block.
- Use async/await consistently.
- Test endpoints with Postman/curl before wiring frontend.
- Use proper status codes and RESTful semantics.
- Log requests and errors with context.
- Start from clean `main` and use a feature branch (for example, `feature/backend/nestjs-jwt-auth`).
- Commit in small steps by resource or milestone.
- Run `npm run typecheck` and `npm run lint` before pushing.
- Keep minimal README setup/run steps up to date.

### Week 4 additions (NestJS + JWT)

- Inject dependencies via constructors; never instantiate providers manually.
- Keep one DTO per request shape, validated by `class-validator`; enable
  `whitelist` + `forbidNonWhitelisted` on the global `ValidationPipe`.
- Validation decorator consistency rule:
  - strings: use `@Length(min, max)` when both bounds matter; otherwise one-sided
    `@MinLength` or `@MaxLength`
  - numbers: use `@Min/@Max` with `@IsInt`
  - avoid unnecessary bounds
- Protect every chat route with `@UseGuards(JwtAuthGuard)`; read identity with
  `@CurrentUser()`.
- Hash passwords with bcrypt; strip the hash before returning any `User`.
- Load `JWT_SECRET` from `@nestjs/config`; commit `.env.example`, never `.env`.
- Keep DbServices injectable so the Week 5 Mongo swap stays local.
- Preserve the error envelope via a Nest exception filter so the FE is unaffected.
- Test the auth flow (signup, login, bad creds `401`, duplicate `409`, cross-user
  `403`) before wiring the FE.
- Show field-level, user-friendly auth form validation messages in the FE that
  map backend validation failures to actionable feedback.

## Code Smells and Red Flags to Avoid

- Fat controllers that contain business logic and data mutations.
- Passing `Request`/`Response` into services or DbServices.
- Inconsistent JSON/error shapes between endpoints.
- Incorrect REST semantics (for example, mutation via `GET`).
- Wrong status codes (`200` on create instead of `201`).
- Trusting `req.body` without validation.
- Mixing validation styles in the same controller/module.
- Exporting mutable store Maps directly to callers.
- Maintaining hardcoded frontend lookup tables that duplicate backend runtime data.
- Bundling multiple scenarios into one test case (`it`) where failures become ambiguous.
- Unclear in-memory mutation patterns that create hidden bugs.
- Tangled concerns (logging + validation + business logic in one place).
- Duplicated or scattered CORS config.
- Ignoring lint or typecheck failures.

### Week 4 additions (NestJS + JWT)

- Plaintext passwords stored, returned, or logged anywhere.
- Hardcoded `JWT_SECRET` or committing a real `.env`.
- Business logic, hashing, or token verification leaking into controllers.
- Unprotected chat routes (missing `@UseGuards(JwtAuthGuard)`).
- Authorization failures returning the data or a `404` instead of `403`.
- Deriving identity from the request body instead of the verified token.
- Manually instantiating providers instead of using DI.
- DTOs that skip validation or accept unknown fields.
- Changing the error envelope shape and breaking the FE contract.

---

## Change Log Notes

- Week 2 scope is documented as the completed frontend baseline.
- Week 3 (Express REST backend) is documented as completed.
- Week 4 (NestJS refactor + JWT auth) is documented as completed.
- Week 5 (MongoDB persistence via Mongoose) is now the active implementation
  target; its open concerns are tracked under "Week 5 Open Concerns" and must be
  cleared before the PR.
- Shared layering/validation principles were generalized to cover both Express
  (Week 3) and NestJS (Week 4).
- Future weeks should be added as new sections without removing shared principles.
