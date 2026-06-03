# Frontend Chat MVP — Working Instructions

## Project Context

- **Course:** Frontend
- **Week:** 2
- **Score weight:** 100

## TL;DR

Ship a chat UI in React + Vite + TypeScript against a mocked API.

- Conversation list on the left
- Message thread + composer on the right
- Optimistic sends
- Real loading / error / empty states

The mocked API contract MUST match what your backend will deliver in Week 3. Design the contract first.

## Project Documentation Map

- [`CLAUDE.md`](./CLAUDE.md) is for execution instructions, engineering rules, constraints, and acceptance criteria.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) is the source of truth for high-level architecture, file responsibilities, and data flow decisions.
- [`API_CONTRACT.md`](./API_CONTRACT.md) is the source of truth for endpoint contracts and request/response shapes.

Recommended planning flow:

1. Define/confirm endpoint shapes in [`API_CONTRACT.md`](./API_CONTRACT.md).
2. Design data flow and module boundaries in [`ARCHITECTURE.md`](./ARCHITECTURE.md).
3. Execute implementation against constraints and acceptance criteria in [`CLAUDE.md`](./CLAUDE.md).

If there is a conflict:

1. Follow task constraints and acceptance requirements in `CLAUDE.md`.
2. Follow structural design decisions from `ARCHITECTURE.md`.
3. Keep `API_CONTRACT.md` aligned with architecture and implementation.

## Engineering Rules (Must Follow)

1. Always use curly braces for every `if` statement, including one-liners.
2. Remove pass-through handlers; call the original function directly from JSX when no extra logic is added. This includes wrappers that only duplicate work the delegate already does (for example, `refetch()` setting loading/error when the loader it calls already sets them) — let the single source own that logic.
3. Never fail validation silently; always show a clear user-facing error message.
4. Keep validation behavior consistent across similar flows (for example: add + edit).
5. Prefer clear variable names (`inputValue`, `value`) over vague names.
6. Derive critical values from latest state inside functional updates (`setState((prev) => ...)`), not render-scoped state.
7. Use typed arrays + `.map()` for repeated UI options instead of duplicated handlers/JSX blocks.
8. Add edge-case tests for each mutation path (for example: non-existent ID operations).
9. Keep formatting conventions strict (EOF newline, lint/format clean).
10. Use `type` aliases for object/data shapes instead of `interface` (enforced via `@typescript-eslint/consistent-type-definitions`).
11. Keep a single source of truth for shared UI state (for example: current selection). Lift it to one owner and pass it down via props; do not also store it inside a data-fetching hook and resolve between the two at runtime.
12. Guard against stale async results: capture the relevant key (for example: `conversationId`) before an `await`, and after it resolves verify it still matches the active key before writing state. A late response from a previous selection must never overwrite the current one.
13. Keep presentational/leaf components decoupled from infrastructure (auth/session, mock data, network). They should receive data and resolvers via props so they stay easy to test in isolation; do such wiring in container components. Resolve identity (for example: the current user) from real app state passed down as props, not by reaching into global/session singletons inside a leaf. The session/auth singleton is owned by the `apiClient` boundary: only `login`/`logout` mutate it, and the UI never imports `authSession` directly. Do not maintain the same fact (for example: the current user) in both React state and a global singleton that callers must keep in sync by hand.
14. Do not silently substitute fallback values that can mask bugs (for example: `getSessionUserId() ?? 'user-1'`). Pass required values explicitly so a missing value is impossible by construction, or fail visibly. See rule 3.

## Naming and Commit Conventions

### Commit structure

Each commit should represent one logical concern and be reviewable on its own. A reviewer should be able to review commit by commit, understanding the intent of each change in isolation. Do not bundle unrelated changes together. If they do not belong together conceptually, they belong in separate commits.

### Commit messages

- Format: `<file/topic>: <message>`
- Start with a lowercase verb.
- Maximum length: 72 characters.
- End with a period.
- Example: `user.dto: add eduEmail field to StudentInformation.`
- For new files/modules, use: `<file/topic>: initial commit.`

### Branch naming

- Convention: `feature/<domain>/<scope>`
- Use kebab-case.
- Add a subfolder segment for scoped subdomains.
- Examples:
  - `feature/backend/edu-email-visibility`
  - `feature/frontend/auth/login-redirect`

## Learning Goals

- Ship a real product with clean component architecture and clear data flow.
- Handle loading, empty, success, and error states explicitly.
- Apply optimistic updates with rollback on failure.
- Test components and at least one custom hook.
- Write a typed mocked API matching a contract you'll later build server-side.

## Product Spec

- Auth screen (mocked): "log in as user X". No real auth this week; just choose a user identity.
- Conversation list: shows all conversations the current user is part of, sorted by last message.
- Message thread: messages from the selected conversation, auto-scrolled to bottom.
- Message composer: controlled text area, submit on Enter (Shift+Enter for newline).
- Optimistic message send: message appears instantly, rolls back on simulated failure.
- Loading skeletons for conversation list + message thread.
- Empty states (no conversations, empty thread).
- Error toast on failed send.
- Mocked API behind a single `apiClient.ts` module — typed, matching the contract for Week 3.

## Tech Constraints

- React + Vite + TypeScript (strict mode).
- No real backend. Use MSW (Mock Service Worker) or a simple in-memory fake fetcher.
- No `any`. Explicit return types.
- At least one custom hook for the chat domain (for example: `useConversation`, `useMessages`).
- At least one component using `useReducer` for non-trivial state.

## API Contract Requirement

You design the contract this week and document it in `API_CONTRACT.md`. Minimum endpoints:

- `POST /auth/login` -> `{ token, user }`
- `POST /auth/logout` -> clears the session (204, no content)
- `GET /conversations` -> list of conversations
- `GET /conversations/:id/messages?cursor=...` -> paginated messages
- `POST /conversations/:id/messages` -> create a message

Backend Week 3 will implement this contract. If the contract changes later, document the change.

## Acceptance Criteria

- [ ] All UI states (loading, empty, success, error) are visibly handled.
- [ ] Optimistic send works and rolls back on simulated failure.
- [ ] Auto-scroll keeps the latest message in view.
- [ ] Cursor-style pagination is supported in the API mock (frontend does not crash on a long thread).
- [ ] At least one custom hook + at least one `useReducer` usage.
- [ ] At least 5 unit/component tests with Vitest + React Testing Library.
- [ ] `npx tsc --noEmit` passes.
- [ ] `API_CONTRACT.md` documents every endpoint with request/response shapes.

## Submission

- PR on your assigned GitHub repo.
- PR description includes:
  - Summary
  - Link to `API_CONTRACT.md`
  - List of states/components
  - Key tradeoffs
- Mentor reviews the PR on Sunday.
