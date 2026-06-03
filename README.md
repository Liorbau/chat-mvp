# Chat MVP

A small chat application built with React, Vite, and TypeScript.

The app includes:
- Mock login ("log in as user X")
- Conversation list on the left
- Message thread and composer on the right
- Optimistic message sending with rollback on failure
- Loading, empty, success, and error UI states
- In-memory mocked API aligned with `API_CONTRACT.md`

## Tech Stack

- React
- TypeScript (strict)
- Vite
- Vitest + React Testing Library

## Repository Structure

- `apps/web/` — Week 2 frontend (React + Vite)
- `apps/api/` — Week 3 backend workspace (placeholder scaffold)
- `packages/contracts/` — shared API contract types used by web and api
- Root (`/`) — shared scripts, Husky hooks, and project docs

## Run Locally

- Install all workspaces: `npm install`
- Frontend dev server: `npm run dev` (delegates to `@chat/web`)
- Frontend tests: `npm test`
- Full monorepo checks: `npm run verify:precommit`

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

## Project Docs

- Implementation and constraints: `CLAUDE.md`
- Architecture and responsibilities: `ARCHITECTURE.md`
- API contract: `API_CONTRACT.md`
