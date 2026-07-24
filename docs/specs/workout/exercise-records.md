# 운동 기록, 컨디션, 리포트

작성일자: 2026-07-24

## 1. 문서 목적

`/exercise` 탭에서 제공하는 운동 기록 홈, 수동 운동 기록, 컨디션 기록, 운동 리포트의 현재 구현을 정리한다.

이 문서는 `fcbbdb3`, `63c6836`, `95359a8`, `f3f6924` 커밋까지 반영한 기준 문서다.

## 2. 현재 범위

| 도메인 | 현재 범위 | 상태 |
| --- | --- | --- |
| 운동기록 홈 | 오늘 운동, 오늘 컨디션, 인라인 리포트, 당겨서 새로고침 | 구현 |
| 수동 운동 기록 | 생성, 수정, 목록, 상세, 삭제, 날짜 범위 필터 | 구현 |
| 루틴 완료 기록 | 활성 운동 완료 결과를 운동기록 목록/상세에서 조회 | 구현 |
| 컨디션 기록 | 생성, 수정, 목록, 삭제, 날짜 범위 필터, 근육 부위 안내 | 구현 |
| 운동 리포트 | 총합 요약, 차트 탭, 12주 빈도, 추이 차트 | 구현 |
| 트레이너 열람 | 회원 기록 열람 | 미구현 |
| AI 조언 연동 | 기록·컨디션 기반 AI 해석 | 미구현 |

## 3. 구현 원칙

| 원칙 | 내용 |
| --- | --- |
| 서버 기준 | 운동기록, 컨디션, 리포트의 기준 데이터는 PostgreSQL이다. |
| 사용자 분리 | 모든 CRUD는 `x-user-key` 기준으로 분리한다. |
| 날짜 분리 | 저장 시각은 UTC ISO, 운동일/체크일은 클라이언트 기준 `YYYY-MM-DD`를 사용한다. |
| 리스트/리포트 연쇄 | 운동기록 변경은 주간 트래커와 리포트를 함께 갱신하고, 컨디션 변경은 리포트를 함께 갱신한다. |
| 원본 UX 복원 | 기존 앱의 입력 밀도와 화면 흐름은 살리되 Granite 라우트와 zustand 상태 구조로 정리한다. |

## 4. 운동기록 홈 요구사항

| ID | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- |
| EH-001 | `/exercise` 탭에서 운동기록 홈으로 이동해야 한다. | 하단 탭이 `activeKey="exercise"`인 홈 탭 바와 `/exercise` 라우트가 연결돼 있다. | 구현 | `client/src/features/home/components/home-tab-bar.tsx`, `client/src/pages/exercise.tsx` |
| EH-002 | 홈 상단에서 오늘 운동을 볼 수 있어야 한다. | 오늘 날짜로 운동기록을 조회해 카드 목록을 보여주고, 없으면 `+운동 기록하기` CTA를 띄운다. | 구현 | `client/src/features/exercise-dashboard/components/exercise-screen.tsx` |
| EH-003 | 홈 상단에서 오늘 컨디션을 볼 수 있어야 한다. | 오늘 날짜로 컨디션 기록을 조회해 가장 최신 1건을 보여주고, 없으면 `+컨디션 체크` CTA를 띄운다. | 구현 | `client/src/features/exercise-dashboard/components/exercise-screen.tsx` |
| EH-004 | 홈에서 인라인 리포트를 바로 볼 수 있어야 한다. | 총 운동 횟수, 총 볼륨, 컨디션 체크 수와 공용 차트 섹션을 홈 안에서 렌더링한다. | 구현 | `client/src/features/exercise-dashboard/components/exercise-screen.tsx`, `client/src/features/workout-reports/components/workout-report-chart-section.tsx` |
| EH-005 | 목록/컨디션/리포트 데이터를 한 번에 새로고침할 수 있어야 한다. | pull-to-refresh가 운동기록, 컨디션, 리포트 query prefix를 함께 invalidate한다. | 구현 | `client/src/features/exercise-dashboard/components/exercise-screen.tsx` |
| EH-006 | 오늘 운동 카드에서 기록 상세로 이동할 수 있어야 한다. | 카드 클릭 시 기록 source에 따라 수정 폼 또는 상세 화면으로 분기한다. | 구현 | `client/src/features/workout-records/lib/get-workout-record-route.ts` |

## 5. 수동 운동 기록 요구사항

| ID | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- |
| MW-001 | 수동 운동 기록을 새로 작성할 수 있어야 한다. | `/exercise-form`이 create 모드일 때 빈 zustand draft로 시작한다. | 구현 | `client/src/features/workout-records/components/manual-workout-form-screen.tsx`, `client/src/features/workout-records/stores/use-manual-workout-form-store.ts` |
| MW-002 | 저장된 수동 운동 기록을 다시 수정할 수 있어야 한다. | manual source 기록은 `/exercise-form?recordId=...`로 열리고 기존 record로 draft를 hydrate한다. | 구현 | `client/src/features/workout-records/components/manual-workout-form-screen.tsx` |
| MW-003 | 루틴 완료 기록은 읽기 전용 상세로 봐야 한다. | non-manual source는 `/exercise-record-detail`로 이동하고 수정 버튼이 비활성화된다. | 구현 | `client/src/features/workout-records/lib/get-workout-record-route.ts`, `client/src/features/workout-records/components/workout-record-detail-screen.tsx` |
| MW-004 | 기본 정보로 날짜와 운동시간을 입력할 수 있어야 한다. | `performedOn`, `exerciseTime` 입력을 제공한다. | 구현 | `client/src/features/workout-records/components/manual-workout-form-screen.tsx` |
| MW-005 | 유산소 입력을 세부 필드로 기록할 수 있어야 한다. | 걸음수, 러닝머신 분, 사이클 분, 천국의 계단 분을 입력한다. | 구현 | `client/src/features/workout-records/components/manual-workout-form-screen.tsx` |
| MW-006 | 근력 운동을 여러 종목/세트로 기록할 수 있어야 한다. | 운동 종목 추가, 세트 추가/삭제, 세트별 무게·횟수 입력을 제공한다. | 구현 | `client/src/features/workout-records/components/manual-workout-form-screen.tsx`, `client/src/features/workout-records/stores/use-manual-workout-form-store.ts` |
| MW-007 | 근력 입력 중 볼륨·1RM 등 참고 지표를 즉시 보여야 한다. | 각 종목에 LB, 볼륨, 1RM 추정값, MAX를 계산해 표시한다. | 구현 | `client/src/features/workout-records/lib/manual-workout-form.ts`, `client/src/features/workout-records/components/manual-workout-form-screen.tsx` |
| MW-008 | 체성분, 식단, 컨디션 메모를 함께 기록할 수 있어야 한다. | 아침/저녁 체중, 골격근량, 체지방 kg/%, 수면, 컨디션, 활동 강도, 식단 4칸, 하루 일과 보고를 입력한다. | 구현 | `client/src/features/workout-records/components/manual-workout-form-screen.tsx` |
| MW-009 | 입력 검증은 최소한 날짜/시간 형식과 내용 존재 여부를 확인해야 한다. | 클라이언트가 `performedOn` 형식, `exerciseTime` 파싱, 상세 항목 최소 1개 입력 여부를 검증한다. | 구현 | `client/src/features/workout-records/lib/manual-workout-form.ts` |
| MW-010 | 서버도 날짜·숫자 범위를 검증해야 한다. | Zod가 날짜, 시간, 세트 수, 숫자 범위, 최대 길이를 검증한다. | 구현 | `server/src/modules/workout-records/workout-records.schemas.ts` |
| MW-011 | 저장 payload는 현재 시각과 사용자 로컬 날짜를 함께 담아야 한다. | `performedAt`은 현재 UTC ISO, `performedOn`은 입력 날짜, `timeZone`은 클라이언트 IANA 타임존으로 보낸다. | 구현 | `client/src/features/workout-records/lib/manual-workout-form.ts` |
| MW-012 | 유산소 시간은 입력된 분 값을 합산해 계산해야 한다. | 러닝머신, 사이클, 천국의 계단 분 입력의 합으로 `cardio.durationSeconds`를 만든다. | 구현 | `client/src/features/workout-records/lib/manual-workout-form.ts` |
| MW-013 | 운동기록 생성 시 주간 트래커 완료도 함께 생성돼야 한다. | 서버가 `workout_records`와 `workout_completions`를 같은 트랜잭션에서 저장한다. | 구현 | `server/src/modules/workout-records/workout-records.repository.ts` |
| MW-014 | 운동기록 수정 시 연결된 주간 완료 날짜와 note도 따라가야 한다. | manual record update가 `completed_on`과 `note`를 연결된 `workout_completions`에도 반영한다. | 구현 | `server/src/modules/workout-records/workout-records.repository.ts` |
| MW-015 | 운동기록 삭제 시 연결된 주간 완료도 정리돼야 한다. | record 삭제 후 `weekly_completion_id`가 있으면 연결된 `workout_completions`를 삭제한다. | 구현 | `server/src/modules/workout-records/workout-records.repository.ts` |
| MW-016 | 저장/수정/삭제 후 연관 화면이 갱신돼야 한다. | 운동기록 mutation 성공 시 운동기록 목록, 운동 리포트, 홈 주간 트래커 query를 invalidate한다. | 구현 | `client/src/features/workout-records/api/workout-records.ts` |
| MW-017 | 운동기록 목록에서 날짜 범위 필터를 사용할 수 있어야 한다. | 캘린더 모달로 `start/end` 범위를 고르고 해당 범위만 필터링한다. | 구현 | `client/src/features/workout-records/components/workout-record-list-screen.tsx` |
| MW-018 | 운동기록 목록은 날짜 그룹과 점진적 확장을 제공해야 한다. | 날짜 헤더로 그룹핑하고 10개 단위로 더 보여준다. | 구현 | `client/src/features/workout-records/components/workout-record-list-screen.tsx`, `client/src/features/workout-records/lib/workout-record-list-metadata.ts` |
| MW-019 | 목록과 상세에서 삭제할 수 있어야 한다. | 목록 카드 long press 삭제와 상세 화면 삭제 버튼을 모두 제공한다. | 구현 | `client/src/features/workout-records/components/workout-record-list-screen.tsx`, `client/src/features/workout-records/components/workout-record-detail-screen.tsx` |
| MW-020 | 상세 화면은 수동/루틴 기록 모두를 읽기 쉬운 방식으로 보여야 한다. | 운동 시간, 총 볼륨, 유산소, 근력 세트와 함께 근력 세트, 루틴 step, 체성분, 식단, 컨디션, 하루 일과를 구분해 노출한다. | 구현 | `client/src/features/workout-records/components/workout-record-detail-screen.tsx` |

## 6. 컨디션 기록 요구사항

| ID | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- |
| CR-001 | 컨디션 기록을 새로 작성하고 수정할 수 있어야 한다. | `/condition-form`이 create/edit 모드를 모두 지원한다. | 구현 | `client/src/features/condition-records/components/condition-form-screen.tsx` |
| CR-002 | 컨디션 문항은 고정된 순서와 라벨을 가져야 한다. | 15개 컨디션 문항과 15개 근육통 문항 라벨을 client/server가 같은 순서로 공유한다. | 구현 | `client/src/features/condition-records/lib/condition-record-metadata.ts`, `server/src/modules/condition-records/condition-records.schemas.ts` |
| CR-003 | 일반 컨디션은 0~5점, 근육통은 0~4점 범위를 가져야 한다. | 선택한 점수를 다시 누르면 0으로 돌아가며, 서버도 같은 범위를 검증한다. | 구현 | `client/src/features/condition-records/stores/use-condition-form-store.ts`, `server/src/modules/condition-records/condition-records.schemas.ts` |
| CR-004 | 날짜와 주차를 함께 기록할 수 있어야 한다. | `date`, `weekNumberInput`을 받고 저장 시 숫자로 변환한다. | 구현 | `client/src/features/condition-records/components/condition-form-screen.tsx`, `client/src/features/condition-records/lib/condition-form.ts` |
| CR-005 | 동일 날짜 기록은 별도 record로 관리할 수 있어야 한다. | 현재 저장은 날짜 기준 upsert가 아니라 ID 기반 create/update다. 같은 날짜로 여러 record를 생성할 수 있다. | 구현 | `server/src/modules/condition-records/condition-records.repository.ts` |
| CR-006 | 근육 부위를 눌렀을 때 위치 안내를 볼 수 있어야 한다. | `ConditionMuscleInfoModal`이 부위별 이미지, 설명, 추천 운동을 보여준다. | 구현 | `client/src/features/condition-records/components/condition-muscle-info-modal.tsx`, `client/src/features/condition-records/lib/condition-muscle-info.ts` |
| CR-007 | 컨디션 목록에서 날짜 범위 필터를 사용할 수 있어야 한다. | 캘린더 모달로 날짜 범위를 적용하고 표시 라벨은 `전체`, `M/D`, `M/D ~ M/D` 형식을 쓴다. | 구현 | `client/src/features/condition-records/components/condition-record-list-screen.tsx`, `client/src/features/condition-records/lib/condition-record-metadata.ts` |
| CR-008 | 컨디션 목록은 날짜 그룹과 점진적 확장을 제공해야 한다. | 날짜 헤더 그룹핑과 10개 단위 더보기 구조를 제공한다. | 구현 | `client/src/features/condition-records/components/condition-record-list-screen.tsx`, `client/src/features/condition-records/stores/use-condition-record-list-store.ts` |
| CR-009 | 컨디션 카드에서 평균과 대표 상태를 빠르게 파악할 수 있어야 한다. | 컨디션 평균, 근육통 평균, 대표 근육통 부위와 badge를 카드에 표시한다. | 구현 | `client/src/features/condition-records/components/condition-record-card.tsx` |
| CR-010 | 생성/수정/삭제 후 리포트가 갱신돼야 한다. | condition mutation 성공 시 컨디션 목록과 리포트 query를 invalidate한다. | 구현 | `client/src/features/condition-records/api/condition-records.ts` |
| CR-011 | 서버는 과거 4문항 legacy 데이터를 읽을 수 있어야 한다. | service가 legacy object 형태를 15개 배열 형태로 normalize해 응답한다. | 구현 | `server/src/modules/condition-records/condition-records.service.ts` |
| CR-012 | 민감 문항도 현재 계약 안에 포함돼야 한다. | `성욕`, `발기 빈도 및 강도`, `월경 전/중/후 반응`이 현재 15문항 배열에 포함된다. | 구현 | `client/src/features/condition-records/lib/condition-record-metadata.ts`, `server/src/modules/condition-records/condition-records.schemas.ts` |

## 7. 운동 리포트 요구사항

| ID | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- |
| RP-001 | 홈과 전용 리포트 화면에서 같은 차트 컴포넌트를 재사용해야 한다. | 홈 인라인 리포트와 `/progress-chart`가 `WorkoutReportChartSection`을 공유한다. | 구현 | `client/src/features/exercise-dashboard/components/exercise-screen.tsx`, `client/src/features/workout-reports/components/workout-report-screen.tsx` |
| RP-002 | 리포트는 탭으로 차트 종류를 전환할 수 있어야 한다. | `볼륨`, `체중`, `체성분`, `컨디션`, `빈도` 5개 탭을 zustand로 관리한다. | 구현 | `client/src/features/workout-reports/components/workout-report-chart-section.tsx`, `client/src/features/workout-reports/stores/use-workout-report-store.ts` |
| RP-003 | totals는 전체 운동기록 기준 누적 값을 제공해야 한다. | 총 운동 횟수, 운동일 수, 운동 시간, 총 볼륨, 유산소 시간, 컨디션 체크 수를 반환한다. | 구현 | `server/src/modules/workout-reports/workout-reports.service.ts` |
| RP-004 | manualTotals는 manual source만 별도 집계해야 한다. | manual record만 대상으로 `workoutRecordCount`, `totalVolumeKg`를 계산한다. | 구현 | `server/src/modules/workout-reports/workout-reports.service.ts` |
| RP-005 | currentWeek는 기준일이 속한 주의 운동 건수와 운동일 수를 보여야 한다. | `referenceDate` 기준 현재 주의 `workoutRecordCount`, `workoutDayCount`를 응답한다. | 구현 | `server/src/modules/workout-reports/workout-reports.service.ts` |
| RP-006 | 주간 빈도는 최근 12주를 보여야 한다. | `weeklyFrequency`가 최근 12주의 `weekStartDate`, `weekEndDate`, `workoutRecordCount`, `workoutDayCount`를 반환한다. | 구현 | `server/src/modules/workout-reports/workout-reports.service.ts` |
| RP-007 | 리포트 주간 기준은 현재 서버 구현과 일치해야 한다. | 리포트는 `weekStartsOn: 0`으로 일요일 시작 주간을 사용한다. 홈 주간 트래커의 월요일 시작 규칙과는 다르다. | 구현 | `server/src/modules/workout-reports/workout-reports.service.ts` |
| RP-008 | 볼륨 추이는 볼륨이 있는 기록만 보여야 한다. | `totalVolumeKg > 0` 기록만 날짜/시각 정렬 후 최근 30개를 반환한다. | 구현 | `server/src/modules/workout-reports/workout-reports.service.ts` |
| RP-009 | 체중 추이는 manual record의 체중 데이터만 사용해야 한다. | 아침 체중 우선, 없으면 `weightKg`를 사용해 최근 30개를 반환한다. | 구현 | `server/src/modules/workout-reports/workout-reports.service.ts` |
| RP-010 | 체성분 추이는 체중·골격근량·체지방률 값이 있는 시점만 보여야 한다. | 세 값 중 하나라도 0보다 크면 포함해 최근 30개를 반환한다. | 구현 | `server/src/modules/workout-reports/workout-reports.service.ts` |
| RP-011 | 컨디션 추이는 날짜와 생성 시각 기준으로 정렬해야 한다. | `checked_on`, `created_at` 순으로 정렬한 뒤 평균 컨디션 점수만 최근 30개 반환한다. | 구현 | `server/src/modules/workout-reports/workout-reports.service.ts` |
| RP-012 | 탭별 간단한 해석 문구를 보여야 한다. | 최근 값 차이나 평균을 이용한 insight 문구를 탭별로 계산해 표시한다. | 구현 | `client/src/features/workout-reports/components/report-format.ts` |

## 8. API 구현 현황

| Method | 경로 | 목적 | 비고 |
| --- | --- | --- | --- |
| `GET` | `/api/workout-records` | 운동기록 목록 조회 | `from?`, `to?`, `source?` |
| `GET` | `/api/workout-records/:recordId` | 운동기록 상세 조회 | source에 따라 manual/routine 공용 |
| `POST` | `/api/workout-records/manual` | 수동 운동 기록 생성 | 주간 완료도 함께 생성 |
| `PUT` | `/api/workout-records/:recordId` | 수동 운동 기록 수정 | 연결된 주간 완료 날짜/note도 함께 갱신 |
| `DELETE` | `/api/workout-records/:recordId` | 운동기록 삭제 | 연결된 주간 완료도 함께 삭제 |
| `POST` | `/api/workout-records/routine-completions` | 루틴 완료 저장 | 활성 운동 완료 흐름 |
| `GET` | `/api/condition-records` | 컨디션 기록 목록 조회 | `from?`, `to?` |
| `GET` | `/api/condition-records/:conditionId` | 컨디션 기록 상세 조회 | 수정 폼 진입용 |
| `POST` | `/api/condition-records` | 컨디션 기록 생성 | 날짜 upsert 아님 |
| `PUT` | `/api/condition-records/:conditionId` | 컨디션 기록 수정 | ID 기준 수정 |
| `DELETE` | `/api/condition-records/:conditionId` | 컨디션 기록 삭제 | 목록/리포트 invalidate |
| `GET` | `/api/workout-reports/summary` | 리포트 요약 조회 | `referenceDate?` |

## 9. 데이터 계약

### 수동 운동 기록 입력/저장

| 필드 | 설명 |
| --- | --- |
| `performedAt` | 저장 시점의 UTC ISO 시각 |
| `performedOn` | 클라이언트 기준 운동 날짜 |
| `timeZone` | 클라이언트 IANA 타임존 |
| `durationSeconds` | `exerciseTime`을 분/시간 문자열에서 파싱한 운동 시간 |
| `cardio` | `steps`, `treadmillMinutes`, `cycleMinutes`, `stairClimberMinutes`, 계산된 `durationSeconds` |
| `strengthExercises[]` | 운동명, 세트 배열, 휴식, RIR, 계산된 볼륨/LB/1RM/MAX |
| `bodyComposition` | 아침/저녁 체중, 골격근량, 체지방 kg, 체지방률 |
| `sleep` / `condition` / `activityLevel` | 자유 입력 텍스트 |
| `meals[]` | 최대 4개 식사 메모 |
| `dailyReport` / `memo` | 하루 일과 보고와 메모 |
| `location` | `activityLevel` 문자열을 기반으로 `home`, `gym`, `unknown` 중 하나로 추론 |

### 컨디션 기록 입력/저장

| 필드 | 설명 |
| --- | --- |
| `date` | 클라이언트 기준 체크일 |
| `weekNumber` | 0~999 정수 |
| `conditions[]` | 15개 고정 라벨 배열, 점수는 0~5 |
| `muscleSoreness[]` | 15개 고정 라벨 배열, 점수는 0~4 |
| `timeZone` | 클라이언트 IANA 타임존 |

### 리포트 응답

| 필드 | 설명 |
| --- | --- |
| `referenceDate` | 집계 기준 날짜 |
| `totals` | 전체 기록 기준 누적 집계 |
| `manualTotals` | manual source 전용 집계 |
| `currentWeek` | 기준일이 속한 주의 집계 |
| `condition` | 컨디션/근육통 평균 |
| `weeklyFrequency` | 최근 12주 빈도 |
| `volumeTrend` | 최근 30개 볼륨 추이 |
| `weightTrend` | 최근 30개 체중 추이 |
| `bodyCompositionTrend` | 최근 30개 체성분 추이 |
| `conditionTrend` | 최근 30개 컨디션 추이 |

## 10. 테스트 근거

| 구분 | 파일 |
| --- | --- |
| 클라이언트 운동기록 form/포맷 | `client/src/features/workout-records/lib/__tests__/manual-workout-form.test.ts`, `client/src/features/workout-records/lib/__tests__/get-workout-record-route.test.ts` |
| 클라이언트 컨디션 form/card | `client/src/features/condition-records/lib/__tests__/condition-form.test.ts`, `client/src/features/condition-records/components/__tests__/condition-record-card.test.tsx` |
| 클라이언트 리포트 포맷/API | `client/src/features/workout-reports/components/__tests__/report-format.test.ts`, `client/src/features/workout-reports/api/__tests__/workout-report-summary.test.ts` |
| 서버 운동기록 | `server/src/modules/workout-records/__tests__/workout-records.service.spec.ts`, `server/src/modules/workout-records/__tests__/workout-records.controller.integration.spec.ts` |
| 서버 컨디션 | `server/src/modules/condition-records/__tests__/condition-records.service.spec.ts`, `server/src/modules/condition-records/__tests__/condition-records.controller.integration.spec.ts` |
| 서버 리포트 | `server/src/modules/workout-reports/__tests__/workout-reports.service.spec.ts` |

## 11. 현재 갭 및 주의사항

| ID | 항목 | 현재 영향 |
| --- | --- | --- |
| ER-GAP-001 | 트레이너 열람 미구현 | 회원 기록을 트레이너 계정에서 보는 별도 권한 흐름이 없다. |
| ER-GAP-002 | AI 조언 연동 미구현 | 기록과 컨디션을 AI 프롬프트 입력으로 가공하는 단계가 없다. |
| ER-GAP-003 | 컨디션 날짜당 단일 레코드 정책 부재 | 동일 날짜 record 중 하나를 대표값으로 강제하지 않는다. 홈 `오늘의 컨디션`은 같은 날짜의 최신 record 1건만 노출한다. |
| ER-GAP-004 | 주간 기준 불일치 | 홈 주간 트래커는 월요일 시작, 운동 리포트는 일요일 시작 주간을 사용한다. |
| ER-GAP-005 | draft 영속화 부재 | 운동/컨디션 폼 초안은 zustand 메모리 상태라 앱 재시작 시 사라진다. |
