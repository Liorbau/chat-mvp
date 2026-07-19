# Chat MVP — Architecture (Multi-Week)

## Related Planning Docs

- Execution rules and acceptance criteria: [`CLAUDE.md`](./CLAUDE.md)
- Endpoint contracts and payload shapes: [`API_CONTRACT.md`](./API_CONTRACT.md)
- Frontend directory/file structure rules: [`docs/FRONTEND_CONVENTIONS.md`](./docs/FRONTEND_CONVENTIONS.md)

## Purpose

This document is the source of truth for high-level architecture, module
boundaries, and data-flow decisions across the whole project.

It is organized by phase:

- **Week 2 (Completed)** — Frontend Chat MVP against a mocked API.
- **Week 3 (Completed)** — Express + TypeScript REST backend replacing the
  mock, with frontend wired to real API.
- **Week 4 (Completed)** — NestJS refactor of the backend with real JWT auth
  (signup/login, Passport JWT, Guards, bcrypt) plus FE auth screens.
- **Week 5 (Completed)** — MongoDB persistence via Mongoose: the in-memory stores
  are replaced by a Mongoose-backed DbService (DAO) seam, with indexes, keyset
  cursor pagination, and an atomic transactional send.
- **Week 6 (Completed)** — AI assistant mode: `ai` module, swappable
  `LlmProvider`, SSE streaming, user-scoped tools.
- **Week 7 (Completed)** — AI tutor (RAG): per-user knowledge base on Atlas Vector
  Search, LangChain retrieval + grounded answers with citations.
- **Week 8 (Completed)** — Capstone LangGraph agent: one `StateGraph` serves both
  assistant and tutor, with MongoDB checkpointing and streamed tool progress.
- **Backend Refactor (post-Week 8)** — endpoint layering standardized to
  `Controller -> Orchestrator -> Service -> Repository` (one orchestrator per
  endpoint) across every module. No wire-contract change.

When a later week supersedes an earlier decision, note it in that week's section
rather than deleting the history.

---

# Week 2 (Completed) — Frontend Chat MVP

> Status: shipped. This is the implemented baseline the Week 3 backend must keep
> working without behavior changes (other than swapping the mock for real HTTP).

## High-Level Architecture

- Single-page frontend (no routing needed for now).
- Entry: `src/main.tsx` renders `<App />`.
- App shell: `src/App.tsx` sets up global layout and mounts the chat feature.
- Main feature lives under `src/features/chat/`.

## Folder and File Structure (One File -> One Responsibility)

> **Superseded (week 9+).** The frontend was later reorganized into feature
> slices and `src/features/chat/` no longer exists (every part moved to a
> resource-named `features/<domain>/` folder). The subsections below are kept as
> the original **Week-2** layout for historical context; for the **current**
> frontend structure see [`docs/FRONTEND_CONVENTIONS.md`](docs/FRONTEND_CONVENTIONS.md)
> (the canonical rulebook).

### `src/features/chat/components/`

- `ChatLayout.tsx`
  - Layout-only.
  - Arranges left (conversations) and right (messages + composer) columns.
  - Receives container components as children/props.
  - No data fetching, no business logic.

- `ConversationListContainer.tsx`
  - Container for conversations.
  - Uses `useConversations` for fetching/status.
  - Receives selection state from `ChatLayout` via props.
  - Handles loading/error/empty/success branches.
  - Renders presentational `ConversationList` and loading skeleton states.

- `ConversationList.tsx`
  - Presentational component.
  - Receives `conversations`, `selectedConversationId`, `onSelect`.
  - Maps array to `ConversationListItem`.

- `ConversationListItem.tsx`
  - Presentational component.
  - Renders a single conversation row (title, preview, active state).

- `MessagePanelContainer.tsx`
  - Container for messages of the selected conversation.
  - Receives `selectedConversationId` via props.
  - Uses `useOptimisticMessages`.
  - Handles status branches: no selection, loading, error, empty, success.
  - On success, renders `MessageList` and `MessageComposer`.

- `MessageList.tsx`
  - Presentational component.
  - Receives messages and renders a `MessageItem` list.

- `MessageItem.tsx`
  - Presentational component.
  - Renders one message bubble, aligned by sender.

- `MessageComposer.tsx`
  - Controlled input component.
  - Local UI state (`inputValue`, `isSending`) and focus retention.
  - Props: `onSend(content)`, `disabled`.
  - No API calls.

### `src/features/chat/hooks/`

- `useConversations.ts`
  - Fetches conversations.
  - Internal state:
    - `status: LoadStatus` (`"idle" | "loading" | "success" | "empty" | "error"`)
    - `conversations: Conversation[]`
    - `error: string | null`
  - Uses `apiClient.getConversations()` in `useEffect`.
  - Returns: `status`, `conversations`, `error`, `refetch()`

- `useMessages.ts`
  - Fetches messages for a given conversation.
  - Input: `conversationId: string | null`
  - Manages: `status`, `messages`, `error`
  - Fetches with `apiClient.getMessages(conversationId)` when `conversationId` changes.
  - Returns: `status`, `messages`, `error`, `refetch()`

- `useOptimisticMessages.ts`
  - Wraps `useMessages` and adds optimistic sending.
  - Uses `useReducer` with non-trivial state from `messagesReducer.ts`.
  - Responsibilities:
    - Merge base messages + optimistic pending messages.
    - Expose `sendMessage(content)`:
      - add optimistic message immediately with temporary ID
      - call `apiClient.sendMessage`
      - on success: replace optimistic entry with real message
      - on failure: remove optimistic message and set error
  - Returns: `status`, `messages`, `error`, `sendMessage`, `refetch`

### `src/features/chat/api/`

- Contract-first shared types live in the `@chat/contract` package and are
  imported directly (`User`, `Conversation`, `Message`, `GetMessagesResponse`,
  `SendMessageRequest`/`SendMessageResponse`, `LoginRequest`, `ApiError`, …).

- `apiClient.ts`
  - Fetcher module — the only module that talks to the network (or mock).
  - Exposes: `getConversations`, `getMessages`, `sendMessage`, `login`, `logout`.
  - UI and hooks never import `fetch` directly.

### `src/features/chat/state/`

- `chatStatus.ts`
  - `export type LoadStatus = "idle" | "loading" | "success" | "empty" | "error";`

- `messagesReducer.ts`
  - Pure reducer (no React imports) used by `useOptimisticMessages`.
  - State: `messages`, `pendingMessages`, `error`.
  - Actions: `LOAD_SUCCESS`, `SEND_START`, `SEND_SUCCESS`, `SEND_FAILURE`.

### `src/features/chat/__tests__/`

- Tests for reducers, selectors, mock server contract behavior, components, and hooks.
- Built with Vitest + React Testing Library.

## Week 2 Key Principles (still apply going forward)

- One file, one task. No God components.
- Container vs presentational split: containers use hooks and coordinate status
  branches; presentational components receive typed props only.
- Status-driven UI via the `LoadStatus` union with early returns.
- API decoupling: only `apiClient.ts` knows transport details.
- `useReducer` for the optimistic flow, with pure reducer logic for unit testing.
- No `any`; explicit prop and return types.

---

# Week 3 (Completed) — Express REST Backend

> Status: implemented. Week 3 shipped a clean Express + TypeScript REST API with
> in-memory storage that fulfills `API_CONTRACT.md`, and the Week 2 frontend now
> calls the real backend over HTTP.
>
> Constraint reminder: **no real auth, no database** this week. A *fake* token is
> issued at login and used only to carry identity. Real JWT auth arrives Week 4
> with identical downstream behavior.

## Repo Structure

The project is an npm-workspaces monorepo. The frontend, backend, and shared
contract each live in their own workspace.

```
chat-mvp/
  package.json             # root: workspaces, husky, prettier, orchestration scripts
  packages/
    contract/              # @chat/contract: shared domain types (single source of truth)
      src/index.ts
  apps/
    web/                   # @chat/web: Week 2 frontend (moved from repo root)
      src/...
    api/                   # @chat/api: Week 3 backend
      package.json
      tsconfig.json
      src/
        index.ts           # bootstrap: build app + listen
        app.ts             # build express app (middleware + routes); exported for tests
        config/
          env.ts           # PORT, CORS_ORIGIN, pagination defaults
        middleware/
          requestLogger.ts
          authenticate.ts
          validate.ts
          notFound.ts
          errorHandler.ts
        modules/
          auth/
            auth.router.ts
            auth.controller.ts
            auth.service.ts
          conversations/
            conversations.router.ts
            conversations.controller.ts
            conversations.service.ts
          messages/
            messages.router.ts
            messages.controller.ts
            messages.service.ts
        dbServices/
          users.dbService.ts
          conversations.dbService.ts
          messages.dbService.ts
          tokens.dbService.ts
        types/
          express.d.ts     # Express Request augmentation (userId, token, validated)
        db/
          users.store.ts
          conversations.store.ts
          messages.store.ts
          tokens.store.ts
          store.ts         # seed bootstrap (from Week 2 mockData)
        errors/
          AppError.ts
          errorCodes.ts
        validation/
          *.schema.ts      # Zod schemas per route
```

> Shared types: `packages/contract` is the single source of truth for domain and
> transport types used by both apps (`User`, `Conversation`, `Message`, login and
> message DTOs, structured `ApiError`). Both apps import `@chat/contract` directly.

## Layering and Responsibilities

Strict one-directional flow: **router -> controller -> service -> DbService -> store**.

- **Router**: maps HTTP method + path to a controller; mounts validation
  middleware. No logic.
- **Controller**: reads `req.params` / `req.query` / `req.body` and `req.userId`,
  calls a service, shapes the HTTP response (status + JSON). Delegates errors via
  `next(err)`. The only layer allowed to touch `Request`/`Response`.
- **Service**: business logic and orchestration. Framework-agnostic (no Express
  imports). Returns domain data or throws `AppError`.
- **DbService**: persistence-oriented helpers (`findById`, `create`, `update`,
  `listByConversationId`) over store functions. Services never touch raw `Map`s.
- **Store**: domain-scoped in-memory `Map` ownership and low-level helpers.

`app.ts` builds the app (for `supertest`); `index.ts` starts listening. This keeps
the app testable without binding a port.

## In-Memory Store

- Store state is split by domain:
  - `db/users.store.ts`
  - `db/conversations.store.ts`
  - `db/messages.store.ts`
  - `db/tokens.store.ts`
- `db/store.ts` is a seed bootstrap module that loads Week 2 fixture data
  (`user-1..4`, `conv-1..3`, `msg-1..9`) at app startup.
- `app.ts` imports `./db/store` once so seeds initialize before routes handle traffic.

- `Map` over arrays for O(1) `findById` and clean deletes.
- Updates are immutable replace-in-place: `map.set(id, { ...existing, ...patch })`.

## Identity Flow (fake token, no real auth)

This is the key design decision: identity is resolved **per request**, never from
a global/hardcoded constant (a constant would make two browser tabs share one
user and break multi-user chat).

1. `POST /auth/login` accepts `{ userId }`. If the user does not exist -> `401`
   (`UNAUTHORIZED`). Otherwise it generates an opaque token, stores
   `tokens.set(token, userId)`, and returns `{ token, user }`.
2. The frontend stores the token and sends it as `Authorization: Bearer <token>`
   on every subsequent request.
3. `authenticate` middleware reads the header, looks up `tokens`, and sets
   `req.userId`. Missing/unknown token -> `401`.
4. `POST /auth/logout` deletes the token from the map and returns `204`.

Week 4 swaps the `tokens` lookup for real JWT verification; everything downstream
(`req.userId`) stays identical.

## Endpoints

| Endpoint | Success | Notes |
|---|---|---|
| `POST /auth/login` | `200` | body `{ userId }` -> `{ token, user }`; unknown user -> `401` |
| `POST /auth/logout` | `204` | invalidates token; no body |
| `GET /conversations` | `200` | current user's conversations, sorted `updatedAt` desc |
| `POST /conversations` | `201` | returns the created conversation; duplicate 1:1 -> `409` |
| `GET /conversations/:id/messages` | `200` | `?cursor=&limit=`; non-member or missing -> `404` |
| `POST /conversations/:id/messages` | `201` | `{ message }`; non-member or missing -> `404` |

### `POST /conversations` rules

- Body: `{ title: string, participantIds: string[] }`.
- `title`: required; trimmed; non-empty after trim; max length 100.
- `participantIds`: required; non-empty; deduped into a set.
- Creator = `req.userId` (auto-added to participants if absent).
- Every participant must exist in the users store, else `400` (`VALIDATION_ERROR`).
- **Duplicate 1:1 guard (`409`)**: if the resulting set has exactly two distinct
  users and a conversation already exists with exactly that set (order-independent)
  -> `409` (`CONVERSATION_ALREADY_EXISTS`). Group conversations (3+) are exempt.

### Message endpoints

- Authorization: load the conversation; if it does not exist **or** `req.userId`
  is not a participant -> `404` (avoids leaking conversation existence). Same `404`
  for both cases.
- `POST` derives `senderId` from `req.userId` (never from the body).
- On send: append the message, update the conversation's `lastMessagePreview` and
  `updatedAt`.
- `content`: required; trimmed; non-empty -> else `400`.

## Pagination (keyset, opaque cursor)

- Wire shape stays the Week 2 contract: response `{ messages, nextCursor }`,
  query `?cursor=...&limit=...`. (No `items` / `hasMore` / `before`.)
- The cursor is **opaque** to the frontend (base64-encoded keyset, internally
  `createdAt|id`). The frontend only echoes back whatever `nextCursor` it received.
- Keyset, not offset: each page seeks **older** than the cursor using
  `(createdAt, id)` as a composite key (`id` is the tiebreaker for equal
  timestamps). `nextCursor === null` means the beginning is reached.
- Within a page, messages are sorted **ascending** (`createdAt` asc) for direct
  rendering, even though pagination walks older.
- `limit`: optional; default `20`, max `50` (clamped); `<= 0` or non-numeric ->
  `400`. Enforced in validation schema + env-backed limits.

Rationale: keyset is stable under concurrent inserts and maps 1:1 to a Week 4 DB
query (`WHERE (created_at, id) < (:ts, :id) ORDER BY created_at DESC, id DESC
LIMIT :n`), unlike index/offset pagination.

## Validation

- Zod schemas per route in `validation/*.schema.ts`.
- A generic `validate(schema, source)` middleware parses `body` / `params` /
  `query`; on failure it throws an `AppError` with code `VALIDATION_ERROR` (`400`)
  and Zod issues in `details`.
- Use `z.infer` so the validated DTO type cannot drift from the schema.

## Error Handling (consistent envelope)

- Envelope (per Week 3 instructions): `{ "error": { "code", "message", "details"? } }`.
- `AppError` carries `statusCode`, `code`, `message`, optional `details`.
- `errorCodes.ts` enumerates codes: `VALIDATION_ERROR`, `UNAUTHORIZED`,
  `RESOURCE_NOT_FOUND`, `CONVERSATION_ALREADY_EXISTS`, `INTERNAL`.
- Services throw `AppError`; controllers stay thin and call `next(err)`.
- `notFound` middleware handles unmatched routes; final `errorHandler` maps
  `AppError` to the envelope, logs unexpected errors, and falls back to `500`
  `INTERNAL`.

## Cross-Cutting Middleware

- `express.json()` mounted once, early.
- `requestLogger`: logs `method path status durationMs` on response `finish`.
- `cors`: configured in **one** place; origin from `config/env.ts`
  (default `http://localhost:5173`); allows `Content-Type` and `Authorization`.
- IDs: all server-generated IDs use `randomUUID()` from `node:crypto`.

## Frontend Wiring (mock removal)

`apiClient.ts` remains the single seam, so hooks/components stay decoupled from
transport details. Implemented:

- `apiClient` targets `VITE_API_BASE_URL` and uses real `fetch` with unchanged
  function signatures.
- Login sends `{ userId }`; apiClient stores token in-memory and attaches
  `Authorization: Bearer <token>` to protected requests.
- Frontend reads structured backend errors (`error.message`).
- Runtime mock server is removed; legacy Week 2 mock fixtures remain unwired as
  historical reference only.

## Week 3 Contract Changes (implemented in `API_CONTRACT.md`)

- Error shape moved to `{ error: { code, message, details? } }`.
- `POST /auth/login` request body uses `{ userId }`.
- `POST /conversations` is documented with `201` returning the created conversation and duplicate `409`.
- Message list includes `?limit=` alongside `?cursor=`.
- Contract changes are tracked in the contract changelog section.

## Week 3 TODO Checklist

- [x] Scaffold `apps/api/` (Express + TS strict, scripts, tsconfig).
- [x] In-memory stores (`db/*.store.ts`) + seed bootstrap (`db/store.ts`) from Week 2 fixtures.
- [x] DbServices: users, conversations, messages, tokens.
- [x] Middleware: `requestLogger`, `authenticate`, `validate`, `notFound`, `errorHandler`.
- [x] `errors/AppError.ts` + `errors/errorCodes.ts`.
- [x] Auth module: `login` (`{ userId }` -> token), `logout` (`204`).
- [x] Conversations module: list (sorted) + create (validation, creator, 1:1 `409`).
- [x] Messages module: list (keyset pagination) + create (membership `404`, senderId from token).
- [x] Zod schemas per route.
- [x] CORS for the FE dev origin (allow `Authorization`).
- [x] Update `API_CONTRACT.md` with the Week 3 wire changes.
- [x] Wire FE `apiClient` to real HTTP + token + structured errors; runtime mock server removed.
- [x] Verify end-to-end: BE + FE running, real chat between two tabs (two users).
- [x] `npx tsc --noEmit` passes for both FE and BE.

---

# Week 4 (Completed) — NestJS Backend + JWT Auth

> Status: shipped. Week 4 refactored the Week 3 Express backend into a NestJS
> application and replaced the *fake* token with real JWT authentication
> (signup/login, password hashing, Passport JWT strategy, Guards). The wire
> contract and the `req.userId`-style identity downstream stayed equivalent, so the
> FE kept working; it gained login/signup screens, token persistence, and logout.
>
> Persistence was still in-memory this week, sitting behind injectable repository
> (DbService) providers so the Week 5 Mongo swap stayed local to those providers.

## What supersedes Week 3

- **Auth**: the opaque-token map (`tokens.store` / `authenticate` middleware) is
  replaced by signed JWTs verified by a Passport strategy inside a Nest Guard.
- **Login shape**: `POST /auth/login` moves from `{ userId }` to
  `{ email, password }`; `POST /auth/signup` is new. Users now carry a hashed
  password.
- **Framework**: Express `app.ts` + routers/middleware become Nest modules,
  controllers, providers, guards, pipes, and an exception filter.
- **Authorization**: explicit participant check returns `403` for cross-user
  access (Week 3 used `404` to avoid leaking existence; Week 4 spec mandates `403`).

What stays the same: the layered flow, the in-memory storage model, the keyset
pagination semantics, and the `{ error: { code, message, details? } }` envelope.

## Module Diagram

```
AppModule (root)
  ConfigModule          # @nestjs/config, loads JWT_SECRET + BCRYPT_ROUNDS + env (global)
  UsersModule
    UsersController      # GET /users (guarded); participant picking for the FE
    UsersService         # create user, find by email/id, hash password (bcrypt)
    UsersDbService       # injectable persistence over db/users.store (with passwordHash)
    exports: UsersService
  AuthModule
    imports: UsersModule, JwtModule (registerAsync from ConfigService), PassportModule
    AuthController        # POST /auth/signup, POST /auth/login
    MeController          # GET /me (guarded)
    AuthService           # signup, validateUser, login -> sign JWT
    JwtStrategy           # passport-jwt: verify token, load user
    JwtAuthGuard          # AuthGuard('jwt') applied via @UseGuards
    exports: AuthService, PassportModule, JwtModule (feature modules import the
             JwtAuthGuard class directly)
  ConversationsModule
    imports: AuthModule (guard), UsersModule (participant checks)
    ConversationsController   # all routes @UseGuards(JwtAuthGuard)
    ConversationsService      # business logic + 403 authz rule
    ConversationsDbService    # injectable persistence over db/conversations.store
    exports: ConversationsService (consumed by MessagesModule for membership)
  MessagesModule              # kept separate, matching the existing modules/messages split
    imports: AuthModule (guard), ConversationsModule (membership/403 checks)
    MessagesController        # all routes @UseGuards(JwtAuthGuard)
    MessagesService           # business logic + senderId from token
    MessagesDbService         # injectable persistence over db/messages.store
  Shared (app-level)
    AllExceptionsFilter   # maps errors -> { error: { code, message, details? } }
    ValidationPipe        # global; whitelist + forbidNonWhitelisted
    @CurrentUser()        # param decorator reading req.user from the JWT strategy
```

## Proposed Structure (`apps/api`)

> The existing `modules/<domain>/` feature split is kept (it is already Nest-friendly);
> per-feature files are renamed/added in place rather than relocated. The Week 3
> cross-cutting layers (`app.ts`/`index.ts`, `middleware/`, top-level `dbServices/`
> and `validation/`, `types/express.d.ts`) are dissolved into Nest equivalents.
> Stores under `db/` are reused behind repository providers (the Week 5 Mongo seam).

```
apps/api/
  nest-cli.json                  # NEW: Nest CLI config
  tsconfig.build.json            # NEW: build tsconfig
  src/
    main.ts                      # bootstrap Nest app, global pipe + filter, CORS (replaces index.ts/app.ts)
    app.module.ts                # root module wiring
    config/
      env.validation.ts          # validate env (JWT_SECRET + BCRYPT_ROUNDS required, PORT, CORS_ORIGIN)
    common/
      filters/all-exceptions.filter.ts   # error envelope (replaces middleware/errorHandler + notFound)
      decorators/current-user.decorator.ts
      # (logging via Nest middleware/interceptor; pagination helpers reused)
    errors/                      # AppError + errorCodes kept; mapped by the filter
      AppError.ts
      errorCodes.ts
    modules/
      users/                     # NEW module
        users.module.ts
        users.controller.ts      # GET /users (guarded)
        users.service.ts         # create user, find by email/id, bcrypt hashing
        users.dbService.ts       # injectable provider (was dbServices/users.dbService.ts)
      auth/                      # extends existing modules/auth
        auth.module.ts
        auth.controller.ts       # /auth/signup, /auth/login  (auth.router.ts removed)
        me.controller.ts         # GET /me (guarded)
        auth.service.ts
        jwt.strategy.ts          # replaces middleware/authenticate.ts
        jwt-auth.guard.ts
        dto/
          signup.dto.ts          # email, password, name (class-validator)
          login.dto.ts           # email, password  (replaces validation/login.schema.ts)
      conversations/
        conversations.module.ts
        conversations.controller.ts   # conversations.router.ts removed
        conversations.service.ts
        conversations.dbService.ts     # injectable provider (was dbServices/conversations.dbService.ts)
        dto/
          create-conversation.dto.ts   # from validation/createConversation.schema.ts
      messages/
        messages.module.ts
        messages.controller.ts        # messages.router.ts removed
        messages.service.ts
        messages.dbService.ts          # injectable provider (was dbServices/messages.dbService.ts)
        dto/
          create-message.dto.ts        # from validation/createMessage.schema.ts
          list-messages.dto.ts         # from validation/listMessages.schema.ts; also
                                       # exports DEFAULT_LIMIT/MAX_LIMIT (decorator
                                       # args need compile-time constants, not env)
    db/                          # reused in-memory stores behind DbService providers
      users.store.ts             # user records now include passwordHash
      conversations.store.ts
      messages.store.ts
      store.ts                   # seed fixtures; resetStore(bcryptRounds) called from
                                 # bootstrap (main.ts) and tests, since seeding runs
                                 # outside DI where ConfigService is unavailable
      # tokens.store.ts removed  # stateless JWT replaces the Week 3 token map
  .env.example                   # JWT_SECRET=, BCRYPT_ROUNDS=, PORT=, CORS_ORIGIN=
```

Removed by Week 4 (superseded): `app.ts`, `index.ts`, `middleware/*`,
`dbServices/*` (folded into per-module injectable DbService providers),
`validation/*.schema.ts` (replaced by DTOs), `types/express.d.ts`,
`db/tokens.store.ts`, `dbServices/tokens.dbService.ts`, and `config/env.ts`
(replaced by `@nestjs/config` + `env.validation.ts`).

## Layering and Responsibilities

Strict one-directional flow: **module -> controller -> service (provider) -> DbService (provider) -> store**.

- **Controller**: declares routes and `@UseGuards(JwtAuthGuard)`, reads the
  validated DTO and `@CurrentUser()`, calls a service, returns data. Only layer
  aware of HTTP/decorators.
- **Service (provider)**: business logic and orchestration; framework-agnostic.
  Throws `HttpException`/`AppError` mapped by the filter. Hosts the `403`
  participant rule.
- **DbService (provider)**: injectable persistence helpers over the in-memory
  stores (`findById`, `findByEmail`, `create`, `update`, `listByConversationId`).
  Services never touch raw `Map`s; this boundary is the Week 5 Mongo seam.
  (Same role the spec calls a "repository"; the DbService name keeps the Week 3
  vocabulary.)
- **Guard / Strategy / Decorator**: authentication and identity extraction only.

## Authentication Flow (real JWT)

1. `POST /auth/signup` (`{ email, password, name }`): reject duplicate email with
   `409`; hash the password with bcrypt; persist the user; sign a JWT and return
   `{ token, user }` (no `passwordHash` in the response).
2. `POST /auth/login` (`{ email, password }`): look up by email; `bcrypt.compare`
   the password; invalid email or password -> `401`; on success sign a JWT and
   return `{ token, user }`.
3. JWT payload carries the user identity (e.g. `sub: userId`, `email`); signed
   with `JWT_SECRET` from `@nestjs/config`, with an expiry.
4. The FE stores the token (localStorage) and sends `Authorization: Bearer <token>`
   on every request.
5. `JwtStrategy` (`passport-jwt`) extracts the bearer token, verifies the
   signature/expiry, and `validate(payload)` loads the user; Nest attaches it to
   `req.user`. Missing/invalid/expired -> `401`.
6. `@UseGuards(JwtAuthGuard)` protects all chat routes and `/me`.
7. `@CurrentUser()` reads `req.user` in controllers; identity is never taken from
   the request body.

## Authorization Rule (participant check, `403`)

- For any conversation read or message read/post, the service loads the
  conversation and checks the current user is in `participantIds`.
- If the conversation exists but the user is not a participant -> `403`
  (`FORBIDDEN`); the data is never returned.
- This is an explicit Week 4 change from the Week 3 `404`-everything approach.

## DTO Validation (class-validator)

- One DTO per request body/query (never reuse a DTO across unrelated endpoints),
  decorated with `class-validator` rules (`@IsEmail`, `@IsString`, `@Length` /
  `@MinLength`, `@IsNotEmpty`, `@IsUUID` for ID fields, etc.).
- A global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true,
  transform: true })` rejects unknown fields — the Nest equivalent of Week 3's
  Zod `.strict()`.
- Validation failures map to `400` `VALIDATION_ERROR` through the exception filter.

## Error Handling (envelope preserved)

- An app-level exception filter maps `HttpException` (and a domain `AppError`, if
  retained) to the unchanged envelope `{ error: { code, message, details? } }`.
- Code map: `VALIDATION_ERROR` (`400`), `UNAUTHORIZED` (`401`), `FORBIDDEN`
  (`403`), `RESOURCE_NOT_FOUND` (`404`), `CONVERSATION_ALREADY_EXISTS` /
  `EMAIL_ALREADY_EXISTS` (`409`), `INTERNAL` (`500`).

## Config and Secrets

- `@nestjs/config` (global) loads and validates env; `JWT_SECRET` and
  `BCRYPT_ROUNDS` are required and never hardcoded. `PORT` and `CORS_ORIGIN`
  carry over from Week 3.
- `JwtModule.registerAsync` reads the secret/expiry from `ConfigService`;
  `UsersService` reads `BCRYPT_ROUNDS` for the bcrypt cost factor.
- `.env.example` is committed with placeholders; real `.env` is git-ignored.

## CORS

- Configured once in `main.ts`; origin from config (default
  `http://localhost:5173`); allow `Content-Type` and `Authorization`.

## Frontend Wiring (auth screens)

`apiClient.ts` stays the single transport seam. Week 4 FE changes:

- **Login screen** (`{ email, password }`) and **Signup screen**
  (`{ email, password, name }`); both call `apiClient` and store the returned
  token in `localStorage`.
- `apiClient` reads the token from storage and attaches
  `Authorization: Bearer <token>` to every request (including chat endpoints).
- **Logout** clears the token from storage and resets FE auth state.
- A `GET /me` call can rehydrate the session on load when a token is present.
- On `401`, the FE clears the token and routes back to login.

> A `LoginScreen.tsx` already exists from the Week 3 wiring; it must move from the
> `{ userId }` flow to the `{ email, password }` flow and gain a signup counterpart.

## Week 4 Contract Changes (to reflect in `API_CONTRACT.md`)

- `POST /auth/signup` added: `{ email, password, name }` -> `{ token, user }`;
  duplicate email -> `409`.
- `POST /auth/login` body changes from `{ userId }` to `{ email, password }`;
  bad creds -> `401`.
- `GET /me` added: returns the authenticated `User`.
- All chat endpoints now require `Authorization: Bearer <JWT>`; missing/invalid
  -> `401`.
- Cross-user conversation access -> `403` (was `404` in Week 3).
- `POST /auth/logout` becomes a FE-side token clear (no server session to tear
  down with stateless JWT); the endpoint is removed.
- `Conversation.title` becomes optional: direct (1:1) conversations store no
  title and the FE derives a per-viewer display name from participants.
- `GET /users` added (authenticated, public user shape) so the FE can pick
  participants for a new conversation.

## Week 4 TODO Checklist

- [x] Scaffold Nest app (`main.ts`, `app.module.ts`, scripts, strict `tsconfig`).
- [x] `@nestjs/config` with env validation; `JWT_SECRET` + `BCRYPT_ROUNDS` required; add `.env.example`.
- [x] Global `ValidationPipe` + `AllExceptionsFilter` (preserve error envelope).
- [x] `UsersModule`: injectable DbService over the in-memory store + bcrypt
      hashing; seed users with `passwordHash`.
- [x] `AuthModule`: signup/login DTOs, `AuthService`, `JwtModule`, `JwtStrategy`,
      `JwtAuthGuard`, `@CurrentUser()`, `GET /me`.
- [x] `ConversationsModule`/`MessagesModule`: guard every route; enforce the `403`
      participant rule; reuse keyset pagination.
- [x] CORS in `main.ts` (allow `Authorization`).
- [x] Update `API_CONTRACT.md` with signup/login/`me`, bearer auth, and `403`.
- [x] FE: login + signup screens, token persistence, `Authorization` header on
      every request, logout, `401` handling.
- [x] Verify end-to-end auth flow between two users/tabs.
- [x] `npx tsc --noEmit` passes; `npm run build` (Nest) passes.

---

# Week 5 (Completed) — MongoDB Persistence (Mongoose)

> Status: shipped. Week 5 replaces the in-memory `Map` stores with MongoDB via
> Mongoose. Only the DbService (DAO) layer changes — controllers, services, the
> DTO contract, JWT auth, and the `403` participant rule are untouched, so the FE
> keeps working with no changes. Data now survives process restart.

## What supersedes Week 4

- **Storage**: the `db/*.store.ts` in-memory `Map`s are gone. Each DbService now
  owns a Mongoose model injected via `@nestjs/mongoose` and is the only layer
  that touches Mongoose.
- **Atomic send**: sending a message now inserts the message **and** bumps the
  parent conversation inside a single Mongo transaction (requires a replica set).
- **Seeding**: moved out-of-band to `npm run seed -w @chat/api` (a standalone
  Nest context script). The server never seeds on boot, so restarts preserve data.

What stays the same: the layered flow (module → controller → service → DbService),
the keyset pagination semantics, the `{ error: { code, message, details? } }`
envelope, and every response shape in `API_CONTRACT.md`.

## Data Model Decision (reference vs. denormalize)

Rule: **reference high-volume/mutable data; denormalize only the small, read-hot
scalars the conversation list needs.**

- **Messages → referenced.** Own `messages` collection linked by
  `conversationId`. Threads grow unbounded, so embedding would hit the 16MB
  document cap and break cursor pagination. Reference scales; embed does not.
- **Conversations → denormalize `lastMessageAt` + `lastMessagePreview`.** The
  sidebar lists conversations newest-first with a snippet. An index on the
  `messages` collection cannot sort the *conversations* collection, so storing
  these two scalars on the conversation makes the list one indexed query. Cost:
  each send updates them on the parent (done inside the send transaction).
- **Users → referenced** (`senderId` on messages), never embedded. The FE loads
  the directory once (`GET /users`) and resolves names client-side, so embedding
  names would be duplicated, stale-prone data with no payoff.
- **Single uuid string `_id`** across all three collections (seeds use pinned
  uuids; creates/signups generate uuids).

## Collections, Schemas, and Indexes

One model per domain, registered with `MongooseModule.forFeature` in its own
module; the connection (`MongooseModule.forRootAsync`, reads `MONGO_URI` from
`ConfigService`) lives only in `AppModule`.

| Collection | Schema file | Key fields | Index | Query it backs |
| --- | --- | --- | --- | --- |
| `users` | `modules/users/user.schema.ts` | `_id` (uuid), `email` (unique, lowercased), `name`, `passwordHash` | unique `email` | login/signup lookup by email; enforces one account per email (`E11000 → 409`) |
| `conversations` | `modules/conversations/conversation.schema.ts` | `_id` (uuid), `participantIds[]`, `title?`, `lastMessagePreview`, `lastMessageAt`, `createdAt` | `{ participantIds: 1, lastMessageAt: -1 }` | `find({ participantIds: me }).sort({ lastMessageAt: -1 })` — the sidebar list |
| `messages` | `modules/messages/message.schema.ts` | `_id` (uuid), `conversationId`, `senderId`, `content`, `createdAt` (Date) | `{ conversationId: 1, createdAt: -1, _id: -1 }` | keyset cursor page of a thread, with `_id` as a stable tiebreak for equal `createdAt` |

## DbService (DAO) Seam and DTO Boundary

- **DbService (DAO)** = the `*DbService` classes + `*.schema.ts`. Only these touch
  Mongoose; domain services depend on the DbService, never on a model.
- **Mapper at the boundary** (`toPublicUser`, `toConversation`, `toMessage`)
  converts a Mongoose doc to a `@chat/contract` response: strips `_id → id`, drops
  `__v` and `passwordHash`, and maps the stored `lastMessageAt` (falling back to
  `createdAt`) to the contract's `updatedAt`. Controllers return these DTOs, never
  raw documents — so no `_id`/`__v` ever leaks.

## Keyset Cursor Pagination

- Backed by the compound `messages` index above. A page reads
  `{ conversationId, (createdAt, _id) < cursor }` ordered by `(createdAt, _id)`
  descending, then returns oldest→newest per the contract.
- The cursor is an opaque base64 token encoding the last `(createdAt, _id)`; the
  `_id` component breaks ties when multiple messages share a `createdAt`.
  `nextCursor: null` means no more pages.

## Atomic Send (transaction + replica set)

- `POST /conversations/:id/messages` opens a Mongo session/transaction, inserts
  the message, and `$set`s `lastMessageAt` + `lastMessagePreview` on the parent
  conversation, then commits — so the list snippet and a message can never drift
  apart on a partial failure.
- Multi-document transactions require a replica set. `docker-compose.yml` runs
  `mongo:7` as a self-initializing single-node `rs0`; `MONGO_URI` carries
  `?replicaSet=rs0`. A MongoDB Atlas cluster (already a replica set) also works.

## Config and Seeding

- `MONGO_URI` is required and validated at startup (`config/env.validation.ts`);
  the API will not boot without it. `.env.example` documents it with the
  `?replicaSet=rs0` suffix.
- `npm run seed -w @chat/api` builds and runs a standalone seed script (pinned
  uuids, shared dev password). Seeding never runs on boot.

## Week 5 TODO Checklist

- [x] `@nestjs/mongoose` wired; `forRootAsync` (MONGO_URI) in `AppModule`,
      `forFeature` per module.
- [x] Three collections with single uuid `_id`; required indexes
      (unique `email`; conversation activity; message keyset).
- [x] DbServices rewritten over Mongoose; in-memory `db/*.store.ts` removed.
- [x] DTO mappers strip `_id`/`__v`/`passwordHash` and map `lastMessageAt →
      updatedAt`; no raw documents in responses.
- [x] Keyset cursor pagination over the compound message index (verified on a
      150-message thread + same-`createdAt` tiebreak).
- [x] Atomic transactional send; Mongo runs as a `rs0` replica set.
- [x] `E11000 → 409`; new-conversation ordering (`lastMessageAt` set on create).
- [x] Out-of-band `npm run seed`; data survives restart.
- [x] Week-4 JWT auth + `403` participant rule preserved; contract unchanged.
- [x] `npx tsc --noEmit` and `npm run build` pass; smoke-tested end-to-end.

---

# Week 6 (Completed) — AI Assistant Mode

> Status: shipped. Adds an `ai` module alongside the existing chat. A new
> conversation `type: 'assistant'` triggers an LLM turn that streams over SSE and
> persists like any message. No existing endpoint changed shape.
>
> **Superseded in part** by the post-Week-8 Orchestrator Layering refactor (see
> that section): `AiController`/`AiService` here are historical — the streaming
> turn now runs Controller → `StreamAgentReplyOrchestrator` → `AgentService`.

## What's added

- **`ConversationType`** `'user' | 'assistant'` on the conversation schema
  (default `'user'`), with a partial unique index enforcing one assistant
  conversation per user (idempotent get-or-create).
- **`LlmProvider`** — an abstract class (DI token) with `streamReply` and
  `generateStructured`. `OpenAiProvider` is active; `AnthropicProvider` is a
  drop-in selected by `LLM_PROVIDER`. SDK specifics stay inside each provider.
- **`AiController`** — `POST /ai/conversations/:id/messages`, the one
  server-orchestrated streaming endpoint. Sets SSE headers and writes each
  `AssistantSseEvent`.
- **`AiService`** — `prepareTurn` (authz + persist the user message) and
  `streamReply` (the LLM + tool loop: stream tokens, run tool calls, persist the
  assistant message).
- **`ConversationMemoryService`** — loads recent history within a token budget,
  and selects warm/cold turn messages (`historyForTurn`) for the agent.
- **`AiToolsService` + tools** — user-scoped, Zod-validated tools the model can
  call against the caller's own data (`requesterId` from the JWT, never the model).

Module arrow is one-way `ai -> messages` / `ai -> conversations`.

# Week 7 (Completed) — AI Tutor with Knowledge Base + Citations (RAG)

> Status: shipped. Adds a per-user knowledge base and a `tutor` conversation
> type that answers grounded **only** in the user's uploaded documents, with
> citations. Reuses the Week-6 streaming path end-to-end.

## What supersedes earlier weeks

- **Storage moves to MongoDB Atlas** (local Mongo has no Vector Search). The app
  points the single `MONGO_URI` at an Atlas M0 cluster (a replica set, so the
  Week-5 transactional send still works). The **test suite stays on local docker
  Mongo** (`test.app.ts` overrides `MONGO_URI`); vector retrieval is exercised by
  the eval, not the unit suite.
- **`ConversationType`** extends to `'user' | 'assistant' | 'tutor'`; `tutor` is
  one-per-user get-or-create, reusing the assistant's partial-unique-index
  pattern (`findOwnedByType`).

## `knowledge` module

Owns the knowledge base: documents CRUD + ingestion + retrieval. `ai` imports it
for the tutor composer (one-way `ai -> knowledge`).

| Collection | Schema | Key fields | Notes |
| --- | --- | --- | --- |
| `kb_documents` | `schemas/document.schema.ts` | `_id` (uuid), `userId`, `name`, `mimeType`, `contentHash`, `status`, `chunkCount`, `createdAt` | explicit collection name; indexes on `{userId, createdAt}` and `{userId, contentHash}` (dedup) |
| `kb_chunks` | `schemas/chunk.schema.ts` | `_id` (uuid), `documentId`, `documentName`, `userId`, `text`, `embedding[1024]`, `chunkIndex` | `userId`/`documentName` denormalized; vector search served by the Atlas index, not Mongoose |

- **`DocumentDbService`** / **`ChunkDbService`** (DAOs) — one per collection, the
  only layers touching Mongoose; `ChunkDbService` also exposes the native
  `chunkCollection()` the vector store needs.
- **`KnowledgeService`** — `ingest` (extraction seam -> hash/dedup -> chunk ->
  embed -> store), `listDocuments`, `removeDocument`. Chunking is LangChain
  `RecursiveCharacterTextSplitter` (500 / 75). Dedup by content hash: an existing
  `ready` doc with the same hash is returned as-is (no duplicate chunks).
- **`VoyageEmbeddings`** — a ~20-line `Embeddings` adapter over Voyage's REST API
  (`voyage-3.5-lite`, 1024 dims, `input_type` document/query).
- **`KnowledgeRetrieverService`** — wraps `MongoDBAtlasVectorSearch` (built lazily
  once Mongo is connected). `retrieve` embeds the query and runs `$vectorSearch`
  with a **`userId` pre-filter** — the per-user isolation guarantee.
- **`KnowledgeController`** — `POST` (multipart upload), `GET` (list), `DELETE`
  (`-> { id }`).

## Atlas Vector Search index

Committed at `apps/api/atlas/vector-index.json` (`embedding`: 1024, cosine;
`userId` as a filter field). Created once via the Atlas UI (M0 doesn't support
driver index creation). `VECTOR_INDEX_NAME` defaults to `kb_chunks_vector`.

## Tutor turn (reuses the Week-6 path)

`POST /ai/conversations/:id/messages`; `AiController` branches on
`conversation.type`: `assistant` -> `AiService.streamReply`; `tutor` ->
`TutorService.streamTutorReply`. Both are async generators of the same
`AssistantSseEvent`, so the SSE write loop, auth, user-message persistence, and
history loading are shared. `TutorService`:

1. Loads history (reused `ConversationMemoryService`).
2. Builds the retrieval query by concatenating the last few user turns (so a
   follow-up's antecedent is in the query — no extra rewrite call).
3. Retrieves top-4; keeps chunks scoring >= ~0.7.
4. **Empty -> a fixed refusal**, no LLM call, no citations (no hallucination).
5. Otherwise grounds a LangChain `ChatOpenAI` (`temperature 0`) on the retrieved
   context, streams tokens, then persists the answer with `citations`.

Citations ride the `done` SSE event and persist on the `Message`; the FE renders
a clickable Sources list under each tutor answer.

## Eval

HTTP harness (`apps/api/eval/rag/`, `npm run eval:rag`): uploads committed
docs, asks fixture questions through the real tutor, and reads recall straight
from the answer's citations. Reports precision@k / recall@k / hit-rate@k and a
keyword-based answer score (temperature 0). Self-throttles to Voyage's 3 RPM.

## Frontend

A third **Tutor** mode (dark-reddish theme) reuses the assistant streaming hook
(`useAssistantChat(userId, 'tutor')`). A `KnowledgeDocuments` panel handles
upload (picker + drag-drop) / list / delete; answers show a clickable Sources
list.

# Week 8 (Completed) — Capstone: LangGraph Agent

> Status: shipped. Refactors the tutor into an explicit LangGraph agent that also
> serves assistant mode, with MongoDB checkpointing and streamed tool progress.
>
> **Superseded in part** by the post-Week-8 Orchestrator Layering refactor (see
> that section): authorize + user-message persistence moved out of `AgentService`
> into `StreamAgentReplyOrchestrator`, so `AgentService` is now the graph engine
> only (stream + history + finish); the graph nodes/edges live in `agent/nodes/`
> and `agent/edges/`, assembled by `agent.nodes.ts`.

## What supersedes earlier weeks

- **One agent replaces two stacks.** `AiService.streamReply` (Week-6 hand-rolled
  tool loop) and `TutorService` (Week-7 chain) are **deleted**; a single
  `AgentService` runs a LangGraph `StateGraph` for both `assistant` and `tutor`,
  branching on `conversationType` inside the graph.
- **`LLM_PROVIDER` fully retired** — the abstraction and both concrete providers
  are deleted. All LLM access goes through one factory + a `generateStructured`
  helper (`ai/chat-model.ts`, over `withStructuredOutput`).

## `ai/agent` subsystem

| File | Role |
| --- | --- |
| `agent.state.ts` | `Annotation`-based graph state (see below) |
| `../chat-model.ts` (ai root) | `createChatModel` provider registry + `generateStructured` (`withStructuredOutput`) |
| `tools/{retrieve-knowledge,get-my-name,summarize-my-recent-messages}.tool.ts` | LangChain `tool()` wrappers; `requesterId` bound from run config, never model input |
| `tools/tool-context.ts` | `requesterIdFromConfig` — the JWT-scope helper |
| `tools/agent-tools.service.ts` | assembles + exposes the bound tool list |
| `agent.graph.ts` | builds + compiles the `StateGraph` |
| `checkpointer.provider.ts` | `MongoDBSaver` from the shared Mongoose connection |
| `stream-to-sse.ts` | pure translator: LangGraph `streamEvents` → `AssistantSseEvent` |
| `agent.service.ts` | orchestrates a turn: seed messages → stream → persist |
| `citations.ts` (in `ai/`) | shared `SOURCES:` parser + citation mapper |

## Graph

Nodes `route / retrieve / tool_call / tool_result`; conditional edge
`decideNext` off `route`:

```
START -> route
route  --(retrieval call)--> retrieve   --> route
       --(user-data call)--> tool_call  --> tool_result --> route
       --(no call)--------> END
```

- `route` — the single generation node. It both decides (tools bound, may emit tool
  calls) and, when no tool is needed, produces the final answer that is streamed to
  the client — so a plain reply costs one model call, not two. It strips `SOURCES:`
  and derives citations on that final answer. `decideNext` reads the last message's
  tool calls: retrieval → `retrieve`; other → `tool_call`; none → `END`.
- `retrieve` — runs the RAG tool, fills `state.retrieved` from its
  `content_and_artifact` result, sets `retrievalAttempted`, appends a `ToolMessage`,
  loops back.
- `tool_call` → `tool_result` — executes user-data tools, folds results into the
  transcript, loops back (tools chain across turns).
- Tutor refusal — when `retrievalAttempted && retrieved.length === 0`, `route`
  returns the canned refusal with **no LLM call**. Gating on `retrievalAttempted`
  distinguishes "retrieval ran and found nothing" from "retrieval was never needed"
  (e.g. "thanks"), so ordinary chatter is not refused.

State (`agent.state.ts`): `messages` (`messagesStateReducer`), `conversationType`,
`requesterId`, `conversationId`, `retrieved`, `retrievalAttempted`, `citations`,
`pendingToolMessages`.

## Checkpointing

`MongoDBSaver` keyed `thread_id = conversationId`, reusing the pooled Mongoose
connection (`connection.getClient()`; the mongodb 6/7 type skew is bridged with a
cast, as the Week-7 vector store does). The checkpointer is the agent's working
memory; Mongo `messages` stays the UI source of truth. Warm threads feed only the
new user message; cold threads seed history from Mongo once → conversations resume
after a restart.

## Streaming + frontend

`AssistantSseEvent` gains `tool_call` / `tool_result`. The FE hook dispatches a
tool label into reducer state; both AI panels show the BE-supplied progress line
("Searching your documents…"). Tokens and tutor citations render as before; all
three conversation types coexist via the existing mode switcher (no panel merge).

---

# Backend Refactor (post-Week 8) — Orchestrator Layering

> Status: shipped on `refactor/backend/orchestrator-layer`. A structural refactor
> with **no wire-contract change**: every endpoint now flows
> `Controller -> Orchestrator -> Service -> Repository`. The enforceable rulebook
> lives in `CLAUDE.md` ("Endpoint layering (orchestrator pattern)"); this section
> records the architecture and what it supersedes.

## Layering

- **Controller** — routes and delegates only: read the DTO + `@CurrentUser()`,
  call `orchestrator.execute(...)`, return the DTO. No logic.
- **Orchestrator** — one per endpoint (`<verb>-<noun>.orchestrator.ts`). Owns
  authorize → validate → compose services/repositories (and transactions) → map.
  The only layer that crosses domain boundaries; **services never call each other**.
- **Service** — single-domain business logic, framework-agnostic.
- **Repository (`*DbService`)** — Mongoose persistence only.
- **Pipe** — edge validation/extraction of transport input (e.g. a multipart
  upload → a framework-agnostic type) so nothing downstream imports Express/multer.

Thin layers are kept for uniformity (e.g. `ListUsersOrchestrator` just forwards to
the service); the only sanctioned skip is `GET /me` (returns the guard-resolved user).

## Endpoints and their orchestrators

| Module | Endpoint(s) | Orchestrator(s) |
| --- | --- | --- |
| auth | `POST /auth/signup`, `/auth/login` | Signup / Login |
| users | `GET /users` | ListUsers |
| auth (me) | `PATCH /me` | UpdateProfile |
| users (avatar) | `POST` / `DELETE /me/avatar` | UploadAvatar / RemoveAvatar (+ `AvatarFilePipe`) |
| conversations | `GET` / `POST /conversations` | ListConversations / CreateConversation |
| messages | `GET` / `POST /conversations/:id/messages` | GetMessages / CreateMessage |
| knowledge | `POST` / `GET` / `DELETE /knowledge/documents` | Ingest / List / RemoveDocument (+ `DocumentFilePipe`) |
| ai | `POST /ai/conversations/:id/messages` | StreamAgentReply |

## What this supersedes

- **`ai` turn.** `StreamAgentReplyOrchestrator` owns prepareTurn (authorize +
  persist the user message) and hands the controller the SSE stream; `AgentService`
  is the graph engine only; `AiController` writes `@Res()` frames and nothing else.
- **`messages`.** `createMessage`/`listMessages` became a guard-free `sendMessage`
  + a pure `getPage`; authorization and the plain-endpoint guard moved into the
  orchestrators. This fixed a latent bug where that guard, living in the shared
  `createMessage`, rejected assistant sends from the agent path.
- **Storage seam** renamed by role: `ObjectStorage`/`OBJECT_STORAGE` →
  `StorageProvider`/`STORAGE_PROVIDER` (`S3Storage` is the concrete impl).
- **Avatar model** stores a resolved `avatar { srcUrl, storageKey }`; the DB→DTO
  mapper is pure (no config, no throw). The upload/remove flows are owned by their
  orchestrators (composing `StorageProvider` + `UsersService`); `AvatarService` was
  dissolved. Read URLs come from `StorageProvider.publicUrl(key)`, so URL knowledge
  stays in the provider. Both endpoints return
  `AvatarResponse { avatarUrl: string | null }` (URL after upload, `null` after
  remove). The upload pipe validates size (→ `400`) and type by magic bytes; the
  multer `fileSize` limit and the filter's `PayloadTooLargeException` case were
  removed (the `knowledge` upload follows the same pipe pattern).

## One-job-per-file extractions

`user.mapper.ts` (incl. `buildUserUpdate`), `messages.mappers.ts`,
`messages.cursor.ts`, `knowledge.chunking.ts`, `image.signature.ts`,
`agent/nodes/*.node.ts` + `agent/edges/decide-next.ts` (graph nodes/edges, assembled
by `agent.nodes.ts`), `document.dbService.ts` / `chunk.dbService.ts`
(knowledge DAO split by collection), and the split RAG eval (`rag-eval.client.ts` /
`rag-eval.scoring.ts`) keep services, DAOs, and the graph assembly under the
~150-line soft cap.

---

## Documentation Alignment

- Keep this file aligned with implementation as structure evolves.
- Keep `API_CONTRACT.md` aligned with `@chat/contract` usage across `apps/web` and `apps/api`.
- If architecture decisions change, update this file in the same PR, in the
  relevant week's section.
