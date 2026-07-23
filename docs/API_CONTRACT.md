# Chat MVP — API Contract

## Related Planning Docs

- Execution rules and acceptance criteria: [`CLAUDE.md`](../CLAUDE.md)
- Feature structure and data flow: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## Stability Policy

This file documents the current HTTP and SSE contract shared by the frontend
and backend. `@chat/contract` is the TypeScript source of truth.

- Keep endpoint shapes stable.
- If a change is required, update this file in the same PR so it always reflects
  the live contract.

## Authentication

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
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  previousEmails: string[]; // read-only history, newest last, capped at 10 (FIFO)
  subscription: Subscription; // read-only; only a verified webhook grants `pro`
};
// Note: the password is hashed server-side (bcrypt) and is never part of `User`
// or any response body.

type PlanKey = "free" | "pro";
type SubscriptionStatus = "none" | "active" | "failed";

type Subscription = {
  planKey: PlanKey;
  status: SubscriptionStatus;
};

type Plan = {
  key: PlanKey;
  name: string;
  priceAmount: number; // minor units (e.g. cents); source of truth is MongoDB
  currency: string; // ISO 4217, e.g. "USD"
};

type ListPlansResponse = { plans: Plan[] };
type CreatePaymentSessionRequest = { planKey: PlanKey };
type PaymentSessionResponse = { redirectUrl: string };

type RequestEmailChangeRequest = { newEmail: string };
type RequestEmailChangeResponse = { status: "confirmation_sent" };
type ConfirmEmailChangeRequest = { token: string };

type SignupRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
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
  type: "user" | "assistant" | "tutor";
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
  "firstName": "string",
  "lastName": "string"
}
```

**Success response (201)**

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "avatarUrl": null,
    "previousEmails": []
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
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "avatarUrl": null,
    "previousEmails": []
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
  "avatarUrl": "https://cdn.example/avatars/<id>?v=<uuid> | null",
  "previousEmails": []
}
```

`avatarUrl` is the public CDN URL of the user's avatar, or `null` when none is
set. The `?v=<uuid>` cache-buster changes on every upload so replacements are
served immediately; the raw storage key never leaves the API.

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
size, stores the object at the fixed per-user key `avatars/<userId>` (a replace
overwrites it in place, so there is no old object to clean up), and points the
profile at the new `?v=<uuid>` URL.

**Success response (200)**

```json
{
  "avatarUrl": "https://cdn.example/avatars/<id>?v=<uuid>"
}
```

**Error response (400)** — `VALIDATION_ERROR` for a missing file, unsupported
type, or a file over 5 MB.

#### `DELETE /me/avatar`

Clear the avatar from the profile and best-effort delete the stored object.

**Success response (200)**

```json
{
  "avatarUrl": null
}
```

### Change email

Email changes go through a confirmed two-step flow, never a plain profile update.
The request is made by the logged-in user; the confirmation link is
token-authenticated and works even when opened logged-out or long afterward.

#### `POST /me/email`

Requires a bearer token. Validates the new email (format, not the current one,
not taken), signs a short-lived JWT `{ userId, newEmail }` (separate
`EMAIL_CHANGE_TOKEN_SECRET`; no server-side token storage), and emails a
confirmation link to the new address.

**Request body**

```json
{ "newEmail": "string" }
```

**Success response (200)**

```json
{ "status": "confirmation_sent" }
```

**Errors** — `400 VALIDATION_ERROR` (bad format, or same as current);
`409 EMAIL_ALREADY_EXISTS` (already taken by another user).

#### `POST /auth/email/confirm`

Public — the signed token is the credential, so no session is required. Verifies
the token, re-checks the address is still free, atomically sets the new email and
pushes the old one onto `previousEmails` (FIFO, max 10). `old === new` is a no-op.

**Request body**

```json
{ "token": "string" }
```

**Success response (200)** — the updated `User`.

**Errors** — `401 UNAUTHORIZED` (invalid or expired token);
`409 EMAIL_ALREADY_EXISTS` (address taken between request and confirm).

### Password reset (unauthenticated OTP)

A logged-out user proves inbox control with an emailed one-time code, then sets a
new password. Both endpoints are public. `RESET_CODE_LENGTH` (shared in
`@chat/contract`) is the code length (6 digits).

#### `POST /auth/password/forgot`

Public. **Always returns the same generic status** (no account enumeration). If the
account exists, generates a numeric code, stores its bcrypt hash in the reset-code
store with a ~10-minute TTL (one active code per user, overwriting any prior), and
emails it through the email seam. No email is sent for unknown addresses.

**Request body**

```json
{ "email": "string" }
```

**Success response (200)**

```json
{ "status": "reset_code_sent" }
```

**Errors** — `400 VALIDATION_ERROR` (missing/invalid email format). Unknown accounts
still return `200` with the same body.

#### `POST /auth/password/reset`

Public. Verifies the code (matches, not expired, not already used), sets the new
password, consumes the code (single-use), and **invalidates all existing sessions**
by bumping the user's `tokenVersion`.

**Request body**

```json
{ "email": "string", "code": "string", "newPassword": "string" }
```

**Success response (200)**

```json
{ "status": "password_reset" }
```

**Errors** — `400 VALIDATION_ERROR` (bad code length/format or too-short password);
`401 UNAUTHORIZED` — one **opaque** message for every failure (unknown email, no
active code, expired, wrong code, already used) so confirm can't enumerate accounts
either. After success, any token issued before the reset also returns `401`.

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

## AI Assistant & Tutor

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
  | { type: 'tool_call'; tool: string; label: string } // a tool started
  | { type: 'tool_result'; tool: string } // a tool finished
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

## Subscriptions & Billing (Pro plan)

A user upgrades from `free` to `pro` through a payment provider's hosted checkout.
Plan prices live in MongoDB (never hardcoded), so changing a price is a DB edit.
The subscription grant is applied **only** by a signature-verified webhook, never
by the redirect back to the app.

Flow: Account page → `POST /users/plans/payment-session` → redirect to the
provider's hosted session → user pays → provider redirects to
`/account/upgrade-success|upgrade-cancelled` (API may 302 to the web app) **and**
(asynchronously) calls the webhook → the webhook enqueues a job → a worker
verifies the amount and grants `pro`. The Account UI polls `GET /me` until Pro
is active or the poll budget expires.

### `GET /users/plans`

Authenticated. Lists the available plans (from MongoDB).

**Success response (200)** — `ListPlansResponse` (`{ plans: Plan[] }`).

### `POST /users/plans/payment-session`

Authenticated. Starts a hosted checkout for the given plan and returns the URL to
redirect the browser to. Does **not** change the subscription.

**Request body** — `CreatePaymentSessionRequest`

```json
{ "planKey": "pro" }
```

**Success response (200)** — `PaymentSessionResponse`

```json
{ "redirectUrl": "https://checkout.example/session/..." }
```

**Errors** — `400 VALIDATION_ERROR` (unknown `planKey`, or the plan is not
purchasable, e.g. `free`); `401 UNAUTHORIZED` (missing/invalid token);
`404` (plan not found); `409 SUBSCRIPTION_ALREADY_ACTIVE` (caller already has an
active subscription for that `planKey`).

### `POST /webhooks/payments`

**Public** (no JWT). Called by the payment provider. Authenticity is enforced by
verifying the provider signature (`signature` header — Rapyd HMAC over the raw
body; local provider uses `sha256(JWT_SECRET)` hex, no extra env); an invalid
or missing signature → `401`. A verified event is pushed to a queue and processed
asynchronously (retries + dead-letter queue), so this endpoint returns quickly and
idempotently. Active Pro is never overwritten by a later `payment_failed` for
another checkout attempt.

**Success response (200)**

```json
{ "received": true }
```

Returns `{ "received": true }` even for a duplicate delivery or an
unrecognized-but-verified event type (idempotent ack). The subscription grant is
applied by the worker only after an amount/currency check against the DB plan; a
mismatched amount is recorded (so it won't retry) and rejected without a grant.
