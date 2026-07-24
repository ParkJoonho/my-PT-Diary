# 운동 홈·리포트·컨디션 마이그레이션 작업 정리

작성일자: 2026-07-24

## 범위

- 원본 기준
  - `2026-07-13/my-PT-Diary/app/(tabs)/exercise.tsx`
  - `2026-07-13/my-PT-Diary/components/ProgressChartSection.tsx`
  - `2026-07-13/my-PT-Diary/app/progress-chart.tsx`
  - `2026-07-13/my-PT-Diary/app/condition-form.tsx`
  - `2026-07-13/my-PT-Diary/app/condition-list.tsx`
  - `2026-07-13/my-PT-Diary/app/trainer-condition-view.tsx`
  - `2026-07-13/my-PT-Diary/lib/types.ts`
- 현재 구현 기준
  - `server/src/modules/workout-reports/**`
  - `server/src/modules/condition-records/**`
  - `client/src/features/exercise-dashboard/components/exercise-screen.tsx`
  - `client/src/features/workout-reports/**`
  - `client/src/features/condition-records/**`
  - `client/src/shared/api/generated/models/**`

## 1. 원본 기준으로 제대로 마이그레이션한 작업

| 영역 | 마이그레이션 완료 내용 | 현재 파일 |
| --- | --- | --- |
| 리포트 서버 계약 확장 | 원본 리포트 화면이 필요로 하는 추이 데이터를 서버 `summary` 응답에 포함시켰다. 기존 `totals`, `currentWeek`, `condition`, `weeklyFrequency`만 있던 계약에 `manualTotals`, `volumeTrend`, `weightTrend`, `bodyCompositionTrend`, `conditionTrend`를 추가했다. | `server/src/modules/workout-reports/dto/workout-report-summary-response.dto.ts`, `client/src/shared/api/generated/models/workoutReportSummaryDto.ts`, `client/src/shared/api/generated/models/workoutReportManualTotalsDto.ts`, `client/src/shared/api/generated/models/workoutReportTrendPointDto.ts`, `client/src/shared/api/generated/models/workoutReportBodyCompositionTrendPointDto.ts` |
| 리포트 서버 집계 로직 | 원본 `ProgressChartSection`이 하던 집계를 서버로 옮겼다. 볼륨 추이, 체중 추이, 체성분 추이, 컨디션 추이를 서버가 날짜 정렬까지 포함해 계산하고 내려준다. | `server/src/modules/workout-reports/workout-reports.service.ts` |
| 리포트 주간 기준 복원 | 원본 운동 리포트의 주간 빈도는 `일요일 시작` 기준이었다. 이번 작업에서 `currentWeek`와 `weeklyFrequency`도 같은 기준으로 다시 맞췄다. | `server/src/modules/workout-reports/workout-reports.service.ts`, `server/src/modules/workout-reports/__tests__/workout-reports.service.spec.ts` |
| 홈 리포트 요약 기준 복원 | 원본 `/exercise` 상단 리포트 요약의 `총 운동 횟수`, `총 볼륨`은 `personal exercise` 기준이었고, 차트는 더 넓은 운동 데이터 기준이었다. 현재 서버 응답에 `manualTotals`를 따로 둬서 홈 요약 카드가 원본과 같은 의미를 갖도록 복원했다. | `server/src/modules/workout-reports/dto/workout-report-summary-response.dto.ts`, `server/src/modules/workout-reports/workout-reports.service.ts`, `client/src/features/exercise-dashboard/components/exercise-screen.tsx` |
| Orval 재생성 | 서버 Swagger 변경에 맞춰 클라이언트 생성 모델을 다시 뽑았다. 클라이언트는 수동 조합 대신 생성된 `WorkoutReportSummaryDto`를 그대로 사용한다. | `client/orval.config.ts`, `client/src/shared/api/generated/models/workoutReportSummaryDto.ts`, `client/src/shared/api/generated/models/**` |
| 홈 `/exercise` 리포트 영역 복원 | 원본처럼 홈 하단에 `운동 리포트` 섹션을 두고, 설명 문구 + 요약 3개 + 탭 차트 + 인사이트 문구를 같은 화면 안에서 보이도록 다시 만들었다. | `client/src/features/exercise-dashboard/components/exercise-screen.tsx`, `client/src/features/workout-reports/components/workout-report-chart-section.tsx` |
| 별도 리포트 화면 정리 | 원본 `progress-chart`의 역할을 다시 살리되, 중복 구현 대신 공용 차트 섹션을 사용하도록 정리했다. 홈 인라인 리포트와 별도 리포트 화면이 같은 집계와 같은 탭 UI를 공유한다. | `client/src/pages/progress-chart.tsx`, `client/src/features/workout-reports/components/workout-report-screen.tsx`, `client/src/features/workout-reports/components/workout-report-chart-section.tsx` |
| 리포트 탭 상태 구조화 | 리포트 탭 상태를 화면 내부 state로 흩어두지 않고 zustand 슬라이스로 분리했다. 홈 인라인 리포트와 별도 리포트 화면이 같은 탭 상태 구조를 공유한다. | `client/src/features/workout-reports/stores/use-workout-report-store.ts` |
| 리포트 포맷/인사이트 정리 | 원본과 같은 탭 구성 `볼륨 / 체중 / 체성분 / 컨디션 / 빈도`를 유지하고, 원본이 클라이언트에서 만들던 인사이트 문구도 서버 summary 기반으로 다시 계산한다. | `client/src/features/workout-reports/components/report-format.ts`, `client/src/features/workout-reports/components/workout-report-chart-section.tsx` |
| today 운동/컨디션 흐름 유지 | 이미 맞춰둔 today 운동 카드, today 컨디션 카드, 빈 상태 CTA, 목록 이동 흐름을 리포트 복원 이후에도 원본 쪽 흐름이 깨지지 않게 유지했다. | `client/src/features/exercise-dashboard/components/exercise-screen.tsx`, `client/src/features/workout-records/components/workout-record-card.tsx`, `client/src/features/condition-records/components/condition-record-card.tsx` |
| 컨디션 저장/조회 연동 유지 | 컨디션 폼, 목록, 홈 today 카드, 리포트 컨디션 추이가 모두 같은 `ConditionRecordDto` 계약을 보도록 유지했다. 이번 작업으로 리포트가 raw 목록을 다시 조합하지 않아도 되게 정리됐다. | `client/src/features/condition-records/**`, `server/src/modules/condition-records/**`, `client/src/features/workout-reports/components/report-format.ts` |
| 테스트 갱신 | 서버 리포트 서비스 테스트를 새 집계 규칙에 맞게 갱신했고, 클라이언트 리포트 summary wrapper/포맷 테스트도 새 DTO에 맞게 다시 고정했다. | `server/src/modules/workout-reports/__tests__/workout-reports.service.spec.ts`, `client/src/features/workout-reports/api/__tests__/workout-report-summary.test.ts`, `client/src/features/workout-reports/components/__tests__/report-format.test.ts` |

## 2. 제약사항 때문에 임시로 구현한 내용

| 항목 | 현재 처리 방식 | 왜 임시인지 | 후속 정리 방향 |
| --- | --- | --- | --- |
| 리포트 주간 기준과 홈 주간 트래커 기준 분리 | 리포트는 원본을 따라 `일요일 시작`으로 맞췄지만, 앱의 다른 주간 기능이 같은 기준으로 통일된 것은 아니다. | 이번 작업은 “원본 마이그레이션”이 우선이라 리포트만 먼저 원본 기준으로 맞췄다. 제품 전체 주간 정책 통일은 별도 의사결정이 필요하다. | `weekly-tracker`와 `workout-reports`의 주 경계 기준을 제품 정책으로 다시 정하고 공통 유틸로 통일한다. |
| `manualTotals`와 `totals` 이중 구조 | 홈 요약 카드와 차트/전체 집계의 기준이 원본에서도 달랐기 때문에, 현재 응답도 `manualTotals`와 `totals`를 같이 둔다. | 원본 의미를 그대로 옮기려면 이 분리가 필요했다. 다만 장기적으로는 사용자에게 기준 차이가 혼란스러울 수 있다. | 홈 요약과 차트의 집계 범위를 하나로 통일할지 제품 정책을 정한 뒤 DTO를 단순화한다. |
| routine 레코드의 볼륨 한계 | 서버는 `routine` 기록도 리포트에 포함할 수 있지만, 과거 `routine` 소스 레코드는 무게 기반 볼륨 데이터가 비어 있을 수 있다. 따라서 `summary.totalVolumeKg`가 없는 routine 기록은 볼륨 추이에 기여하지 않는다. | 예전 routine 저장 구조가 볼륨 계산에 필요한 실중량 정보를 충분히 갖고 있지 않았다. | 과거 routine 레코드 백필 전략을 정하거나, routine 완료 시점의 볼륨 계산 정책을 별도로 보강한다. |
| Granite용 차트 UI 재해석 | 원본 Expo `ProgressChartSection`의 구조와 정보 밀도는 맞췄지만, 아이콘/배경/헤더 셸은 Granite 화면 패턴에 맞춰 다시 조합했다. | 현재 앱은 Expo Router 셸과 1:1이 아니고, 공용 Granite 레이아웃 규칙도 따로 있다. | 공용 레이아웃 규칙이 정리되면 차트 카드·헤더·FAB 위치를 더 원본스럽게 다듬는다. |
| 인사이트 계산 위치 | 인사이트 문구는 원본처럼 클라이언트에서 계산한다. 서버가 분석 문구를 직접 내려주지는 않는다. | 원본도 서버 분석이 아니라 프런트 계산이었고, 이번 턴은 원본 복원과 DTO 정리 우선이었다. | 리포트 문구를 서버화할지, AI 기반 해석으로 바꿀지 제품 방향이 정해지면 재설계한다. |
| 리포트 탭 상태 저장 범위 | 리포트 탭 상태는 zustand 슬라이스로 분리했지만, 세션 지속 저장이나 라우트별 독립 상태까지는 넣지 않았다. | 지금은 홈과 별도 리포트 화면이 같은 탭 구조를 공유하는 것만으로 충분했다. | 탭 마지막 선택값을 유지할지, 홈/별도 화면 상태를 분리할지 사용성 정책을 정한다. |
| React Hook Form 미도입 | 폼 계열은 이미 zustand 슬라이스 기반 구조가 잡혀 있어서, 이번 작업에서는 `react-hook-form`을 새로 넣지 않았다. | 리포트/홈 마이그레이션이 핵심이었고, 컨디션 폼은 기존 구조가 동작상 충분했다. | 폼 검증 규칙이 더 복잡해지거나 UI 테스트가 필요해지면 `react-hook-form` 도입을 재검토한다. |

## 3. 이번 작업에서 미구현한 작업

| 항목 | 현재 상태 | 왜 이번 작업에서 남겼는지 | 후속 파일 |
| --- | --- | --- | --- |
| 원본 `ParallaxBackground` / `AppHeader` 1:1 복원 | 미구현 | 현재 Granite 화면 셸 안에서 동작 복원과 집계 복원을 우선했다. 시각 셸까지 1:1로 맞추면 범위가 커진다. | `client/src/features/exercise-dashboard/components/exercise-screen.tsx`, `client/src/features/workout-reports/components/workout-report-screen.tsx` |
| 리포트 전용 날짜/기간 선택 UI | 미구현 | 원본도 기간 선택 UI는 없었고, 이번 작업은 원본 복원 범위에 집중했다. | `client/src/features/workout-reports/components/workout-report-chart-section.tsx` |
| PT 수업일지와 리포트 정책 통일 | 미구현 | 원본도 홈 요약과 차트의 포함 범위가 달랐고, 현재는 그 의미만 복원했다. PT 수업을 어디까지 같은 “운동 기록”으로 묶을지는 제품 정책이 더 필요하다. | `server/src/modules/workout-reports/workout-reports.service.ts`, `client/src/features/exercise-dashboard/components/exercise-screen.tsx` |
| 과거 routine 데이터 백필 | 미구현 | 새 집계 로직은 들어갔지만, 예전 routine 레코드의 부족한 볼륨 정보까지 복구하는 데이터 이관은 이번 범위 밖이었다. | `server/src/modules/workout-records/**`, `server/src/modules/workout-reports/workout-reports.service.ts` |
| 컨디션 날짜 중복 정책 정리 | 미구현 | 현재는 같은 날짜에 여러 컨디션 기록을 허용하고, 홈 today 카드 대표값도 기존 정렬 규칙을 따른다. 이 정책 자체는 이번 턴에서 새로 결정하지 않았다. | `server/src/modules/condition-records/**`, `client/src/features/condition-records/components/condition-record-list-screen.tsx`, `client/src/features/exercise-dashboard/components/exercise-screen.tsx` |
| 트레이너 컨디션 열람 흐름 마이그레이션 | 미구현 | 이번 작업은 일반 사용자 기준의 컨디션 입력/목록/홈/리포트에 집중했다. 트레이너 전용 화면은 범위에서 뺐다. | `2026-07-13/my-PT-Diary/app/trainer-condition-view.tsx`에 대응하는 at-pt 기능 필요 |
| AI/분석 소비자 정합성 점검 | 미구현 | 컨디션 구조와 리포트 구조는 정리했지만, AI 조언이나 분석 서버가 이 데이터를 어떻게 읽는지까지는 이번에 손대지 않았다. | 향후 AI Hub, 분석, 추천 소비자 점검 필요 |
| 화면 상호작용 테스트 | 미구현 | 이번엔 API wrapper, 포맷 유틸, 서버 서비스 테스트 위주로 고정했다. 홈 `/exercise`와 리포트 탭 전환의 UI 테스트는 아직 없다. | `client/src/features/exercise-dashboard/components/**/__tests__`, `client/src/features/workout-reports/components/**/__tests__` |
| 클라이언트 lint 부채 정리 | 미구현 | 이번 작업 범위 밖의 `condition-records`, `workout-records` 기존 파일들에 `noArrayIndexKey`, `noNonNullAssertion` 계열 규칙 위반이 남아 있어서, unrelated diff를 키우지 않으려고 마이그레이션 작업과 분리했다. | `client/src/features/condition-records/**`, `client/src/features/workout-records/**` |

## 빠르게 확인할 체크포인트

- 리포트 서버 응답
  - `GET /api/workout-reports/summary`에 `manualTotals`, `volumeTrend`, `weightTrend`, `bodyCompositionTrend`, `conditionTrend`가 포함되는지
  - `weeklyFrequency`와 `currentWeek`가 리포트 기준 `일요일 시작`으로 계산되는지
- 홈 `/exercise`
  - `오늘의 운동`, `오늘의 컨디션`, `운동 리포트`가 한 화면 안에 보이는지
  - 리포트 섹션에서 요약 3개, 탭 차트, 인사이트 문구가 표시되는지
  - 오늘 컨디션 빈 상태 CTA와 today 카드 요약이 기존 흐름대로 동작하는지
- 별도 리포트 화면
  - `/progress-chart`에서도 홈과 같은 탭 구성과 같은 차트 데이터가 보이는지
  - 홈에서 본 탭 전환과 같은 방식으로 `볼륨 / 체중 / 체성분 / 컨디션 / 빈도`를 확인할 수 있는지
- 컨디션 기능
  - `conditions.length === 15`
  - `muscleSoreness.length === 15`
  - 컨디션 입력, 목록, 홈 today 카드, 리포트 컨디션 추이가 같은 데이터 계약을 보는지

## 검증 이력

- 서버
  - `npm run typecheck`
  - `npm test -- --runInBand src/modules/condition-records/__tests__/condition-records.service.spec.ts src/modules/workout-reports/__tests__/workout-reports.service.spec.ts`
- 클라이언트
  - `npm run api:generate`
  - `npm run typecheck`
  - `npm test -- --runInBand src/features/condition-records/api/__tests__/condition-records.test.ts src/features/condition-records/lib/__tests__/condition-form.test.ts src/features/workout-reports/api/__tests__/workout-report-summary.test.ts src/features/workout-reports/components/__tests__/report-format.test.ts`

## 참고

- 컨디션 세부 이력은 기존 `client/docs/tasks/condition-migration-status.md`에 더 자세히 남아 있다.
- 운동 기록 전반의 이전 정리는 `client/docs/tasks/workout-condition-migration-status.md`에 남아 있다.
- 이 문서는 2026-07-24 기준으로 운동 홈 `/exercise`, 리포트 서버/프론트, 컨디션 연동까지 포함한 최신 상태를 한 문서에서 추적하려는 목적의 정리다.
