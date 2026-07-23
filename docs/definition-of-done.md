# Definition of Done

작업 완료를 보고하기 전에 다음 항목을 확인한다.

- 요청된 요구사항이 빠짐없이 구현되었고 요청하지 않은 기능이 추가되지 않았다.
- `npm run lint`가 성공한다.
- `npm run format:check`가 성공한다.
- `npm test`가 성공한다.
- `docker compose config`가 성공한다. Compose plugin이 없는 환경에서는 동등한 `docker-compose config`를 실행하고 그 사실을 보고한다.
- `docker build --tag minki-server:verify .`로 Docker 이미지 빌드가 성공한다.
- README, agent 문서, CI와 실제 `package.json` script의 명령어가 일치한다.
- 임시 파일, 디버그 코드, 사용하지 않는 의존성 또는 현재 필요하지 않은 추상화가 남아 있지 않다.
- 비밀값과 민감정보가 Git 추적 파일, 로그, API 응답, 테스트 출력에 포함되지 않는다.
- Git 상태와 변경 범위를 마지막으로 검토하고 기존 사용자 변경이 보존되었는지 확인한다.
- 사용자가 명시적으로 요청하지 않았다면 commit과 push를 수행하지 않는다.

검증이 실패하면 실패 사실만 보고하고 끝내지 않는다. 원인을 분석해 범위 내에서 수정하고 같은 검증을 다시 실행한다. 환경 제약으로 실행할 수 없는 항목만 이유와 대체 검증을 명확히 보고한다.
