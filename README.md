# Minki Server

해커톤용 “출처 기반 전공·진로 탐색 서비스”의 Express 백엔드입니다. 현재는 공통 서버 환경과 상태 확인 API만 포함하며, 서비스 도메인·인증·사용자 모델은 정의하지 않습니다.

## 요구 사항

- Node.js 24 LTS
- npm 11 이상
- PostgreSQL 17(로컬 실행 시 별도 준비) 또는 Docker

## 로컬 실행

```bash
cp .env.example .env
npm ci
npm run prisma:generate
npm run dev
```

Windows PowerShell에서 npm 스크립트 실행 정책에 막히면 `npm` 대신 `npm.cmd`를 사용합니다. 로컬 Node 프로세스로 실행할 때 `DATABASE_URL`이 가리키는 PostgreSQL은 별도로 접근 가능해야 합니다.

- 애플리케이션 상태: `GET http://localhost:3000/api/v1/health`
- DB 연결 상태: `GET http://localhost:3000/api/v1/health/db`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI 문서: `http://localhost:3000/openapi.json`

운영 실행은 다음 명령을 사용합니다.

```bash
npm start
```

## Docker 실행

Docker Compose는 앱과 pgvector가 포함된 PostgreSQL만 실행합니다. PostgreSQL의 5432 포트는 호스트에 공개하지 않습니다.

```bash
docker compose up --build -d
docker compose ps
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/health/db
docker compose down
```

`docker compose` 플러그인이 연결되지 않은 환경에서는 같은 명령을 `docker-compose`로 실행할 수 있습니다.

데이터는 `postgres_data` named volume에 유지됩니다. 로컬 기본 자격 증명은 개발 편의를 위한 값이므로 공유 환경에서는 `.env`의 `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`를 반드시 변경해야 합니다. 볼륨까지 제거하려는 경우에만 제거 범위를 확인한 뒤 `docker compose down --volumes`를 사용합니다.

## 테스트와 코드 품질

```bash
npm test
npm run test:coverage
npm run lint
npm run format:check
```

테스트는 DB 상태 확인 함수를 대체해 기본 테스트 스위트가 로컬 PostgreSQL에 의존하지 않도록 구성되어 있습니다.

## Prisma

```bash
npm run prisma:generate
npm run prisma:validate
npm run prisma:migrate:dev
npm run prisma:migrate:deploy
npm run prisma:studio
```

현재 Prisma 스키마에는 datasource와 client generator만 있으며 서비스 도메인 모델은 없습니다. Docker PostgreSQL은 최초 데이터 디렉터리 초기화 시 `vector` 확장만 활성화합니다.

## 환경변수

| 변수           | 필수 | 설명                                        | 예시                    |
| -------------- | ---- | ------------------------------------------- | ----------------------- |
| `NODE_ENV`     | 예   | `development`, `test`, `production` 중 하나 | `development`           |
| `PORT`         | 예   | 1~65535 범위의 서버 포트                    | `3000`                  |
| `DATABASE_URL` | 예   | `postgresql://` 형식의 연결 문자열          | `.env.example` 참고     |
| `CORS_ORIGIN`  | 예   | 허용 origin. 여러 개는 쉼표로 구분          | `http://localhost:3000` |
| `LOG_LEVEL`    | 예   | Pino 로그 레벨                              | `info`                  |

Docker Compose 전용 선택 변수는 `APP_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`입니다. `.env`와 `.env.*`는 Git 및 Docker 빌드 컨텍스트에서 제외되며 `.env.example`만 추적합니다.

운영 환경에서는 Nginx 한 홉을 전제로 `trust proxy`를 1로 설정하고, 개발·테스트에서는 비활성화합니다. 실제 배포 토폴로지가 달라지면 이 값을 재검토해야 합니다.

## 구조

```text
src/
  app.js                 # Express 애플리케이션 구성
  server.js              # 실행과 graceful shutdown
  config/                # 환경변수와 Prisma Client
  common/                # 오류, 미들웨어, 응답, 로거
  modules/health/        # 상태 확인 기능
  routes/                # API 조합과 OpenAPI 문서
```

새 기능은 확정된 명세에 따라 `src/modules/<feature>` 아래에 추가합니다.

## 개발 하네스

Codex와 Claude Code는 같은 구조·코딩·완료 기준을 사용합니다. 규칙을 수정할 때 agent별 파일에 내용을 복사하지 말고 공유 문서를 먼저 갱신합니다.

- [Architecture](docs/architecture.md)
- [Conventions](docs/conventions.md)
- [Definition of Done](docs/definition-of-done.md)
- [Codex instructions](AGENTS.md)
- [Claude Code instructions](CLAUDE.md)

Claude Code에서는 `.claude/commands`의 `/implement`, `/verify`, `/review` 명령을 사용할 수 있습니다.
