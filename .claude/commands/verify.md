# Verify

현재 작업 트리가 프로젝트 완료 기준을 충족하는지 검증한다.

1. `git status`와 변경 파일을 확인한다.
2. lock 파일 기반 재현 설치가 필요하면 `npm ci`를 실행한다. 기존 설치를 유지해야 하는 상황이면 `npm ls --depth=0`으로 의존성 상태를 확인하고 선택 이유를 보고한다.
3. 다음 명령을 순서대로 실행한다.

   ```bash
   npm run lint
   npm run format:check
   npm test
   docker compose config
   docker build --tag minki-server:verify .
   ```

4. Prisma 관련 변경이 있으면 `npm run prisma:generate`와 `npm run prisma:validate`도 실행한다.
5. Docker Compose plugin이 없으면 `docker-compose config`를 사용하고 대체 사실을 보고한다.
6. 실패한 검증은 원인을 찾아 수정한 뒤 같은 명령을 재실행한다.
7. 각 명령의 성공·실패, 수정 내용, 환경 제약으로 실행하지 못한 항목을 요약한다.

검증 과정에서 비밀값을 출력하거나 commit·push를 수행하지 않는다.
