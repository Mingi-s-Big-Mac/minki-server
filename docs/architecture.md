# Architecture

## 전체 구조

이 프로젝트는 Express 5 기반의 모듈형 모놀리식 애플리케이션이다. 하나의 프로세스와 배포 단위를 유지하면서 기능 코드를 `src/modules/<feature>` 아래에 분리한다. 기능 간 경계는 명확히 유지하되, 아직 필요하지 않은 별도 서비스나 공통 추상화는 만들지 않는다.

```text
src/
  app.js
  server.js
  config/
  common/
  modules/
    health/
  routes/
```

## 애플리케이션 진입점

- `src/app.js`는 Express 애플리케이션 생성과 공통 미들웨어·라우터 등록만 담당한다. 네트워크 포트를 열거나 프로세스를 종료하지 않는다.
- `src/server.js`는 환경변수 검증 후 포트를 열고, 운영 시그널과 예외를 처리하며, HTTP 서버와 데이터베이스 연결을 안전하게 종료한다.

이 분리 덕분에 테스트는 실제 포트를 열지 않고 `app.js`가 만든 애플리케이션을 Supertest로 직접 호출할 수 있다.

## 최상위 디렉터리 책임

- `src/config`: Zod 환경변수 설정과 Prisma 같은 외부 인프라 클라이언트의 생성·생명주기를 관리한다.
- `src/common`: 기능에 종속되지 않는 오류, 미들웨어, 응답 포맷, 로깅 코드를 둔다.
- `src/modules`: 기능별 HTTP 진입점과 유스케이스, 데이터 접근 코드를 모듈 단위로 둔다.
- `src/routes`: API 버전별 모듈 라우터를 조합하고 OpenAPI 문서를 제공한다.
- `prisma`: Prisma datasource, client generator와 향후 승인된 데이터 모델·마이그레이션을 둔다.

## 기능 모듈 계층

기능이 실제로 필요할 때 다음 책임을 기준으로 파일을 추가한다. 모든 계층을 미리 만들지 않고, 해당 기능에 필요한 계층만 만든다.

- Route: URL과 HTTP 메서드를 선언하고 미들웨어·controller를 연결한다. 비즈니스 규칙을 구현하지 않는다.
- Controller: 요청에서 검증된 입력을 읽고 service를 호출한 뒤 공통 응답 형식으로 반환한다. 데이터베이스에 직접 접근하지 않는다.
- Service: 기능의 유스케이스와 도메인 규칙을 구현한다. Express의 request/response 객체에 의존하지 않는다.
- Repository: Prisma Client를 사용한 영속성 접근을 캡슐화한다. 데이터 접근이 없으면 만들지 않는다.
- Schema: 외부 입력, 경로·쿼리 매개변수와 필요한 출력 계약을 Zod로 정의한다. 검증이 없으면 형식적인 파일을 만들지 않는다.

일반적인 호출 방향은 다음과 같다.

```text
route -> controller -> service -> repository -> Prisma -> PostgreSQL
              |            |
              +-- schema --+
```

## PostgreSQL과 Prisma

`src/config/prisma.js`가 애플리케이션 전체에서 공유하는 Prisma Client를 지연 생성한다. 개발 중 모듈 재로딩이나 여러 기능에서의 중복 생성으로 연결 풀이 늘어나지 않도록 전역에 하나만 보관하고, `server.js`의 graceful shutdown에서 연결을 해제한다.

Prisma는 PostgreSQL driver adapter를 통해 연결하며 접속 문자열은 검증된 `DATABASE_URL`에서만 읽는다. 기능 코드는 Prisma Client를 직접 새로 만들지 않는다. 데이터 접근 코드가 생기면 해당 기능 repository에서 공유 Client를 사용한다.

Docker Compose에서는 앱이 `postgres` 서비스 이름과 내부 포트 5432로 접속한다. PostgreSQL 포트는 호스트에 publish하지 않으며, pgvector 확장만 초기화한다.

## 새 기능의 표준 구조

기능명세서가 확정된 모듈은 필요 범위에 따라 다음 구조를 사용한다.

```text
src/modules/<feature>/
  <feature>.routes.js
  <feature>.controller.js
  <feature>.service.js
  <feature>.repository.js   # 데이터 접근이 있을 때만
  <feature>.schema.js       # 외부 입력 검증이 있을 때만
```

모듈 라우터는 `src/routes/api.routes.js`에서 `/api/v1` 아래에 연결한다. 모듈 사이의 직접 참조가 필요하면 순환 의존성을 만들지 않는 방향으로 service 계약을 먼저 검토한다.

## 현재 도메인 범위

기능명세서와 도메인 정책이 아직 확정되지 않았다. 따라서 사용자, 인증, 전공, 진로, 출처, 로드맵 또는 임베딩 관련 모델·테이블·API·정책을 추측해서 만들지 않는다. 현재 Prisma schema에는 datasource와 client generator만 유지한다.
