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

## Occupation Data

`GET /occupations`, `/interests`, roadmaps, and AI Q&A all read from the
`Occupation`/`Skill`/`Qualification`/`Major`/`Source` tables, which start
empty. Load real data with:

```bash
npm run seed:occupations -- data/occupations.template.json
```

Copy `data/occupations.template.json`, fill it with real occupation data from
an authoritative source (NCS, 워크넷, 커리어넷, etc.), then run the command
above against your file. See [Data import](docs/data-import.md) for the file
format. This does not run automatically — it must be invoked manually.

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

## Deployment

### GitHub Secrets

Configure these repository secrets:

| Secret        | Value                                                               |
| ------------- | ------------------------------------------------------------------- |
| `EC2_HOST`    | EC2 public hostname or IP address                                   |
| `EC2_USER`    | Ubuntu SSH user                                                     |
| `EC2_SSH_KEY` | Private key whose public key is in the EC2 user's `authorized_keys` |
| `DEPLOY_PATH` | Absolute path to the repository on EC2                              |

### First-time server setup

The EC2 user must have `git`, `curl`, Docker Engine, and Docker Compose v2 installed, permission to run Docker, SSH access from GitHub Actions, and read access to this repository.

```bash
git clone <repository-url> <deploy-path>
cd <deploy-path>
git switch main
cp .env.example .env
$EDITOR .env
docker compose up -d --build
curl --fail https://minki-api.duckdns.org/api/v1/health
```

Set `DEPLOY_PATH` to the same absolute `<deploy-path>`. Keep the production `.env` only on EC2 and never commit it. For a private repository, configure an EC2 deploy key or another read-only Git credential so `git fetch origin main` works non-interactively.

### Manual deployment

Run from `DEPLOY_PATH` on EC2:

```bash
git fetch origin main
git reset --hard origin/main
docker compose build
docker compose up -d
curl --fail https://minki-api.duckdns.org/api/v1/health
```

This does not remove the named PostgreSQL volume or overwrite the ignored production `.env`.

### CI/CD

Pull requests and pushes to `main` run `npm ci`, Prisma validation/client generation, linting, formatting checks, tests, Compose validation, and a Docker image build. Tests use injected repositories and providers, so CI does not start an unnecessary PostgreSQL service container.

After CI succeeds for a `main` push, the deploy job connects to EC2 over SSH, saves the current commit, resets the server checkout to `origin/main`, builds and starts the Compose services, then retries the public health endpoint. If health checks keep failing, it prints `docker compose ps` and application logs, resets to the saved commit, rebuilds, and starts the previous version before failing the workflow. Prisma migrations run when the application container starts; rollback does not reverse database migrations, so production migrations must remain backward-compatible with the previous application version.

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
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` (set
  `SMTP_HOST`, `SMTP_PORT`, and `SMTP_FROM` together; `SMTP_USER` and `SMTP_PASSWORD` are a pair)
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
