# Codex Project Instructions

이 저장소에서 작업하는 Codex는 아래 공통 문서를 기준으로 판단한다.

- 구조와 계층 책임: [`docs/architecture.md`](docs/architecture.md)
- 코딩·보안·테스트 규칙: [`docs/conventions.md`](docs/conventions.md)
- 완료 전 검증 기준: [`docs/definition-of-done.md`](docs/definition-of-done.md)
- 실행과 환경변수 사용법: [`README.md`](README.md)

## 작업 절차

1. 작업 전에 관련 파일, 디렉터리 구조와 `git status`를 확인한다.
2. 기존 코드와 사용자가 만든 변경을 보존하고 무관한 파일을 수정하거나 되돌리지 않는다.
3. 기능명세서와 도메인 정책이 확정되지 않은 부분은 추측하지 않는다. 특히 사용자, 인증, 전공, 진로, 출처, 로드맵 모델·API·정책을 임의로 만들지 않는다.
4. 기능은 `src/modules/<feature>` 아래의 모듈 구조와 공통 architecture 규칙을 따른다. 현재 필요하지 않은 계층이나 추상화는 만들지 않는다.
5. 구현 후 최소한 `npm run lint`, `npm run format:check`, `npm test`를 실행한다.
6. 완료 보고 전 definition of done에 따라 Compose 설정과 Docker 이미지 빌드를 검증한다. Docker, Prisma, 환경변수 또는 배포 관련 파일을 변경하면 관련 Prisma 검증과 실제 컨테이너 동작 등 영향 범위의 검증도 추가한다.
7. 검증 실패는 원인을 수정한 뒤 같은 명령을 다시 실행한다.
8. 완료 시 변경한 파일, 핵심 결정, 실행한 검증과 실행하지 못한 검증의 이유를 보고한다.

## 안전과 Git

- 비밀번호, 토큰, Authorization, Cookie, API key, DB URL과 실제 자격 증명을 파일, 로그, API 응답 또는 작업 출력에 노출하지 않는다.
- `.env`와 비밀값 파일을 생성·추적하지 않고 공개 가능한 `.env.example`만 유지한다.
- 사용자가 명시적으로 요청하기 전에는 commit 또는 push를 수행하지 않는다.
- 사용자 변경을 덮어쓰는 reset, checkout, 강제 push 같은 파괴적 Git 작업을 수행하지 않는다.

Windows PowerShell 실행 정책이 npm wrapper를 차단하면 동일 명령의 `npm.cmd`를 사용한다. Docker Compose plugin이 연결되지 않은 환경에서는 `docker-compose`를 동등한 대체 명령으로 사용할 수 있으며 결과에 이를 명시한다.
