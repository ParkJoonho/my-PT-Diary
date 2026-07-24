# 활성 운동 및 출첵 연동

작성일자: 2026-07-24

## 1. 문서 목적

홈 화면의 추천 루틴에서 `운동 시작`을 누른 뒤 활성 운동 화면으로 진입하고, 완료 결과가 운동 기록과 홈 주간 트래커에 반영되는 현재 구현을 정리한다.

이 문서는 `fcbbdb3`, `63c6836`, `f3f6924` 커밋까지 반영한 기준 문서다.

## 2. 현재 구현 기준

| 구분 | 내용 |
| --- | --- |
| 홈 진입점 | `client/src/features/home/components/home-screen.tsx` |
| 루틴 표시 | `client/src/features/workout-routines` |
| 활성 운동 라우트 | `client/src/pages/active-workout.tsx` |
| 진행 상태 저장 | `client/src/features/active-workout/stores/use-active-workout-store.ts` |
| 완료 저장 API | `POST /api/workout-records/routine-completions` |
| 저장 후 연쇄 갱신 | 운동기록 목록, 운동 리포트, 홈 주간 트래커 query invalidate |
| 주간 완료 생성 | 서버에서 `workout_records`와 `workout_completions`를 함께 저장 |
| 날짜 기준 | `completedAt`은 UTC ISO, `completedOn`은 클라이언트 기준 날짜 |

## 3. 사용자 흐름

| 순서 | 사용자 행동 | 현재 구현 |
| --- | --- | --- |
| 1 | 홈에서 추천 루틴을 본다. | `RoutineCard`가 추천 루틴 목록과 `운동 시작` 버튼을 표시한다. |
| 2 | `운동 시작`을 누른다. | 홈이 선택한 루틴을 zustand store의 `selectedRoutine`에 저장하고 `/active-workout?routineId=...`로 이동한다. |
| 3 | 활성 운동 화면에 진입한다. | 라우트가 store의 `selectedRoutine`을 우선 사용하고, 없으면 `routineId`로 정적 루틴을 다시 찾는다. |
| 4 | 운동 준비 화면을 본다. | 3초 카운트다운 오버레이를 띄우고 사용자는 `건너뛰기`로 바로 시작할 수 있다. |
| 5 | 운동을 진행한다. | 카운트다운이 끝나면 타이머가 초 단위로 증가하고, 일시정지/재개가 가능하다. |
| 6 | 단계별 완료를 체크한다. | 각 루틴 step을 체크/해제할 수 있고 완료 수가 즉시 반영된다. |
| 7 | 운동 종료를 누른다. | 완료 항목이 0개면 `계속하기 / 취소하고 나가기 / 저장하고 종료`를, 1개 이상이면 저장 확인을 묻는다. |
| 8 | 저장을 확정한다. | 클라이언트가 완료 payload를 만들고 `routine-completions` API를 호출한다. |
| 9 | 저장이 성공한다. | 성공 Alert에 운동 시간과 완료 항목 수를 표시한 뒤 홈으로 이동한다. |
| 10 | 홈으로 돌아온다. | 루틴 선택 상태를 비우고 주간 트래커가 invalidate된 캐시를 다시 조회한다. |

## 4. 요구사항 및 구현 현황

| ID | 구분 | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- | --- |
| AW-001 | 홈 시작 연결 | 홈의 `운동 시작`은 선택한 루틴을 활성 운동 화면으로 전달해야 한다. | 홈이 `setSelectedRoutine(routine)` 후 `/active-workout`로 이동한다. | 구현 | `client/src/features/home/components/home-screen.tsx` |
| AW-002 | 라우트 복원성 | store가 비어 있어도 `routineId`만으로 활성 운동을 다시 열 수 있어야 한다. | `resolveActiveWorkoutRouteRoutine()`가 store 루틴을 우선 사용하고, 없으면 `findRoutineById()`로 복원한다. | 구현 | `client/src/features/active-workout/lib/resolve-active-workout-routine.ts` |
| AW-003 | 잘못된 라우트 처리 | 유효한 루틴을 찾지 못하면 빈 화면 대신 안내를 보여야 한다. | `루틴을 찾지 못했어요.`와 `돌아가기` 액션을 표시한다. | 구현 | `client/src/pages/active-workout.tsx` |
| AW-004 | 진행 상태 초기화 | 화면에 들어올 때 이전 진행 상태가 남지 않아야 한다. | mount 시 `initializeProgress()`, unmount 시 `resetProgress()`를 호출한다. | 구현 | `client/src/features/active-workout/components/active-workout-screen.tsx` |
| AW-005 | 세션 상태 분리 | 루틴 선택 상태와 운동 진행 상태를 분리해 관리해야 한다. | zustand store를 `selectedRoutine` 세션 슬라이스와 countdown/elapsed/completedSteps 진행 슬라이스로 나눴다. | 구현 | `client/src/features/active-workout/stores/use-active-workout-store.ts` |
| AW-006 | 카운트다운 | 운동 시작 전 3초 카운트다운을 보여야 한다. | `countdown=3`에서 시작해 1초마다 감소하고 0이 되면 `countdownDone=true`가 된다. | 구현 | `client/src/features/active-workout/stores/use-active-workout-store.ts`, `client/src/features/active-workout/components/active-workout-screen.tsx` |
| AW-007 | 카운트다운 건너뛰기 | 사용자가 즉시 운동을 시작할 수 있어야 한다. | `건너뛰기`가 현재 timeout을 정리하고 `skipCountdown()`을 호출한다. | 구현 | `client/src/features/active-workout/components/active-workout-screen.tsx` |
| AW-008 | 타이머 | 카운트다운 이후 경과 시간을 초 단위로 집계해야 한다. | `countdownDone && !isPaused`일 때 1초 interval로 `elapsedSeconds`를 증가시킨다. | 구현 | `client/src/features/active-workout/components/active-workout-screen.tsx` |
| AW-009 | 일시정지 | 운동 중 타이머를 멈췄다가 다시 이어야 한다. | `togglePause()`가 `isPaused`를 뒤집고 interval 실행 여부를 제어한다. | 구현 | `client/src/features/active-workout/stores/use-active-workout-store.ts` |
| AW-010 | 단계 체크 | step별 완료 여부를 체크·해제할 수 있어야 한다. | `completedSteps` 맵을 index 기준으로 관리하고 `toggleStep()`으로 반전한다. | 구현 | `client/src/features/active-workout/stores/use-active-workout-store.ts`, `client/src/features/active-workout/components/workout-step-list.tsx` |
| AW-011 | 저장 전 확인 | 종료 시 저장 여부를 사용자에게 확인해야 한다. | 완료 수 0개와 1개 이상인 경우를 나눠 Alert 문구와 선택지를 다르게 제공한다. | 구현 | `client/src/features/active-workout/components/active-workout-screen.tsx` |
| AW-012 | 완료 payload | 저장 payload는 모든 step의 완료 여부와 클라이언트 기준 날짜를 포함해야 한다. | `createRoutineCompletionPayload()`가 `completedAt`, `completedOn`, `timeZone`, `routineSource`, 전체 `steps[]`를 만든다. | 구현 | `client/src/features/active-workout/lib/create-routine-completion-payload.ts` |
| AW-013 | 최소 운동 시간 | 즉시 종료해도 저장 duration이 0초가 되지 않아야 한다. | 저장 시 `Math.max(elapsedSeconds, 1)`을 사용한다. | 구현 | `client/src/features/active-workout/components/active-workout-screen.tsx` |
| AW-014 | 저장 중 상태 | 저장 중 중복 제출을 막고 사용자에게 대기 상태를 보여야 한다. | mutation pending 동안 입력을 무시하고 전체 화면 saving overlay를 띄운다. | 구현 | `client/src/features/active-workout/components/active-workout-screen.tsx` |
| AW-015 | 저장 실패 표시 | 저장 실패를 조용히 삼키지 않아야 한다. | mutation 에러 메시지를 `errorMessage`에 넣고 step 목록 아래에 노출한다. | 구현 | `client/src/features/active-workout/components/active-workout-screen.tsx`, `client/src/features/active-workout/stores/use-active-workout-store.ts` |
| AW-016 | 저장 성공 후 이동 | 저장 성공 시 홈으로 돌아가고 선택 루틴 상태를 비워야 한다. | 성공 Alert 확인 후 `clearSelectedRoutine()` 후 홈 `/`로 이동한다. | 구현 | `client/src/pages/active-workout.tsx`, `client/src/features/active-workout/components/active-workout-screen.tsx` |
| AW-017 | 주간 트래커 연동 | 루틴 완료가 홈 주간 트래커와 스트릭에 반영돼야 한다. | `useCreateRoutineWorkoutCompletion()` 성공 시 운동기록·리포트·주간 트래커 query를 함께 invalidate한다. | 구현 | `client/src/features/workout-records/api/routine-workout-completions.ts`, `client/src/features/workout-records/api/workout-records.ts` |
| AW-018 | 운동기록 연동 | 루틴 완료가 운동기록 탭에서 조회 가능한 기록으로 남아야 한다. | 서버가 `workout_records`에 routine source 기록을 저장하고 운동기록 목록/상세가 이를 조회한다. | 구현 | `server/src/modules/workout-records`, `client/src/features/workout-records` |
| AW-019 | 서버 요약 계산 | 루틴 완료 응답은 완료 수와 유산소/근력 step 요약을 포함해야 한다. | 서버 서비스가 `completedStepCount`, `strengthSetCount`, `cardioDurationSeconds` 등을 계산해 summary에 저장한다. | 구현 | `server/src/modules/workout-records/workout-records.service.ts` |
| AW-020 | 세션 영속성 | 앱 재시작 뒤에도 진행 중 운동이 복원되어야 한다. | 현재 store는 메모리 전용이다. 루틴 재조회는 가능하지만 진행 중 countdown, timer, step 체크는 복원되지 않는다. | 미구현 | `client/src/features/active-workout/stores/use-active-workout-store.ts` |

## 5. 상태 저장 규칙

| 상태 키 | 의미 | 초기값 |
| --- | --- | --- |
| `selectedRoutine` | 홈에서 시작한 현재 루틴 | `null` |
| `countdown` | 남은 카운트다운 초 | `3` |
| `countdownDone` | 실제 운동 시작 여부 | `false` |
| `elapsedSeconds` | 운동 경과 시간 | `0` |
| `isPaused` | 일시정지 여부 | `false` |
| `completedSteps` | step index별 완료 여부 | `{}` |
| `errorMessage` | 저장 실패 메시지 | `null` |

진행 상태는 활성 운동 화면에 들어올 때 항상 새로 초기화된다. 홈에서 선택한 루틴만 세션 store에 남고, 저장 성공 또는 취소 시 `clearSelectedRoutine()`으로 비운다.

## 6. API 구현 현황

| Method | 경로 | 목적 | 주요 입력 | 주요 응답 |
| --- | --- | --- | --- | --- |
| `POST` | `/api/workout-records/routine-completions` | 루틴 완료 저장과 주간 완료 생성 | `routineId`, `routineLabel`, `routineSource`, `completedAt`, `completedOn`, `timeZone`, `durationSeconds`, `steps[]` | `workoutRecord`, `weeklyCompletion` |

### 요청 필드

| 필드 | 설명 |
| --- | --- |
| `completedAt` | UTC ISO 완료 시각 |
| `completedOn` | 클라이언트 기준 완료 날짜 |
| `routineId` | 선택한 루틴 ID |
| `routineLabel` | 루틴 라벨 |
| `routineSource` | `static`, `ai`, `trainer` 등 루틴 출처 |
| `durationSeconds` | 총 운동 시간 |
| `steps[]` | 모든 step의 `name`, `detail`, `type`, `completed`, `restAfter?`, `sets?`, `tag?` |
| `timeZone` | IANA 타임존 |

### 응답 필드

| 필드 | 설명 |
| --- | --- |
| `workoutRecord` | 운동기록 탭에서 조회되는 저장 결과 |
| `weeklyCompletion.id` | 연결된 `workout_completions` ID |
| `weeklyCompletion.completedOn` | 주간 트래커에 반영된 완료 날짜 |
| `weeklyCompletion.source` | 현재 `routine` |

## 7. 테스트 근거

| 구분 | 검증 내용 | 파일 |
| --- | --- | --- |
| 클라이언트 단위 | 선택 루틴 복원 로직 | `client/src/features/active-workout/lib/__tests__/resolve-active-workout-routine.test.ts` |
| 클라이언트 단위 | active-workout store 상태 전이 | `client/src/features/active-workout/stores/__tests__/active-workout-store.test.ts` |
| 클라이언트 단위 | 완료 payload 생성 | `client/src/features/active-workout/lib/__tests__/create-routine-completion-payload.test.ts` |
| 서버 단위 | 루틴 step 요약과 주간 완료 note 생성 | `server/src/modules/workout-records/__tests__/workout-records.service.spec.ts` |

## 8. 현재 제한 및 후속 검토

| ID | 항목 | 현재 영향 |
| --- | --- | --- |
| AW-GAP-001 | 진행 중 운동 영속화 부재 | 앱을 닫거나 새로고침하면 countdown, step 체크, elapsed time이 사라진다. |
| AW-GAP-002 | 중단 확인 범위 제한 | 종료 버튼 기준 Alert는 있지만 OS 뒤로가기·강제 종료까지 포함한 이탈 복구는 없다. |
| AW-GAP-003 | 저장 실패 재시도 UX 단순 | 인라인 에러는 보이지만 별도 재시도 버튼이나 실패 원인 분류는 없다. |
| AW-GAP-004 | 루틴 복원 범위 제한 | `routineId`가 정적/AI mock 데이터에 없으면 복원하지 못하고 안내 화면으로 빠진다. |
