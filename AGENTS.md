# Codex Project Instructions

Use these shared documents as the source of truth:

- [Architecture](docs/architecture.md)
- [Conventions](docs/conventions.md)
- [Definition of Done](docs/definition-of-done.md)
- [Requirements](docs/requirements.md)
- [Database](docs/database.md)
- [API](docs/api.md)
- [Open questions](docs/open-questions.md)

## Rules

1. Check relevant files, directory structure, current branch, and `git status` before work.
2. Preserve existing user changes. Do not revert unrelated edits.
3. Use JavaScript ESM. Do not convert to TypeScript.
4. Follow the feature module structure under `src/modules/<feature>`.
5. Do not invent policies not present in requirements. Record unresolved policies in `docs/open-questions.md`.
6. Do not create fake official public data, fake NCS data, or fake citations.
7. Keep secrets out of files, logs, API responses, tests, and terminal output.
8. After changes, run `npm run lint`, `npm run format:check`, and `npm test`. Run Prisma and Docker verification when those areas change.
9. Do not commit or push unless the user explicitly asks.
10. Report changed files, decisions, validation results, skipped validation, and remaining risks.

Use `npm.cmd` on Windows if `npm` script execution is blocked. If Docker Compose v2 is unavailable, use `docker-compose` and report that fallback.
