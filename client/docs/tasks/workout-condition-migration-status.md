# 운동 기록·컨디션 마이그레이션 작업 정리

작성일자: 2026-07-24

## 범위

- 원본 기준
  - `2026-07-13/my-PT-Diary/lib/types.ts`
  - `2026-07-13/my-PT-Diary/lib/helpers.ts`
  - `2026-07-13/my-PT-Diary/app/exercise-form.tsx`
  - `2026-07-13/my-PT-Diary/app/exercise-list.tsx`
  - `2026-07-13/my-PT-Diary/app/active-workout.tsx`
  - `2026-07-13/my-PT-Diary/app/(tabs)/exercise.tsx`
  - `2026-07-13/my-PT-Diary/components/ProgressChartSection.tsx`
  - `2026-07-13/my-PT-Diary/app/condition-form.tsx`
  - `2026-07-13/my-PT-Diary/app/condition-list.tsx`
- 현재 구현 기준
  - `server/src/modules/workout-records/**`
  - `server/src/modules/condition-records/**`
  - `server/src/modules/workout-reports/**`
  - `server/src/database/database.service.ts`
  - `client/src/features/workout-records/**`
  - `client/src/features/condition-records/**`
  - `client/src/features/active-workout/**`
  - `client/src/features/exercise-dashboard/components/exercise-screen.tsx`
  - `client/src/shared/api/generated/models/**`

## 1. 원본 기준으로 제대로 마이그레이션한 작업

| 영역 | 마이그레이션 완료 내용 | 현재 파일 |
| --- | --- | --- |
| 수동 운동 서버 계약 | 원본 `PersonalExercise`에서 실제로 쓰던 생활/운동 문맥 필드까지 받을 수 있게 계약을 넓혔다. 기존 축소 계약의 `title + 간단 cardio + 간단 bodyComposition + memo` 수준에서 `exerciseTime`, `sleep`, `condition`, `activityLevel`, `meals`, `dailyReport`, 확장 cardio, 확장 bodyComposition, 운동별 계산값까지 담는다. | `server/src/modules/workout-records/dto/create-manual-workout-record.dto.ts`, `server/src/modules/workout-records/dto/workout-record-response.dto.ts`, `server/src/modules/workout-records/workout-records.schemas.ts` |
| 수동 운동 저장 구조 | 서버가 수동 운동 레코드를 원본 개인 운동 흐름에 맞게 `manual_detail`와 `body_composition` 안에 정규화해서 저장하도록 바꿨다. `performed_at`도 별도 저장해서 수정 시 운동 수행 시각이 `completed_at`에 덮여 섞이지 않게 정리했다. | `server/src/modules/workout-records/workout-records.service.ts`, `server/src/modules/workout-records/workout-records.repository.ts`, `server/src/modules/workout-records/workout-records.repository.port.ts`, `server/src/database/database.service.ts` |
| 운동 요약 계산 | 원본 `calcExerciseStats` 기준의 볼륨, 최고중량, 파운드 환산, 1RM 추정값 계산을 클라이언트/서버 양쪽에서 다시 맞췄다. | `client/src/features/workout-records/lib/manual-workout-form.ts`, `server/src/modules/workout-records/workout-records.service.ts` |
| Orval 재생성 | 확장된 운동/컨디션 Swagger 기준으로 생성 모델을 다시 뽑았다. 현재 클라이언트는 새 모델을 직접 사용한다. | `client/orval.config.ts`, `client/src/shared/api/generated/models/createManualWorkoutRecordDto.ts`, `client/src/shared/api/generated/models/manualWorkoutRecordDetailDto.ts`, `client/src/shared/api/generated/models/bodyCompositionDto.ts`, `client/src/shared/api/generated/models/manualStrengthExerciseDto.ts` |
| 수동 운동 입력 화면 | 원본 `exercise-form`의 섹션 순서를 기준으로 `기본 정보`, `유산소`, `컨디션 체크`, `체성분`, `식단 체크`, `운동 종목`, `하루 일과 보고`를 다시 복원했다. 세트 추가/삭제, 종목 추가/삭제, 운동별 계산값 갱신 흐름도 다시 맞췄다. | `client/src/features/workout-records/components/manual-workout-form-screen.tsx`, `client/src/features/workout-records/lib/manual-workout-form.ts` |
| 운동 폼 상태 구조 | 화면 안에 흩어져 있던 폼 상태를 zustand 슬라이스로 분리했다. 원본 도메인 단위로 `performedOn`, cardio, body composition, meals, strength exercises를 store에서 관리한다. | `client/src/features/workout-records/stores/use-manual-workout-form-store.ts` |
| 운동 기록 목록 UX | 원본 `exercise-list` 기준으로 날짜 헤더, 오늘 배지, 달력 범위 필터, 기록 존재일 점 표시, 10건 단위 점진 로드, 롱프레스 삭제, 카드 탭 시 수정 화면 진입 흐름을 복원했다. | `client/src/features/workout-records/components/workout-record-list-screen.tsx`, `client/src/features/workout-records/components/workout-record-calendar-modal.tsx`, `client/src/features/workout-records/stores/use-workout-record-list-store.ts`, `client/src/features/workout-records/lib/workout-record-list-metadata.ts` |
| 운동 기록 카드 요약 | 원본처럼 카드에서 `운동시간 / 운동종목 / 총 중량`이 바로 보이도록 바꿨고, 수동 기록은 `dailyReport`를 보조 문장으로 보여준다. | `client/src/features/workout-records/components/workout-record-card.tsx`, `client/src/features/workout-records/lib/workout-record-format.ts` |
| active-workout 저장 흐름 | 원본 `active-workout`처럼 완료한 루틴을 별도 루틴 완료 레코드가 아니라 개인 운동 기록 payload로 변환해서 같은 운동 기록 흐름으로 저장하도록 돌려놨다. | `client/src/features/active-workout/components/active-workout-screen.tsx`, `client/src/features/active-workout/lib/create-manual-workout-payload.ts` |
| 운동 탭 today 흐름 | 원본 `/exercise` 기준으로 `오늘의 운동`, `오늘의 컨디션`, `운동 리포트` 진입 흐름을 다시 정리했다. 오늘 운동은 수동 기록을 바로 수정 화면으로 열고, 오늘 컨디션은 원본처럼 대표 점수/근육통/부위 요약 카드를 보여준다. | `client/src/features/exercise-dashboard/components/exercise-screen.tsx` |
| 운동 상세 보강 | 현재 상세 화면이 남아 있는 만큼, 수동 기록의 체성분, 컨디션, 식단, 하루 일과 보고도 빠지지 않게 보여주도록 보강했다. | `client/src/features/workout-records/components/workout-record-detail-screen.tsx` |
| 컨디션 입력/목록 | 원본 `condition-form`, `condition-list` 기준의 15개 컨디션 문항, 15개 근육통 문항, 근육 위치 안내, 날짜 범위 필터, 날짜 헤더, 오늘 배지, 롱프레스 삭제 흐름이 이미 현재 코드베이스에 반영돼 있고 유지되고 있다. | `client/src/features/condition-records/components/condition-form-screen.tsx`, `client/src/features/condition-records/components/condition-record-list-screen.tsx`, `client/src/features/condition-records/components/condition-muscle-info-modal.tsx`, `client/src/features/condition-records/stores/use-condition-form-store.ts`, `client/src/features/condition-records/stores/use-condition-record-list-store.ts` |
| 컨디션 서버 계약 | 원본 `ConditionCheck` 구조의 `date`, `weekNumber`, 15개 `conditions[]`, 15개 `muscleSoreness[]` 계약이 서버와 생성 모델에 반영돼 있고 그대로 유지되고 있다. | `server/src/modules/condition-records/condition-records.schemas.ts`, `server/src/modules/condition-records/dto/create-condition-record.dto.ts`, `server/src/modules/condition-records/dto/condition-record-response.dto.ts`, `client/src/shared/api/generated/models/createConditionRecordDto.ts`, `client/src/shared/api/generated/models/conditionRecordDto.ts` |
| 검증 | 서버 타입체크/테스트와 클라이언트 타입체크/테스트를 통과시켰다. | `server`: `npm run typecheck`, `npm test -- workout-records condition-records workout-reports --runInBand` / `client`: `npm run typecheck`, `npm test -- --runInBand` |

## 2. 제약사항 때문에 임시로 구현한 내용

| 항목 | 현재 처리 방식 | 왜 임시인지 | 후속 정리 방향 |
| --- | --- | --- | --- |
| 수동 운동 저장 스키마 | 원본 `PersonalExercise` 전체를 1:1 컬럼으로 찢지 않고 `manual_detail` JSON + `body_composition` JSON에 담는다. | 이번 턴은 원본 필드 복원과 UX 복구가 우선이라, DB 정규화까지 같이 벌리면 범위가 커진다. | 운영 요구가 생기면 `exercise_time`, `sleep`, `condition`, `activity_level`, `meals`, `daily_report`를 개별 컬럼으로 승격한다. |
| active-workout 자동 기록의 중량값 | 원본처럼 루틴 완료를 개인 운동 기록으로 저장하지만, 근력 세트의 `weightKg`는 여전히 `0`으로 넣는다. | 현재 Granite active-workout UI에는 실제 중량 입력 단계가 없다. 원본도 자동 저장 시 중량을 복원하지 못했다. | active-workout 중 세트별 실중량 입력 UX를 별도 추가하면 그 값으로 저장하도록 바꾼다. |
| 원본 Expo 셸 대체 | `ParallaxBackground`, `AppHeader`, Expo Router 전역 FAB를 그대로 쓰지 않고 Granite 현재 화면 구조 안에서 헤더/버튼/UI를 재조합했다. | 현재 앱 구조가 Expo Router 셸과 1:1이 아니고, 기존 Granite 화면 패턴을 깨지 않으려 했다. | 공용 Granite 헤더/레이아웃 규칙이 정리되면 시각 셸을 다시 맞춘다. |
| 햅틱 피드백 제거 | 원본의 `expo-haptics`는 이번 구현에 다시 붙이지 않았다. | 현재 앱에서 공용 햅틱 패턴이 없고, 원본 동작 복원이 핵심 범위였다. | Granite 공용 햅틱 유틸이 생기면 점수 선택, 저장 성공, 필터 열기 등에 복구한다. |
| 운동 상세 라우트 유지 | 메인 흐름은 원본처럼 목록 카드 탭 시 바로 수정 화면으로 보내지만, 기존 `/exercise-record-detail` 라우트와 상세 화면은 당장 제거하지 않고 보강만 했다. | 이미 현재 앱 라우팅과 일부 진입점이 상세 화면을 참조하고 있어서 한 턴에 제거까지 하면 리스크가 크다. | 라우트 사용처를 정리한 뒤 상세 라우트를 완전히 없앨지, 읽기 전용 흐름으로 유지할지 결정한다. |
| 서버 리포트 구조 유지 | 운동 리포트 서버는 현재 `workout_records` / `condition_records` 집계 API를 그대로 유지하고, 홈 운동 탭에서는 요약 카드만 원본 쪽으로 맞췄다. | 원본 인라인 `ProgressChartSection`을 그대로 복구하려면 PT 수업 포함 정책, 차트 UI, 주차 집계까지 같이 정리해야 한다. | 운동 탭 인라인 리포트와 별도 리포트 화면의 역할을 확정한 뒤 하나의 집계 정책으로 합친다. |
| 컨디션 구형 레코드 읽기 호환 | 컨디션 서버는 예전 축소 계약 JSON도 읽을 수 있게 호환 레이어를 남겨둔 상태다. | 이미 저장된 레코드가 있을 수 있어 당장 읽기 실패를 만들고 싶지 않았다. | 구형 레코드 백필 후 fallback 제거. |

## 3. 이번 작업에서 미구현한 작업

| 항목 | 현재 상태 | 왜 이번 작업에서 남겼는지 | 후속 파일 |
| --- | --- | --- | --- |
| 운동 탭 인라인 차트 1:1 복원 | 미구현 | 원본은 `ProgressChartSection`이 운동 탭 안에 바로 있었지만, 현재는 요약 카드 + 별도 리포트 페이지 진입만 유지했다. | `client/src/features/exercise-dashboard/components/exercise-screen.tsx`, `client/src/features/workout-reports/components/workout-report-screen.tsx`, `2026-07-13/my-PT-Diary/components/ProgressChartSection.tsx` |
| PT 수업 포함 리포트 정합성 점검 | 미구현 | 이번 턴은 개인 운동 기록 흐름 복구가 우선이었고, PT 수업과 운동 리포트의 집계 정책 일치까지는 손대지 않았다. | `server/src/modules/workout-reports/**`, `client/src/features/workout-reports/**` |
| 구형 운동 레코드 백필 | 미구현 | 서버는 새 운동 계약을 받을 수 있게 넓혔지만, 기존 축소 운동 레코드를 새 구조로 일괄 변환하는 마이그레이션 스크립트는 만들지 않았다. | `server/src/modules/workout-records/workout-records.service.ts`, `server/src/database/database.service.ts` |
| 운동 폼/목록 화면 UI 상호작용 테스트 | 미구현 | 현재는 타입, API wrapper, helper 테스트 중심으로만 검증했다. | `client/src/features/workout-records/components/**/__tests__` |
| active-workout 중량 입력 UX | 미구현 | 자동 저장은 원본 방향으로 되돌렸지만, 실중량을 입력하는 별도 스텝은 없다. | `client/src/features/active-workout/**` |
| 음성/영상/자세분석 연계 | 미구현 | 사용자 지시대로 운동 기록 마이그레이션 범위에서는 미구현 기능을 이어 붙이지 않았다. | 원본 `2026-07-13/my-PT-Diary/app/active-workout.tsx` 의 음성/카메라 관련 흐름에 대응하는 at-pt 기능 필요 |
| 컨디션 트레이너 열람/다운스트림 소비자 점검 | 미구현 | 현재 저장/조회/운동 탭 today 흐름은 맞췄지만, 트레이너 화면이나 AI/분석 소비자까지는 이번 범위에 넣지 않았다. | `2026-07-13/my-PT-Diary/app/trainer-condition-view.tsx`, 향후 AI/분석 소비자 점검 |

## 빠르게 확인할 체크포인트

- 운동 기록 입력
  - `exercise-form`에서 날짜, 유산소, 컨디션, 체성분, 식단, 운동 종목, 하루 일과 보고를 모두 입력할 수 있는지
  - 세트 중량/횟수를 바꾸면 볼륨, LB, 1RM, MAX가 즉시 바뀌는지
- 운동 기록 목록
  - 날짜 헤더와 `오늘` 배지가 보이는지
  - 달력 필터에서 기록 있는 날짜 점, 단일일/범위 선택, `전체 보기`가 동작하는지
  - 카드 롱프레스로 삭제 확인이 뜨는지
  - 카드 탭 시 상세가 아니라 수정 폼으로 바로 들어가는지
- active-workout
  - 종료 후 저장 시 `운동 기록 저장 완료`가 뜨고, `/exercise-list`에서 개인 운동 기록으로 보이는지
- 운동 탭 today 카드
  - 오늘 운동이 있으면 수동 기록 카드가 보이고 탭 시 수정 폼으로 가는지
  - 오늘 컨디션이 있으면 대표 점수/근육통/부위 요약 카드가 보이는지
- 컨디션 기능
  - `conditions.length === 15`
  - `muscleSoreness.length === 15`
  - 날짜 헤더/달력 필터/근육 위치 안내 모달/롱프레스 삭제가 유지되는지

## 참고

- 컨디션 쪽 세부 정리는 기존 문서 `client/docs/tasks/condition-migration-status.md`에도 있다.
- 이번 문서는 2026-07-24 기준 현재 코드베이스 상태를 기준으로, 이미 반영돼 있던 컨디션 마이그레이션과 이번 운동 기록 변경분을 한 파일에서 같이 추적하려는 목적의 정리다.
