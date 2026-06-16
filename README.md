# Chat MVP

A chat application built as an npm-workspaces monorepo.

## Workspace Layout

- `apps/web` — React + Vite + TypeScript frontend (Week 2).
- `apps/api` — NestJS + TypeScript backend: JWT auth (Week 4) and MongoDB persistence via Mongoose (Week 5).
- `packages/contract` — shared domain types (single source of truth) consumed by both apps.

The frontend includes:
- Conversation list on the left
- Message thread and composer on the right
- Optimistic message sending with rollback on failure
- Loading, empty, success, and error UI states
- Real API integration aligned with `API_CONTRACT.md`

## Tech Stack

- Frontend: React, TypeScript (strict), Vite, Vitest + React Testing Library
- Backend: NestJS, TypeScript (strict), MongoDB + Mongoose, Passport JWT, class-validator

## Prerequisites

- Node.js + npm
- MongoDB running as a single-node replica set (required for multi-document
  transactions). Easiest via the provided `docker-compose.yml`, which
  auto-initializes the `rs0` replica set. A MongoDB Atlas cluster also works
  (already a replica set).

## Environment

`apps/api` loads config from `apps/api/.env` (copy `apps/api/.env.example`). Required vars:

- `JWT_SECRET` — secret used to sign/verify JWTs
- `BCRYPT_ROUNDS` — bcrypt cost (e.g. `12`)
- `MONGO_URI` — e.g. `mongodb://localhost:27017/chat?replicaSet=rs0`

`MONGO_URI` is validated at startup; the API will not boot without it. The
`?replicaSet=rs0` is required for transactions (sending a message updates the
parent conversation atomically).

## Run Locally

1. Install (from repo root): `npm install`
2. Start MongoDB as a replica set: `docker compose up -d` (starts `mongo:7` as the `rs0` single-node replica set and auto-initializes it; data persists in a volume). An Atlas `MONGO_URI` works too.
3. Seed the database (out-of-band — the server never seeds on boot, so data survives restarts): `npm run seed -w @chat/api`
4. Backend dev server: `npm run dev:api` (`http://localhost:4000`)
5. Frontend dev server: `npm run dev:web` (`http://localhost:5173`)

- `VITE_API_BASE_URL` defaults to `http://localhost:4000`
- Tests: `npm test` (the API suite uses a `chat-test` database and requires a running MongoDB)
- Full checks: `npm run verify:precommit`

Seed accounts (password `password123`): `alex@example.com`, `sam@example.com`, `dana@example.com`, `maya@example.com`.

## Acceptance Criteria Mapping

- **All UI states (loading, empty, success, error) are visibly handled**  
  Yes. Conversations and messages containers explicitly render skeletons, empty text, normal content, and error states.

- **Optimistic send works and rolls back on simulated failure**  
  Yes. Message send uses optimistic insert, then either confirms on success or removes and shows an error on failure.

- **Auto-scroll keeps the latest message in view**  
  Yes. The message list scrolls to an end marker whenever messages update.

- **Cursor-style pagination supported in the API mock (frontend doesn’t crash on long thread)**  
  Yes. The mock API uses cursor paging, and message loading follows cursors to build full history safely.

- **At least one custom hook + at least one `useReducer` usage**  
  Yes. Custom hooks include `useMessages` and `useOptimisticMessages`.  
  `useReducer` is used in `useOptimisticMessages` with `messagesReducer` (note: reducer usage is in a hook, not directly inside a component).

- **At least 5 unit/component tests with Vitest + React Testing Library**  
  Yes. The project includes more than 5 tests across reducers, selectors, mocks, components, and hooks.

- **`npx tsc --noEmit` passes**  
  Yes. Typecheck is included in `npm run verify:precommit` and currently passes.

- **`API_CONTRACT.md` documents every endpoint with request/response shapes**  
  Yes. Required endpoints and payloads are fully documented in `API_CONTRACT.md`.

## Backend API Mapping

- **Auth implemented (Week 4)**  
  `POST /auth/signup` and `POST /auth/login` accept `{ email, password, name? }`, hash with bcrypt, and return a signed JWT + user. `GET /me` returns the current user.

- **Conversations and messages endpoints implemented**  
  Yes. `GET /conversations`, `POST /conversations`, `GET /conversations/:id/messages` (cursor-paginated), and `POST /conversations/:id/messages` are available and match the contract. All require a valid JWT.

- **Clean backend layering + validation + error shape**  
  Yes. Router -> controller -> service layering is used, invalid input returns `400`, and errors follow `{ "error": { "code", "message", "details" } }`.

- **Operational requirements covered**  
  Yes. Request logging and JSON middleware are enabled, and CORS allows `http://localhost:5173`.

## Project Docs

- Implementation and constraints: `CLAUDE.md`
- Architecture and responsibilities: `ARCHITECTURE.md`
- API contract: `API_CONTRACT.md`
