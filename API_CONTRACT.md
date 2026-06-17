# Frontend Chat MVP — API Contract (Week 2 -> Week 4)

## Related Planning Docs

- Execution rules and acceptance criteria: [`CLAUDE.md`](./CLAUDE.md)
- Feature structure and data flow: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## Stability Policy

This contract is the backend target for the current week's implementation
(Week 4: NestJS + JWT auth).

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

**Success response (200)**

```json
{
  "id": "string",
  "name": "string",
  "email": "string"
}
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

Headers:
- `Location: /conversations/:id`

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
