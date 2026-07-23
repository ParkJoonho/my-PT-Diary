# 홈 주간 트래커

작성일자: 2026-07-22

## 1. 문서 목적

홈 화면의 주간 트래커가 어떤 운동 기록을 완료로 인정하고, 주간 상태와 연속 운동일을 어떻게 계산·표시하는지 정리한다. 이 문서의 요구사항 ID와 표는 추후 요구사항 정의서 및 QA 추적 매트릭스의 기초 자료로 사용한다.

## 2. 구현 기준

| 구분 | 내용 |
| --- | --- |
| 대상 화면 | 홈 화면의 `주간 트래커` 카드 |
| 서버 구현 커밋 | `df2a65b feat(server): 주간 트래커 서버와 스웨거, 로컬 Postgres 환경 추가` |
| 클라이언트 연동 커밋 | `26ef40f feat: 홈 주간 트래커를 서버 API와 연동` |
| 사용자 식별 기준 | Apps in Toss `getAnonymousKey()`가 반환한 익명 사용자 해시 |
| 주간 표시 범위 | 기준일이 포함된 월요일부터 일요일까지 |
| 스트릭 기준 | 오늘 또는 어제부터 과거 방향으로 연속된 운동 완료일 수 |
| 완료 데이터 | PostgreSQL `workout_completions` 레코드 |
| 현재 클라이언트 연동 범위 | 주간 요약 조회, 루틴 운동 완료 후 주간 요약 재조회 |

## 3. 용어와 정책

| 용어 | 정의 |
| --- | --- |
| 운동 완료 | `workout_completions`에 사용자 키, 완료일, 출처가 저장된 레코드 |
| 완료일 | 해당 날짜에 운동 완료 레코드가 1건 이상 존재하는 날짜 |
| 주간 완료일 수 | 현재 표시 중인 월요일~일요일 범위에서 완료된 날짜 수 |
| 완료 건수 | 같은 날짜에 저장된 운동 완료 레코드 수 |
| 스트릭 | 오늘 또는 어제를 시작점으로 과거 방향으로 하루도 끊기지 않고 이어진 완료일 수 |
| 기준일 | 주간 범위와 스트릭을 계산하는 날짜. 클라이언트가 현재 지역 기준 `referenceDate`를 전달한다. |

앱 접속이나 로그인만으로는 운동 완료가 생성되지 않는다. 주간 트래커는 출석 기능이 아니라 운동 완료 현황 기능이다.

## 4. 요구사항 및 구현 현황

| ID | 구분 | 요구사항·기대 동작 | 현재 구현 | 상태 | 주요 근거 파일 |
| --- | --- | --- | --- | --- | --- |
| WT-001 | 주간 표시 | 기준일이 포함된 주의 월요일부터 일요일까지 7일을 순서대로 표시한다. | 서버가 기준일의 월요일과 일요일을 계산하고 7개 날짜를 생성한다. 클라이언트는 서버가 반환한 `days`를 그대로 표시한다. | 구현 | `server/src/modules/weekly-tracker/weekly-tracker.service.ts`, `client/src/features/home/components/weekly-tracker-card.tsx` |
| WT-002 | 완료 표시 | 해당 날짜에 운동 완료 기록이 1건 이상 있을 때만 체크 아이콘을 표시한다. | `completed_on`별 건수를 조회하고 `completionCount > 0`이면 `completed: true`를 반환한다. 기존 월·화 강제 완료 하드코딩은 제거됐다. | 구현 | `server/src/modules/weekly-tracker/weekly-tracker.repository.ts`, `server/src/modules/weekly-tracker/weekly-tracker.service.ts` |
| WT-003 | 주간 완료일 | 같은 날 운동을 여러 번 해도 주간 완료일 수는 하루로 계산한다. | `totalCompletedDays`는 `days[].completed`가 참인 날짜 개수로 계산한다. | 구현 | `server/src/modules/weekly-tracker/weekly-tracker.service.ts` |
| WT-004 | 완료 건수 | 같은 날짜의 여러 운동 완료 기록은 별도 건수로 유지한다. | 날짜별 `COUNT(*)` 결과를 `days[].completionCount`로 반환한다. 화면은 현재 건수를 별도로 노출하지 않는다. | 일부 구현 | `server/src/modules/weekly-tracker/weekly-tracker.repository.ts`, `client/src/features/home/types/home.ts` |
| WT-005 | 연속 운동일 | 스트릭은 이번 주 월요일에 초기화하지 않고 주 경계를 넘어 계산한다. | 기준일까지의 모든 완료일을 조회하여 오늘 또는 어제부터 연속된 날짜를 역순으로 센다. | 구현 | `server/src/modules/weekly-tracker/weekly-tracker.repository.ts`, `server/src/modules/weekly-tracker/weekly-tracker.service.ts` |
| WT-006 | 오늘 운동한 경우 | 오늘 완료 기록이 있으면 오늘부터 과거 방향으로 스트릭을 계산한다. | 오늘이 완료일 집합에 포함되면 오늘을 시작점으로 계산한다. | 구현 | `server/src/modules/weekly-tracker/weekly-tracker.service.ts` |
| WT-007 | 오늘 쉬고 어제 운동한 경우 | 오늘 기록이 없더라도 어제까지 연속 운동했다면 어제부터 스트릭을 계산한다. | 오늘이 없고 어제가 있으면 어제를 시작점으로 계산한다. | 구현 | `server/src/modules/weekly-tracker/weekly-tracker.service.ts` |
| WT-008 | 스트릭 중단 | 오늘과 어제 모두 운동 기록이 없으면 스트릭은 0이다. | 오늘과 어제가 모두 완료일 집합에 없으면 `0`을 반환한다. | 구현 | `server/src/modules/weekly-tracker/weekly-tracker.service.ts` |
| WT-009 | 사용자 분리 | 서로 다른 사용자의 운동 완료 기록이 섞이지 않아야 한다. | 모든 생성·조회·삭제 쿼리에 `user_key` 조건을 적용한다. | 구현 | `server/src/modules/weekly-tracker/weekly-tracker.repository.ts` |
| WT-010 | 사용자 키 획득 | Apps in Toss 환경에서는 익명 사용자 해시를 서버 사용자 키로 사용한다. | `getAnonymousKey()`의 `HASH` 결과를 `x-user-key` 헤더로 전달한다. 브리지 실패 시 모든 로컬 미리보기가 `dev-preview-user`를 공유한다. | 일부 구현 | `client/src/shared/api/user-key.ts`, `client/src/shared/api/weekly-tracker.ts` |
| WT-011 | 사용자 키 검증 | 사용자 키가 없거나 잘못된 요청을 서버가 거부해야 한다. | `x-user-key`를 trim한 뒤 1~255자 문자열인지 검증하며 누락·오류 시 400을 반환한다. | 구현 | `server/src/common/decorators/user-key.decorator.ts`, `server/src/modules/weekly-tracker/weekly-tracker.schemas.ts` |
| WT-012 | 날짜 검증 | 요청 날짜는 실제 존재하는 `YYYY-MM-DD` 날짜여야 한다. | Zod가 형식과 실제 달력 날짜를 검증한다. DTO에도 형식 검증 데코레이터가 적용돼 있다. | 구현 | `server/src/modules/weekly-tracker/weekly-tracker.schemas.ts`, `server/src/modules/weekly-tracker/dto/*.ts` |
| WT-013 | 클라이언트 날짜 기준 | 사용자가 있는 지역의 오늘 날짜를 기준으로 주간 범위와 완료일을 계산해야 한다. | 클라이언트가 `date-fns`로 `referenceDate`와 `completedOn`을 만들고 서버에 전달한다. 서버는 전달받은 날짜를 기준으로 계산한다. | 구현 | `client/src/shared/lib/date.ts`, `client/src/shared/api/weekly-tracker.ts`, `client/src/features/active-workout/lib/create-routine-completion-payload.ts` |
| WT-014 | 초기 조회 | 홈 진입 시 현재 사용자의 주간 요약을 조회한다. | `HomeScreen`이 `useWeeklyTrackerSummary()`를 호출하고 React Query가 데이터를 조회한다. | 구현 | `client/src/features/home/components/home-screen.tsx`, `client/src/shared/api/weekly-tracker.ts` |
| WT-015 | 로딩 상태 | 주간 요약을 조회하는 동안 사용자가 로딩 중임을 알 수 있어야 한다. | 카드 크기의 영역에 `ActivityIndicator`를 표시한다. | 구현 | `client/src/features/home/components/home-screen.tsx` |
| WT-016 | 오류 상태 | 주간 요약 조회 실패 시 실패 상태를 표시해야 한다. | `주간 데이터를 불러오지 못했어요.` 문구를 표시한다. 재시도 버튼이나 상세 원인은 제공하지 않는다. | 일부 구현 | `client/src/features/home/components/home-screen.tsx` |
| WT-017 | 캐시·재시도 | 불필요한 중복 조회를 줄이고 일시적 실패를 재시도한다. | React Query의 `staleTime`은 30초이고 실패 시 1회 재시도한다. 사용자 키와 클라이언트 기준일을 쿼리 키에 포함한다. | 구현 | `client/src/shared/api/query-client.ts`, `client/src/shared/api/weekly-tracker.ts` |
| WT-018 | 운동 완료 생성 연동 | 실제 운동 완료 시 해당 날짜와 출처를 서버에 저장하고 주간 요약을 갱신해야 한다. | 활성 운동 완료 시 `workout-records/routine-completions`를 호출하고, 성공하면 사용자 키 기준 주간 트래커 쿼리를 무효화한다. | 구현 | `server/src/modules/workout-records`, `client/src/features/workout-records/api/routine-workout-completions.ts` |
| WT-019 | 완료 기록 조회·삭제 연동 | 사용자가 원본 운동 완료 기록을 조회하거나 자신의 기록을 삭제할 수 있어야 한다. | 서버 API는 존재하지만 현재 클라이언트 화면에는 조회·삭제 기능이 연결되지 않았다. | 일부 구현 | `server/src/modules/weekly-tracker/weekly-tracker.controller.ts` |
| WT-020 | 실행 환경별 API 주소 | 시뮬레이터·실기기·배포 환경에서 올바른 서버 주소를 사용해야 한다. | Orval 결과에 `http://127.0.0.1:3000`이 고정된다. 환경별 base URL 설정과 HTTPS 배포 주소는 없다. | 미구현 | `client/orval.config.ts`, `client/src/shared/api/generated/` |
| WT-021 | API 코드 재생성 | OpenAPI 변경 시 동일한 방식으로 클라이언트 타입과 요청 함수를 재생성할 수 있어야 한다. | `npm run api:generate`와 Orval 설정이 있다. 생성 폴더는 Git에서 제외되며 생성 시 로컬 서버의 `/docs-json`이 필요하다. 새 clone 및 CI의 자동 생성 단계는 없다. | 일부 구현 | `client/package.json`, `client/orval.config.ts`, `client/.gitignore` |

## 5. 화면 표시 규칙

| 화면 상태 | 표시 내용 |
| --- | --- |
| 조회 중 | 주간 카드 영역에 로딩 인디케이터 표시 |
| 조회 성공 | `주간 트래커`, `{streakCount}일 연속`, 월~일 완료 상태 표시 |
| 조회 실패 | `주간 데이터를 불러오지 못했어요.` 표시 |
| 스트릭 0 | `0일 연속` 배지를 그대로 표시 |
| 완료된 날짜 | 주황색 체크 아이콘 표시 |
| 미완료 날짜 | 회색 원 표시 |

`streakCount`는 주간 완료일 수와 다른 값이다. 화면의 요일 체크는 현재 주만 보여주지만 스트릭은 이전 주 기록까지 이어서 계산한다.

## 6. 스트릭 계산 예시

기준일이 2026-07-22 수요일인 경우다.

| 완료 기록 | 계산 결과 | 설명 |
| --- | --- | --- |
| 7월 22일, 21일, 20일 | 3일 연속 | 오늘부터 월요일까지 연속 |
| 7월 21일, 20일 | 2일 연속 | 오늘 기록은 없지만 어제부터 연속 |
| 7월 22일, 20일 | 1일 연속 | 21일이 비어 있어 오늘에서 중단 |
| 7월 20일만 존재 | 0일 연속 | 오늘과 어제 모두 비어 있음 |
| 지난주 토·일, 이번 주 월·화·수 | 5일 연속 | 주 경계에서 초기화하지 않음 |

## 7. API 구현 현황

모든 주간 트래커 API는 `x-user-key` 헤더를 필수로 사용한다.

| Method | 경로 | 목적 | 주요 입력 | 주요 응답 | 클라이언트 연결 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/weekly-tracker` | 주간 요약 및 스트릭 조회 | `referenceDate?` | `WeeklyTrackerSummaryDto` | 연결됨 |
| `GET` | `/api/weekly-tracker/workouts` | 선택한 주의 원본 완료 기록 조회 | `referenceDate?` | `WeeklyWorkoutCompletionDto[]` | 미연결 |
| `POST` | `/api/weekly-tracker/workouts` | 운동 완료 기록 생성 | `completedOn`, `source`, `note?` | 생성된 완료 기록 | 미연결 |
| `DELETE` | `/api/weekly-tracker/workouts/:workoutId` | 현재 사용자 소유 완료 기록 삭제 | UUID 형식 `workoutId` | `{ deleted: true }` | 미연결 |
| `POST` | `/api/workout-records/routine-completions` | 루틴 운동 기록과 주간 완료 기록 생성 | `routineId`, `completedAt`, `completedOn`, `timeZone`, `durationSeconds`, `steps` | 운동 기록과 주간 완료 링크 | 연결됨 |

### 주간 요약 응답

| 필드 | 타입 | 의미 |
| --- | --- | --- |
| `weekStartDate` | string | 주의 월요일, `YYYY-MM-DD` |
| `weekEndDate` | string | 주의 일요일, `YYYY-MM-DD` |
| `referenceDate` | string | 계산에 사용한 기준일 |
| `streakCount` | number | 오늘 또는 어제부터 이어지는 연속 완료일 수 |
| `totalCompletedDays` | number | 표시 주간 내 완료된 날짜 수 |
| `days` | array | 월요일부터 일요일까지의 날짜별 상태 |
| `days[].date` | string | 해당 날짜 |
| `days[].label` | string | `월`~`일` 요일 라벨 |
| `days[].completed` | boolean | 완료 기록 1건 이상 존재 여부 |
| `days[].completionCount` | number | 해당 날짜의 완료 기록 건수 |

### 운동 완료 생성 입력

| 필드 | 필수 | 제약 |
| --- | --- | --- |
| `completedOn` | 필수 | 실제 존재하는 `YYYY-MM-DD` 날짜 |
| `source` | 필수 | `manual`, `personal_exercise`, `pt_lesson`, `routine`, `outdoor` 중 하나 |
| `note` | 선택 | trim 적용, 최대 200자 |

## 8. 데이터 모델

테이블명은 `workout_completions`다. 애플리케이션 시작 시 스키마 생성을 시도하고, DB 접근 시 초기화가 완료되지 않았다면 다시 보장한다.

| 컬럼 | 타입 | 제약·의미 |
| --- | --- | --- |
| `id` | TEXT | 기본 키, 서버에서 UUID 생성 |
| `user_key` | TEXT | Apps in Toss 익명 사용자 해시 또는 개발 fallback 키 |
| `completed_on` | DATE | 운동 완료일 |
| `source` | TEXT | 운동 완료 출처 |
| `note` | TEXT | 선택 메모, nullable |
| `created_at` | TIMESTAMPTZ | 생성 시각, 기본값 `NOW()` |

`user_key`, `completed_on DESC` 복합 인덱스가 있다. 같은 사용자가 같은 날짜와 출처로 여러 레코드를 생성하는 것을 막는 유니크 제약은 없다.

## 9. 클라이언트 데이터 흐름

| 순서 | 처리 |
| --- | --- |
| 1 | 앱 루트에서 `QueryClientProvider`를 제공한다. |
| 2 | 홈 화면이 `useWeeklyTrackerSummary()`를 호출한다. |
| 3 | `getAnonymousKey()` 결과를 조회하고 런타임 동안 Promise를 캐시한다. |
| 4 | 사용자 해시를 `x-user-key` 헤더에 넣어 주간 요약 API를 호출한다. |
| 5 | 성공하면 서버 `days`와 `streakCount`를 카드에 표시한다. |
| 6 | 실패하면 오류 상태를 표시하고 React Query 설정에 따라 1회 재시도한다. |
| 7 | 활성 운동 완료 시 `useCreateRoutineWorkoutCompletion()`이 서버에 기록을 저장한다. |
| 8 | 저장 성공 후 사용자 키 기준 주간 트래커 쿼리를 무효화하고 홈으로 돌아온다. |

## 10. 테스트 현황

| 구분 | 검증 내용 | 구현 파일 | 현재 결과 |
| --- | --- | --- | --- |
| 서버 단위 | 생성 결과 매핑, 월~일 요약, 연속일 계산, 빈 스트릭, 목록 매핑, 삭제 위임·오류 | `server/src/modules/weekly-tracker/__tests__/weekly-tracker.service.spec.ts` | 통과 |
| 서버 컨트롤러 통합 | 사용자 키가 있는 요약 요청, 잘못된 날짜 형식 400 | `server/src/modules/weekly-tracker/__tests__/weekly-tracker.controller.integration.spec.ts` | 통과 |
| 서버 E2E | 사용자 키 누락, 잘못된 payload, 생성→요약→목록→삭제와 실제 PostgreSQL 연동 | `server/test/weekly-tracker.e2e-spec.ts` | 통과 |
| 클라이언트 API 단위 | 사용자 키 헤더 전달, 성공 응답 반환, 실패 응답 예외 | `client/src/shared/api/__tests__/weekly-tracker.test.ts` | 통과 |
| 클라이언트 화면 | 서버 데이터 표시, 오류 문구, 로딩 상태 | `client/src/features/home/__tests__/home-screen.test.tsx` | 통과 |

현재 확인된 결과는 서버 `test:e2e`, `typecheck`, `test`, `lint`, `build` 통과와 클라이언트 `typecheck`, `test`, `lint`, `build` 통과다. 클라이언트 테스트는 4개 suite, 9개 test가 통과했다.

테스트 앱은 `createNestApplication()`과 `app.init()`으로 내부 부팅한 뒤 Supertest로 요청한다. 실제 `npm run start:dev`, `main.ts`, `app.listen(3000)`, 외부 클라이언트에서 `localhost:3000`으로 연결하는 과정은 현재 E2E 범위에 포함되지 않는다.

## 11. 현재 제한 및 후속 검토 항목

| ID | 항목 | 현재 영향 | 권장 검증 방향 |
| --- | --- | --- | --- |
| WT-GAP-001 | 원본 완료 기록 조회·삭제 화면 미연결 | 저장된 완료 기록을 사용자가 별도 목록에서 확인하거나 삭제할 수 없다. | 운동 기록 목록 UI와 삭제 정책 연결 |
| WT-GAP-002 | 서버 기본 기준일 | 클라이언트가 `referenceDate`를 누락하면 서버 실행 환경 날짜를 사용할 수 있다. | 클라이언트 요청 필수화 또는 서버 기본 타임존 정책 확정 |
| WT-GAP-003 | API 주소 하드코딩 | 실기기의 `127.0.0.1`은 개발 Mac 서버를 가리키지 않는다. | 환경별 API base URL 및 HTTPS 배포 주소 구성 |
| WT-GAP-004 | 생성 코드 Git 제외 | 새 clone에서 생성 파일이 없으면 import와 빌드가 실패할 수 있다. | CI·설치·빌드 전 API 생성 자동화 또는 생성물 관리 정책 확정 |
| WT-GAP-005 | 사용자 키 fallback 공유 | 브리지 미지원 환경의 모든 사용자가 `dev-preview-user` 데이터를 공유한다. | 개발 사용자 키 분리 또는 개발 DB 초기화 정책 추가 |
| WT-GAP-006 | 완료 후 자동 재조회 범위 | 루틴 완료 화면에서는 무효화가 적용되지만 다른 완료 생성 경로가 생기면 같은 규칙을 반복 적용해야 한다. | 완료 생성 hook 공통화 유지 |
| WT-GAP-007 | 오류 복구 UI 부족 | 실패 원인을 알 수 없고 사용자가 즉시 재시도할 수 없다. | 재시도 버튼과 오류 로깅·분류 추가 |
| WT-GAP-008 | 실제 서버 기동 검증 부재 | 코드 테스트 통과와 별개로 개발 서버가 포트를 열지 못하는 문제를 놓칠 수 있다. | 서버 기동 및 `/health` 외부 요청 smoke test 추가 |

## 12. 관련 파일

| 영역 | 파일 |
| --- | --- |
| 서버 진입·Swagger | `server/src/main.ts`, `server/src/app.module.ts` |
| 서버 환경·DB | `server/src/config/env.schema.ts`, `server/src/database/database.service.ts`, `docker-compose.yml` |
| 사용자 키 검증 | `server/src/common/decorators/user-key.decorator.ts` |
| 컨트롤러 | `server/src/modules/weekly-tracker/weekly-tracker.controller.ts` |
| 서비스 계산 | `server/src/modules/weekly-tracker/weekly-tracker.service.ts` |
| 저장소 | `server/src/modules/weekly-tracker/weekly-tracker.repository.ts` |
| 요청 검증 | `server/src/modules/weekly-tracker/weekly-tracker.schemas.ts`, `server/src/modules/weekly-tracker/dto/` |
| API 생성 설정 | `client/orval.config.ts`, `client/package.json` |
| React Query | `client/src/shared/api/query-client.ts`, `client/src/shared/api/weekly-tracker.ts` |
| 사용자 키 | `client/src/shared/api/user-key.ts` |
| 홈 화면 | `client/src/features/home/components/home-screen.tsx`, `client/src/features/home/components/weekly-tracker-card.tsx` |
| 테스트 | `client/src/features/home/__tests__/`, `client/src/shared/api/__tests__/`, `server/src/modules/weekly-tracker/__tests__/`, `server/test/` |
