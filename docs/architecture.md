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

Mail and AI are provider boundaries:

- `auth/mail.provider.js` sends email only when SMTP is configured.
- `conversations/ai.provider.js` and `roadmaps/roadmap.provider.js` are placeholders for a future AI service contract.

No fake official public data, fake NCS content, or fake citations should be generated.
