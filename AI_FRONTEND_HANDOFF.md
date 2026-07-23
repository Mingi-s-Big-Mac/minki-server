# minki-server 연동 가이드 (프론트엔드 / AI)

백엔드(`minki-server`) 기준 최신 상태 정리. Base URL: `http://<서버주소>/api/v1`

---

## 공통 사항

### 응답 포맷

**성공**

```json
{ "success": true, "data": { ... }, "meta": { ... } }
```

`meta`는 있을 때만 포함 (페이지네이션 등).

**실패**

```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "요청 값이 올바르지 않습니다." },
  "requestId": "..."
}
```

검증 실패(400)는 `error.details`에 `[{ path, message }]` 배열이 추가로 붙음.

### 인증 (2026-07-24 변경: 해커톤 일정상 이메일 인증/refresh 로테이션 제거, 단일 토큰으로 단순화)

- 방식: `Authorization: Bearer <accessToken>` 헤더. 쿠키 사용 안 함.
- Access token은 JWT, 기본 만료 7일(`ACCESS_TOKEN_EXPIRES_IN`). **Refresh token 없음** — 만료되면 그냥 재로그인.
- 회원가입 시 이메일 인증 코드 발송/확인 단계 없음. `POST /auth/sign-up` 한 번 호출로 계정 생성 + 토큰 발급까지 끝남.
- 401 공통 코드: `UNAUTHORIZED` (토큰 없음/만료/위조) → 프론트에서 이 코드 잡히면 로그인 화면으로 리다이렉트.

### 헬스체크

- `GET /health` — 서버 자체 살아있는지 확인 (`{ status, timestamp, uptimeSeconds }`). 인증 불필요.
- `GET /health/db` — DB 연결까지 확인 (`{ status: "ok", database: "reachable" }`, 연결 실패 시 에러 응답). 인증 불필요.
- Docker Compose 헬스체크도 이 `/health` 엔드포인트를 그대로 사용 중.

### 문서

- Swagger UI: `GET /docs`
- OpenAPI JSON: `GET /openapi.json`
- 요청/응답 스키마 상세는 여기서 1차로 확인. 이 문서는 흐름/주의사항 위주.

### Rate limit

- 일반 API: 전역 rate limiter 적용.
- `POST /auth/sign-in`: 더 빡빡한 limiter (분당 10회).

---

## 프론트엔드 작업

### 1. 인증 플로우 (순서 고정)

1. `POST /auth/sign-up` `{ email, password(8자+), nickname, grade, majorText, schoolId?, majorId? }` → 이메일 도메인이 학교 화이트리스트에 없으면 `EMAIL_DOMAIN_NOT_ALLOWED`(400), 이미 가입된 이메일이면 `EMAIL_ALREADY_EXISTS`(409). 성공 시 `{ accessToken, user }` 바로 반환 (이메일 인증/별도 로그인 불필요).
2. `POST /auth/sign-in` `{ email, password }` → 동일하게 `{ accessToken, user }`.
3. 로그아웃: `POST /auth/sign-out` → 서버 상태 없음(stateless JWT). 클라이언트에 저장된 토큰만 지우면 됨.
4. 로그인 상태 확인: `GET /auth/me` (Bearer 필요).
5. 토큰 만료(7일) 시 refresh 없이 그냥 재로그인.

### 2. 화면별 API 매핑

| 화면                       | 엔드포인트                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 회원가입/로그인            | 위 인증 플로우                                                                                                                                                |
| 내 정보                    | `GET/PATCH /users/me`, `PATCH /users/me/password`, `DELETE /users/me`                                                                                         |
| 마이페이지 통계            | `GET /users/me/stats`, `GET /users/me/activities`                                                                                                             |
| 학교 검색(가입 시)         | `GET /schools`                                                                                                                                                |
| 카탈로그(필터용)           | `GET /catalog/categories`, `/catalog/skills`, `/catalog/qualifications`, `/catalog/majors`                                                                    |
| 통합 검색 자동완성         | `GET /search/suggestions`                                                                                                                                     |
| 직업 목록/상세             | `GET /occupations`, `GET /occupations/:occupationId`                                                                                                          |
| 직업 비교                  | `GET /occupations/compare?ids=id1,id2` (최소 2개 이상 id)                                                                                                     |
| 관심 직업                  | `GET /interests/occupations`, `POST/DELETE /interests/occupations/:occupationId`                                                                              |
| 대시보드 홈                | `GET /dashboard`                                                                                                                                              |
| 로드맵 목록/상세/생성/삭제 | `POST/GET /roadmaps`, `GET/DELETE /roadmaps/:roadmapId` — **주의: 현재 생성 호출 시 항상 503 에러 (아래 AI 섹션 참고)**                                       |
| AI 대화                    | `POST/GET /conversations`, `GET/DELETE /conversations/:conversationId`, `POST /conversations/:conversationId/messages` — **동일하게 메시지 전송 시 항상 503** |

### 3. AI 연동 두 화면 프론트 작업 방식

`POST /roadmaps` (로드맵 생성)과 `POST /conversations/:id/messages` (AI 대화 응답)는 **지금 호출하면 항상 아래 에러가 남**:

```json
{
  "success": false,
  "error": { "code": "AI_SERVICE_CONTRACT_UNDEFINED", "message": "..." },
  "requestId": "..."
}
```

(AI 서버 URL도 아직 없으면 `AI_SERVICE_NOT_CONFIGURED`)

→ 지금 할 수 있는 것: 화면 레이아웃, 로딩 상태, 에러 상태(이 두 코드 케이스 포함) UI까지는 미리 구현. 실제 생성 결과 렌더링은 AI 계약 확정 후 붙이면 됨. 이 부분 붙기 전까지 목업 데이터로 진행 가능.

### 4. CORS

배포 시 `CORS_ORIGIN` 환경변수에 프론트 실제 도메인이 등록되어 있어야 함. 로컬 개발 중 CORS 에러 나면 서버 관리자에게 프론트 개발 서버 origin(`http://localhost:xxxx`) 추가 요청.

---

## AI 작업

### 현재 상태: 계약 미정, 미구현

`src/modules/conversations/ai.provider.js`, `src/modules/roadmaps/roadmap.provider.js` 둘 다 스텁이고 호출 시 무조건 에러를 던지는 상태. AI 서버가 아직 없어서 백엔드가 붙일 대상 자체가 없음.

### 결정해야 할 것 (순서대로)

1. **AI 서버를 어떻게 노출할지**: 별도 HTTP 서비스로 띄우고 `AI_SERVICE_URL`(+`AI_SERVICE_API_KEY`)로 minki-server가 호출하는 구조로 이미 설계되어 있음 (`config.aiService.url/apiKey/timeoutMs`, 기본 timeout 5000ms). 이 구조를 그대로 따를지 확정.
2. **로드맵 생성 API 계약**: minki-server가 `POST /roadmaps` 요청을 받으면 넘겨줄 입력값은 이미 정해져 있음 —
   ```json
   { "grade": 1, "major": "컴퓨터공학", "targetOccupationId": "uuid", "currentSkillIds": ["uuid", ...] }
   ```
   여기에 유저 정보(관심 직업, 활동 이력 등)를 백엔드가 추가로 붙여서 AI 서버에 넘길 수 있음 — 뭘 더 붙일지 AI 쪽에서 필요한 입력 스펙 알려주면 백엔드에서 조합 가능. **AI 서버가 응답으로 뭘 내려줄지(로드맵 구조: 단계/기간/추천 스킬 등 JSON 스키마)가 제일 먼저 필요함.**
3. **Q&A(대화) API 계약**: `POST /conversations/:id/messages` 입력은 `{ content: string }` (유저 메시지 텍스트, 최대 4000자). AI 서버가 이걸 받아서 뭘 리턴할지(단일 답변 텍스트 vs 스트리밍 vs 인용 출처 포함 등) 확정 필요.
4. **임베딩/검색 (RAG 쓸 경우)**: DB에 `SourceChunk.embedding` pgvector 컬럼이 이미 준비되어 있지만 **차원 수 미정**. 임베딩 모델 확정되는 대로 알려주면 컬럼 차원 맞춤 (지금은 nullable, 아무 것도 안 채워짐 — 실제 공식 출처 데이터 없이 가짜 콘텐츠/인용 생성 금지 원칙 있음).
5. **정책성 질문 (아직 미정, 결정되면 백엔드에 공유)**:
   - AI 대화 보존 기간 (몇 일/영구 등)
   - 로드맵 재생성/수정 정책 (덮어쓰기 vs 새 버전 생성)

### 계약 확정 후 백엔드가 할 일

`ai.provider.js` / `roadmap.provider.js`를 실제 HTTP 클라이언트로 교체 (`config.aiService.url`로 fetch/axios 호출, `AI_SERVICE_TIMEOUT_MS` 타임아웃 적용). AI 서버 쪽에서 요청/응답 JSON 스키마만 문서로 던져주면 바로 구현 가능한 상태.

---

## 참고

- 에러 코드 전체 목록은 각 모듈 `*.service.js`에서 `AppError` 검색하면 다 나옴.
- 환경변수 전체 목록/의미는 `.env.example` + `src/config/env.js` 참고.
