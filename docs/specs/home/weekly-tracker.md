# 홈 주간 트래커

작성일자: 2026-07-24

## 1. 문서 목적

홈 화면의 `주간 트래커` 카드가 어떤 데이터를 완료로 인정하고, 어떤 시점에 다시 조회되며, 연속 운동일을 어떻게 계산하는지 현재 구현 기준으로 정리한다.

## 2. 현재 구현 기준

| 구분 | 내용 |
| --- | --- |
| 대상 화면 | 홈 `주간 트래커` 카드 |
| 기준 커밋 | `0e205bd`, `fcbbdb3`, `63c6836`, `f3f6924` |
| 기준 데이터 | PostgreSQL `workout_completions` |
| 주간 범위 | `referenceDate`가 포함된 월요일~일요일 |
| 스트릭 기준 | 오늘 또는 어제부터 과거 방향으로 이어지는 연속 완료일 수 |
| 클라이언트 기준일 | `getClientTodayDate()`로 만든 `referenceDate` |
| 연결된 완료 생성 | 루틴 완료 `POST /api/workout-records/routine-completions`, 수동 운동 `POST /api/workout-records/manual` |
| 연결된 완료 갱신/삭제 | 수동 운동 `PUT /api/workout-records/:recordId`, `DELETE /api/workout-records/:recordId` |

## 3. 요구사항 및 구현 현황

| ID | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- |
| WT-001 | 기준일이 포함된 주의 월요일~일요일 7일을 표시해야 한다. | 서버가 `referenceDate` 기준 월요일과 일요일을 계산하고 7개 day 배열을 반환한다. | 구현 | `server/src/modules/weekly-tracker/weekly-tracker.service.ts` |
| WT-002 | 같은 날짜에 완료 기록이 1건 이상 있으면 체크 상태여야 한다. | 날짜별 `completionCount > 0`이면 `completed: true`로 응답한다. | 구현 | `server/src/modules/weekly-tracker/weekly-tracker.repository.ts`, `server/src/modules/weekly-tracker/weekly-tracker.service.ts` |
| WT-003 | 같은 날 여러 운동을 해도 주간 완료일 수는 하루로 계산해야 한다. | `totalCompletedDays`는 `days[].completed`가 참인 날짜 수로 계산한다. | 구현 | `server/src/modules/weekly-tracker/weekly-tracker.service.ts` |
| WT-004 | 완료 건수는 별도로 유지해야 한다. | 같은 날짜 다건 완료는 `days[].completionCount`에 남긴다. 현재 홈 카드는 건수를 노출하지 않는다. | 일부 구현 | `server/src/modules/weekly-tracker/weekly-tracker.repository.ts`, `client/src/features/home/components/weekly-tracker-card.tsx` |
| WT-005 | 스트릭은 주 경계를 넘어 계산돼야 한다. | 오늘 또는 어제를 시작점으로 과거 완료일 집합을 역순으로 세며, 주간 표시 범위와 독립적으로 계산한다. | 구현 | `server/src/modules/weekly-tracker/weekly-tracker.service.ts` |
| WT-006 | 사용자 지역의 오늘 날짜를 기준으로 계산해야 한다. | 클라이언트가 `referenceDate`와 `completedOn`을 로컬 기준 날짜로 만들어 서버에 전달한다. | 구현 | `client/src/shared/api/weekly-tracker.ts`, `client/src/shared/lib/date.ts`, `client/src/features/active-workout/lib/create-routine-completion-payload.ts` |
| WT-007 | 홈 진입 시 현재 사용자 기준 주간 요약을 조회해야 한다. | `HomeScreen`이 Suspense 기반 `useWeeklyTrackerSummary()`를 호출한다. | 구현 | `client/src/features/home/components/home-screen.tsx`, `client/src/shared/api/weekly-tracker.ts` |
| WT-008 | 주간 요약은 로딩/오류 상태를 분리해 보여야 한다. | 로딩 시 카드 자리 ActivityIndicator, 오류 시 `주간 데이터를 불러오지 못했어요.`를 표시한다. | 구현 | `client/src/features/home/components/home-screen.tsx` |
| WT-009 | 루틴 완료 저장 시 주간 완료도 함께 생성돼야 한다. | `routine-completions` 저장 트랜잭션이 `workout_records`와 `workout_completions`를 함께 저장한다. | 구현 | `server/src/modules/workout-records/workout-records.repository.ts` |
| WT-010 | 수동 운동 생성 시 개인 운동 완료도 함께 생성돼야 한다. | manual record 생성이 `source=personal_exercise` 완료 레코드를 같이 만든다. | 구현 | `server/src/modules/workout-records/workout-records.repository.ts` |
| WT-011 | 수동 운동 수정 시 연결된 완료 날짜와 메모도 함께 갱신돼야 한다. | manual record update가 연결된 `weekly_completion_id`의 `completed_on`, `source`, `note`를 갱신한다. | 구현 | `server/src/modules/workout-records/workout-records.repository.ts` |
| WT-012 | 운동기록 삭제 시 연결된 완료도 같이 지워야 한다. | record 삭제 후 연결된 `weekly_completion_id`가 있으면 해당 `workout_completions`를 삭제한다. | 구현 | `server/src/modules/workout-records/workout-records.repository.ts` |
| WT-013 | 운동기록 변경 후 홈 카드는 다시 조회돼야 한다. | 루틴 완료와 수동 운동 create/update/delete mutation이 주간 트래커 query prefix를 invalidate한다. | 구현 | `client/src/features/workout-records/api/routine-workout-completions.ts`, `client/src/features/workout-records/api/workout-records.ts` |
| WT-014 | 컨디션 변경은 주간 트래커에 영향을 주지 않아야 한다. | 컨디션 mutation은 condition records와 report summary만 invalidate하고 주간 트래커는 건드리지 않는다. | 구현 | `client/src/features/condition-records/api/condition-records.ts` |
| WT-015 | 원본 완료 목록 CRUD API가 있더라도 홈에서는 요약만 노출해도 된다. | 홈 UI는 `GET /api/weekly-tracker` 응답만 사용하고, 원본 완료 목록/삭제 화면은 연결하지 않았다. | 구현 | `client/src/features/home/components/weekly-tracker-card.tsx`, `server/src/modules/weekly-tracker/weekly-tracker.controller.ts` |

## 4. 클라이언트 데이터 흐름

| 순서 | 처리 |
| --- | --- |
| 1 | 홈 화면이 `useWeeklyTrackerSummary()`를 호출한다. |
| 2 | API wrapper가 `getAnonymousKey()` 기반 `x-user-key`와 `referenceDate`를 함께 보낸다. |
| 3 | 서버가 주간 day 배열, 스트릭, 완료일 수를 계산해 응답한다. |
| 4 | 홈 카드는 `days`와 `streakCount`를 그대로 렌더링한다. |
| 5 | 루틴 완료 또는 수동 운동 create/update/delete가 성공하면 주간 트래커 query prefix를 invalidate한다. |
| 6 | 홈으로 복귀하거나 관련 화면이 다시 보일 때 최신 요약을 재조회한다. |

## 5. API 구현 현황

| Method | 경로 | 목적 | 비고 |
| --- | --- | --- | --- |
| `GET` | `/api/weekly-tracker` | 주간 요약 조회 | 홈에서 사용 |
| `GET` | `/api/weekly-tracker/workouts` | 선택 주의 원본 완료 목록 | 현재 홈 미사용 |
| `POST` | `/api/weekly-tracker/workouts` | 원본 완료 수동 생성 | 현재 홈 미사용 |
| `DELETE` | `/api/weekly-tracker/workouts/:workoutId` | 원본 완료 삭제 | 현재 홈 미사용 |

### 주간 요약 응답

| 필드 | 의미 |
| --- | --- |
| `weekStartDate` / `weekEndDate` | 표시 중인 월요일~일요일 범위 |
| `referenceDate` | 계산 기준 날짜 |
| `streakCount` | 오늘 또는 어제부터 이어지는 연속 완료일 수 |
| `totalCompletedDays` | 현재 주간 내 완료된 날짜 수 |
| `days[].date` | 각 날짜 |
| `days[].label` | `월`~`일` |
| `days[].completed` | 완료 여부 |
| `days[].completionCount` | 해당 날짜의 완료 기록 건수 |

## 6. 테스트 근거

| 구분 | 파일 |
| --- | --- |
| 서버 단위/통합/E2E | `server/src/modules/weekly-tracker/__tests__/weekly-tracker.service.spec.ts`, `server/src/modules/weekly-tracker/__tests__/weekly-tracker.controller.integration.spec.ts`, `server/test/weekly-tracker.e2e-spec.ts` |
| 클라이언트 API/화면 | `client/src/shared/api/__tests__/weekly-tracker.test.ts`, `client/src/features/home/__tests__/home-screen.test.tsx` |
| 연쇄 저장 검증 | `server/src/modules/workout-records/__tests__/workout-records.service.spec.ts` |

## 7. 현재 제한 및 후속 검토

| ID | 항목 | 현재 영향 |
| --- | --- | --- |
| WT-GAP-001 | 원본 완료 목록 UI 미연결 | 저장된 완료 레코드를 홈에서 직접 조회/삭제할 수 없다. |
| WT-GAP-002 | 서버 기본 기준일 fallback | 클라이언트가 `referenceDate`를 누락하면 서버 실행 환경 날짜를 사용한다. |
| WT-GAP-003 | 완료 건수 미노출 | 같은 날 여러 운동을 한 정보는 응답에 있지만 카드 UI에는 노출되지 않는다. |
| WT-GAP-004 | 수동 운동과 리포트의 주간 기준 불일치 | 홈 주간 트래커는 월요일 시작, 운동 리포트는 일요일 시작 주간을 사용한다. |
