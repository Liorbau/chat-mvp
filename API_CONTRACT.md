# Frontend Chat MVP — API Contract (Week 2 -> Week 8)

## Related Planning Docs

- Execution rules and acceptance criteria: [`CLAUDE.md`](./CLAUDE.md)
- Feature structure and data flow: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## Stability Policy

This contract is the backend target for the current week's implementation
(Week 5: MongoDB persistence). Week 5 changed only the storage layer; every
request and response shape below is unchanged from Week 4.

- Keep endpoint shapes stable.
- If a change is required, update this file in the same PR and add a short "Contract Changes" note at the end.

## Authentication (Week 4)

- Auth uses real JWTs. `POST /auth/signup` and `POST /auth/login` return a signed
  token; every other endpoint requires it.
- Send the token on every protected request:
  - `Authorization: Bearer <token>`
- Missing, malformed, invalid, or expired token -> `401` (`UNAUTHORIZED`).
- Authorization rule: a user may only read or post in conversations they are a
  participant in. Accessing another user's conversation -> `403` (`FORBIDDEN`);
  the data is never returned.
- Passwords are hashed (bcrypt) server-side and never appear in any response.

## Base Types

```ts
type User = {
  id: string;
  name: string;
  email: string;
};
// Note: the password is hashed server-side (bcrypt) and is never part of `User`
// or any response body.

type SignupRequest = {
  email: string;
  password: string;
  name: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type AuthResponse = {
  token: string; // signed JWT
  user: User;
};

type Conversation = {
  id: string;
  // Optional: direct (1:1) conversations carry no stored title — the frontend
  // derives a per-viewer display name from the other participant. Named/group
  // conversations may set one.
  title?: string;
  participantIds: string[];
  lastMessagePreview: string;
  updatedAt: string; // ISO 8601
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string; // ISO 8601
};

type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

## Sort and Pagination Rules

- Conversations are returned sorted by `updatedAt` descending (newest first).
- Messages are returned sorted by `createdAt` ascending (oldest -> newest).
- Message pagination uses a cursor:
  - `cursor` is an opaque string returned by the previous response.
  - `cursor = null` or missing means first page.
  - `nextCursor = null` means no more pages.

## Endpoints

### `POST /auth/signup`

**Request body**

```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Success response (201)**

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

**Error responses**

- `400` `VALIDATION_ERROR` — invalid/missing fields.
- `409` `EMAIL_ALREADY_EXISTS` — email already registered.

```json
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "An account with this email already exists"
  }
}
```

### `POST /auth/login`

**Request body**

```json
{
  "email": "string",
  "password": "string"
}
```

**Success response (200)**

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

**Error response (401)**

Returned for an unknown email or a wrong password (same response for both, to
avoid leaking which accounts exist).

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}
```

### `GET /me`

Returns the currently authenticated user. Requires a valid bearer token.

**Success response (200)** — the `User` shape

```json
{
  "id": "string",
  "name": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "avatarUrl": "https://cdn.example/avatars/<id>/<uuid> | null"
}
```

`avatarUrl` is the public CloudFront URL of the user's avatar, or `null` when
none is set. It is derived server-side from the stored object key; the raw key
never leaves the API.

**Error response (401)**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid token"
  }
}
```

### Avatar upload

The browser uploads the image to the API, which validates it and stores it in
config-selected object storage (`STORAGE_PROVIDER` — any S3-compatible store:
AWS S3, Cloudflare R2, Supabase, …). Reads are served from the provider's CDN via
the `avatarUrl` on the `User`. Both routes require a bearer token.

#### `POST /me/avatar` (multipart)

Upload/replace the avatar. `multipart/form-data` with a single `file` field
(`image/png`, `image/jpeg`, or `image/webp`, ≤ 5 MB). The API validates type +
size, stores the object under `avatars/<userId>/<uuid>`, points the profile at
it, and best-effort deletes the previous object.

**Success response (200)** — the updated `User` (with the new `avatarUrl`).

**Error response (400)** — `VALIDATION_ERROR` for a missing file, unsupported
type, or a file over 5 MB.

#### `DELETE /me/avatar`

Clear the avatar from the profile and best-effort delete the stored object.

**Success response (200)** — the updated `User` (`avatarUrl` is now `null`).

### Logout (client-side)

JWT auth is stateless, so there is no server session to tear down and no logout
endpoint. The frontend logs out by clearing the stored token and resetting its
auth state.

> All endpoints below require `Authorization: Bearer <token>`. A missing or
> invalid token returns `401` (`UNAUTHORIZED`).

### `GET /users`

Returns all users (public shape, never the password hash). Used by the
frontend to pick participants when starting a new conversation.

**Success response (200)**

```json
[
  {
    "id": "string",
    "name": "string",
    "email": "string"
  }
]
```

**Error response (401)**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid token"
  }
}
```

### `GET /conversations`

Returns only the conversations the authenticated user participates in.

**Success response (200)**

```json
[
  {
    "id": "string",
    "title": "string",
    "participantIds": ["string"],
    "lastMessagePreview": "string",
    "updatedAt": "2026-05-27T10:00:00.000Z"
  }
]
```

**Error response (401)**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid token"
  }
}
```

### `POST /conversations`

**Request body**

`title` is optional: omit it for direct (1:1) chats (the frontend derives a
per-viewer name from the participants); set it for named/group conversations.

```json
{
  "title": "string (optional)",
  "participantIds": ["string"]
}
```

**Success response (201)**

```json
{
  "id": "string",
  "title": "string",
  "participantIds": ["string"],
  "lastMessagePreview": "",
  "updatedAt": "2026-05-27T10:00:00.000Z"
}
```

**Error response (4xx/5xx)**

```json
{
  "error": {
    "code": "CONVERSATION_ALREADY_EXISTS",
    "message": "A direct conversation for these participants already exists"
  }
}
```

### `GET /conversations/:id/messages?cursor=...`

**Path params**

- `id: string` (conversation id)

**Query params**

- `cursor?: string`
- `limit?: number` (default: `20`, max: `50`)

**Success response (200)**

```json
{
  "messages": [
    {
      "id": "string",
      "conversationId": "string",
      "senderId": "string",
      "content": "string",
      "createdAt": "2026-05-27T10:05:00.000Z"
    }
  ],
  "nextCursor": "string-or-null"
}
```

**Error responses**

- `401` `UNAUTHORIZED` — missing/invalid token.
- `403` `FORBIDDEN` — conversation exists but the caller is not a participant.
- `404` `RESOURCE_NOT_FOUND` — conversation does not exist.

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not a participant in this conversation"
  }
}
```

### `POST /conversations/:id/messages`

**Path params**

- `id: string` (conversation id)

**Request body**

```json
{
  "content": "string"
}
```

**Success response (201)**

```json
{
  "message": {
    "id": "string",
    "conversationId": "string",
    "senderId": "string",
    "content": "string",
    "createdAt": "2026-05-27T10:10:00.000Z"
  }
}
```

**Error responses**

- `400` `VALIDATION_ERROR` — invalid/missing `content`.
- `401` `UNAUTHORIZED` — missing/invalid token.
- `403` `FORBIDDEN` — caller is not a participant in the conversation.
- `404` `RESOURCE_NOT_FOUND` — conversation does not exist.

`senderId` is always derived from the authenticated user, never from the body.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  }
}
```

## AI Assistant & Tutor (Weeks 6-7)

### Conversation types

`POST /conversations` accepts an optional `type: 'user' | 'assistant' | 'tutor'`
(default `'user'`). `assistant` and `tutor` are single-participant (the creator)
and **get-or-create, one per user** — posting `{ type: 'assistant' }` or
`{ type: 'tutor' }` returns the existing one if present. `participantIds` is
ignored for these types.

### New shared types

```ts
type Citation = {
  chunkId: string
  documentId: string
  documentName: string
  text: string
  score?: number
}

// Present only on tutor answers.
type Message = { /* ...existing... */; citations?: Citation[] }

type DocumentStatus = 'pending' | 'ready' | 'failed'
type KnowledgeDocument = {
  id: string
  name: string
  mimeType: string
  status: DocumentStatus
  chunkCount: number
  createdAt: string // ISO 8601
}
```

### `POST /ai/conversations/:id/messages` (SSE)

Posts a user message to an `assistant` or `tutor` conversation and streams the
reply. Persists the user message, runs the **LangGraph agent** (which may call
retrieval + user-data tools), streams tokens and tool progress, then persists the
assistant message. `400` if the conversation is not `assistant`/`tutor`; `403` if
the caller is not a participant.

**Response:** `text/event-stream`. Each line is `data: <json>\n\n` where the
JSON is an `AssistantSseEvent`:

```ts
type AssistantSseEvent =
  | { type: 'user_message'; message: Message }
  | { type: 'token'; value: string }
  | { type: 'status'; state: 'thinking' | 'tool_call' }
  | { type: 'tool_call'; tool: string; label: string } // a tool started (Week 8)
  | { type: 'tool_result'; tool: string } // a tool finished (Week 8)
  | { type: 'done'; messageId: string; citations?: Citation[] }
  | { type: 'error'; code: string; message: string }
```

`tool_call` / `tool_result` announce the agent's progress; the FE renders `label`
(e.g. "Searching your documents…"). Tutor answers carry `citations` on the `done`
event (and on the persisted `Message`). On empty retrieval the tutor returns a
fixed refusal with no citations (never hallucinates).

### `POST /knowledge/documents` (multipart)

Upload a document (`multipart/form-data`, field `file`; `.md`/`.txt`). Ingests
synchronously (chunk -> embed -> store) and returns the document with its final
status. Re-uploading identical content is deduped (returns the existing `ready`
document; no duplicate chunks).

- `201` -> `KnowledgeDocument` (status `ready`, or `failed` on an ingestion-infra
  error).
- `400` `VALIDATION_ERROR` — unsupported/empty file.
- `401` — missing/invalid token.

### `GET /knowledge/documents`

Returns the authenticated user's documents (newest first).

- `200` -> `KnowledgeDocument[]`.

### `DELETE /knowledge/documents/:id`

Removes a document and its chunks. Scoped to the owner (another user's id -> `404`).

- `200` -> `{ id: string }`.
- `404` `RESOURCE_NOT_FOUND` — not found / not owned.

## Contract Changes

### Week 3

- Login request body changed from `{ email, password }` to `{ userId }`.
- Error envelope changed from `{ error: string }` to
  `{ error: { code, message, details? } }`.
- Added `POST /conversations` to the documented endpoint surface.
- Added `limit` query parameter documentation for message pagination.

### Week 4 (NestJS + JWT auth)

- Added `POST /auth/signup` (`{ email, password, name }` -> `{ token, user }`);
  duplicate email -> `409` (`EMAIL_ALREADY_EXISTS`).
- `POST /auth/login` body changed back from `{ userId }` to `{ email, password }`;
  bad credentials -> `401`.
- Added `GET /me` returning the authenticated user.
- Auth tokens are now real signed JWTs; all chat endpoints require
  `Authorization: Bearer <token>` and return `401` when it is missing/invalid.
- Added authorization rule: cross-user conversation access -> `403`
  (`FORBIDDEN`); Week 3 used `404` for the non-member case.
- Removed `POST /auth/logout`: JWT is stateless, so logout is a client-side token
  clear with no server endpoint.
- Passwords are hashed (bcrypt) server-side and never returned.
- `Conversation.title` is now optional: direct (1:1) conversations store no
  title and the frontend derives a per-viewer display name from participants.
- Added `GET /users` (authenticated) returning all users in the public shape,
  used by the frontend to pick participants for a new conversation.

### Week 5 (MongoDB persistence)

- **No request or response shape changes.** Storage moved from in-memory stores
  to MongoDB (Mongoose); every endpoint above behaves identically.
- `Conversation.updatedAt` is now derived from the stored `lastMessageAt`
  (falling back to `createdAt` for a conversation with no messages yet); the wire
  field name and ISO-8601 format are unchanged.
- Cursor pagination is now an index-backed keyset over MongoDB. The cursor stays
  an opaque string; clients still pass back `nextCursor` verbatim.
- Sending a message updates the message and its conversation's `lastMessageAt` /
  `lastMessagePreview` atomically (single transaction), so the conversation list
  never drifts from the latest message.
- Data now persists across server restarts.

### Week 6 (AI assistant mode)

- `POST /conversations` gains optional `type: 'user' | 'assistant'` (default
  `'user'`); `assistant` is get-or-create, one per user.
- Added `POST /ai/conversations/:id/messages` — SSE stream of `AssistantSseEvent`
  (token deltas + `done`/`error`); persists user + assistant messages.

### Week 7 (AI tutor / RAG)

- `type` union extends to include `'tutor'` (also get-or-create, one per user).
- `Message` gains optional `citations: Citation[]` (tutor answers only); the
  `done` SSE event gains optional `citations`.
- Added `POST /knowledge/documents` (multipart upload, returns `KnowledgeDocument`),
  `GET /knowledge/documents` (list), `DELETE /knowledge/documents/:id`
  (`-> { id }`).
- The tutor reuses `POST /ai/conversations/:id/messages`; the server branches on
  `conversation.type`.

### Week 8 (LangGraph agent)

- `AssistantSseEvent` gains `tool_call` (`{ tool, label }`) and `tool_result`
  (`{ tool }`) — the agent's tool progress; the FE renders `label`.
- No endpoint or request-shape changes: both `assistant` and `tutor` now run
  through one LangGraph agent behind the same SSE endpoint. Agent state is
  checkpointed in MongoDB (`thread_id = conversationId`) so conversations resume
  after a restart.
