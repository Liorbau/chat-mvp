# Chat MVP

A chat application built as an npm-workspaces monorepo.

## Workspace Layout

- `apps/web` — React + Vite + TypeScript frontend (Week 2).
- `apps/api` — Express + TypeScript REST backend (Week 3, completed).
- `packages/contract` — shared domain types (single source of truth) consumed by both apps.

The frontend includes:
- Conversation list on the left
- Message thread and composer on the right
- Optimistic message sending with rollback on failure
- Loading, empty, success, and error UI states
- Real API integration aligned with `API_CONTRACT.md`

## Tech Stack

- React, TypeScript (strict), Vite, Vitest + React Testing Library (frontend)
- Node.js, Express, TypeScript (backend)

## Run Locally

- Install (from repo root): `npm install`
- For end-to-end chat flow, run both servers:
- Backend dev server: `npm run dev:api` (`http://localhost:4000`)
- Frontend dev server: `npm run dev:web` (`http://localhost:5173`)
- `VITE_API_BASE_URL` defaults to `http://localhost:4000`
- Tests: `npm test`
- Full checks: `npm run verify:precommit`

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

## Week 3 API Mapping

- **`POST /auth/login` implemented**  
  Yes. Accepts `{ userId }`, returns fake token + user with input validation and consistent errors.

- **Conversations and messages endpoints implemented**  
  Yes. `GET /conversations`, `POST /conversations`, `GET /conversations/:id/messages`, and `POST /conversations/:id/messages` are available and match the contract.

- **Clean backend layering + validation + error shape**  
  Yes. Router -> controller -> service layering is used, invalid input returns `400`, and errors follow `{ "error": { "code", "message", "details" } }`.

- **Operational requirements covered**  
  Yes. Request logging and JSON middleware are enabled, and CORS allows `http://localhost:5173`.

## Project Docs

- Implementation and constraints: `CLAUDE.md`
- Architecture and responsibilities: `ARCHITECTURE.md`
- API contract: `API_CONTRACT.md`
