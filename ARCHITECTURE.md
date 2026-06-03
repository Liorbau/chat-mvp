# Frontend Chat MVP — Architecture

## Related Planning Docs

- Execution rules and acceptance criteria: [`CLAUDE.md`](./CLAUDE.md)
- Endpoint contracts and payload shapes: [`API_CONTRACT.md`](./API_CONTRACT.md)

## Purpose

This document defines the high-level architecture, module boundaries, and design principles for the Week 2 Frontend Chat MVP.

Use this as the source of truth for:

- feature structure
- data flow
- container vs presentational responsibilities
- optimistic update design
- maintainability rules

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
  - Returns:
    - `status`, `conversations`, `error`, `refetch()`

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
  - Returns:
    - `status` (derived from base hook + pending sends)
    - `messages` (merged)
    - `error`
    - `sendMessage`
    - `refetch`

### `src/features/chat/api/`

- `chatApi.types.ts`
  - Contract-first shared types for frontend and mocked backend:
    - `User`
    - `Conversation`
    - `Message`
    - `GetMessagesResponse`
    - `SendMessageRequest`
    - `SendMessageResponse`
    - `LoginRequest`, `LoginResponse`, `ApiError`

- `apiClient.ts`
  - Fetcher module.
  - Only module that talks to network (or mock server).
  - Exposes:
    - `getConversations(): Promise<Conversation[]>`
    - `getMessages(conversationId: string, cursor?: string): Promise<GetMessagesResponse>`
    - `sendMessage(req: SendMessageRequest): Promise<SendMessageResponse>`
    - `login(req: LoginRequest): Promise<LoginResponse>`
    - `logout(): Promise<void>`
  - UI and hooks never import `fetch` directly.
  - The session lives behind this boundary: only `login`/`logout` mutate it, so
    the UI never touches `authSession` directly.

### `src/features/chat/state/`

- `chatStatus.ts`
  - Shared union type for status-driven UI:
    - `export type LoadStatus = "idle" | "loading" | "success" | "empty" | "error";`

- `messagesReducer.ts`
  - Pure reducer (no React imports) for message state used by `useOptimisticMessages`.
  - State:
    - `messages: Message[]`
    - `pendingMessages: Message[]`
    - `error: string | null`
  - Example actions:
    - `LOAD_SUCCESS` (set base messages)
    - `SEND_START` (add optimistic message)
    - `SEND_SUCCESS` (replace temp message with real one)
    - `SEND_FAILURE` (remove temp message, set error)

### `src/features/chat/mocks/`

- `mockData.ts`
  - In-memory arrays matching `chatApi.types.ts`.
  - Example:
    - `let conversations: Conversation[] = [...]`
    - `let messages: Message[] = [...]`

- `mockServer.ts`
  - Async functions simulating backend contract:
    - `mockGetConversations(): Promise<Conversation[]>`
    - `mockGetMessages(conversationId: string, cursor?: string): Promise<GetMessagesResponse>`
    - `mockPostMessage(req: SendMessageRequest): Promise<SendMessageResponse>`
  - May include:
    - artificial latency
    - random failures for error-state testing
  - `apiClient.ts` should call this layer (or a fetch wrapper), not a real backend.

### `src/features/chat/__tests__/`

- Tests for reducers, selectors, mock server contract behavior, components, and hooks.
- Built with Vitest + React Testing Library.
- Focus on status branches, optimistic mutation flows, and edge cases.

### Shared UI Primitives

- No standalone `src/components/ui/` primitives are currently used.
- Loading/error/empty visuals are rendered through feature-level components
  (`ConversationListSkeleton`, `MessageThreadSkeleton`, `ErrorToast`, and inline copy).

## Key Principles and Rules

### One File, One Task

- No God components.
- Extract when a file does more than one thing.
- Do not mix fetching/state/rendering unless it is explicitly a container.

### Container vs Presentational Components

- Containers:
  - use hooks
  - coordinate status branches
  - connect UI to domain actions
- Presentational components:
  - receive typed props only
  - no fetch, no `useEffect`, no business logic
  - only UI concerns and local UI state

### Status-Driven UI

- Use discrete status union:
  - `"idle" | "loading" | "success" | "empty" | "error"`
- Use early returns in containers:
  - loading -> feature skeleton components
  - error -> inline error copy and retry actions (plus send-error toast)
  - empty -> inline empty-state copy
  - success -> main content

### API Decoupling

- Only `apiClient.ts` knows transport details (URLs/requests).
- Hooks/reducers/components work with typed domain data only.
- Mock backend must follow the same contract as real backend (contract-first).

### `useReducer` Usage

- Use `useReducer` in `useOptimisticMessages` for non-trivial optimistic flow.
- Keep reducer logic in pure `messagesReducer.ts` for direct unit testing.

### TypeScript Rules

- JSX-rendering modules in `.tsx`.
- Pure logic modules in `.ts`.
- Prefer explicit prop and return types.
- No `any`.

### Clean Code and Maintainability

- No dead files.
- Every file should be imported somewhere or removed.
- Prefer small, focused functions.
- Prefer clarity over clever abstractions.
- Commit frequently with meaningful messages (one logical change per commit).

## Documentation Alignment

- Keep this file aligned with implementation as structure evolves.
- Keep `API_CONTRACT.md` aligned with `chatApi.types.ts` and `apiClient.ts`.
- If architecture decisions change, update this file in the same PR.
