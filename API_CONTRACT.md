# Frontend Chat MVP — API Contract (Week 2 -> Week 3)

## Related Planning Docs

- Execution rules and acceptance criteria: [`CLAUDE.md`](./CLAUDE.md)
- Feature structure and data flow: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## Stability Policy

This contract is the backend target for Week 3 implementation.

- Keep endpoint shapes stable.
- If a change is required, update this file in the same PR and add a short "Contract Changes" note at the end.

## Base Types

```ts
type User = {
  id: string;
  name: string;
  email: string;
};

type Conversation = {
  id: string;
  title: string;
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

### `POST /auth/login`

**Request body**

```json
{
  "userId": "string"
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

**Error response (4xx/5xx)**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}
```

### `POST /auth/logout`

Clears the server-side session for the authenticated caller. The frontend owns
its own React user state; this endpoint is the only way it tears down the
session, so the two are never reset independently.

**Request body**

_None._

**Success response (204)**

_No content._

### `GET /conversations`

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

**Error response (4xx/5xx)**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or malformed Authorization header"
  }
}
```

### `POST /conversations`

**Request body**

```json
{
  "title": "string",
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

**Error response (4xx/5xx)**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Conversation not found"
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

**Error response (4xx/5xx)**

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

- Login request body changed from `{ email, password }` to `{ userId }`.
- Error envelope changed from `{ error: string }` to
  `{ error: { code, message, details? } }`.
- Added `POST /conversations` to the documented endpoint surface.
- Added `limit` query parameter documentation for message pagination.
