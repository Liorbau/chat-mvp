# Chat MVP — Working Instructions

## Project Context

- Masterschool Fellowship (AI Software Engineering); ongoing project built in a
  rolling, additive format (each iteration extends the app, never a rewrite).
- This file tracks stable engineering principles and cross-cutting conventions
  that apply to the whole project.

## How to Use This Document

- `CLAUDE.md` = execution source of truth; `docs/ARCHITECTURE.md` = architecture;
  `docs/API_CONTRACT.md` = endpoint contract;
  `docs/FRONTEND_CONVENTIONS.md` = frontend directory/file structure rules
  (feature slices, component-as-folder, presentational/container, context-over-props,
  api actions) — follow it for all `apps/web` work.
- On conflict: follow `CLAUDE.md` principles, then `docs/ARCHITECTURE.md`
  structure, and keep `docs/API_CONTRACT.md` aligned.

## AI Engineering Policy

The AI ownership protocol lives in [AGENTS.md](AGENTS.md): the human owns system
design, tradeoffs, and final decisions; agents restate the task, surface options
for important decisions, keep diffs small (≤ ~3 files / ~40 lines before
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

## Shared Engineering Principles

1. Always use curly braces for every `if` statement, including one-liners.
2. Remove pass-through handlers; call the original function directly when no extra logic is added.
3. Never fail validation silently; always return or show a clear error.
4. Keep validation behavior consistent across similar flows.
5. Prefer clear variable names (`inputValue`, `value`) over vague names.
6. Derive critical values from latest state in functional updates when relevant.
7. Use typed arrays + `.map()` for repeated options or repeated UI/logic branches.
8. Add edge-case tests for mutation paths (for example, non-existent IDs); cover
   critical invariants — tenant/data isolation and idempotency (dedup) — with
   explicit tests, not incidental coverage.
9. Keep formatting conventions strict (EOF newline, lint and format clean).
10. `interface` vs `type` (rule of thumb): use `interface` for a contract many
    kinds of things implement (a blueprint for implementers, e.g. `LlmProvider`,
    `AiTool`); use `type` for a data shape — the thing itself (e.g. `LlmMessage`,
    DTO/response shapes). Neither should be an `abstract class` when there is no
    shared state/implementation. Both are erased at runtime, so when NestJS must
    inject a contract, pair it with a `Symbol` injection token and
    `@Inject(TOKEN)`; implementers use `implements`.
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
23. Our own functions must return a meaningful value; `Promise<void>` / `void`
    return types are banned for domain code. If a function seems to return
    nothing, that is a design smell — pause and rework it (return a result,
    id, status, or restructure). The only exception is a signature the framework
    or runtime fixes for us (NestJS lifecycle hooks like `onModuleDestroy`, the
    `bootstrap`/`seed` entrypoints); those may be `void`/`Promise<void>` because
    we do not choose their shape.
24. Keep each function/class/method at a single level of abstraction. If an
    injectable (or any unit) otherwise only orchestrates named helpers and then
    contains one inline ad-hoc block, that mixed altitude is a smell — extract
    the block into a peer helper at the same level as the others.
25. Inject swappable external providers (LLM, embeddings, storage) via their
    abstraction or DI token — never the concrete vendor class; a service stays
    provider-agnostic (swapping is a module rebind). A module `exports` only
    providers another module actually injects; internals stay private.
26. When calling an external API with bulk or looped input, respect its
    batch/size/rate limits (batch, paginate, or throttle) — never send unbounded
    requests.
27. Give mutually-exclusive outcomes separate code paths; never carry one path's
 data onto another (e.g., a refusal must not include citations/sources).
28. Derive a type from its single source of truth (e.g. `ReturnType<typeof fn>`
 or one shared type) instead of hand-writing two identical shapes that can drift
 (a context value vs. its hook's return; a DTO vs. its mapper output).
29. Never use strict equality against `null` or `undefined` (`=== null`, `!== null`,
 `=== undefined`, `!== undefined` are all banned app-wide, FE + BE). Use truthiness —
 `if (x)` / `if (!x)` / `Boolean(x)` — for objects and strings-where-empty-is-invalid.
 **Caveat:** when `0` or `''` are legitimate values (numbers, or strings where empty
 is meaningful), use the loose `== null` / `!= null` so a real `0`/`''` isn't treated
 as missing.
30. Don't mix standalone/static functions with Nest: wrap behavior- or
 dependency-bearing capability (bcrypt, code generation, message building, any
 external seam) as an `@Injectable()` provider and inject it via the constructor.
 Reserve free-function files (`*.mappers.ts`, `*.utils.ts`) for **pure data-shape
 transforms** only (e.g. `_id → id`, doc → DTO). Rule of thumb: does it *do* work or
 hold a dependency? Inject it. Does it just reshape a value? Mapper/util.
31. Default to zero comments. Code must explain itself through clear names and
 structure; never narrate what the code already says, never add file/section banner
 comments, and never restate a symbol's name in a comment. A comment is a last
 resort, allowed only for a genuinely non-obvious invariant, security subtlety, or
 workaround that a name cannot capture — and then it is a single short line placed
 directly above the exact line it explains, never a multi-line block and never a
 header over a group of lines. Prefer extracting a well-named function or constant
 over writing a comment.

## Naming and Commit Conventions

- One logical concern per commit; do not combine unrelated areas.
- Message format: `<file/topic>: <message>` — lowercase verb, ≤ 72 chars, end
  with a period (e.g. `users: back users with mongodb and a unique email index.`).
  New files/modules: `<topic>: initial commit.`
- Branch: `feature/<domain>/<scope>`, kebab-case (e.g. `feature/backend/db`).
- Run `npm run typecheck`, `npm run lint`, and tests before pushing.
- Order commits so code is in its final shape by the time it lands. Reviewers
  read commits chronologically, so do not let an early commit introduce code that
  a later commit in the same PR rewrites. When squashing or reordering, fold the
  fix into the commit that introduces the code (or place it immediately after) so
  intermediate states never show superseded logic — this avoids "Outdated"
  review comments on code that no longer exists.

## Shared Long-Term Goals

- Build a production-minded chat system iteratively; each iteration additive, not a rewrite.
- Contract-first between frontend and backend; preserve maintainable module boundaries.
- Keep type safety and predictable error handling across the stack.

## Backend Architecture and Clean Code

### Layering and responsibilities

- **Module** declares controllers/providers and wires `imports`/`exports`; a
  module consumes another's provider only when it is exported.
- **Controller** is the only layer touching request/response: read the validated
  DTO and `@CurrentUser()`, call an orchestrator, return a DTO. No business logic.
- **Orchestrator** — one per endpoint (`<verb>-<noun>.orchestrator.ts` with an
  `execute(...)`). Owns the endpoint flow: authorize → validate → compose
  services/repositories (and transactions) → map to the response DTO. The only
  layer that crosses domain boundaries.
- **Service** owns single-domain business logic; framework- and DB-agnostic.
  Services never call each other across domains — composition lives in orchestrators.
- **DbService (DAO / repository)** owns persistence (Mongoose models); services
  and orchestrators never touch Mongoose directly.
- **Pipe** validates/extracts transport input at the edge (e.g. a multipart file
  into a framework-agnostic DTO) so nothing downstream sees Express/multer types.
- **Guard / Strategy / Decorator** own authentication and identity extraction.
- Inject dependencies via constructors; never `new` providers manually.

### Endpoint layering (orchestrator pattern)

Applies to every endpoint.

- **`Controller → Orchestrator → Service → Repository`, one orchestrator per
  endpoint.** Controllers only route and delegate; the authorize → validate → act
  flow lives in the orchestrator. Keep each layer even when thin (for uniformity
  across domains); the only sanctioned skip is a read that just returns the
  guard-resolved principal (`GET /me`).
- **Orchestrators compose; services don't.** Cross-domain coordination (and
  transactions) happen in the orchestrator; a service stays within its own domain.
- **Transport types stay at the edge** (controllers/guards/pipes). File uploads go
  through a `*.pipe.ts` that validates and returns a framework-agnostic type;
  services and orchestrators never import Express/multer.
- **Enforce each input constraint once, at the edge, mapped to the error
  envelope.** The upload `*.pipe.ts` validates both size (→ `400 VALIDATION_ERROR`)
  and *type by magic bytes* (fail-closed, never the client-claimed
  `Content-Type`). No multer `fileSize` limit and no transport-specific
  `PayloadTooLargeException` special-case in the global filter.
- **One real job per file (~150-line soft cap).** Extract pure helpers to
  siblings: DB mappers `*.mappers.ts`, cursor/paging `*.cursor.ts`, chunking /
  extraction helpers, etc. Avoid hollow layers beyond the thin-but-uniform
  orchestrators above.
- **Name a swappable seam by its role, not its payload:** an `interface` + a
  `Symbol` DI token (e.g. `StorageProvider` / `STORAGE_PROVIDER`); the vendor name
  stays on the concrete class only (`S3Storage implements StorageProvider`).

### Data model conventions

- **Single uuid string `_id`** across all collections (seeds use pinned uuids;
  creates/signups generate uuids). No separate `id` field on the document.
- **Reference vs. denormalize:** reference high-volume/mutable data (its own
  collection linked by id) so it scales past the 16MB document cap and keeps
  cursor pagination working; denormalize only the small, read-hot scalars a list
  view needs (e.g. `lastMessageAt` + `lastMessagePreview` on a conversation) and
  update them wherever the source changes.
- **Embed** a small, owned, always-loaded value object as a subdocument
  (`_id: false`) on its parent (e.g. `avatar` on `User`); reference anything that
  grows unbounded or is queried independently.
- **DAO → DTO boundary:** mapper functions (`toPublicUser`, `toMessage`,
  `toConversation`) strip `_id → id` and drop `__v`/secrets. Controllers return
  `@chat/contract` types, never raw Mongoose documents.

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
