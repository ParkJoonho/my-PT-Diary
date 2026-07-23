# 활성 운동 및 출첵 연동

작성일자: 2026-07-23

## 1. 문서 목적

홈 화면의 기본 추천 루틴에서 `운동 시작`을 누른 뒤 운동을 완료하고, 완료 결과가 서버 운동 기록과 홈 주간 트래커 출첵·스트릭으로 이어지는 흐름을 정의한다.

이 문서는 기존 바이브코딩 앱의 구현물을 `at-pt`의 올바른 폴더 구조, 서버 중심 저장 방식, 읽기 쉬운 코드 구조로 마이그레이션하기 위한 작업 관리 문서다.

## 2. 구현 원칙

| 원칙 | 내용 |
| --- | --- |
| 서버 우선 | 운동 완료와 출첵의 기준 데이터는 서버에 저장한다. 클라이언트 로컬 저장을 기준 데이터로 삼지 않는다. |
| 기존 앱 참고 범위 제한 | 기존 바이브코딩 앱에서는 루틴 데이터, 활성 운동 UX, 완료 기록 변환 로직만 참고한다. 저장·인증·동기화 구조는 그대로 가져오지 않는다. |
| 폴더 구조 준수 | 클라이언트는 `features/workout-routines`, `features/active-workout`, `features/workout-records`로 나누고, 공통 날짜·API 유틸은 `shared`에 둔다. |
| 홈은 조립만 담당 | 홈 화면은 루틴 카드와 주간 트래커를 조립하고, 운동 진행·완료 로직을 직접 가지지 않는다. |
| 날짜 기준 고정 | 완료 시각은 UTC 기준으로 저장하고, 출첵 날짜는 클라이언트 타임존 기준 `YYYY-MM-DD`로 저장한다. |
| 단계적 구현 | 먼저 기본 루틴 운동 완료와 주간 트래커 연동을 끝내고, 수동 운동 기록·컨디션·리포트는 후속 단계로 확장한다. |

## 3. 기존 바이브코딩 앱 참고 대상

| ID | 참고 대상 | 기존 위치 | 가져올 내용 | 가져오지 않을 내용 |
| --- | --- | --- | --- | --- |
| SRC-001 | 기본 추천 루틴 데이터 | `2026-07-13/my-PT-Diary/lib/routines.ts` | 루틴 ID, 라벨, 시간, 장소, 패턴, 운동 단계, 세트, 휴식, 태그 | 파일 구조와 import 방식 |
| SRC-002 | 홈 루틴 시작 흐름 | `2026-07-13/my-PT-Diary/app/(tabs)/index.tsx` | 루틴 카드에서 `/active-workout`으로 진입하는 UX | Expo Router 코드, 홈 화면 거대 컴포넌트 구조 |
| SRC-003 | 활성 운동 화면 | `2026-07-13/my-PT-Diary/app/active-workout.tsx` | 카운트다운, 타이머, 일시정지, 단계 체크, 완료 확인 | 카메라, 음성, 자세 분석, Alert 중심 UX를 1차 범위에 전부 포함하는 방식 |
| SRC-004 | 완료 기록 변환 | `2026-07-13/my-PT-Diary/app/active-workout.tsx` | 완료한 루틴 단계를 운동 기록 payload로 바꾸는 아이디어 | `AsyncStorage` 저장 호출, 로컬 우선 성공 처리 |
| SRC-005 | 운동 기록 타입 | `2026-07-13/my-PT-Diary/lib/types.ts` | `PersonalExercise`, `ExerciseEntry`, `ExerciseSet`, `CardioData`의 필드 아이디어 | 기존 타입명을 서버 계약 없이 그대로 고정하는 방식 |
| SRC-006 | 운동 기록 입력·목록 | `2026-07-13/my-PT-Diary/app/exercise-form.tsx`, `app/exercise-list.tsx` | 수동 기록 확장 시 필요한 필드와 목록 UX | 날짜·숫자 검증 없는 폼, 로컬 중심 삭제·수정 |
| SRC-007 | 운동 음성 가이드 | `2026-07-13/my-PT-Diary/lib/exercise-guides.ts` | 기본 운동 일부의 안내 문구 | 1차 완료 플로우의 필수 기능으로 포함 |

## 4. 대상 폴더 구조

| 영역 | 대상 위치 | 역할 |
| --- | --- | --- |
| 홈 루틴 표시 | `client/src/features/home` | 홈 화면 조립, 루틴 카드 노출, `운동 시작` 진입 |
| 루틴 데이터·표시 | `client/src/features/workout-routines` | 기본 루틴 데이터, 루틴 타입, 루틴 카드/아코디언 확장 |
| 활성 운동 | `client/src/features/active-workout` | 카운트다운, 타이머, 단계 체크, 완료 화면 |
| 운동 기록 API | `client/src/features/workout-records` | 운동 완료 요청, 운동 기록 조회·목록 확장 |
| 공통 날짜 유틸 | `client/src/shared/lib/date.ts` | 클라이언트 기준일, UTC 시각, 타임존 |
| 서버 운동 기록 | `server/src/modules/workout-records` | 운동 기록 저장·조회·삭제, 주간 트래커 연동 |
| 서버 출첵 | `server/src/modules/weekly-tracker` | 완료일 저장, 주간 상태, 스트릭 계산 |

## 5. 사용자 워크플로우

| 순서 | 사용자 행동 | 시스템 동작 | 필요한 구현 |
| --- | --- | --- | --- |
| 1 | 홈에 진입한다. | 주간 트래커와 기본 추천 루틴을 표시한다. | 홈 루틴 데이터 표시, 주간 트래커 조회 |
| 2 | 루틴 탭을 선택한다. | AI추천, 헬스장, 크로스핏, 홈트 루틴을 필터링한다. | 루틴 탭 상태, 루틴 필터 |
| 3 | 루틴을 펼친다. | 운동명, 세트·횟수, 휴식, 태그를 보여준다. | 루틴 아코디언 |
| 4 | `운동 시작`을 누른다. | 선택한 루틴 ID로 활성 운동 화면에 진입한다. | 라우팅, 루틴 조회 |
| 5 | 운동 화면을 본다. | 3초 카운트다운 후 운동 타이머를 시작한다. | 카운트다운, 타이머 |
| 6 | 운동 단계를 수행한다. | 단계별 체크 상태를 저장한다. | 체크/해제 상태 |
| 7 | 운동을 일시정지·재개한다. | 타이머 진행을 멈추거나 다시 시작한다. | 일시정지/재개 |
| 8 | 운동 완료를 누른다. | 완료 확인 후 완료한 단계와 운동 시간을 집계한다. | 완료 확인, 집계 유틸 |
| 9 | 완료를 확정한다. | 서버에 운동 기록을 저장하고 주간 트래커 완료 기록을 생성한다. | 서버 운동 완료 API |
| 10 | 홈으로 돌아온다. | 주간 트래커를 다시 조회한다. | 쿼리 무효화·재조회 |
| 11 | 출첵을 확인한다. | 오늘 요일이 체크되고 스트릭이 갱신된다. | 주간 트래커 반영 |

## 6. 요구사항 및 구현 현황

| ID | 구분 | 요구사항·기대 동작 | 현재 구현 | 상태 | 주요 근거 파일 |
| --- | --- | --- | --- | --- | --- |
| AW-001 | 기본 루틴 | 홈에서 사용할 기본 추천 루틴 데이터를 제공한다. | 기존 루틴 데이터를 `workout-routines` feature의 추천 루틴 데이터로 이전했다. | 완료 | `client/src/features/workout-routines/data/recommended-routines.ts` |
| AW-002 | 루틴 분리 | 루틴 데이터와 UI는 홈 내부가 아니라 `workout-routines` feature로 분리한다. | 루틴 카드, 아코디언, 타입, 데이터, 태그 유틸을 `workout-routines`로 이동했다. | 완료 | `client/src/features/workout-routines` |
| AW-003 | 운동 시작 버튼 | 루틴 아코디언의 `운동 시작` 버튼은 활성 운동 화면으로 이동해야 한다. | 시작 버튼이 선택 루틴을 홈으로 올리고 Granite 라우트 `/active-workout`으로 이동한다. | 완료 | `client/src/features/workout-routines/components/routine-accordion.tsx`, `client/src/features/home/components/home-screen.tsx` |
| AW-004 | 활성 운동 라우트 | 선택한 루틴 ID를 받아 활성 운동 화면을 렌더링한다. | `/active-workout` 페이지와 wrapper 라우트를 추가했다. | 완료 | `client/src/pages/active-workout.tsx`, `client/pages/active-workout.tsx` |
| AW-005 | 루틴 조회 | 활성 운동 화면은 전달받은 루틴 ID로 루틴 정보를 찾아야 한다. | 정적 추천 루틴과 AI mock 루틴을 `findRoutineById`로 조회한다. | 완료 | `client/src/features/workout-routines/lib/find-routine.ts` |
| AW-006 | 카운트다운 | 운동 시작 전 짧은 카운트다운을 보여준다. | 활성 운동 화면에서 3초 카운트다운 후 타이머가 시작된다. | 완료 | `client/src/features/active-workout/components/active-workout-screen.tsx` |
| AW-007 | 타이머 | 운동 시작 후 경과 시간을 계산하고 표시한다. | 초 단위 경과 시간을 표시하고 완료 payload의 `durationSeconds`로 전달한다. | 완료 | `client/src/features/active-workout/components/active-workout-screen.tsx` |
| AW-008 | 일시정지 | 사용자는 운동 중 타이머를 일시정지하고 재개할 수 있어야 한다. | 일시정지·재개 버튼으로 타이머 증가를 제어한다. | 완료 | `client/src/features/active-workout/components/active-workout-screen.tsx` |
| AW-009 | 단계 체크 | 사용자는 루틴 단계별 완료 여부를 체크·해제할 수 있어야 한다. | 단계별 checkbox UI와 완료 수 표시를 구현했다. | 완료 | `client/src/features/active-workout/components/active-workout-screen.tsx` |
| AW-010 | 운동 중단 | 사용자가 완료하지 않고 나갈 때 중단 또는 저장 여부를 확인해야 한다. | 현재는 뒤로가기만 제공한다. 중단 확인 모달은 후속 UX로 남긴다. | 일부 구현 | `client/src/features/active-workout/components/active-workout-screen.tsx` |
| AW-011 | 완료 집계 | 완료 시 체크된 단계 수, 운동 시간, 루틴 단계 완료 여부를 집계한다. | 완료 단계 map과 운동 시간을 서버 payload로 변환한다. 유산소/근력 세부 집계는 후속 리포트 범위로 분리한다. | 일부 구현 | `client/src/features/active-workout/lib/create-routine-completion-payload.ts` |
| AW-012 | 운동 기록 생성 | 완료한 루틴을 서버 운동 기록으로 저장한다. | Orval 생성 API를 감싼 mutation hook으로 서버 루틴 완료 API를 호출한다. | 완료 | `client/src/features/workout-records/api/routine-workout-completions.ts`, `server/src/modules/workout-records` |
| AW-013 | 출첵 생성 | 운동 기록 저장이 성공하면 `workout_completions` 완료 기록이 생성되어야 한다. | 서버 트랜잭션 안에서 `workout_records`와 `workout_completions`를 함께 저장한다. | 완료 | `server/src/modules/workout-records` |
| AW-014 | 날짜 저장 | 완료 시각은 UTC ISO로, 완료 날짜는 클라이언트 타임존 기준 날짜로 저장한다. | 완료 payload 생성 시 `completedAt`, `completedOn`, `timeZone`을 넣는다. | 완료 | `client/src/shared/lib/date.ts`, `client/src/features/active-workout/lib/create-routine-completion-payload.ts` |
| AW-015 | 홈 복귀 | 완료 후 홈으로 돌아가 주간 트래커를 다시 조회한다. | mutation 성공 시 사용자 키 기준 주간 트래커 query를 invalidate하고 홈으로 이동한다. | 완료 | `client/src/features/workout-records/api/routine-workout-completions.ts`, `client/src/pages/active-workout.tsx` |
| AW-016 | 완료 표시 | 오늘 완료 기록이 생기면 홈 주간 트래커의 오늘 요일이 체크되어야 한다. | 서버 주간 트래커는 완료 기록을 기준으로 체크를 계산하고, 클라이언트는 완료 후 재조회한다. | 완료 | `server/src/modules/weekly-tracker/weekly-tracker.service.ts`, `client/src/shared/api/weekly-tracker.ts` |
| AW-017 | 스트릭 갱신 | 오늘 또는 어제부터 이어지는 연속 완료일 수를 표시한다. | 서버 스트릭 계산과 클라이언트 재조회 흐름이 연결됐다. | 완료 | `server/src/modules/weekly-tracker/weekly-tracker.service.ts`, `client/src/features/home/components/weekly-tracker-card.tsx` |
| AW-018 | 수동 운동 기록 | 사용자가 루틴 없이 직접 운동 기록을 작성·수정·삭제할 수 있어야 한다. | 기존 앱에는 입력·목록 화면이 있다. `at-pt`에는 없다. 1차 범위 이후 진행한다. | 후속 | `2026-07-13/my-PT-Diary/app/exercise-form.tsx`, `app/exercise-list.tsx` |
| AW-019 | 컨디션 기록 | 운동 기록 탭에서 컨디션 체크를 작성·조회할 수 있어야 한다. | 기존 앱에는 화면이 있다. 활성 운동 1차 범위에는 포함하지 않는다. | 후속 | `2026-07-13/my-PT-Diary/app/condition-form.tsx`, `app/condition-list.tsx` |
| AW-020 | 운동 리포트 | 누적 운동 기록으로 볼륨·빈도·체성분·컨디션 리포트를 표시한다. | 기존 앱에는 인라인 리포트가 있다. 서버 기록 기준 집계 정책 확정 후 진행한다. | 후속 | `2026-07-13/my-PT-Diary/components/ProgressChartSection.tsx` |

## 7. 서버 우선 구현 순서

| 순서 | 작업 | 산출물 | 완료 기준 | 상태 |
| --- | --- | --- | --- | --- |
| 1 | 서버 운동 기록 도메인 설계 | `workout-records` API 스펙, DB 컬럼 | 운동 완료 payload와 주간 트래커 연동 방식 확정 | 완료 |
| 2 | 서버 운동 완료 API 구현 | `POST /api/workout-records/routine-completions` 또는 동등 API | 운동 기록과 `workout_completions`가 하나의 흐름으로 저장됨 | 완료 |
| 3 | 서버 검증 추가 | DTO/Zod schema, 서비스 테스트, E2E 테스트 | 잘못된 날짜·루틴·단계 payload 거부 | 완료 |
| 4 | 클라이언트 API 래퍼 구현 | 운동 완료 mutation hook | `x-user-key`, 완료 날짜, UTC 완료 시각, 타임존 전달 | 완료 |
| 5 | 루틴 feature 분리 | `features/workout-routines` | 홈 feature에서 루틴 데이터 의존 최소화 | 완료 |
| 6 | 활성 운동 화면 구현 | `features/active-workout`와 페이지 라우트 | 루틴 조회, 카운트다운, 타이머, 체크, 완료 | 완료 |
| 7 | 홈 시작 버튼 연결 | 루틴 아코디언 라우팅 | 기본 루틴에서 활성 운동으로 이동 | 완료 |
| 8 | 완료 후 홈 갱신 | React Query invalidate/refetch | 완료 후 오늘 체크와 스트릭이 갱신됨 | 완료 |
| 9 | 운동 기록 목록 확장 | `features/workout-records` UI | 저장된 완료 기록을 사용자가 확인 가능 | 후속 |
| 10 | 컨디션·리포트 확장 | `condition-records`, 리포트 | 서버 기준 기록으로 컨디션과 리포트 표시 | 후속 |

## 8. 1차 MVP 범위

| 포함 | 제외 |
| --- | --- |
| 홈 기본 루틴에서 운동 시작 | 운동 종목 검색·추가 |
| 활성 운동 카운트다운과 타이머 | 전체 운동 DB |
| 루틴 단계 체크 | 운동 배우기 전체 |
| 운동 완료 저장 | 카메라 자세 분석 |
| 주간 트래커 출첵 생성 | 음성 안내 |
| 완료 후 홈 스트릭 갱신 | 컨디션 기록 |
| 서버 기준 사용자별 저장 | 운동 리포트 |

## 9. 1차 API 구현 현황

| Method | 경로 | 목적 | 입력 | 출력 |
| --- | --- | --- | --- | --- |
| `POST` | `/api/workout-records/routine-completions` | 루틴 운동 완료 저장 | `routineId`, `routineLabel`, `completedAt`, `completedOn`, `timeZone`, `durationSeconds`, `completedSteps[]` | 저장된 운동 기록과 주간 완료 기록 |
| `GET` | `/api/workout-records` | 운동 기록 목록 조회 | `from?`, `to?`, `source?` | 현재 사용자 운동 기록 목록 |
| `GET` | `/api/workout-records/:recordId` | 운동 기록 상세 조회 | `recordId` | 운동 기록 상세 |
| `DELETE` | `/api/workout-records/:recordId` | 운동 기록 삭제 | `recordId` | 삭제 결과 |

1차 구현에서는 `POST /api/workout-records/routine-completions`가 성공할 때 내부적으로 `weekly-tracker` 완료 기록도 함께 생성한다. 클라이언트가 `workout-records`와 `weekly-tracker`를 따로 두 번 호출하지 않도록 서버에서 하나의 완료 흐름으로 묶는다.

현재 서버는 위 4개 API를 구현했고 Swagger `/docs-json`에 반영됐다. Orval 생성도 완료했으며, 클라이언트는 `POST /api/workout-records/routine-completions`를 mutation hook으로 감싸 활성 운동 완료 화면에서 사용한다.

## 10. 운동 완료 payload 초안

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `routineId` | string | 필수 | 기본 루틴 ID |
| `routineLabel` | string | 필수 | 화면에 표시된 루틴명 |
| `routineSource` | string | 필수 | `static`, `ai`, `trainer` 등 |
| `completedAt` | string | 필수 | UTC ISO 완료 시각 |
| `completedOn` | string | 필수 | 클라이언트 타임존 기준 `YYYY-MM-DD` |
| `timeZone` | string | 필수 | IANA 타임존, fallback은 `Asia/Seoul` |
| `durationSeconds` | number | 필수 | 실제 운동 경과 시간 |
| `steps` | array | 필수 | 루틴 전체 단계와 완료 여부 |
| `steps[].name` | string | 필수 | 운동명 |
| `steps[].detail` | string | 필수 | 세트·횟수·시간 설명 |
| `steps[].type` | string | 필수 | `cardio`, `strength`, `stretch`, `rest` |
| `steps[].completed` | boolean | 필수 | 사용자가 체크한 완료 여부 |
| `steps[].restAfter` | string | 선택 | 단계 후 휴식 |
| `steps[].sets` | number | 선택 | 근력 운동 세트 수 |

## 11. 데이터 저장 정책

| 항목 | 정책 |
| --- | --- |
| 기준 저장소 | PostgreSQL |
| 사용자 식별 | Apps in Toss 익명 사용자 키 |
| 운동 완료일 | `completedOn`을 사용한다. 서버 현재 날짜로 재계산하지 않는다. |
| 실제 완료 시각 | `completedAt` UTC ISO를 저장한다. |
| 출첵 생성 | 운동 기록 저장 성공 시 서버 내부에서 `workout_completions`를 생성한다. |
| 중복 완료 | 같은 날 여러 운동 완료를 허용한다. 주간 체크는 하루 단위, 완료 건수는 별도 보존한다. |
| 삭제 | 운동 기록 삭제 시 연결된 주간 완료 기록 처리 정책을 함께 정해야 한다. |
| 실패 처리 | 운동 기록 저장 또는 출첵 생성 중 하나라도 실패하면 클라이언트에는 실패로 응답한다. |

## 12. 테스트 계획

| ID | 구분 | 검증 내용 | 대상 |
| --- | --- | --- | --- |
| TEST-AW-001 | 서버 단위 | 루틴 완료 payload를 운동 기록으로 변환한다. | `workout-records.service` |
| TEST-AW-002 | 서버 단위 | 운동 기록 저장 후 주간 완료 기록을 생성한다. | `workout-records.service`, `weekly-tracker` |
| TEST-AW-003 | 서버 검증 | 잘못된 날짜, 빈 루틴 ID, 빈 단계 목록을 거부한다. | DTO/Zod schema |
| TEST-AW-004 | 서버 E2E | 루틴 완료 생성 후 `GET /api/weekly-tracker`에서 오늘이 체크된다. | E2E |
| TEST-AW-005 | 클라이언트 단위 | 루틴 ID 조회와 source 분류가 맞다. | `find-routine.test.ts` |
| TEST-AW-006 | 클라이언트 단위 | 단계 체크 상태와 완료 payload가 일치한다. | `create-routine-completion-payload.test.ts` |
| TEST-AW-007 | 클라이언트 단위 | 완료 요청에 `completedAt`, `completedOn`, `timeZone`이 포함된다. | `create-routine-completion-payload.test.ts` |
| TEST-AW-008 | 클라이언트 화면 | 홈 주간 트래커 조회 흐름이 유지된다. | `home-screen.test.tsx` |

현재 검증 결과: 서버 `test:e2e`, `typecheck`, `test`, `lint`, `build` 통과. 클라이언트 `api:generate`, `typecheck`, `test`, `lint`, `build` 통과.

## 13. 후속 확장

| 단계 | 기능 | 비고 |
| --- | --- | --- |
| 2차 | 수동 운동 기록 입력·수정·삭제 | 기존 `exercise-form`, `exercise-list`를 서버 중심으로 재설계 |
| 3차 | 컨디션 기록 | 민감 문항 노출 정책과 점수 의미 정리 필요 |
| 4차 | 운동 리포트 | PT 수업, 개인 운동, 루틴 완료의 집계 기준 통일 필요 |
| 5차 | 운동 배우기 | 기존 영상 링크·부위/기구 필터를 별도 feature로 이전 |
| 6차 | 음성 가이드 | 기본 운동 텍스트를 검수 후 활성 운동 보조 기능으로 추가 |
| 7차 | 자세 분석 | 카메라·AI 분석은 앱인토스 권한과 성능 정책 확인 후 진행 |

## 14. 관련 파일

| 영역 | 파일 |
| --- | --- |
| 기존 루틴 데이터 | `2026-07-13/my-PT-Diary/lib/routines.ts` |
| 기존 활성 운동 | `2026-07-13/my-PT-Diary/app/active-workout.tsx` |
| 기존 운동 타입 | `2026-07-13/my-PT-Diary/lib/types.ts` |
| 기존 운동 기록 저장 | `2026-07-13/my-PT-Diary/lib/storage.ts` |
| 기존 운동 입력·목록 | `2026-07-13/my-PT-Diary/app/exercise-form.tsx`, `2026-07-13/my-PT-Diary/app/exercise-list.tsx` |
| 기존 운동 가이드 | `2026-07-13/my-PT-Diary/lib/exercise-guides.ts`, `2026-07-13/my-PT-Diary/app/exercise-guide.tsx` |
| 현재 홈 루틴 | `client/src/features/workout-routines/data/recommended-routines.ts`, `client/src/features/workout-routines/components/routine-accordion.tsx` |
| 현재 활성 운동 | `client/src/features/active-workout/components/active-workout-screen.tsx`, `client/src/pages/active-workout.tsx` |
| 현재 운동 기록 API | `client/src/features/workout-records/api/routine-workout-completions.ts`, `server/src/modules/workout-records` |
| 현재 주간 트래커 | `server/src/modules/weekly-tracker`, `client/src/shared/api/weekly-tracker.ts` |
| 날짜 유틸 | `client/src/shared/lib/date.ts` |
