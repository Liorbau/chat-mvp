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

## Documentation Alignment

- Keep this file aligned with implementation as structure evolves.
- Keep `API_CONTRACT.md` aligned with `chatApi.types.ts` and `@chat/contract` usage in `apps/api`.
- If architecture decisions change, update this file in the same PR, in the
  relevant week's section.
