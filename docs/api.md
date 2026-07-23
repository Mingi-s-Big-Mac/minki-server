# API

Base path: `/api/v1`

Public:

- `GET /health`
- `GET /health/db`
- `POST /auth/email-verifications`
- `POST /auth/email-verifications/confirm`
- `POST /auth/sign-up`
- `POST /auth/sign-in`
- `POST /auth/refresh`
- `POST /auth/sign-out`
- `GET /schools`

Authenticated:

- `GET /auth/me`
- `GET /users/me`
- `PATCH /users/me`
- `PATCH /users/me/password`
- `DELETE /users/me`
- `GET /users/me/stats`
- `GET /users/me/activities`
- `GET /catalog/categories`
- `GET /catalog/skills`
- `GET /catalog/qualifications`
- `GET /catalog/majors`
- `GET /search/suggestions`
- `GET /occupations`
- `GET /occupations/:occupationId`
- `GET /occupations/compare?ids=id1,id2`
- `GET /interests/occupations`
- `POST /interests/occupations/:occupationId`
- `DELETE /interests/occupations/:occupationId`
- `GET /dashboard`
- `POST /roadmaps`
- `GET /roadmaps`
- `GET /roadmaps/:roadmapId`
- `DELETE /roadmaps/:roadmapId`
- `POST /conversations`
- `GET /conversations`
- `GET /conversations/:conversationId`
- `DELETE /conversations/:conversationId`
- `POST /conversations/:conversationId/messages`

Success responses use `{ "success": true, "data": {}, "meta": {} }`.
Failure responses use `{ "success": false, "error": { "code": "...", "message": "..." }, "requestId": "..." }`.
