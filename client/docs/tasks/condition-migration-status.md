# 컨디션 마이그레이션 작업 정리

작성일자: 2026-07-24

## 범위

- 원본 기준
  - `2026-07-13/my-PT-Diary/lib/types.ts`
  - `2026-07-13/my-PT-Diary/app/condition-form.tsx`
  - `2026-07-13/my-PT-Diary/app/condition-list.tsx`
  - `2026-07-13/my-PT-Diary/app/(tabs)/exercise.tsx`
- 현재 구현 기준
  - `at-pt/server/src/modules/condition-records/**`
  - `at-pt/server/src/database/database.service.ts`
  - `at-pt/client/src/features/condition-records/**`
  - `at-pt/client/src/features/exercise-dashboard/components/exercise-screen.tsx`
  - `at-pt/client/src/features/workout-reports/components/report-format.ts`
  - `at-pt/client/src/shared/api/generated/models/**`

## 1. 원본 기준으로 제대로 마이그레이션한 작업

| 영역 | 마이그레이션 완료 내용 | 현재 파일 |
| --- | --- | --- |
| 서버 계약 | 원본 `ConditionCheck` 구조에 맞춰 `date`, `weekNumber`, 15개 `conditions[]`, 15개 `muscleSoreness[]` 계약으로 확장했다. 기존 4개 컨디션/6개 근육통 축소 계약을 제거했다. | `server/src/modules/condition-records/condition-records.constants.ts`, `server/src/modules/condition-records/condition-records.schemas.ts`, `server/src/modules/condition-records/dto/create-condition-record.dto.ts`, `server/src/modules/condition-records/dto/condition-record-response.dto.ts` |
| 서버 저장 정책 | 원본처럼 생성과 수정을 `id` 기준으로 분리했다. 기존 `(user_key, checked_on)` 기준 upsert를 제거해서 새 작성과 수정 흐름이 섞이지 않게 했다. | `server/src/modules/condition-records/condition-records.repository.ts`, `server/src/modules/condition-records/condition-records.service.ts`, `server/src/database/database.service.ts` |
| 서버 요약값 유지 | 원본 UI는 평균 요약을 목록 카드에서 클라이언트가 계산했지만, 현재 앱의 리포트 소비자를 위해 서버 `summary` 계산은 유지했다. 다만 계산 대상은 15개 배열 점수 기준으로 바꿨다. | `server/src/modules/condition-records/condition-records.service.ts` |
| 서버 테스트 | 새 계약과 생성/조회 흐름에 맞게 서비스/컨트롤러 테스트, 리포트 의존 테스트를 갱신했다. | `server/src/modules/condition-records/__tests__/condition-records.service.spec.ts`, `server/src/modules/condition-records/__tests__/condition-records.controller.integration.spec.ts`, `server/src/modules/workout-reports/__tests__/workout-reports.service.spec.ts` |
| Orval 재생성 | 서버 Swagger 기준으로 클라이언트 생성 모델을 다시 만들었다. 현재 클라이언트는 `ConditionItemDto[]` 기반 모델을 사용한다. | `client/src/shared/api/generated/models/createConditionRecordDto.ts`, `client/src/shared/api/generated/models/conditionRecordDto.ts`, `client/src/shared/api/generated/models/conditionItemDto.ts` |
| 입력 화면 상태 구조 | 폼 상태를 원본 도메인 구조에 맞춰 `date`, `weekNumberInput`, `conditions[]`, `muscleSoreness[]`로 재구성했고, zustand 슬라이스로 분리했다. | `client/src/features/condition-records/stores/use-condition-form-store.ts`, `client/src/features/condition-records/lib/condition-form.ts` |
| 입력 화면 UX | 날짜/주차 입력, 컨디션 15문항 1~5 토글, 근육통 15문항 1~4 토글, 수정 모드 로딩, 저장 후 목록 복귀 흐름을 원본 기준으로 복원했다. | `client/src/features/condition-records/components/condition-form-screen.tsx`, `client/src/features/condition-records/components/condition-score-row.tsx` |
| 근육 위치 안내 | 원본의 근육 부위 안내 모달을 Granite 쪽 컴포넌트로 옮기고, 원본 PNG 자산도 같이 복사해 연결했다. | `client/src/features/condition-records/lib/condition-muscle-info.ts`, `client/src/features/condition-records/components/condition-muscle-info-modal.tsx`, `client/src/assets/muscles/*` |
| 목록/필터 화면 UX | 날짜 헤더 묶기, 오늘 배지, 달력 범위 필터, 기록 존재일 마킹, 10건 단위 점진 로드, 롱프레스 삭제 흐름을 복원했다. 목록 상태도 zustand 슬라이스로 분리했다. | `client/src/features/condition-records/components/condition-record-list-screen.tsx`, `client/src/features/condition-records/components/condition-calendar-modal.tsx`, `client/src/features/condition-records/stores/use-condition-record-list-store.ts` |
| 목록 카드 요약 | 원본처럼 컨디션 평균, 근육통 평균, 근육통 부위 요약을 카드에 다시 표시한다. | `client/src/features/condition-records/components/condition-record-card.tsx`, `client/src/features/condition-records/lib/condition-record-metadata.ts` |
| 운동 기록 탭 연동 | 오늘 컨디션 빈 상태의 `컨디션 체크` 버튼, 상단 `전체 기록보기` 링크, 오늘 기록 요약 카드 흐름을 원본 쪽으로 맞췄다. | `client/src/features/exercise-dashboard/components/exercise-screen.tsx` |
| 리포트 연동 | 컨디션 추이 포맷터가 새 `date` 필드를 기준으로 동작하도록 갱신했다. | `client/src/features/workout-reports/components/report-format.ts` |
| 검증 | 서버/클라이언트 타입체크와 관련 테스트를 통과시켰다. | `server`: `npm run typecheck`, `npm test -- condition-records workout-reports` / `client`: `npm run typecheck`, `npm test -- condition-records workout-reports exercise-dashboard` |

## 2. 제약사항 때문에 임시로 구현한 내용

| 항목 | 현재 처리 방식 | 왜 임시인지 | 후속 정리 방향 |
| --- | --- | --- | --- |
| 기존 축소 계약 레코드 호환 | 서버가 `normalizeConditions`, `normalizeMuscleSoreness`로 예전 4개/6개 JSON도 읽을 수 있게 뒀다. | 이미 저장된 구형 레코드가 있을 수 있어서, DB를 한 번에 깨지 않으려고 읽기 호환 레이어를 남겼다. | 구형 레코드를 SQL/스크립트로 15개 배열 구조로 백필한 뒤 fallback을 제거한다. |
| DB 스키마 전환 방식 | `week_number` 컬럼 추가와 unique 제거만 넣었고, 기존 JSON 데이터 변환 마이그레이션은 넣지 않았다. | 지금은 앱 코드를 먼저 복구하는 것이 우선이라 데이터 이관까지 한 턴에 끝내지 않았다. | 운영/개발 DB 상태를 보고 JSON 구조 일괄 변환 마이그레이션을 따로 만든다. |
| 원본 Expo 화면 셸 대체 | `ParallaxBackground`, `AppHeader`, `useSafeAreaInsets`, 전역 FAB 대신 Granite 화면 안에서 로컬 헤더/버튼으로 대체했다. | Granite 현재 구조에는 원본 Expo Router 레이아웃과 1:1 대응 셸이 없다. | 공용 Granite 헤더/플로팅 액션 패턴이 정해지면 거기에 다시 맞춘다. |
| 햅틱 피드백 제거 | 점수 선택, 저장 성공, 필터 열기 등에서 원본 `expo-haptics`는 쓰지 않았다. | 현재 앱에서 Expo Haptics 패턴을 그대로 쓰고 있지 않다. | Granite 쪽 공용 햅틱 유틸 또는 허용 패턴이 정해지면 다시 붙인다. |
| 캘린더/툴팁 UI 단순화 | 아이콘 기반 세부 표현 대신 텍스트 버튼과 기본 RN 컴포넌트로 구성했다. | 원본 라이브러리/아이콘 조합을 그대로 들고 오지 않고, 현재 앱 의존성 안에서 구현했다. | 디자인 시스템이나 공용 아이콘 정책이 정리되면 시각 디테일을 다시 맞춘다. |
| today 카드 정렬 근거 | 오늘 카드와 목록은 `date DESC`, 동률이면 `createdAt DESC` 기준으로 대표 레코드를 잡는다. | 원본은 로컬 저장 순서에 기대고 있었고, 서버 전환 후에는 명시 기준이 필요했다. | 제품 정책으로 “같은 날짜 여러 기록 허용/대표값 규칙”이 확정되면 그 정책으로 고정한다. |

## 3. 이번 작업에서 미구현한 작업

| 항목 | 현재 상태 | 왜 이번 작업에서 남겼는지 | 후속 파일 |
| --- | --- | --- | --- |
| 구형 DB 레코드 일괄 변환 | 미구현 | 읽기 fallback만 넣었고, 실제 DB JSON 백필은 안 했다. | `server/src/modules/condition-records/condition-records.service.ts`, `server/src/database/database.service.ts` |
| 원본 `_layout.tsx` 수준의 전역 FAB 복원 | 미구현 | Granite 쪽 라우트/레이아웃 구조가 원본 Expo Router와 달라서 화면 내부 버튼으로 대체했다. | `client/src/features/condition-records/components/condition-record-list-screen.tsx`, 필요 시 공용 레이아웃 파일 |
| 원본 배경/상단 셸 1:1 시각 복원 | 미구현 | 동작 마이그레이션을 우선했고, `ParallaxBackground`/`AppHeader` 비주얼은 그대로 안 옮겼다. | `client/src/features/condition-records/components/condition-form-screen.tsx`, `client/src/features/condition-records/components/condition-record-list-screen.tsx` |
| 햅틱 연동 | 미구현 | Granite 쪽 공용 패턴 없이 일단 기능만 옮겼다. | 입력/목록 컴포넌트 전반 |
| 폼/목록 화면 UI 테스트 | 미구현 | 이번엔 API/포맷/폼 로직 테스트만 갱신했고, 실제 화면 상호작용 테스트는 추가하지 않았다. | `client/src/features/condition-records/components/**/__tests__` |
| 원본 트레이너 열람 흐름 | 미구현 | 이번 작업 범위를 `condition-form`, `condition-list`, `/exercise` 연동으로 제한했다. | 원본 `app/trainer-condition-view.tsx`에 대응하는 at-pt 기능 필요 |
| 원본 AI/분석 소비자 정합성 점검 | 미구현 | 이번 작업은 저장/조회/표시 마이그레이션이 우선이었고, 컨디션 데이터를 downstream에서 어떻게 읽는지까지는 안 건드렸다. | 향후 AI Hub, 분석, 리포트 소비자 점검 필요 |

## 빠르게 확인할 체크포인트

- 원본 필드 개수 복원 여부
  - `conditions.length === 15`
  - `muscleSoreness.length === 15`
- 새 작성과 수정이 분리됐는지
  - `POST /api/condition-records` 는 새 `id` 생성
  - `PUT /api/condition-records/:conditionId` 는 기존 `id` 수정
- today 빈 상태와 today 기록 상태가 원본 흐름과 맞는지
  - 빈 상태: `/exercise` 에서 `컨디션 체크`
  - 기록 있음: 요약 카드 표시, 상단은 `전체 기록보기`
- 목록에서 날짜 헤더/오늘 배지/기간 필터/롱프레스 삭제가 동작하는지

