# Conventions

## JavaScript와 ESM

- Node.js 24와 JavaScript를 사용한다.
- 모든 애플리케이션 코드는 ESM `import`/`export`를 사용한다. CommonJS `require`와 `module.exports`를 사용하지 않는다.
- 로컬 파일 import에는 `.js` 확장자를 명시한다.
- Node 내장 모듈, 외부 패키지, 로컬 모듈 순으로 그룹을 나눈다.
- 기본 export가 요구되는 설정 파일을 제외하고 named export를 우선한다.
- 순환 의존성과 단순 재노출만 하는 불필요한 barrel 파일을 만들지 않는다.

## 명명 규칙

- 디렉터리는 소문자 kebab-case를 사용한다.
- 기능 파일은 `<feature>.<role>.js` 형식을 사용한다. 예: `health.service.js`.
- 공통 유틸리티 파일은 역할이 드러나는 kebab-case를 사용한다. 예: `error-handler.js`.
- 테스트 파일은 `<subject>.test.js` 형식을 사용한다.
- 변수와 함수는 camelCase, 클래스는 PascalCase를 사용한다.
- 환경변수는 UPPER_SNAKE_CASE를 사용한다.

## API 경로와 계층

- 공개 API는 `/api/v1`처럼 명시적인 버전 prefix를 사용한다.
- 경로 segment는 소문자 kebab-case와 명사 중심으로 작성한다.
- Route는 경로 연결, controller는 HTTP 변환, service는 유스케이스, repository는 데이터 접근만 담당한다.
- Controller나 route에서 Prisma를 직접 사용하지 않는다.
- 명세에 없는 endpoint를 편의상 추가하지 않는다.

## 응답과 오류

- 성공 응답은 `{ "success": true, "data": ... }` 형식을 사용하고 필요한 경우에만 `meta`를 추가한다.
- 오류 응답은 `{ "success": false, "error": { "code", "message" }, "requestId" }` 형식을 사용한다.
- 예상 가능한 오류는 `AppError` 계열로 표현하고 전역 오류 미들웨어에 전달한다.
- 운영 환경에서는 stack trace, 내부 주소, DB 오류 원문과 구현 세부정보를 응답에 포함하지 않는다.
- 404, validation, rate limit, JSON parse 오류도 공통 오류 형식을 유지한다.

## Zod 검증

- 환경변수와 신뢰할 수 없는 외부 입력은 사용 전에 Zod로 검증한다.
- 기능 입력 schema는 해당 기능 모듈의 `<feature>.schema.js`에 둔다.
- 검증 실패 메시지에 비밀번호, 토큰, 원본 DB URL 같은 실제 입력값을 포함하지 않는다.
- service는 검증과 정규화가 끝난 값을 받도록 한다.
- 동일한 규칙을 여러 schema에 복제해야 할 때만 작은 공통 schema를 추출한다.

## Prisma

- Prisma Client는 `src/config/prisma.js`의 공유 인스턴스만 사용한다.
- Prisma Client를 controller, service 또는 repository에서 새로 생성하지 않는다.
- Prisma 쿼리는 기능 repository에 두며, 단순 health query처럼 repository가 불필요한 인프라 확인은 예외로 한다.
- Raw SQL이 필요하면 parameterized query나 Prisma tagged template을 사용한다. 동적 문자열을 unsafe query에 전달하지 않는다.
- Prisma schema 변경에는 검토 가능한 migration을 함께 만든다. 단, 기능명세서 확정 전에는 도메인 모델이나 빈 migration을 만들지 않는다.
- 연결 오류를 API 응답에 그대로 노출하지 않고 안전한 애플리케이션 오류로 변환한다.

## 로그와 민감정보

- 애플리케이션 로그는 Pino와 request-scoped logger를 사용한다. 임시 `console.log`를 남기지 않는다.
- Authorization, Cookie, 비밀번호, 토큰, 세션, API key, DB URL과 접속 자격 증명을 로그에 기록하지 않는다.
- 요청 본문과 전체 query string을 기본 요청 로그에 포함하지 않는다.
- 오류를 기록할 때도 민감정보가 포함될 수 있는 원문 대신 안전한 오류 이름·코드와 request ID를 우선한다.
- API 응답, 테스트 snapshot, CI 출력에도 실제 비밀값을 포함하지 않는다.

## 환경변수와 비밀값

- 런타임 환경변수는 `src/config/env.js`에서 서버 시작 전에 검증한다.
- 새 환경변수를 추가하면 `.env.example`, README 환경변수 표와 Docker/CI 설정을 함께 검토한다.
- `.env`와 실제 자격 증명 파일은 Git에 추가하지 않는다.
- `.env.example`에는 공개 가능한 로컬 예시값만 사용한다.
- 코드에 운영 비밀값, 내부 호스트, 개인 토큰을 하드코딩하지 않는다.

## 테스트

- Vitest와 Supertest를 사용한다.
- API 테스트는 가능한 한 `createApp()`을 직접 사용하고 고정 포트를 열지 않는다.
- 외부 DB가 필요 없는 테스트는 repository 또는 DB 확인 경계를 대체해 안정적으로 실행한다.
- 실제 DB 동작을 검증하는 통합 테스트는 단위/API 테스트와 분리하고 필요한 환경과 정리 절차를 명시한다.
- 성공 경로뿐 아니라 validation, 404, 전역 오류, 인프라 실패와 민감정보 비노출을 검증한다.
- 테스트가 생성한 서버, 연결, 타이머와 데이터는 테스트 종료 전에 정리한다.

## 커밋과 브랜치

- Codex와 Claude Code는 사용자가 명시적으로 요청한 경우에만 commit 또는 push를 수행한다.
- 커밋을 요청받으면 한 커밋에 하나의 논리적 변경을 담고, 검증하지 않은 파일을 포함하지 않는다.
- 별도 팀 규칙이 없다면 branch 이름은 `feat/`, `fix/`, `chore/`, `docs/` prefix와 짧은 kebab-case 설명을 사용한다.
- 별도 팀 규칙이 없다면 commit 제목은 `feat:`, `fix:`, `docs:`, `test:`, `chore:`처럼 변경 의도가 드러나게 작성한다.
- 사용자 변경을 덮어쓰거나 무관한 변경을 되돌리지 않으며, 강제 push와 파괴적 Git 명령은 명시적 승인 없이 사용하지 않는다.
