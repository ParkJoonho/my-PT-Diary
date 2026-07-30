# 홈 루틴·활성 운동·운동 기록·컨디션 마이그레이션 작업 정리

작성일자: 2026-07-24

## 범위

- 원본 기준
  - `2026-07-13/my-PT-Diary/app/(tabs)/index.tsx`
  - `2026-07-13/my-PT-Diary/app/active-workout.tsx`
  - `2026-07-13/my-PT-Diary/lib/routines.ts`
  - `2026-07-13/my-PT-Diary/lib/active-routine-store.ts`
  - `2026-07-13/my-PT-Diary/app/(tabs)/exercise.tsx`
  - `2026-07-13/my-PT-Diary/app/exercise-list.tsx`
  - `2026-07-13/my-PT-Diary/app/exercise-form.tsx`
  - `2026-07-13/my-PT-Diary/app/condition-form.tsx`
  - `2026-07-13/my-PT-Diary/app/condition-list.tsx`
  - `2026-07-13/my-PT-Diary/app/trainer-condition-view.tsx`
  - `2026-07-13/my-PT-Diary/components/ProgressChartSection.tsx`
- 현재 구현 기준
  - `server/src/modules/workout-records/**`
  - `server/src/modules/condition-records/**`
  - `server/src/modules/workout-reports/**`
  - `server/src/modules/weekly-tracker/**`
  - `client/src/features/home/**`
  - `client/src/features/workout-routines/**`
  - `client/src/features/active-workout/**`
  - `client/src/features/workout-records/**`
  - `client/src/features/exercise-dashboard/**`
  - `client/src/features/condition-records/**`
  - `client/src/shared/api/generated/**`
  - `client/src/pages/active-workout.tsx`

## 1. 원본에 대해서 마이그레이션 제대로 한 작업

| 영역 | 마이그레이션 완료 내용 | 현재 파일 |
| --- | --- | --- |
| 홈 루틴 탭 구조 | 원본 홈 루틴 카드의 `AI추천 / 헬스장 / 크로스핏 / 홈트` 탭 구조와 아코디언 진입 흐름을 Granite feature 구조로 분리했다. 홈 화면은 조립만 하고, 루틴 데이터/아코디언/태그 해석은 별도 feature에서 관리한다. | `client/src/features/home/components/home-screen.tsx`, `client/src/features/workout-routines/components/routine-card.tsx`, `client/src/features/workout-routines/components/routine-accordion.tsx`, `client/src/features/workout-routines/lib/resolve-step-tag.ts` |
| 루틴 시작 handoff | 원본의 “선택한 루틴 전체를 active-workout으로 넘긴다”는 흐름을 Granite에서 zustand session slice로 옮겼다. 단순 `routineId`만 넘기지 않고, 선택 루틴 전체를 store에 올린 뒤 route에서 우선 해석한다. | `client/src/features/active-workout/stores/use-active-workout-store.ts`, `client/src/features/active-workout/lib/resolve-active-workout-routine.ts`, `client/src/pages/active-workout.tsx` |
| active-workout 화면 골격 | 원본 active-workout의 핵심 진행 UX인 `3초 카운트다운 -> 상단 타이머바 -> 체크 가능한 step list -> 종료 확인` 흐름을 다시 맞췄다. 큰 화면 파일을 그대로 들고 오지 않고 Granite 쪽에서 countdown, timer, list 컴포넌트로 분리했다. | `client/src/features/active-workout/components/active-countdown-overlay.tsx`, `client/src/features/active-workout/components/active-timer-bar.tsx`, `client/src/features/active-workout/components/workout-step-list.tsx`, `client/src/features/active-workout/components/active-workout-screen.tsx` |
| active-workout 진행 상태 분리 | 운동 진행 상태를 화면 로컬 state에 흩뜨리지 않고 zustand progress slice로 분리했다. countdown, pause, elapsedSeconds, completedSteps, errorMessage를 한 store 안에서 관리해 화면 파일이 조립 중심으로 읽히게 정리했다. | `client/src/features/active-workout/stores/use-active-workout-store.ts`, `client/src/features/active-workout/stores/__tests__/active-workout-store.test.ts` |
| 루틴 완료 서버 계약 | 원본의 “루틴 완료”를 수동 운동 저장으로 뭉개지 않고, 별도 routine completion 계약으로 저장하도록 되돌렸다. `routineId`, `routineLabel`, `routineSource`, `completedAt`, `completedOn`, `timeZone`, step 완료 상태를 서버에 그대로 전달한다. | `client/src/features/active-workout/lib/create-routine-completion-payload.ts`, `client/src/features/workout-records/api/routine-workout-completions.ts`, `server/src/modules/workout-records/dto/create-routine-workout-completion.dto.ts`, `server/src/modules/workout-records/workout-records.schemas.ts` |
| 루틴 완료 저장 + 출첵 연동 | 서버는 routine completion 저장 시 `workout_records`와 `workout_completions`를 같이 만들고, 클라이언트는 성공 후 운동 기록/주간 트래커/리포트 query를 함께 무효화한다. 원본의 로컬 저장 우선 흐름 대신 서버 기준 저장으로 정리했다. | `server/src/modules/workout-records/workout-records.controller.ts`, `server/src/modules/workout-records/workout-records.repository.ts`, `server/src/modules/workout-records/workout-records.service.ts`, `client/src/features/workout-records/api/routine-workout-completions.ts`, `client/src/shared/api/weekly-tracker.ts` |
| 루틴 summary 보강 | 루틴 기록이 단순 `완료 N/M`만 남지 않도록, 서버가 step detail에서 유산소 시간·거리·걸음 수와 근력 세트 수를 다시 계산한다. 그래서 routine record도 리포트/카드에서 최소한의 운동 요약을 갖게 했다. | `server/src/modules/workout-records/workout-records.service.ts`, `server/src/modules/workout-records/__tests__/workout-records.service.spec.ts` |
| 운동 기록 목록/상세 연쇄 | 루틴 기록과 수동 기록을 목록에서 함께 보이게 정리했다. 수동 기록은 원본처럼 수정 폼으로, 루틴 기록은 읽기 전용 상세로 분기해 원본 의도와 현재 서버 계약을 동시에 맞췄다. | `client/src/features/workout-records/components/workout-record-list-screen.tsx`, `client/src/features/workout-records/components/workout-record-card.tsx`, `client/src/features/workout-records/components/workout-record-detail-screen.tsx`, `client/src/features/workout-records/lib/get-workout-record-route.ts` |
| 운동 탭 today 흐름 | 원본 `/exercise`의 `오늘의 운동 / 오늘의 컨디션 / 운동 리포트` 구성을 Granite 화면으로 유지했다. 오늘 운동은 manual/routine record를 같이 보여주고, 오늘 컨디션 카드는 대표 점수와 부위 요약을 보여준다. | `client/src/features/exercise-dashboard/components/exercise-screen.tsx`, `client/src/features/workout-records/lib/workout-record-format.ts`, `client/src/features/condition-records/components/condition-record-card.tsx` |
| 컨디션 서버 계약 | 원본 `ConditionCheck` 구조의 `date`, `weekNumber`, 15개 `conditions[]`, 15개 `muscleSoreness[]` 계약을 서버 DTO/스키마/응답 모델에 반영해 유지했다. | `server/src/modules/condition-records/condition-records.schemas.ts`, `server/src/modules/condition-records/dto/create-condition-record.dto.ts`, `server/src/modules/condition-records/dto/condition-record-response.dto.ts`, `client/src/shared/api/generated/models/createConditionRecordDto.ts`, `client/src/shared/api/generated/models/conditionRecordDto.ts` |
| 컨디션 입력/목록 UX | 원본 `condition-form`, `condition-list`의 날짜/주차 입력, 15개 점수 토글, 근육 위치 안내, 날짜 헤더, 오늘 배지, 달력 필터, 롱프레스 삭제 흐름을 Granite 컴포넌트로 옮겼다. 상태는 form slice와 list slice로 분리했다. | `client/src/features/condition-records/components/condition-form-screen.tsx`, `client/src/features/condition-records/components/condition-score-row.tsx`, `client/src/features/condition-records/components/condition-muscle-info-modal.tsx`, `client/src/features/condition-records/components/condition-record-list-screen.tsx`, `client/src/features/condition-records/components/condition-calendar-modal.tsx`, `client/src/features/condition-records/stores/use-condition-form-store.ts`, `client/src/features/condition-records/stores/use-condition-record-list-store.ts` |
| 컨디션 today/리포트 연동 | 컨디션 기록은 today 카드와 리포트 condition trend까지 같은 API 계약을 공유한다. 원본처럼 “컨디션 입력 -> 목록/홈/리포트 소비”가 한 데이터 구조로 이어지게 정리했다. | `client/src/features/exercise-dashboard/components/exercise-screen.tsx`, `client/src/features/workout-reports/components/workout-report-chart-section.tsx`, `server/src/modules/workout-reports/workout-reports.service.ts` |
| generated API와 검증 | 서버 Swagger 기준으로 Orval을 다시 생성했고, 이번 범위의 서버/클라이언트 타입체크·테스트·lint를 통과시켰다. | `client/orval.config.ts`, `client/src/shared/api/generated/**`, `server/src/modules/workout-records/__tests__/**`, `client/src/features/active-workout/**/__tests__`, `client/src/features/condition-records/**/__tests__`, `client/src/features/workout-records/**/__tests__` |

## 2. 제약사항 때문에 임시로 구현한 내용

| 항목 | 현재 처리 방식 | 왜 임시인지 | 후속 정리 방향 |
| --- | --- | --- | --- |
| AI 루틴 데이터 | 홈의 AI추천 루틴은 아직 서버 personalized routine을 받지 않고 `mock-routines.ts`의 mock 데이터로 유지한다. | 현재 서버에는 원본 `/api/ai/personalized-routines`와 `/api/trainer/routines/for-user`에 대응하는 모듈이 없다. 지금은 원본 탭 구조와 시작 UX를 먼저 고정하는 게 우선이었다. | AI 추천/트레이너 루틴 API를 서버에 추가하고, `RoutineCard`가 mock 대신 서버 응답을 읽도록 바꾼다. |
| 선택 루틴 저장 위치 | 원본 AsyncStorage handoff 대신 선택 루틴 전체를 zustand memory store에 둔다. 같은 세션 안에서는 안전하지만 앱 재실행이나 외부 deep link 복원까지 보장하지는 않는다. | Granite에서는 원본처럼 AsyncStorage 의존을 그대로 들고 오지 않는 것이 우선이었다. | persistent handoff가 필요해지면 Granite 호환 저장 전략을 별도로 정하고 session slice를 확장한다. |
| active-workout 보조 액션 | 원본의 음성가이드/영상촬영/자세분석 버튼은 step action 자리에 다시 보이게 했지만, 현재는 `미구현` 배지와 함께 시각적 자리만 복원했다. | Expo Speech/Camera/AI posture 분석을 Granite에 그대로 옮길 수 없고, 이번 턴은 루틴 저장 흐름과 기본 UX 복원이 핵심이었다. | Granite 호환 음성/카메라/분석 전략이 정해지면 같은 자리에서 실제 액션을 연결한다. |
| 루틴 기록의 볼륨 데이터 | routine completion은 유산소 시간·거리·걸음 수와 세트 수는 계산하지만, 실중량 입력이 없어서 `totalVolumeKg`는 구조적으로 비어 있을 수 있다. | 원본 active-workout도 자동 저장에서는 실중량을 못 받았고, 현재 Granite active-workout에도 중량 입력 UI가 없다. | active-workout에서 세트별 중량 입력을 추가하거나, 후속 편집 단계에서 routine record를 보강하는 정책을 정한다. |
| 수동/루틴 진입 라우트 분기 | manual record는 수정 폼, routine record는 상세 화면으로 분리해 두었다. 한 화면에서 둘을 다 편집하지는 않는다. | manual form은 원본 `PersonalExercise` 구조이고, routine record는 step 완료 기록 중심이라 한 폼에서 강제로 합치면 계약이 뒤틀린다. | routine record 전용 편집 UX가 필요하면 별도 편집 화면이나 변환 정책을 만든다. |
| 운동/컨디션 화면 셸 | 원본의 `ParallaxBackground`, `AppHeader`, Expo Router 전역 FAB를 1:1로 복제하지 않고 Granite 화면 패턴 안에서 재조합했다. | 현재 앱 셸과 라우팅 구조가 원본 Expo Router 전역 레이아웃과 같지 않다. | 공용 Granite 헤더/배경/탭 패턴이 정리되면 더 원본스럽게 시각 셸을 맞춘다. |
| manual form entity id | 수동 운동 폼의 운동 행/세트 행은 서버 모델에 없는 client-only id를 둬서 렌더 key를 안정화했다. | Granite lint 규칙상 array index key를 쓰지 않는 편이 맞고, set/운동 행이 동적으로 늘어나는 폼이라 안정 key가 필요했다. | 장기적으로는 form helper에서 id 생성 전략을 더 명시적으로 관리하거나 공용 form entity 유틸로 뺀다. |
| 컨디션 구형 레코드 읽기 호환 | 컨디션 서버는 예전 축소 JSON 구조를 배열 기반 15문항 구조로 읽어주는 fallback을 유지한다. | 이미 저장된 레코드가 있을 수 있어 지금 당장 읽기 실패를 만들면 회귀가 된다. | 구형 condition record 백필이나 정리 스크립트가 들어가면 fallback을 제거한다. |

## 3. 이번 작업에서 미구현한 작업

| 항목 | 현재 상태 | 왜 이번 작업에서 남겼는지 | 후속 파일 |
| --- | --- | --- | --- |
| 실 AI 맞춤 루틴 API | 미구현 | 홈 UI와 루틴 시작 흐름은 복원했지만, 원본의 개인화 AI 루틴 생성 API 자체는 아직 서버에 없다. | `server/src/modules/ai-...`에 대응하는 새 모듈 필요, `client/src/features/workout-routines/components/routine-card.tsx` |
| 트레이너 루틴/트레이너 source 흐름 | 미구현 | 원본은 trainer 루틴과 `routineSource = trainer` 흐름을 갖지만, 현재 클라이언트 루틴 모델은 `mock-ai`와 `static`만 쓴다. | `client/src/features/workout-routines/types/routine.ts`, `client/src/features/workout-routines/lib/find-routine.ts`, 서버 trainer routine API |
| active-workout 음성/영상/자세분석 실동작 | 미구현 | 버튼 자리는 복원했지만 실제 기능은 연결하지 않았다. | `client/src/features/active-workout/components/workout-step-list.tsx`, 후속 Granite 호환 음성/카메라 feature |
| active-workout 중량 입력 UX | 미구현 | routine record 저장은 정상화했지만, 루틴 수행 중 실중량을 입력하는 단계는 아직 없다. | `client/src/features/active-workout/**`, `server/src/modules/workout-records/**` |
| routine record 전용 수정 UX | 미구현 | routine record는 현재 상세 조회와 삭제는 가능하지만, manual form처럼 수정하지는 않는다. | `client/src/features/workout-records/components/workout-record-detail-screen.tsx`, 후속 routine edit screen 필요 |
| trainer condition view | 미구현 | 일반 사용자 컨디션 입력/목록/홈 연동은 옮겼지만, 원본 `trainer-condition-view`는 아직 대응 화면이 없다. | `2026-07-13/my-PT-Diary/app/trainer-condition-view.tsx`에 대응하는 `client/src/features/condition-records/**` 또는 trainer feature 필요 |
| 홈 하단 탭의 나머지 도메인 | 공통 shell 반영 | `PT`, `AI`, `내 정보` 라우트까지 연결됐고 공통 탭·safe-area 계산을 사용한다. 각 페이지의 원본 충실도 보정은 별도 진행 중이다. | `client/src/shared/components/member-tab-bar.tsx`, `client/src/shared/components/tab-page-layout.tsx` |
| screen-level 상호작용 테스트 | 미구현 | helper/API/store 테스트는 보강했지만, active-workout 종료 얼럿, condition form 입력, today card route 분기 같은 실제 화면 상호작용 테스트는 충분히 없다. | `client/src/features/active-workout/components/**/__tests__`, `client/src/features/condition-records/components/**/__tests__`, `client/src/features/exercise-dashboard/components/**/__tests__` |
| 과거 routine/condition 데이터 백필 | 미구현 | 새 계약은 들어갔지만, 과거 축소 레코드를 새 구조로 일괄 변환하는 데이터 이관은 이번 범위 밖이었다. | `server/src/modules/workout-records/**`, `server/src/modules/condition-records/**`, `server/src/database/database.service.ts` |

## 빠르게 확인할 체크포인트

- 홈 루틴 시작
  - `AI추천 / 헬스장 / 크로스핏 / 홈트` 탭과 아코디언이 원본처럼 보이는지
  - `운동 시작`을 누르면 `/active-workout`으로 진입하고 선택 루틴이 맞게 표시되는지
- active-workout
  - 카운트다운, 타이머, pause, step 체크, 종료 확인이 원본 흐름대로 이어지는지
  - 완료 후 `운동 기록 저장 완료`가 뜨고 routine completion record가 생성되는지
  - 완료 항목이 0개일 때 `취소하고 나가기 / 저장하고 종료` 분기가 뜨는지
- 운동 기록
  - `/exercise-list`에서 manual/routine record가 함께 보이는지
  - manual record는 수정 폼으로, routine record는 상세 화면으로 진입하는지
  - today 운동 카드에 routine record도 나타나는지
- 컨디션
  - `conditions.length === 15`
  - `muscleSoreness.length === 15`
  - 날짜 헤더, 오늘 배지, 달력 범위 필터, 근육 위치 안내 모달, 롱프레스 삭제가 유지되는지
- 리포트
  - `GET /api/workout-reports/summary`가 routine/manual/condition 데이터를 함께 요약하는지
  - routine record가 들어와도 홈 요약과 report chart가 깨지지 않는지

## 검증 이력

- 서버
  - `npm run typecheck`
  - `npm test -- --runInBand src/modules/workout-records/__tests__/workout-records.service.spec.ts src/modules/workout-records/__tests__/workout-records.controller.integration.spec.ts src/modules/workout-reports/__tests__/workout-reports.service.spec.ts`
- 클라이언트
  - `npm run api:generate`
  - `npm run lint`
  - `npm run typecheck`
  - `npm test -- --runInBand`

## 참고

- 수동 운동/컨디션 쪽 이전 정리는 `client/docs/tasks/workout-condition-migration-status.md`에 남아 있다.
- 운동 홈/리포트/컨디션 확장 정리는 `client/docs/tasks/exercise-home-report-condition-migration-status.md`에 남아 있다.
- 이 문서는 2026-07-24 기준으로 홈 루틴 시작, active-workout, routine completion 저장, 운동 기록 연쇄, 컨디션 흐름을 한 번에 추적하려는 목적의 새 작업 정리다.
