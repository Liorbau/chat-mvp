# Chat MVP — Architecture

## Related Planning Docs

- Engineering principles and conventions: [`CLAUDE.md`](../CLAUDE.md)
- Endpoint contracts and payload shapes: [`API_CONTRACT.md`](./API_CONTRACT.md)
- Frontend directory/file structure rules: [`FRONTEND_CONVENTIONS.md`](./FRONTEND_CONVENTIONS.md)

## Purpose

This document is the source of truth for the **current** high-level architecture:
module boundaries, data-flow, and the design decisions behind them. It describes
the system as it exists now, organized by concern — not by delivery timeline. When
a decision changes, update the relevant section in the same PR rather than
appending history.

---

## System Overview

- **Monorepo** (npm workspaces): a React frontend (`@chat/web`), a NestJS backend
  (`@chat/api`), and a shared contract package (`@chat/contract`).
- **Contract-first.** `@chat/contract` is the single source of truth for domain and
  transport types (`User`, `Conversation`, `Message`, DTOs, `ApiError`, SSE events,
  subscription types); both apps import it directly, so the wire contract can't drift.
- **Backend:** NestJS over MongoDB (Mongoose), JWT auth, a global validation pipe and
  exception filter, and an in-process LangGraph agent for AI conversations.
- **Frontend:** a single-page React app (no router — a state-driven screen switch),
  organized into feature slices (see `FRONTEND_CONVENTIONS.md`).
- **AI:** three conversation types (`user`, `assistant`, `tutor`) served by one
  LangGraph agent with MongoDB checkpointing, RAG retrieval, user-scoped tools, and
  SSE token/tool-progress streaming.

## Repository Layout

```
chat-mvp/
  package.json             # root: workspaces, husky, prettier, verify:precommit
  packages/
    contract/              # @chat/contract: shared domain + transport types
  apps/
    web/                   # @chat/web: React + Vite + TS frontend
    api/                   # @chat/api: NestJS backend
      atlas/vector-index.json   # committed Atlas Vector Search index config
      eval/                # RAG eval harness
      src/
        main.ts            # bootstrap: global pipe + filter, CORS, rawBody
        app.module.ts      # root wiring (ConfigModule + Mongoose forRootAsync)
        config/            # env.validation.ts + env.decorators.ts
        common/            # filters, decorators, mongo helpers, error→status map
        errors/            # AppError + ErrorCode
        modules/           # users, auth, conversations, messages, ai, knowledge,
                           #   billing, email, storage
        scripts/seed.ts    # out-of-band seeding (never on boot)
```

---

## Backend — Layering (orchestrator pattern)

Every endpoint flows **`Controller → Orchestrator → Service → Repository`**. The
enforceable rulebook is in `CLAUDE.md`; the roles:

- **Controller** — routes and delegates only: read the validated DTO +
  `@CurrentUser()`, call `orchestrator.execute(...)`, return the DTO. The only layer
  aware of HTTP/decorators. No business logic.
- **Orchestrator** — one per endpoint (`<verb>-<noun>.orchestrator.ts`). Owns the
  endpoint flow: authorize → validate → compose services/repositories (and
  transactions) → map to the response DTO. **The only layer that crosses domain
  boundaries** — services never call each other across domains.
- **Service** — single-domain business logic; framework- and DB-agnostic. Throws
  `AppError`.
- **Repository (`*DbService`, DAO)** — Mongoose persistence only; the sole layer that
  touches models. Services/orchestrators never import Mongoose.
- **Pipe / Guard / Strategy / Decorator** — transport-edge concerns: input
  validation/extraction (e.g. a multipart upload → a framework-agnostic type via a
  `*.pipe.ts`), authentication, and identity extraction.

Thin layers are kept for uniformity (e.g. `ListUsersOrchestrator` just forwards to
its service); the only sanctioned skip is `GET /me` (returns the guard-resolved
user). Files stay under a ~150-line soft cap by extracting pure helpers to siblings
(`*.mapper.ts`, `*.cursor.ts`, chunking/signature helpers, graph nodes/edges).

### Endpoints and their orchestrators

| Module | Endpoint(s) | Orchestrator(s) |
| --- | --- | --- |
| auth | `POST /auth/signup`, `/auth/login` | Signup / Login |
| auth | `POST /auth/password/forgot`, `/auth/password/reset` | RequestPasswordReset / ConfirmPasswordReset |
| auth (me) | `PATCH /me`, `POST /me/email`, `POST /auth/email/confirm` | UpdateProfile / RequestEmailChange / ConfirmEmailChange |
| users | `GET /users` | ListUsers |
| users (avatar) | `POST` / `DELETE /me/avatar` | UploadAvatar / RemoveAvatar (+ `AvatarFilePipe`) |
| conversations | `GET` / `POST /conversations` | ListConversations / CreateConversation |
| messages | `GET` / `POST /conversations/:id/messages` | GetMessages / CreateMessage |
| knowledge | `POST` / `GET` / `DELETE /knowledge/documents` | Ingest / List / RemoveDocument (+ `DocumentFilePipe`) |
| ai | `POST /ai/conversations/:id/messages` | StreamAgentReply |
| billing | `GET /users/plans`, `POST /users/plans/payment-session` | ListPlans / CreatePaymentSession |
| billing | `POST /webhooks/payments` | ProcessPaymentWebhook |

## Backend — Modules

- **`users`** — user records + profile; `UsersService`, `UsersDbService`, the shared
  `PasswordHasher` (bcrypt), avatar upload/remove orchestrators. Exports
  `UsersService` + `PasswordHasher`.
- **`auth`** — JWT signup/login, `GET /me`, password reset, change-email. JWT
  machinery under `auth/jwt/` (`jwt.strategy.ts`, `jwt.auth.guard.ts`,
  `jwt.options.ts`); `PasswordResetService`, `EmailChangeTokenService`, and the
  orchestrators at the module root.
- **`conversations`** / **`messages`** — chat threads and messages; the `403`
  participant rule lives in the orchestrators. `messages` exposes a guard-free
  `sendMessage` + a pure `getPage` (so the agent path can persist assistant
  messages without tripping a human-only guard).
- **`ai`** — the LangGraph agent serving `assistant` + `tutor` turns over SSE.
- **`knowledge`** — per-user knowledge base: document CRUD, ingestion, and vector
  retrieval. `ai` imports it (one-way `ai → knowledge`).
- **`billing`** — plans, payment sessions, and the webhook ingress + queue/worker.
- **`email`** — swappable email delivery seam. **`storage`** — swappable object
  storage seam (avatars).

---

## Authentication & Authorization

- **JWT, stateless.** `POST /auth/signup` (`{ email, password, firstName, lastName }`)
  and `POST /auth/login` (`{ email, password }`) return `{ token, user }`. Passwords
  are bcrypt-hashed (`PasswordHasher`, `BCRYPT_ROUNDS`) and never returned or logged.
- **Verification.** `JwtStrategy` (`passport-jwt`) verifies the bearer token and
  loads the user; `@UseGuards(JwtAuthGuard)` protects every route except signup,
  login, password-reset, and email-confirm. `@CurrentUser()` reads the verified
  principal — identity is never taken from the request body.
- **Session invalidation (`tokenVersion`).** `User.tokenVersion` is embedded in the
  JWT and re-checked by `JwtStrategy` on every request; a mismatch → `401`. A
  password reset `$inc`s it in the same atomic write that swaps the hash, kicking
  every existing session at once.
- **Participant rule (`403`).** Reading or posting in a conversation you don't belong
  to → `403` (`FORBIDDEN`); data is never returned and it never falls back to `404`.
  Enforced in the orchestrators.

## Error Handling

- **One envelope:** `{ error: { code, message, details? } }`.
- **`AppError`** is keyed by `ErrorCode` only — the domain layer never names an HTTP
  status, so services/orchestrators stay unaware they run over HTTP. Static factories:
  `AppError.notFound / .unauthorized / .forbidden / .badRequest / .conflict(code, …)`.
- **`common/errors/code.to.http.status.ts`** owns the single `code → HTTP status`
  map; `AllExceptionsFilter` derives the status (`error.status ?? httpStatusForCode`),
  maps a Mongo `E11000` duplicate-key to `409`, and formats the envelope. Map:
  `VALIDATION_ERROR` 400, `UNAUTHORIZED` 401, `FORBIDDEN` 403, `RESOURCE_NOT_FOUND`
  404, `*_ALREADY_EXISTS` 409, `INTERNAL` 500.

## Configuration & Secrets

- **`@nestjs/config`** (global) loads and validates env via `config/env.validation.ts`,
  which uses the reusable composed decorators in `config/env.decorators.ts`
  (`RequiredString`, `OptionalString`, `HttpUrl`, `RequiredWhen`). The API will not
  boot on invalid config.
- Secrets are **env-only** (`JWT_SECRET`, `EMAIL_CHANGE_TOKEN_SECRET`, `MONGO_URI`,
  provider keys); `.env.example` is
  committed, real `.env` is git-ignored. Conditional requirements use `RequiredWhen`
  (e.g. `RAPYD_*` only when `PAYMENT_PROVIDER=rapyd`; `REDIS_URL` when
  `RESET_CODE_DRIVER=redis` or `QUEUE_DRIVER=bullmq`).

---

## Data Model & Persistence (MongoDB)

One Mongoose model per domain, registered with `MongooseModule.forFeature` in its
module; the connection (`forRootAsync`, `MONGO_URI` from `ConfigService`) lives only
in `AppModule`. **Single uuid string `_id`** across app collections (the `plans`
config table is the one principled exception — see below).

| Collection | Key fields | Index | Backs |
| --- | --- | --- | --- |
| `users` | `_id` (uuid), `email` (unique, lowercased), `passwordHash`, `avatar?`, `previousEmails[]`, `tokenVersion`, `subscription` | unique `email` | login/signup; one account per email (`E11000 → 409`) |
| `conversations` | `_id` (uuid), `type`, `participantIds[]`, `title?`, `lastMessagePreview`, `lastMessageAt`, `createdAt` | `{ participantIds: 1, lastMessageAt: -1 }`; partial-unique on `{ ownerId, type }` for assistant/tutor | sidebar list; one assistant/tutor per user |
| `messages` | `_id` (uuid), `conversationId`, `senderId`, `content`, `citations?`, `createdAt` (Date) | `{ conversationId: 1, createdAt: -1, _id: -1 }` | keyset cursor page, `_id` tiebreak |
| `kb_documents` | `_id` (uuid), `userId`, `name`, `mimeType`, `contentHash`, `status`, `chunkCount`, `createdAt` | `{userId, createdAt}`, `{userId, contentHash}` (dedup) | document list; re-upload dedup |
| `kb_chunks` | `_id` (uuid), `documentId`, `documentName`, `userId`, `text`, `embedding[1024]`, `chunkIndex` | Atlas Vector Search index (`embedding` 1024, cosine; `userId` filter) | per-user vector retrieval |
| `plans` | `_id` = `PlanKey` (`free`/`pro`), `name`, `priceAmount` (minor units), `currency` | — | plan catalog + checkout amount |
| `webhook_events` | `_id` = provider event id, `type`, `userId`, `processedAt` | — | payment webhook idempotency |

### Reference vs. denormalize

Rule: **reference high-volume/mutable data; denormalize only the small, read-hot
scalars a list needs.** Messages are referenced (unbounded threads would hit the
16MB cap and break pagination). Conversations denormalize `lastMessageAt` +
`lastMessagePreview` so the sidebar is one indexed query (updated inside the send
transaction). Users are referenced (`senderId`); the FE resolves names from the
`GET /users` directory. Small 1:1 read-hot state is embedded (`avatar`,
`subscription`).

### DAO seam & DTO boundary

Only `*DbService` classes + `*.schema.ts` touch Mongoose. Pure mapper helpers
(`toPublicUser`, `toConversation`, `toMessage`, `toPlan`) convert docs to
`@chat/contract` responses — strip `_id → id`, drop `__v`/`passwordHash`, map stored
`lastMessageAt → updatedAt`. Controllers return DTOs, never raw documents.

### Keyset cursor pagination

Backed by the compound `messages` index: a page reads
`{ conversationId, (createdAt, _id) < cursor }` ordered descending, returned
oldest→newest per contract. The cursor is an opaque base64 token encoding the last
`(createdAt, _id)`; `_id` breaks ties for equal timestamps; `nextCursor: null` means
no more pages.

### Atomic send

`POST /conversations/:id/messages` opens a Mongo transaction, inserts the message,
and `$set`s `lastMessageAt` + `lastMessagePreview` on the parent, then commits — the
list snippet and the message can't drift on partial failure. Transactions require a
replica set: `docker-compose.yml` runs `mongo:7` as a self-initializing single-node
`rs0` (`MONGO_URI` carries `?replicaSet=rs0`); a MongoDB Atlas cluster also works
(and is required for Vector Search — see RAG).

---

## AI Agent (assistant + tutor)

One `AgentService` runs a LangGraph `StateGraph` for **both** `assistant` and `tutor`
turns, branching on `conversationType` inside the graph. All LLM access goes through
one factory (`ai/chat-model.ts`: `createChatModel` provider registry +
`generateStructured` over `withStructuredOutput`).

### Conversation types

`POST /conversations` accepts `type: 'user' | 'assistant' | 'tutor'` (default
`'user'`). `assistant`/`tutor` are single-participant and **get-or-create, one per
user** (partial-unique index); `participantIds` is ignored for them.

### The `ai/agent` subsystem

| File | Role |
| --- | --- |
| `agent.state.ts` | `Annotation`-based graph state |
| `agent.graph.ts` / `agent.nodes.ts` | builds + compiles the `StateGraph`; assembles `agent/nodes/*` + `agent/edges/*` |
| `../chat-model.ts` | `createChatModel` registry + `generateStructured` |
| `tools/*.tool.ts` | LangChain `tool()` wrappers (retrieve-knowledge, get-my-name, summarize-my-recent-messages) |
| `tools/tool-context.ts` | `requesterIdFromConfig` — binds JWT scope from run config |
| `tools/agent-tools.service.ts` | assembles the bound tool list |
| `checkpointer.provider.ts` | `MongoDBSaver` from the shared Mongoose connection |
| `stream-to-sse.ts` | pure translator: LangGraph `streamEvents` → `AssistantSseEvent` |
| `agent.service.ts` | graph engine: seed messages → stream → persist |
| `citations.ts` | shared `SOURCES:` parser + citation mapper |

The `StreamAgentReplyOrchestrator` owns prepareTurn (authorize + persist the user
message) and hands the controller the SSE stream; `AgentService` is the graph engine
only; `AiController` writes `@Res()` frames and nothing else.

### Graph (nodes, edges, state)

Nodes `route / retrieve / tool_call / tool_result`; conditional edge `decideNext`
off `route`:

```
START -> route
route  --(retrieval call)--> retrieve   --> route
       --(user-data call)--> tool_call  --> tool_result --> route
       --(no call)--------> END
```

- **`route`** — the single generation node. It both decides (tools bound, may emit
  tool calls) and, when no tool is needed, produces the final streamed answer — so a
  plain reply costs one model call, not two. It strips `SOURCES:` and derives
  citations on the final answer. `decideNext` reads the last message's tool calls:
  retrieval → `retrieve`; other → `tool_call`; none → `END`.
- **`retrieve`** — runs the RAG tool, fills `state.retrieved`, sets
  `retrievalAttempted`, appends a `ToolMessage`, loops back.
- **`tool_call` → `tool_result`** — executes user-data tools, folds results into the
  transcript, loops back (tools chain across turns).
- **Tutor refusal** — when `retrievalAttempted && retrieved.length === 0`, `route`
  returns a canned refusal with **no LLM call** (no hallucination). Gating on
  `retrievalAttempted` distinguishes "retrieval ran and found nothing" from
  "retrieval was never needed" (e.g. "thanks"), so chatter isn't refused.

State: `messages` (`messagesStateReducer`), `conversationType`, `requesterId`,
`conversationId`, `retrieved`, `retrievalAttempted`, `citations`,
`pendingToolMessages`.

### Tools

User-scoped and Zod-validated. `requesterId` is bound from the run config (derived
from the verified JWT), **never** from model input — so a tool can only ever touch
the caller's own data.

### Checkpointing

`MongoDBSaver` keyed `thread_id = conversationId`, reusing the pooled Mongoose
connection (`connection.getClient()`). The checkpointer is the agent's working
memory; Mongo `messages` stays the UI source of truth. Warm threads feed only the new
user message; cold threads seed history from Mongo once → conversations resume after a
restart.

### Streaming (SSE)

`POST /ai/conversations/:id/messages` streams `text/event-stream`. Each frame is an
`AssistantSseEvent`:

```ts
type AssistantSseEvent =
  | { type: 'user_message'; message: Message }
  | { type: 'token'; value: string }
  | { type: 'tool_call'; tool: string; label: string }
  | { type: 'tool_result'; tool: string }
  | { type: 'done'; messageId: string; citations?: Citation[] }
  | { type: 'error'; code: string; message: string }
```

`tool_call`/`tool_result` announce agent progress (the FE renders `label`, e.g.
"Searching your documents…"). Tutor answers carry `citations` on `done` and on the
persisted `Message`.

---

## Knowledge Base & RAG (tutor grounding)

The `knowledge` module owns the per-user KB. **Storage is MongoDB Atlas** (local
Mongo has no Vector Search); the single `MONGO_URI` points at an Atlas cluster (still
a replica set, so transactional send works). The **test suite stays on local docker
Mongo**; vector retrieval is exercised by the eval, not the unit suite.

- **`DocumentDbService` / `ChunkDbService`** (DAOs) — one per collection; the only
  layers touching Mongoose. `ChunkDbService` exposes the native `chunkCollection()`
  the vector store needs.
- **`KnowledgeService`** — `ingest` (extraction seam → content-hash dedup → chunk →
  embed → store), `listDocuments`, `removeDocument`. Chunking is LangChain
  `RecursiveCharacterTextSplitter` (500 / 75). Re-uploading identical content returns
  the existing `ready` doc (no duplicate chunks).
- **`VoyageEmbeddings`** — a small `Embeddings` adapter over Voyage's REST API
  (`voyage-3.5-lite`, 1024 dims, document/query `input_type`).
- **`KnowledgeRetrieverService`** — wraps `MongoDBAtlasVectorSearch`; `retrieve`
  embeds the query and runs `$vectorSearch` with a **`userId` pre-filter** — the
  per-user isolation guarantee (enforced in the query itself).
- **Atlas index** — committed at `apps/api/atlas/vector-index.json` (`embedding` 1024,
  cosine; `userId` filter), created once via the Atlas UI; `VECTOR_INDEX_NAME`
  defaults to `kb_chunks_vector`.
- **Eval** — HTTP harness (`apps/api/eval/rag/`, `npm run eval:rag`): uploads
  committed docs, asks fixture questions through the real tutor, reads recall from the
  answer's citations, reports precision/recall/hit-rate@k. Self-throttles to Voyage's
  rate limit.

---

## Change Email

A confirmed two-step flow (email never changes via `PATCH /me`):

1. `POST /me/email` (guarded) — `RequestEmailChangeOrchestrator` rejects an unchanged
   or taken address, signs a short-lived JWT `{ userId, newEmail }` with a **separate**
   `EMAIL_CHANGE_TOKEN_SECRET` (so a confirm token can't be replayed as a session),
   and emails the link.
2. `POST /auth/email/confirm` (public — the token is the credential) —
   `ConfirmEmailChangeOrchestrator` verifies and calls `UsersService.changeEmail`,
   which atomically sets the email and pushes the old one onto `previousEmails` in one
   aggregation-pipeline update (`$concatArrays` + `$slice: -10`, FIFO max 10). The
   unique `email` index is the final authority (`E11000 → 409`).

- **`email` module** — the swappable delivery seam: `EmailProvider` interface +
  `EMAIL_PROVIDER` DI token, with `LogEmailProvider` (default) and `SesEmailProvider`
  (AWS SES v2), bound by env via a factory registry. `EmailChangeTokenService` signs
  with the separate secret via the shared `JwtService` (no second `JwtModule`).
- **Data model:** `User.previousEmails: string[]` (read-only, FIFO max 10);
  `UpdateProfileRequest` / `PATCH /me` no longer accept `email`.

---

## Password Reset

Unauthenticated, emailed-OTP reset. Both endpoints are public;
`RESET_CODE_LENGTH` (shared in `@chat/contract`) is the code length.

1. `POST /auth/password/forgot` — `RequestPasswordResetOrchestrator` **always**
   returns a generic status (no enumeration). If the user exists,
   `PasswordResetService` makes a code, stores its bcrypt hash in the
   `ResetCodeProvider` (10-min TTL, one active per user), and emails the plaintext.
2. `POST /auth/password/reset` — `ConfirmPasswordResetOrchestrator` peeks the stored
   hash, bcrypt-compares, then **consumes** it (single-use) before setting the
   password; `UsersService.resetPassword` writes the new hash and bumps `tokenVersion`
   atomically. Every failure throws the **same opaque** `401`.

- **`reset-code` module (under `auth`)** — ephemeral code store behind a role-named
  seam: `ResetCodeProvider` interface + `RESET_CODE_PROVIDER` token (`store` / `find`
  / `consume`). A factory keyed by `RESET_CODE_DRIVER` picks `RedisResetCodeProvider`
  (ioredis; native `SET … EX` TTL, atomic `GETDEL` single-use) or
  `MemoryResetCodeProvider` (dev). No Mongo collection — codes are throwaway.
- **`PasswordResetService`** (auth) and the shared **`PasswordHasher`** (users) are
  injectables — no free functions imported into Nest classes.

---

## Pro Subscriptions & Billing

A user upgrades `free → pro` through a payment provider's hosted checkout + async
webhook. Plan prices live in MongoDB (never hardcoded), so changing a price is a DB
edit. The grant is applied **only** by a signature-verified webhook, never by the
redirect.

**Flow:** Account page → `POST /users/plans/payment-session` → hosted session → user
pays → provider redirects to `/account?upgrade=success|cancelled` **and**
(asynchronously) calls the webhook → the webhook enqueues a job → a worker verifies
the amount and grants `pro`.

### Grant safety (why the redirect never grants)

The `?upgrade=success` redirect is attacker-controllable and arrives before money is
confirmed, so it only triggers a UI refresh. The only path that writes `pro` is the
signature-verified webhook, and only after `event.amount === plan.priceAmount` (and
currency) is checked against MongoDB. A mismatched amount is recorded as processed
(so it won't retry-storm) and rejected without a grant.

### Ingress vs. consumer (queue + DLQ + idempotency)

- **Ingress** (`ProcessPaymentWebhookOrchestrator`) is thin: verify the HMAC
  signature over the **raw** body → enqueue → ack `{ received: true }` fast.
- **Consumer** (`PaymentWebhookWorker` → `ApplyPaymentEventOrchestrator`) owns the
  work with resilience: BullMQ `attempts: 5` + exponential backoff, and a dedicated
  `payment-webhooks-dlq` for exhausted jobs (a parking lot for inspection/replay).
- **Idempotency** — a `webhook_events` collection keyed by the natural
  `_id = event.id`. The worker applies the entitlement first, then marks the
  event; `has()` short-circuits duplicates. A crash before the mark retries the
  grant (idempotent for Pro). Active Pro is never overwritten by a later
  `payment_failed`.

### Modules and seams

- **`billing` module** — plans (schema/DAO/service), the two authed orchestrators,
  the webhook ingress, and the queue/worker. Imports `UsersModule` to apply the grant
  through `UsersService.setSubscription` (an atomic single-doc write); cross-domain
  writes live in an orchestrator, never a service-to-service call.
- **`PaymentProvider` seam** — `interface` + `PAYMENT_PROVIDER` token
  (`createCheckout` / `verifyWebhook`), factory keyed by `PAYMENT_PROVIDER`:
  `LocalPaymentProvider` (dev/test; deterministic redirect, unsigned JSON events) or
  `RapydPaymentProvider` (HMAC-signed requests + `timingSafeEqual` webhook
  verification). Pure payload parsing is extracted to `payment/lib/`.
  When `PAYMENT_PROVIDER=rapyd`, also require `RAPYD_CHECKOUT_COUNTRY` (ISO
  alpha-2 on the checkout body) and `RAPYD_WEBHOOK_URL` (the exact public URL
  registered in the Rapyd dashboard — Rapyd signs webhooks over that full URL,
  not the request path).
- **`PaymentWebhookQueue` seam** — `interface` + `PAYMENT_WEBHOOK_QUEUE` token,
  factory keyed by `QUEUE_DRIVER`: `BullmqPaymentWebhookQueue` (Redis) or
  `MemoryPaymentWebhookQueue` (tests; a no-op producer so the suite is Redis-free —
  the consumer is unit-tested by calling the orchestrator directly).
- **Raw body** — `NestFactory.create({ rawBody: true })` + a `@WebhookRequest()` param
  decorator maps the raw body + provider headers into a framework-agnostic DTO at the
  controller edge (mirrors `@CurrentUser()`).

### Data model

- **`User.subscription`** (embedded, `_id: false`): `{ planKey, status,
  status }`, default `{ 'free', 'none' }` — small, read-hot, 1:1
  (same rationale as `avatar`).
- **`plans`** — natural string `_id = PlanKey`, a principled exception to the
  uuid-`_id` convention for a fixed config table. Seeded via `$setOnInsert` so a
  re-seed never overwrites an admin's price edit; MongoDB stays the source of truth.
- **`webhook_events`** — natural `_id = event.id` for idempotency.

### Local webhook testing (Rapyd sandbox)

1. `ngrok http 4000` → set `RAPYD_WEBHOOK_URL` to
   `https://<id>.ngrok-free.app/webhooks/payments` (must match the Rapyd dashboard
   webhook URL exactly).
2. Set `PAYMENT_PROVIDER=rapyd`, sandbox keys, and `RAPYD_CHECKOUT_COUNTRY` that
   pairs with the plan currency (seed: `US` + `USD`).
3. Upgrade in the app → complete with a [Rapyd sandbox test card](https://docs.rapyd.net/en/test-cards.html) → confirm `GET /me` shows `pro`/`active`.

---

## Frontend Architecture

- **Single-page, state-driven** — `App.tsx` is the top-level screen router (no
  react-router): it maps *(session + URL entry points) → one screen* via
  assign-then-return. URL-driven entries (`?emailChangeToken=`, `?upgrade=`) are read
  once into state; the authenticated app is `ChatLayout` with a `mode` switcher
  (`chats` / `profile` / assistant / tutor), and `App` can set `initialMode` (e.g.
  open Account on a billing return).
- **Feature slices** — `features/<domain>/` (app, auth, user, conversations, messages,
  ai, knowledge, profile, email-change, password-reset). Component-as-folder with a
  container (hook + context) + presentational view + split file roles
  (`.styles.ts` / `.constants.ts` / `.utils.ts` / `.types.ts`); one context per tree;
  single `return` per component. Canonical rulebook:
  `FRONTEND_CONVENTIONS.md`.
- **API layer** — `api/apiClient.ts` is the single transport seam (base URL,
  `Authorization` header, `ApiRequestError` mapping); `sse.ts` reads SSE frames.
  Single-feature actions live in feature-local `apiActions/`.
- **Auth/session** — `shared/auth/authStorage.ts` persists the token + user and
  notifies subscribers; `AuthProvider` exposes `signIn/signUp/updateProfile/
  refreshUser/signOut`. The assistant/tutor UI uses one streaming hook
  (`useAssistantChat`) + reducer.

---

## Testing

- **Vitest** across both apps. API integration tests use local docker Mongo with
  **per-file database isolation** (each test file gets its own DB), so the suite is
  deterministic and never touches Atlas.
- **Redis-free** — tests set `RESET_CODE_DRIVER=memory` and `QUEUE_DRIVER=memory`;
  the payment consumer is unit-tested by calling `ApplyPaymentEventOrchestrator`
  directly. Vector retrieval is covered by the RAG eval, not the unit suite.
- **Gate** — `npm run verify:precommit` runs format + lint + typecheck + tests.

---

## Documentation Alignment

- Keep this file aligned with the implementation as the architecture evolves; update
  it in the same PR as the change.
- Keep `docs/API_CONTRACT.md` aligned with `@chat/contract` usage across `apps/web`
  and `apps/api`, and `docs/FRONTEND_CONVENTIONS.md` aligned with frontend structure.
