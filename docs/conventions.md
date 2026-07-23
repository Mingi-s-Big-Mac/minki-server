# Conventions

## JavaScript and ESM

- Use JavaScript with ESM imports and exports.
- Include `.js` extensions for local imports.
- Prefer named exports.
- Do not convert the project to TypeScript.

## Naming

- Directories and files use kebab-case.
- Feature files use `<feature>.<role>.js`, for example `auth.service.js`.
- Variables and functions use camelCase. Classes use PascalCase.
- Environment variables use UPPER_SNAKE_CASE.

## APIs

- Public API routes live under `/api/v1`.
- Use noun-based kebab-case paths.
- Auth and service introduction can be public. User features require authentication.
- Use the shared success and error response format.

## Validation and Errors

- Validate request body, params, and query with Zod before calling services.
- Throw `AppError` for expected failures.
- Production error responses must not expose stack traces, Prisma internals, SQL, paths, tokens, cookies, secrets, or database URLs.

## Prisma

- Use `getPrismaClient()` from `src/config/prisma.js`.
- Put Prisma queries in repositories unless the code is infrastructure-only.
- Use transactions for sign-up, refresh token rotation, password/session invalidation, account deletion, roadmap persistence, and AI message/citation persistence.
- Avoid broad cascade deletes. Prefer soft delete or explicit cleanup.

## Security

- Never store plaintext passwords, email verification codes, access tokens, or refresh tokens.
- Do not log Authorization, Cookie, passwords, token values, API keys, SMTP credentials, or database URLs.
- Do not hardcode allowed school email domains. Use `ALLOWED_EMAIL_DOMAINS`.

## Testing

- Use Vitest and Supertest.
- Do not bind real application ports in tests.
- Do not require local PostgreSQL, SMTP, or AI services for unit tests.
- Use fake repositories or providers for external boundaries.

## Git

- Check `git status` before work.
- Preserve user changes.
- Do not commit or push unless explicitly requested.
- Branch names should be short kebab-case with a useful prefix such as `feat/`, `fix/`, or `agent/`.
