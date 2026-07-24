# Architecture

This project is an Express 5 modular monolith using JavaScript ESM.

## Entry Points

- `src/app.js` builds the Express app only: middleware, OpenAPI, route mounting, 404, and global error handling.
- `src/server.js` validates environment variables, starts the HTTP server, and performs graceful shutdown including Prisma disconnect.

## Directories

- `src/config`: environment validation and shared Prisma Client lifecycle.
- `src/common`: cross-cutting errors, middleware, response helpers, logger, security helpers, pagination, and small shared domain constants.
- `src/modules`: feature modules. Current modules are `auth`, `users`, `schools`, `catalog`, `occupations`, `interests`, `dashboard`, `roadmaps`, `conversations`, and `health`.
- `src/routes`: API version composition and OpenAPI document.
- `prisma`: Prisma schema and migrations.
- `docs`: requirements, API, database, import contracts, conventions, and open questions.

## Module Layers

- `*.routes.js`: URL, HTTP method, middleware, and controller wiring.
- `*.controller.js`: request/response handling and common response formatting.
- `*.service.js`: business rules, ownership checks, provider orchestration, and transaction boundaries.
- `*.repository.js`: Prisma data access.
- `*.schema.js`: Zod validation for body, params, and query.

Do not create every layer by default. Add only the files a module needs.

## Data Access

All feature code uses the shared Prisma Client from `src/config/prisma.js`. The client is cached on `globalThis` for development reloads and disconnected during server shutdown.

PostgreSQL is the primary database. Docker uses `pgvector/pgvector:0.8.1-pg17-bookworm`; `SourceChunk.embedding` is nullable pgvector-backed data for future retrieval use.

## External Providers

AI is a provider boundary, called through the shared client in `common/ai/ai-client.js`
(`AI_SERVICE_URL`/`AI_SERVICE_API_KEY`/`AI_SERVICE_TIMEOUT_MS`):

- `conversations/ai.provider.js` calls `POST /api/chat` and maps each returned source into a
  `Source` row (via `common/ai/resolve-source.js`) so chat citations always resolve to a real id.
- `roadmaps/roadmap.provider.js` calls `POST /api/roadmap` and maps the returned timeline into
  `RoadmapSemester`/`RoadmapItem` records, each linked to a resolved `Source`.
- If the AI service is not configured, or the call fails, no fake official content or citations
  are generated — the request fails with a clear error instead.

No fake official public data, fake NCS content, or fake citations should be generated.
