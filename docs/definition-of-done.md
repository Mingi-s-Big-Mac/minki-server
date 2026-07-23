# Definition of Done

A change is complete only when:

- Requirements are implemented in the existing structure.
- `npm run lint` succeeds.
- `npm run format:check` succeeds.
- `npm test` succeeds.
- Prisma schema validation and client generation succeed when Prisma changes.
- Migration files exist for database schema changes.
- `docker compose config` or `docker-compose config` succeeds when Docker configuration changes.
- Docker image build succeeds when runtime code or Docker files change.
- README, docs, OpenAPI, `.env.example`, CI, and scripts agree.
- No unused dependencies or unnecessary files remain.
- No secrets or sensitive data are committed, logged, or returned by APIs.
- No fake official source data, fake NCS content, or fake citations are created.
- No commit or push is performed unless explicitly requested.
