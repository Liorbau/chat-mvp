# Chat MVP — Working Instructions

## Project Context

- Masterschool Fellowship (AI Software Engineering); ongoing multi-week project.
- Current phase: **Week 8 (Capstone — refactor the RAG tutor into a LangGraph agent with MongoDB checkpointing, streamed agent events, and one polished multi-type UI)**.
- This file tracks stable engineering principles, cross-week goals, and the
  current week's requirements.

## How to Use This Document

- `CLAUDE.md` = execution source of truth; `ARCHITECTURE.md` = architecture;
  `API_CONTRACT.md` = endpoint contract;
  `docs/FRONTEND_CONVENTIONS.md` = frontend directory/file structure rules
  (feature slices, component-as-folder, presentational/container, context-over-props,
  api actions) — follow it for all `apps/web` work.
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
23. Never introduce a `Promise<void>` (or any void-returning function) on a
    guess. When a function would naturally return nothing, pause and ask the
    developer what it should do (return a value, restructure, etc.); the
    developer chooses.
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

### Week 5 (Completed) — MongoDB Persistence (Mongoose)

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

### Week 6 (Completed) — AI Assistant Mode

#### Spec summary

Add an AI assistant mode. New conversation type `assistant`: posting a user
message triggers an LLM call; the response streams back via Server-Sent Events
(token deltas + a final "done" event); the FE renders tokens in real time; the
full assistant message persists to MongoDB after streaming completes. Wire at
least one tool the model can call against the authenticated user's own data.

#### Spec rules

- FE creates an assistant conversation via `POST /conversations` with
  `type: "assistant"`.
- Posting a user message to an assistant conversation triggers the LLM call.
- Stream the response via SSE (token deltas, then a final "done" event).
- Persist the full assistant message to MongoDB after streaming completes.
- FE renders streaming tokens live (no waiting for the full response).
- Multi-turn assistant conversations preserve context within sensible limits.

#### Tools (≥1 required)

Pick at least one:

- `summarize_my_recent_messages(limit: number)` — summary of the user's last N
  messages.
- `list_my_conversations()` — the user's conversations.
- `search_my_messages(query: string)` — keyword search over the user's messages.

Tools must:

- Be scoped to the authenticated user only — never leak another user's data.
- Validate inputs with Zod.
- Return structured results the model can reason over.

#### Eval (lightweight)

- 5-10 hand-written test prompts in a JSON file.
- A script that runs each prompt against the assistant and prints the response.
- Document which prompts succeed / fail in the PR description.

#### Tech constraints

- NestJS backend extended.
- Anthropic OR OpenAI (choice). Keep the call behind a thin abstraction so
  swapping providers is feasible.
- API key from env (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`). Never logged,
  never committed; update `.env.example`.
- SSE for streaming. Nest controller exposes a streaming endpoint; FE consumes
  via `EventSource` or a `fetch` streaming body reader.
- Zod for tool input/output schemas. At least one Zod-validated structured
  output use case in the codebase.
- No `any`.
- Prompts live in source files (not inline magic strings) and are commented for
  intent.

#### Acceptance criteria

- [ ] Assistant conversation type works end to end.
- [ ] Tokens stream in real time on the FE — no waiting for the full response.
- [ ] Assistant messages persist to MongoDB after streaming.
- [ ] ≥1 tool implemented; inputs validated with Zod; returns scoped to the
      authenticated user.
- [ ] Multi-turn assistant conversations preserve context within sensible limits.
- [ ] Prompts in source files, commented for intent.
- [ ] ≥1 Zod-validated structured output use case.
- [ ] Small eval set committed; results documented in the PR description.
- [ ] API keys env-only; `.env.example` updated; secrets never logged.
- [ ] `npx tsc --noEmit` passes.

#### Submission

- PR on the assigned repo. PR description: summary, provider chosen + why,
  tool(s) implemented, eval results, key tradeoffs (cost, latency, prompt
  design). Mentor reviews Sunday.

#### Learning Goals to Demonstrate (personal, this week)

Concepts to show off in the implementation, beyond bare acceptance criteria:

- **LLM provider abstraction.** One contract, one concrete impl (Anthropic or
  OpenAI). No provider SDK calls scattered through controllers/services —
  everything goes through the abstraction so providers are swappable.
- **Streaming with SSE.** Backend SSE endpoint streams tokens as the LLM emits
  them; FE renders partial text as it arrives.
- **Tool calling.** Model requests a tool -> backend parses the call, validates
  args, executes the tool, feeds the result back to the model.
- **Structured outputs & validation.** When the model must return structured
  data, validate against a Zod schema and **fail closed** on invalid output —
  never trust raw JSON/text.
- **Safety basics.** Resist prompt injection (model can't override rules or gain
  extra access); never execute model output as code/SQL/commands; secrets in env
  only, never in code or logs.
- **Eval basics.** Hand-written prompt fixtures; a script runs them against the
  assistant; document pass/fail.

#### Reconciliation Notes (learning notes vs. formal spec — formal wins)

- **Provider contract is an `interface` + `Symbol` DI token, not an abstract
  class nor `interface ILlmProvider`.** It's a blueprint many providers implement,
  so per principle #10 it's an `interface` (no `I`-prefix). Because an interface
  is erased at runtime, inject via `const LLM_PROVIDER = Symbol(...)` and
  `@Inject(LLM_PROVIDER)`; providers `implement LlmProvider`. (Same for `AiTool`.)
- **Eval = a script, not a CI gate (minimum).** Formal requires a script that
  runs 5-10 prompts and prints responses, with pass/fail documented in the PR.
  An automated scorer with an `avgScore >= 0.7` threshold gating CI is optional
  enrichment, not a requirement — build it only as a learning extra.
- **Enrichment, not graded by the formal rubric:** feature flag
  `ASSISTANT_MODE_ENABLED` (keeps the old chat flow working), rate
  limiting/quotas. Good practice; do not over-build past the spec.

#### Architecture Decisions (locked)

- **Assistant turn = one server-orchestrated streaming endpoint** in
  `ai.controller` (e.g. `POST /ai/conversations/:id/messages`). It persists the
  user message (reusing `MessagesService.createMessage`), runs the LLM+tool
  loop, streams tokens live, then persists the assistant message. Module arrow
  is one-way `ai -> messages` (no circular dep). The FE forks on
  `conversation.type` at the call site (it already knows the type for UX), so a
  separate URL — not a dual-response route — keeps the contract clean.
- **Creating an assistant conversation stays `POST /conversations`** with a new
  `type: 'user' | 'assistant'` field (default `'user'`) on the schema +
  `CreateConversationDto`. Not an `ai.controller` concern. (`'user'` names the
  participant kind; note it overlaps the message-author `Role` `'user'` — same
  word, different axis.)
- **Cross-user isolation is enforced in code, not the prompt.** Every tool runs
  with `requesterId` from the verified JWT (`@CurrentUser`), never from model
  output; same `assertParticipant` rule. No secrets in the system prompt.
  Prompt-level guardrails are defense-in-depth only.

#### Status

All acceptance criteria met. Implemented: assistant conversation `type`
(idempotent get-or-create, partial unique index); `POST /ai/conversations/:id/messages`
persists the user message, runs the LLM + tool loop, streams SSE token deltas,
then persists the assistant message; swappable `LlmProvider` abstract class
(OpenAI active, Anthropic drop-in via `LLM_PROVIDER`); two user-scoped
Zod-validated tools; one Zod structured-output call (`generateStructured`,
fail-closed); multi-turn context within a token budget; eval harness
(`apps/api/src/modules/ai/eval`). PR notes in `WEEK6_PR.local.md`.

### Week 7 (Completed) — AI Tutor with Knowledge Base + Citations (RAG)

#### Spec summary

Add a per-user knowledge base and a `tutor` conversation type. Endpoints to
upload/list/delete documents; an ingestion pipeline (chunk -> embed -> store in
MongoDB Atlas Vector Search, scoped by user ID); top-K vector retrieval; and a
RAG chain that answers questions grounded ONLY in the user's uploaded content,
returning citations (document name + chunk text per source). LangChain (TS)
composes the RAG chain. FE renders clickable citations under each tutor message.

#### Spec rules

- New conversation `type: 'tutor'` (alongside `'user'` / `'assistant'`).
- Per-user private knowledge base: uploaded docs scoped to the uploader; no
  cross-user retrieval possible.
- Ingestion (sync for simplicity is allowed) stores chunks + embeddings in Atlas
  with the user ID as a filter.
- Tutor answers use ONLY the user's KB for grounded questions — no general LLM
  knowledge; when retrieval is empty, do not hallucinate.
- Every tutor answer includes citations (list of source chunks: document name +
  chunk text); FE renders them clearly and clickable.
- Re-uploading the same document must not duplicate chunks.

#### Endpoints

- `POST /knowledge/documents` — upload a document, kick off ingestion; returns
  ingestion status.
- `GET /knowledge/documents` — list the user's uploaded documents.
- `DELETE /knowledge/documents/:id` — remove a document and its chunks.
- Tutor messages flow through the existing assistant message path but use the
  tutor RAG chain instead of a plain LLM call.

#### Tech constraints

- **MongoDB Atlas required** (local Mongo has no Vector Search). Atlas Vector
  Search index defined in the repo (JSON config or migration script), provisioned.
- **LangChain (TypeScript)** composes the RAG chain (LLMs, prompts, retrievers,
  Runnables) where they earn their keep.
- **Embeddings:** Anthropic has none — use OpenAI `text-embedding-3-small` or
  Voyage AI (document the choice). LLM provider: same abstraction as Week 6.
- **Chunking:** pick size + overlap; document the strategy and reasoning.
- **Citations:** every chunk has a stable ID, document name, and source text in
  the API response.
- No `any`; secrets env-only; update `.env.example`.

#### Eval

- 10-20 question / expected-source pairs in a JSON file.
- Per question: did retrieval return the expected chunk? Did the answer cover the
  expected information?
- Document retrieval recall + a qualitative answer-quality summary in the PR.

#### Acceptance criteria

- [ ] Document upload works for the committed formats.
- [ ] Ingestion produces chunks + embeddings in Atlas with correct metadata.
- [ ] Atlas Vector Search index exists in the repo (config) and is provisioned.
- [ ] Retrieval returns top-K chunks scoped to the authenticated user only.
- [ ] Tutor answers grounded in retrieved context; no hallucination on empty
      retrieval.
- [ ] Every tutor answer carries citations; FE renders them clearly.
- [ ] Eval set committed; recall + answer quality documented in the PR.
- [ ] Re-uploading the same document doesn't duplicate chunks.
- [ ] `npx tsc --noEmit` passes.

#### Submission

- PR on the assigned repo. PR description: summary, chunking strategy +
  reasoning, embedding/LLM provider choices, Atlas index config, eval results
  (numbers + commentary), key tradeoffs. Mentor reviews Sunday.

#### Architecture Decisions (locked)

Decided in the Week 7 design discussion. Optimized for fewest moving parts and
least code while meeting every acceptance criterion.

- **DB topology — whole app on MongoDB Atlas.** Atlas is mandatory (local Mongo
  has no Vector Search). Point the existing single `MONGO_URI`
  (`MongooseModule.forRootAsync` in `AppModule`) at one Atlas M0 free cluster —
  zero new connection code. M0 is a 3-node replica set, so Week-5's transactional
  send still works (verified: transactions are supported on M0). The Atlas SRV
  string auto-discovers the replica set, so drop the manual `?replicaSet=rs0`.
  **Tests stay on local docker Mongo** (per-file DB isolation is unchanged; Atlas
  Vector Search can't run locally, so retrieval is exercised by the eval script,
  not the unit suite).
- **Upload formats — markdown + plain text now, via multipart upload + an
  extraction seam.** `POST /knowledge/documents` accepts real files
  (`multipart/form-data`, `multer`) from day one so the contract never changes
  when richer formats arrive. All formats funnel through one
  `documentToText(file)` seam; today it reads md/txt buffers as UTF-8. PDF/DOCX
  via IBM **Docling** (a `docling-serve` sidecar + the typed `docling-sdk`) is a
  later additive case in that seam — no rewrite upstream or downstream.
- **Embeddings — Voyage AI** (`text-embedding` family on the free 200M-token
  tier; on-spec — spec names OpenAI or Voyage — and MongoDB-native). Pin one
  output dimension (1024) to match the Atlas index. Exact model id is a code
  constant (no config for a value that never changes).
- **RAG composition — LangChain owns the tutor chain end-to-end** (chat model +
  Atlas retriever + prompt + `RunnableSequence`). The Week-6 `LlmProvider`
  abstraction is untouched and keeps serving `assistant` mode. Clean split by
  conversation type; no wrapping LangChain behind the old abstraction.
- **Data model — two collections, single uuid `_id` (Week-5 convention).**
  `kb_documents` `{ _id, userId, name, mimeType, contentHash, status, chunkCount,
  createdAt }` backs the list/delete endpoints; `kb_chunks` `{ _id, documentId,
  userId, text, embedding[1024], chunkIndex }` backs retrieval. `userId` is
  denormalized onto chunks because the Atlas vector query filters on the same
  collection — this is what enforces per-user isolation in the query itself.
- **Dedup — content hash → skip.** Hash the file bytes; if a `ready`
  `kb_document` with that hash already exists for the user, no-op and return it
  (satisfies "re-upload doesn't duplicate" with the least work — no delete + no
  re-embed). A non-`ready` (failed/partial) doc with the same hash is re-ingested
  so it can heal. Deliberate re-processing after a pipeline change is covered by
  the DELETE endpoint + re-upload, not the happy path.
- **Ingestion — synchronous.** Chunk + embed + store inside the POST request,
  return final status (`ready`/`failed`). No queue, worker, or polling. Fine for
  assignment-sized docs.
- **Tutor turn — reuse the Week-6 path, branch on type.** Tutor conversations use
  the existing `POST /ai/conversations/:id/messages`; `ai.service` branches on
  `conversation.type`: `assistant` → the Week-6 `LlmProvider` tool loop
  (unchanged); `tutor` → the LangChain RAG chain. Module arrow stays one-way
  (`ai → knowledge`, like `ai → messages`).
- **Tutor LLM — reuse the Week-6 provider** (OpenAI/Anthropic via LangChain's
  chat model). On-spec ("LLM provider: same as Week 6") and reuses the existing
  key. `temperature: 0` for grounded, deterministic answers.
- **Empty retrieval — short-circuit a canned refusal.** If retrieval returns
  nothing (or top score < ~0.7 threshold), skip the LLM entirely and return a
  fixed grounded message with no citations. Guarantees no hallucination and saves
  a call.
- **Citations — bibliography list, delivered inside the `done` SSE event,
  persisted on the `Message`.** No new SSE event type: add a `citations` field to
  the existing `done` event and to `Message` in `@chat/contract`. The FE renders
  a clickable Sources list under the finished tutor message (no inline `[^1]`
  markers — more code, not required by the spec). Citation shape:
  `{ chunkId, documentId, documentName, text, score? }`.
- **Module boundary — new `knowledge` module.** Owns documents CRUD + ingestion +
  retrieval (a retriever provider wrapping Atlas Vector Search). Named for the
  resource (route is `/knowledge/documents`), not a consumer; the `tutor` RAG
  *generation* lives in `ai`. `ai` imports `KnowledgeModule` for the composer.
- **Atlas Vector Search index — committed JSON + manual UI creation.** Commit
  `vector-index.json` (the "index config in repo" criterion); create it once via
  the Atlas UI. M0 does not support driver/`createSearchIndex` provisioning, and
  the Admin-API alternative is ~30-50 lines + API keys — not worth it for one
  cluster. A driver/script provision is the upgrade path on a paid tier.
- **Chunking — LangChain `RecursiveCharacterTextSplitter`, 1000 chars / 150
  overlap.** No custom splitter; structure-aware chunking (Docling
  `HybridChunker`) arrives with PDF support.
- **Retrieval params — top-K 4, similarity threshold ~0.7** (the empty-retrieval
  cutoff). Both tunable constants.
- **Eval — reuse the Week-6 harness.** 10-20 question/expected-source fixtures,
  `temperature: 0`, deterministic. Report recall@k (required); hit-rate@k and
  precision@k fall out of the same retrieval results for free. No new scoring
  framework.
- **Env additions — `VOYAGE_API_KEY`, Atlas `MONGO_URI` (SRV), `VECTOR_INDEX_NAME`.**
  Tutor LLM reuses the Week-6 `OPENAI`/`ANTHROPIC` key. Update `.env.example`;
  never commit real secrets.

#### Status

All acceptance criteria met and shipped on `feature/backend/week-7-rag` (see
git history + `WEEK7_PR.local.md`). Implemented: `knowledge` module
(`kb_documents` + `kb_chunks`, single uuid `_id`) with multipart upload,
synchronous chunk→embed→store ingestion, content-hash dedup, and per-user Atlas
Vector Search retrieval (`knowledge.retriever.service`); Voyage embeddings
(`voyage.embeddings.ts`, 1024-dim); committed `apps/api/atlas/vector-index.json`;
`tutor` conversation type; `TutorService` LangChain RAG chain (ChatOpenAI +
retriever + prompt) reached via the shared `POST /ai/conversations/:id/messages`
path, branching on `conversation.type` in `ai.controller`; empty-retrieval
short-circuit refusal (threshold 0.7, top-K 4); citations in the `done` SSE event
+ persisted on `Message`; FE `TutorPanel` + `KnowledgeDocuments` render clickable
sources; RAG eval harness (`ai/eval/rag`).

Doc debt carried forward: `ARCHITECTURE.md` / `API_CONTRACT.md` still end at
Week 5 (Weeks 6-7 never backfilled there). Backfill Weeks 6-8 when the capstone
lands so the architecture/contract docs match real code.
**Resolved:** `ARCHITECTURE.md` is now backfilled through Weeks 6-8 and the
post-Week-8 orchestrator-layer refactor, so it matches the real code.

### Week 8 (Current) — Capstone: LangGraph Agent (final shipping week)

#### Spec summary

Final week. Compose Weeks 1-7 into one product: React FE + NestJS BE + MongoDB +
JWT + a **LangGraph agent** that wraps the Week-7 RAG tutor **and** at least one
user-data tool. Persist agent state via a LangGraph MongoDB checkpoint saver.
Stream agent events (token deltas, tool-call announcements, tool-result
completions) to the FE. All three conversation types (`user`, `assistant`,
`tutor`) work in one polished UI. Ship.

#### Spec rules

Refactor the Week-7 tutor into a LangGraph agent. The agent must:

- Have an explicit **state schema** (`Annotation`-based): conversation history,
  retrieved context, last tool call, etc. — typed and documented.
- Use **nodes** for distinct steps — at minimum: `route` (decide next step),
  `retrieve`, `answer`, `tool_call`, `tool_result`.
- Use **conditional edges** to route between "needs retrieval", "needs tool
  call", and "ready to answer" (≥1 conditional edge required).
- Use the **LangGraph MongoDB checkpoint saver** so conversation state survives
  restarts and the agent resumes mid-conversation. Keyed by userId + threadId
  (conversationId).
- **Stream events** to the FE: token deltas, tool-call announcements, tool-result
  completions.
- Use Week-7 **RAG retrieval as a tool** the agent invokes when a question needs
  grounded knowledge.
- Expose **≥1 additional user-data tool** (reuse/extend Week 6):
  `summarize_my_messages`, `list_my_conversations`, `search_my_messages`, or own.

#### FE

- All three conversation types work in one polished UI: human, assistant, tutor.
- Tutor messages render citations (clickable).
- Streaming UX: tokens appear progressively; tool-call indicators show agent
  progress (e.g. "Searching your documents…", "Looking up your messages…").

#### Tech constraints

- **LangGraph (TypeScript)** for the agent graph. **LangGraph MongoDB checkpoint
  saver** for persistence.
- All prior constraints carry forward: TS strict, no `any`, env-only secrets,
  JWT-protected, scoped to the authenticated user.
- The full repo runs locally end-to-end with a documented setup checklist in the
  PR description.

#### Acceptance criteria

- [ ] Agent defined as a LangGraph state graph with ≥1 conditional edge.
- [ ] Agent state schema typed and documented.
- [ ] MongoDB checkpoint saver wired — kill server mid-conversation, restart,
      conversation resumes.
- [ ] Retrieval (Week 7) + ≥1 user-data tool (Week 6) both available to the agent.
- [ ] FE streams tokens and shows tool-call progress.
- [ ] Tutor citations still rendered correctly.
- [ ] All three conversation types work in the same polished UI.
- [ ] Authorization enforced — tools + retrieval scoped to the authenticated user.
- [ ] `npx tsc --noEmit` passes across FE and BE.
- [ ] PR description includes a graph diagram (mermaid ok), the state schema, the
      tool list, and an eight-week-journey reflection.

#### Submission

- PR on the capstone branch. PR description: agent graph diagram, agent state
  schema, tool list, tradeoffs reflection, demo notes, end-to-end local setup
  checklist. Mentor reviews Sunday.

#### Insights vs. formal spec (formal wins)

Supplementary course notes were provided alongside the spec. Where they conflict
with the official instructions, **the instructions win.** Reconciliations:

- **TypeScript, in-process — not a Python sidecar.** The notes repeatedly assume
  a Python LangGraph runtime with tools calling NestJS over HTTP. The formal
  techstraint is **LangGraph (TypeScript)**. Build the graph in-process inside the
  Nest `ai` module; tools call the existing TS services directly (no Python
  process, no HTTP tool adapters). This also matches the current codebase
  (`TutorService` already uses `@langchain/*` in TS).
- **Reuse the existing SSE endpoint + contract.** Keep streaming over the current
  `POST /ai/conversations/:id/messages` and the `AssistantSseEvent` union in
  `@chat/contract`; extend that union for tool-call/tool-result events rather than
  inventing a parallel `/ai/stream` route with a different event vocabulary.
- **Everything else in the notes is confirmatory** (graph nodes/edges, typed
  state, checkpoint collection, per-message citations, JWT-guarded SSE, e2e happy
  path) and aligns with the acceptance criteria above.

#### Architecture Decisions (locked & built)

- **Unified agent, not two stacks.** One `AgentService` runs a LangGraph
  `StateGraph` for both `assistant` and `tutor` (branch on `conversationType`
  inside the graph). The Week-6 hand-rolled tool loop and the Week-7 tutor chain
  were deleted — they were legacy the moment LangGraph landed.
- **Explicit named nodes** `route / retrieve / tool_call / tool_result / answer`
  with a conditional edge (`decideNext`) off `route`; `retrieve` and
  `tool_result` loop back to `route`, so tools chain across turns. `route` decides
  (invoke), `answer` is the sole streamed generator (keeps refusals deterministic).
- **Checkpointer = agent memory; Mongo `messages` = UI truth.** `MongoDBSaver`
  keyed `thread_id = conversationId`, built from the shared Mongoose connection
  (`connection.getClient()`); warm threads feed only the new message, cold threads
  seed history from Mongo once.
- **One LangChain chat-model factory** (`createChatModel`, `ChatOpenAI`/
  `ChatAnthropic`, provider registry, `temperature: 0`) plus a `generateStructured`
  helper over `withStructuredOutput`. The Week-6 `LLM_PROVIDER` abstraction and both
  concrete providers were deleted — one LLM path for the whole module.
- **Two new SSE events** (`tool_call` / `tool_result`) on the existing envelope; a
  pure `stream-to-sse` translator maps LangGraph `streamEvents` → SSE with
  `SOURCES:` held back. FE renders BE-supplied progress labels; no panel merge.
- **Reuse ladder throughout** — reused `BaseMessage.text`,
  `coerceMessageLikeToMessage`, extracted `citations.ts`, reused the Week-6 tools
  and Week-7 retriever; built new only where neither we nor LangChain had it.

#### Status

All acceptance criteria met (eval numbers pending a live Atlas run). Implemented:
the `ai/agent/` subsystem (state, chat-model factory, four tool files + assembler,
graph, checkpointer provider, stream-to-sse translator, `AgentService`); contract
extended with `tool_call`/`tool_result`; controller routes both AI types through
the agent; dead Week-6/7 services removed; the `LLM_PROVIDER` stack fully retired
(one chat-model factory + `generateStructured`). FE renders tool progress +
citations. `verify:precommit` green — **API 73 + Web 56 = 129 tests**
(29 new unit bricks). PR notes in `WEEK8_PR.local.md`. `ARCHITECTURE.md`
backfilled for Weeks 6-8 and the post-Week-8 orchestrator-layer refactor;
`API_CONTRACT.md` backfilled for Weeks 6-8.

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

Derived from the Week-8 backend refactor; applies to every endpoint.

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
  envelope.** Size via the multer limit, with its `PayloadTooLargeException`
  mapped to `400 VALIDATION_ERROR` in the exception filter; verify file *type by
  magic bytes* (fail-closed), never the client-claimed `Content-Type`.
- **One real job per file (~150-line soft cap).** Extract pure helpers to
  siblings: DB mappers `*.mappers.ts`, cursor/paging `*.cursor.ts`, chunking /
  extraction helpers, etc. Avoid hollow layers beyond the thin-but-uniform
  orchestrators above.
- **Name a swappable seam by its role, not its payload:** an `interface` + a
  `Symbol` DI token (e.g. `StorageProvider` / `STORAGE_PROVIDER`); the vendor name
  stays on the concrete class only (`S3Storage implements StorageProvider`).

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
- Post-Week-8: frontend restructured into feature slices and aligned to a mentor
  review — thin containers (screen/form state in `useXForm` hooks provided via
  per-screen context; views/atoms read context), prop types in `X.types.ts`, one
  return per component, shared hooks for duplicated logic (`useComposer`), plus
  Tailwind v4, the `@/` import alias, and named exports. Full frontend rulebook
  in `docs/FRONTEND_CONVENTIONS.md`.
- Add future weeks as new sections without removing shared principles.
