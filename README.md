# Minki Server

Express backend for a source-based major and career exploration service.

## Stack

- Node.js 24 LTS, npm 11
- JavaScript ESM
- Express 5
- PostgreSQL, Prisma, pgvector-ready Docker image
- Zod, Pino, Helmet, CORS, express-rate-limit
- Vitest, Supertest, ESLint, Prettier

## Local Setup

```bash
cp .env.example .env
npm ci
npm run prisma:generate
npm run prisma:migrate:dev
npm run dev
```

Health:

- `GET http://localhost:3000/api/v1/health`
- `GET http://localhost:3000/api/v1/health/db`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi.json`

Production-style local start:

```bash
npm start
```

## Docker

```bash
docker compose up --build -d
docker compose ps
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/health/db
docker compose down
```

If Docker Compose v2 is unavailable, use `docker-compose` for the same commands.

PostgreSQL uses a named volume and is not published to the host by default.

## Verification

```bash
npm ci
npm run lint
npm run format:check
npm test
npm run prisma:validate
npm run prisma:generate
docker compose config
docker build --tag minki-server:verify .
```

## Environment Variables

Required:

- `NODE_ENV`: `development`, `test`, or `production`
- `PORT`: application port
- `DATABASE_URL`: PostgreSQL connection string
- `CORS_ORIGIN`: comma-separated allowed origins
- `LOG_LEVEL`: Pino log level
- `ALLOWED_EMAIL_DOMAINS`: comma-separated school email domains

Required in production:

- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`

Optional:

- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN`
- `EMAIL_VERIFICATION_EXPIRES_IN`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- `AI_SERVICE_URL`, `AI_SERVICE_API_KEY`, `AI_SERVICE_TIMEOUT_MS`
- Docker-only: `APP_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

SMTP and AI service variables are optional. If they are not configured, the server still starts; related features return clear service errors instead of generating fake official data.

## Structure

```text
src/
  app.js
  server.js
  config/
  common/
  modules/
    auth/
    users/
    schools/
    catalog/
    occupations/
    interests/
    dashboard/
    roadmaps/
    conversations/
    health/
  routes/
```

Docs:

- [Architecture](docs/architecture.md)
- [Conventions](docs/conventions.md)
- [Definition of Done](docs/definition-of-done.md)
- [Requirements](docs/requirements.md)
- [Database](docs/database.md)
- [API](docs/api.md)
- [Data import](docs/data-import.md)
- [Open questions](docs/open-questions.md)
