# Chat MVP — Architecture (Multi-Week)

## Related Planning Docs

- Execution rules and acceptance criteria: [`CLAUDE.md`](./CLAUDE.md)
- Endpoint contracts and payload shapes: [`API_CONTRACT.md`](./API_CONTRACT.md)

## Purpose

This document is the source of truth for high-level architecture, module
boundaries, and data-flow decisions across the whole project.

It is organized by phase:

- **Week 2 (Completed)** — Frontend Chat MVP against a mocked API.
- **Week 3 (Completed)** — Express + TypeScript REST backend replacing the
  mock, with frontend wired to real API.
- **Week 4 (Current)** — NestJS refactor of the backend with real JWT auth
  (signup/login, Passport JWT, Guards, bcrypt) plus FE auth screens.

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

- `chatApi.types.ts`
  - Contract-first shared types for frontend and backend:
    - `User`, `Conversation`, `Message`
    - `GetMessagesResponse`
    - `SendMessageRequest`, `SendMessageResponse`
    - `LoginRequest`, `LoginResponse`, `ApiError`

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

### `src/features/chat/mocks/`

- `mockData.ts` — in-memory seed arrays matching `chatApi.types.ts`.
- `mockServer.ts` — async functions simulating the backend contract (latency,
  random failures for error-state testing).

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
> message DTOs, structured `ApiError`). `apps/web/src/features/chat/api/chatApi.types.ts`
> re-exports from `@chat/contract`; backend imports `@chat/contract` directly.

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
| `POST /conversations` | `201` | `+ Location: /conversations/:id`; duplicate 1:1 -> `409` |
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
- `POST /conversations` is documented with `201` + `Location` and duplicate `409`.
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

# Week 4 (Current) — NestJS Backend + JWT Auth

> Status: in progress. Week 4 refactors the Week 3 Express backend into a NestJS
> application and replaces the *fake* token with real JWT authentication
> (signup/login, password hashing, Passport JWT strategy, Guards). The wire
> contract and the `req.userId`-style identity downstream stay equivalent, so the
> FE keeps working; it gains login/signup screens, token persistence, and logout.
>
> Constraint reminder: **still in-memory** this week (Mongo arrives Week 5).
> Persistence sits behind injectable repository providers so the swap stays local.

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

## Documentation Alignment

- Keep this file aligned with implementation as structure evolves.
- Keep `API_CONTRACT.md` aligned with `chatApi.types.ts` and `@chat/contract` usage in `apps/api`.
- If architecture decisions change, update this file in the same PR, in the
  relevant week's section.
