# Claude Code Project Instructions

Claude Code는 이 파일만으로 프로젝트 규칙을 추측하지 말고 다음 문서를 함께 읽는다.

- 공통 agent 작업 규칙: [`AGENTS.md`](AGENTS.md)
- 구조와 계층 책임: [`docs/architecture.md`](docs/architecture.md)
- 코딩·보안·테스트 규칙: [`docs/conventions.md`](docs/conventions.md)
- 완료 기준: [`docs/definition-of-done.md`](docs/definition-of-done.md)
- 로컬·Docker 실행법: [`README.md`](README.md)

## 작업 방식

1. 작업 시작 전에 요구사항과 직접 관련된 코드, 테스트, 문서, Git 상태를 확인한다.
2. 여러 파일이나 계층을 바꾸는 복잡한 작업은 구현 전에 짧은 계획을 세운다.
3. 기존 구조와 사용자가 만든 변경을 보존하며 무관한 변경을 되돌리지 않는다.
4. 기능명세서나 도메인 정책이 없는 부분을 임의로 구현하지 않고 최소 범위만 변경한다.
5. 변경 후 `npm run lint`, `npm run format:check`, `npm test`와 definition of done의 Docker 검증을 실행한다. Prisma 관련 변경에는 Prisma 검증도 추가한다.
6. 검증 실패 시 원인을 분석해 수정하고 성공할 때까지 동일 검증을 재실행한다.
7. 변경 파일과 검증 결과, 남은 위험을 완료 보고에 포함한다.

Commit과 push는 사용자가 명시적으로 요청한 경우에만 수행한다. 권한을 우회하거나 위험한 명령을 자동 승인하는 프로젝트 설정을 추가하지 않는다.
