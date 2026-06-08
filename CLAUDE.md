# Chat MVP — Multi-Week Working Instructions

## Project Context

- **Program:** Masterschool Fellowship (AI Software Engineering)
- **Project:** Chat MVP (ongoing, multi-week)
- **Current phase:** Week 3 (Backend foundations)
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
15. Keep clear layering and separation of concerns (router -> controller -> service -> DbService -> store).
16. No Express types beyond controllers; services and DbServices remain framework-agnostic.
17. Use one consistent error envelope shape across the app.
18. Use async/await consistently; do not mix callback style in new code.
19. Validate inputs before business logic.
20. Logging should include enough context (method, path, status, duration, key IDs when relevant).

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

Recommended commit slicing for backend work:

- tooling/config only
- error infrastructure only (`AppError`, codes, error middleware)
- data layer only (stores + DbServices)
- middleware only
- app wiring only (`app.ts`, `index.ts`, env)

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

### Week 3 (Current) — Express REST API for Chat MVP

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

## Week 3 Study Summary (Core Concepts)

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
- Start from clean `main` and use a feature branch (for example, `feat/express-chat-api`).
- Commit in small steps by resource or milestone.
- Run `npm run typecheck` and `npm run lint` before pushing.
- Keep minimal README setup/run steps up to date.

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

---

## Change Log Notes

- Week 2 scope is now documented as completed baseline.
- Week 3 backend scope is now the active implementation target.
- Future weeks should be added as new sections without removing shared principles.
