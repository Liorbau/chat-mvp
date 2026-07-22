# Chat MVP

A full-stack chat app with human chat, an AI assistant, and a citation-backed
RAG tutor.

## Structure

- `apps/web` — React, Vite, Tailwind CSS, and Vitest.
- `apps/api` — NestJS, MongoDB, JWT auth, LangGraph, and Vitest.
- `packages/contract` — shared API and domain types.

## Main Features

- Direct chat with optimistic sending and cursor pagination.
- JWT authentication, profile editing, avatars, email changes, and password reset.
- LangGraph assistant and tutor with SSE streaming and tool progress.
- Per-user document retrieval with Atlas Vector Search and citations.

## Local Setup

1. Install dependencies: `npm install`
2. Copy `apps/api/.env.example` to `apps/api/.env` and fill in its values.
3. Start local services: `docker compose up -d`
4. Create the Atlas vector index from `apps/api/atlas/vector-index.json`.
5. Seed the database: `npm run seed -w @chat/api`
6. Start the API: `npm run dev:api`
7. Start the web app: `npm run dev:web`

The API runs at `http://localhost:4000`; the web app runs at
`http://localhost:5173`. Tutor mode requires MongoDB Atlas because local MongoDB
does not provide Atlas Vector Search.

## Checks

```bash
npm run verify:precommit
```

The API tests require the local MongoDB replica set from `docker-compose.yml`.

## Documentation

- `AGENTS.md` — agent workflow and human decision points.
- `CLAUDE.md` — implementation rules and project history.
- `ARCHITECTURE.md` — modules, data flows, and design decisions.
- `API_CONTRACT.md` — HTTP and SSE contract.
- `docs/FRONTEND_CONVENTIONS.md` — frontend structure and conventions.
