# 운동 기록 완전 구현

작성일자: 2026-07-23

## 1. 문서 목적

기존 바이브코딩 앱의 운동기록 영역을 `at-pt`에 서버 중심 구조로 이식하기 위한 구현 범위와 순서를 정의한다.

이 문서는 다음 기능을 한 묶음으로 관리한다.

| 도메인 | 기능 | 이번 구현 대상 |
| --- | --- | --- |
| 운동기록 | 운동 기록 공통 저장·동기화 | 대상 |
| 운동기록 | 운동 기록 홈 `/exercise` | 대상 |
| 운동기록 | 개인 운동 기록 입력·목록 | 대상 |
| 운동기록 | 컨디션 기록 입력·목록 | 대상 |
| 운동기록 | 운동 리포트 | 대상 |
| 운동기록 | 트레이너 열람 | 이번 구현 제외, 미구현 상태로 추적 |
| 운동기록 | AI 조언 연동 | 이번 구현 제외, 미구현 상태로 추적 |

## 2. 기존 원본과 QA 근거

| ID | 기능 | 기존 구현 위치 | QA 근거 | 원본 구현률 | 이식 판단 |
| --- | --- | --- | --- | --- | --- |
| ER-SRC-001 | 운동 기록 공통 저장·동기화 | `2026-07-13/my-PT-Diary/lib/storage.ts`, `lib/api/workout.api.ts`, `server/routes.ts` | `2026-07-13/pt-diary-qa/exercise/README.md`, `운동_QA_추적매트릭스.csv` | 20% | 서버 중심으로 재작성 |
| ER-SRC-002 | 운동 기록 홈 `/exercise` | `2026-07-13/my-PT-Diary/app/(tabs)/exercise.tsx` | `my-pt-diary-qa-exercise-1.md` | 50% | UI 흐름 이식, 데이터는 서버 기준 |
| ER-SRC-003 | 개인 운동 기록 입력·목록 | `2026-07-13/my-PT-Diary/app/exercise-form.tsx`, `app/exercise-list.tsx` | `my-pt-diary-qa-exercise-2-record.md` | 50% | 폼·목록 UX 이식, 검증·저장은 재작성 |
| ER-SRC-004 | 컨디션 기록 입력·목록 | `2026-07-13/my-PT-Diary/app/condition-form.tsx`, `app/condition-list.tsx` | `my-pt-diary-qa-exercise-3-condition.md` | 50% | 문항 UI 이식, 정책·저장은 재작성 |
| ER-SRC-005 | 운동 리포트 | `2026-07-13/my-PT-Diary/app/(tabs)/exercise.tsx`, `components/ProgressChartSection.tsx`, `app/progress-chart.tsx` | `my-pt-diary-qa-exercise-4-report.md` | 40% | 집계 기준 통일 후 이식 |
| ER-SRC-006 | 활성 운동 기록 연계 | `2026-07-13/my-PT-Diary/app/active-workout.tsx` | `home/my-pt-dirary-qa-active-workout.md` | 60% | 이미 루틴 완료 저장 일부 구현, 운동기록 탭 표시 필요 |
| ER-SRC-007 | 트레이너 컨디션 열람 | `2026-07-13/my-PT-Diary/app/trainer-condition-view.tsx`, `server/trainer-routes.ts` | `my-pt-diary-qa-exercise-3-condition.md` | 일부 구현 | 이번 구현 제외, 미구현 상태 추적 |
| ER-SRC-008 | AI 조언 컨디션 활용 | `2026-07-13/my-PT-Diary/server/ai-routes.ts` | `my-pt-diary-qa-exercise-3-condition.md` | 불일치 | 이번 구현 제외, 미구현 상태 추적 |

## 3. 구현 원칙

| 원칙 | 내용 |
| --- | --- |
| 서버 기준 | 운동기록, 수동 운동, 컨디션, 리포트의 기준 데이터는 PostgreSQL에 저장한다. |
| 로컬 우선 제거 | 기존 앱의 `AsyncStorage` 공용 키와 서버 0건 폴백 구조는 가져오지 않는다. |
| 사용자 분리 | 모든 조회·생성·수정·삭제는 Apps in Toss 익명 사용자 키 기준으로 분리한다. |
| 날짜 기준 | 저장 시각은 UTC ISO, 운동일·컨디션 체크일은 클라이언트 타임존 기준 `YYYY-MM-DD`로 저장한다. |
| 검증 우선 | 날짜, 숫자, 세트, 점수, 필수 운동명은 서버 DTO/schema에서 검증한다. |
| 실패 표시 | 서버 저장·삭제 실패를 성공처럼 처리하지 않는다. 화면에서 실패 상태와 재시도를 제공한다. |
| 기존 UI 선별 | 기존 화면의 입력 구조와 목록 UX는 참고하되, 로컬 저장·동기화·Alert 중심 오류 처리는 재작성한다. |
| AI 제외 | AI 조언 연동은 이번 구현 범위에서 제외한다. 단, 미구현 요구사항으로 문서에 남긴다. |

## 4. 이번 구현 범위와 제외 범위

| 구분 | 포함 | 제외 |
| --- | --- | --- |
| 운동 기록 홈 | 오늘 운동, 최근 운동, 오늘 컨디션 요약, 리포트 요약 진입 | 트레이너 회원 기록 열람 |
| 개인 운동 기록 | 생성, 수정, 목록, 상세, 삭제, 기간 필터 | 영상 촬영, 자세 분석 |
| 루틴 완료 기록 | 활성 운동에서 저장된 루틴 완료 기록을 운동기록 목록에 표시 | 루틴 완료를 자동으로 중량·볼륨 있는 근력 기록으로 변환 |
| 컨디션 기록 | 생성, 수정, 목록, 상세, 삭제, 날짜 필터 | AI 조언 프롬프트 연결 |
| 운동 리포트 | 서버 기록 기준 볼륨, 빈도, 컨디션, 체성분 요약 | 의료 판단, AI 해석 |
| 저장·동기화 | 서버 기준 CRUD, 오류 상태, 쿼리 무효화 | 기존 로컬 공용 캐시와 자동 서버 동기화 |

## 5. 데이터 정책

| 항목 | 정책 |
| --- | --- |
| 사용자 식별 | `x-user-key` 헤더의 Apps in Toss 익명 사용자 키 |
| 기준 저장소 | PostgreSQL |
| 로컬 저장 | 기준 데이터로 사용하지 않는다. 필요 시 React Query 캐시만 사용한다. |
| 운동일 | 클라이언트 기준 `performedOn` 또는 `completedOn` |
| 생성 시각 | 서버 `createdAt`, UTC |
| 수정 시각 | 서버 `updatedAt`, UTC |
| 삭제 | 사용자 소유 레코드만 삭제 가능 |
| 서버 0건 | 정상 빈 목록으로 표시한다. 로컬 기록으로 대체하지 않는다. |
| 서버 오류 | 오류 상태를 표시한다. 기존 데이터를 성공처럼 덮어쓰지 않는다. |

## 6. 대상 서버 도메인

| 서버 도메인 | 역할 | 상태 |
| --- | --- | --- |
| `workout-records` | 루틴 완료 기록, 수동 개인 운동 기록, 운동 기록 목록·상세·삭제 | 구현 |
| `condition-records` | 컨디션 기록 생성·수정·목록·상세·삭제 | 구현 |
| `workout-reports` | 운동 기록과 컨디션 기록 기반 리포트 집계 | 구현 |
| `weekly-tracker` | 운동 완료일·스트릭 계산 | 구현됨 |
| `trainer-records` | 트레이너가 회원 운동·컨디션을 열람하는 기능 | 이번 범위 제외, 미구현 |
| `ai-context` | AI가 운동·컨디션 요약을 읽는 기능 | 이번 범위 제외, 미구현 |

## 7. 대상 클라이언트 폴더 구조

| 위치 | 역할 |
| --- | --- |
| `client/src/pages/exercise.tsx` | 운동기록 탭 라우트 |
| `client/pages/exercise.tsx` | Granite page wrapper |
| `client/src/features/workout-records` | 운동기록 홈, 목록, 상세, 수동 입력·수정, API wrapper |
| `client/src/features/condition-records` | 컨디션 입력, 목록, 상세, API wrapper |
| `client/src/features/workout-reports` | 운동 리포트 카드, 차트, 집계 표시 |
| `client/src/shared/lib/date.ts` | 날짜·시간·타임존 유틸 |
| `client/src/shared/api/generated` | Orval 생성 API |

## 8. 사용자 워크플로우

| 순서 | 사용자 행동 | 시스템 동작 | 필요한 구현 |
| --- | --- | --- | --- |
| 1 | 하단 탭에서 `기록`을 누른다. | `/exercise` 운동기록 홈을 연다. | 탭 라우팅, 운동기록 홈 |
| 2 | 운동기록 홈을 본다. | 오늘 운동, 최근 기록, 오늘 컨디션, 리포트 요약을 서버에서 조회한다. | 서버 조회 API, 로딩·오류 상태 |
| 3 | `운동 기록하기`를 누른다. | 개인 운동 기록 입력 화면을 연다. | 수동 운동 생성 폼 |
| 4 | 근력·유산소·체성분을 입력한다. | 날짜·숫자·세트·운동명을 검증한다. | 입력 컴포넌트, 검증 |
| 5 | 저장한다. | 서버에 개인 운동 기록을 생성하고 목록·홈·주간 트래커를 갱신한다. | 생성 API, query invalidate |
| 6 | 전체 운동 기록을 본다. | 기간 필터와 최신순 목록을 표시한다. | 목록 API, 필터 |
| 7 | 기록을 선택한다. | 상세 화면에서 운동 항목과 메타 정보를 표시한다. | 상세 API |
| 8 | 기록을 수정한다. | 기존 기록을 서버에서 갱신한다. | 수정 API |
| 9 | 기록을 삭제한다. | 서버 기록과 연결된 완료 기록을 삭제하고 홈·리포트를 갱신한다. | 삭제 API, 확인 UI |
| 10 | 컨디션 체크를 작성한다. | 컨디션·근육통 점수를 서버에 저장한다. | 컨디션 생성 API |
| 11 | 컨디션 목록을 본다. | 날짜별 컨디션 기록을 최신순으로 표시한다. | 컨디션 목록 API |
| 12 | 리포트를 본다. | 운동·컨디션 데이터를 같은 기준으로 집계한다. | 리포트 집계 API 또는 집계 hook |

## 9. 요구사항 및 구현 현황

| ID | 구분 | 요구사항·기대 동작 | 현재 `at-pt` 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- | --- |
| ER-001 | 라우팅 | 하단 탭 `기록`에서 운동기록 홈으로 이동한다. | `/exercise` 라우트와 하단 탭 이동 구현 | 구현 | `client/src/features/home/components/home-tab-bar.tsx`, `client/src/pages/exercise.tsx` |
| ER-002 | 운동기록 홈 | 오늘 운동, 최근 기록, 오늘 컨디션, 리포트 요약을 표시한다. | 운동기록 홈 구현 | 구현 | `client/src/features/exercise-dashboard/components/exercise-screen.tsx` |
| ER-003 | 서버 기준 조회 | 정상 0건과 서버 오류를 구분한다. | Suspense/error/empty 상태와 서버 API wrapper 구현 | 구현 | `client/src/shared/components/async-state.tsx`, `client/src/features/*/api` |
| ER-004 | 사용자 분리 | 모든 기록은 현재 사용자 키로 분리된다. | API wrapper에서 `x-user-key` 헤더 통일 | 구현 | `client/src/features/workout-records/api`, `client/src/features/condition-records/api` |
| ER-005 | 루틴 완료 목록 표시 | 활성 운동 완료 기록이 운동기록 목록에 표시된다. | 운동 기록 목록/상세에서 routine source 표시 | 구현 | `client/src/features/workout-records/components` |
| ER-006 | 개인 운동 생성 | 사용자가 루틴 없이 직접 운동 기록을 작성한다. | 수동 운동 작성 폼 구현 | 구현 | `client/src/features/workout-records/components/manual-workout-form-screen.tsx` |
| ER-007 | 개인 운동 수정 | 저장된 개인 운동 기록을 다시 열어 수정한다. | 수동 운동 수정 폼 구현 | 구현 | `client/src/pages/exercise-form.tsx` |
| ER-008 | 개인 운동 목록 | 운동 기록을 최신순과 기간 필터로 조회한다. | 전체/오늘/최근 7일 목록 구현 | 구현 | `client/src/features/workout-records/components/workout-record-list-screen.tsx` |
| ER-009 | 개인 운동 삭제 | 사용자가 명확한 삭제 버튼으로 운동 기록을 삭제한다. | 상세 화면 삭제 구현 | 구현 | `client/src/features/workout-records/components/workout-record-detail-screen.tsx` |
| ER-010 | 날짜 검증 | 날짜는 실제 존재하는 `YYYY-MM-DD`만 저장된다. | 클라이언트 형식 검증과 서버 검증 구현 | 구현 | `client/src/features/workout-records/lib/manual-workout-form.ts` |
| ER-011 | 숫자 검증 | 운동 시간, 유산소 시간, 걸음 수, 중량, 횟수, 체성분 값은 범위를 검증한다. | 클라이언트 payload 정규화와 서버 범위 검증 구현 | 구현 | `client/src/features/workout-records/lib/manual-workout-form.ts`, `server/src/modules/workout-records` |
| ER-012 | 운동 항목 검증 | 근력 운동은 운동명과 세트 배열이 유효해야 한다. | 근력 운동명/세트 정규화와 서버 검증 구현 | 구현 | `client/src/features/workout-records/lib/manual-workout-form.ts` |
| ER-013 | 컨디션 생성 | 사용자가 컨디션과 근육통 점수를 저장한다. | 컨디션 작성 폼 구현 | 구현 | `client/src/features/condition-records/components/condition-form-screen.tsx` |
| ER-014 | 컨디션 수정 | 기존 컨디션 기록을 다시 열어 수정한다. | 컨디션 수정 폼 구현 | 구현 | `client/src/pages/condition-form.tsx` |
| ER-015 | 컨디션 목록·필터 | 컨디션 기록을 최신순과 기간 필터로 조회한다. | 컨디션 목록 구현 | 구현 | `client/src/features/condition-records/components/condition-record-list-screen.tsx` |
| ER-016 | 컨디션 삭제 | 컨디션 기록을 명확한 버튼과 확인 절차로 삭제한다. | 수정 폼 삭제 구현 | 구현 | `client/src/features/condition-records/components/condition-form-screen.tsx` |
| ER-017 | 컨디션 점수 의미 | 컨디션 1~5와 근육통 1~4의 의미를 입력·요약에서 일관되게 쓴다. | 점수 라벨 유틸과 입력 UI 구현 | 구현 | `client/src/features/condition-records/lib/condition-form.ts` |
| ER-018 | 컨디션 날짜 정책 | 날짜당 1건 대표 기록으로 관리한다. 같은 날짜 저장 시 기존 기록을 수정한다. | 서버 upsert 정책과 프론트 저장 연결 구현 | 구현 | `server/src/modules/condition-records`, `client/src/features/condition-records/api` |
| ER-019 | 민감 문항 정책 | 민감 문항은 기본 구현에서 제외하고 일반 컨디션·근육통 문항만 제공한다. | 미구현 | 미구현 | QA `Condition.QuestionnaireRelevance` |
| ER-020 | 리포트 요약 | 총 운동 횟수, 총 볼륨, 컨디션 체크 수를 같은 기준으로 표시한다. | 리포트 요약 화면 구현 | 구현 | `client/src/features/workout-reports/components/workout-report-screen.tsx` |
| ER-021 | 볼륨 추이 | 날짜 기준으로 운동 볼륨 추이를 표시한다. | 볼륨 추이 섹션 구현 | 구현 | `client/src/features/workout-reports/components/report-format.ts` |
| ER-022 | 운동 빈도 | 홈 주간 트래커와 같은 월요일 시작 주 기준으로 빈도를 계산한다. | 서버 요약 기반 주간 빈도 표시 구현 | 구현 | `server/src/modules/workout-reports`, `client/src/features/workout-reports` |
| ER-023 | 컨디션 추이 | 컨디션 기록을 측정 날짜 기준으로 정렬해 추이를 표시한다. | 컨디션 추이 섹션 구현 | 구현 | `client/src/features/workout-reports/components/report-format.ts` |
| ER-024 | 체성분 추이 | 개인 운동 기록의 체성분 값을 날짜순으로 표시한다. | 체성분 추이 섹션 구현 | 구현 | `client/src/features/workout-reports/components/workout-report-screen.tsx` |
| ER-025 | 주간 트래커 연동 | 운동 기록 생성·삭제 후 홈 주간 트래커를 갱신한다. | 수동 운동/루틴 완료/삭제 후 invalidate 구현 | 구현 | `client/src/features/workout-records/api/workout-records.ts` |
| ER-026 | Orval 생성 | OpenAPI 변경 후 클라이언트 API를 재생성한다. | Orval 재생성 완료 | 구현 | `client/orval.config.ts` |
| ER-027 | Swagger | 신규 운동기록 API를 Swagger에 노출한다. | Swagger DTO nullable 타입 보강과 문서 노출 완료 | 구현 | `server/src/main.ts`, `server/src/modules/*/dto` |
| ER-028 | 트레이너 열람 | 트레이너가 연결된 회원의 운동·컨디션 기록을 열람한다. | 이번 구현 범위 제외. `at-pt` 미구현 | 미구현 | 기존 `app/trainer-condition-view.tsx`, `server/trainer-routes.ts` |
| ER-029 | AI 조언 연동 | AI가 운동·컨디션 요약을 읽어 조언에 활용한다. | 이번 구현 범위 제외. `at-pt` 미구현 | 미구현 | 기존 `server/ai-routes.ts` |

## 10. 서버 API 계획

| Method | 경로 | 목적 | 이번 구현 |
| --- | --- | --- | --- |
| `GET` | `/api/workout-records` | 운동 기록 목록 조회 | 확장 |
| `GET` | `/api/workout-records/:recordId` | 운동 기록 상세 조회 | 기존 API 활용·확장 |
| `POST` | `/api/workout-records/manual` | 수동 개인 운동 기록 생성 | 신규 |
| `PUT` | `/api/workout-records/:recordId` | 수동 개인 운동 기록 수정 | 신규 |
| `DELETE` | `/api/workout-records/:recordId` | 운동 기록 삭제 | 기존 API 활용·확장 |
| `POST` | `/api/workout-records/routine-completions` | 활성 운동 루틴 완료 저장 | 기존 API 유지 |
| `GET` | `/api/condition-records` | 컨디션 기록 목록 조회 | 신규 |
| `GET` | `/api/condition-records/:conditionId` | 컨디션 기록 상세 조회 | 신규 |
| `POST` | `/api/condition-records` | 컨디션 기록 생성 | 신규 |
| `PUT` | `/api/condition-records/:conditionId` | 컨디션 기록 수정 | 신규 |
| `DELETE` | `/api/condition-records/:conditionId` | 컨디션 기록 삭제 | 신규 |
| `GET` | `/api/workout-reports/summary` | 운동기록 홈·리포트 요약 조회 | 신규 |

## 11. 수동 운동 기록 데이터 초안

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `performedOn` | string | 필수 | 클라이언트 기준 운동일 `YYYY-MM-DD` |
| `timeZone` | string | 필수 | IANA 타임존 |
| `startedAt` | string | 선택 | UTC ISO 시작 시각 |
| `endedAt` | string | 선택 | UTC ISO 종료 시각 |
| `durationSeconds` | number | 필수 | 운동 시간 |
| `location` | string | 선택 | `gym`, `home`, `outdoor`, `unknown` |
| `cardio` | object | 선택 | 유산소 기록 |
| `cardio.steps` | number | 선택 | 걸음 수 |
| `cardio.durationSeconds` | number | 선택 | 유산소 시간 |
| `cardio.distanceMeters` | number | 선택 | 거리 |
| `strengthExercises` | array | 선택 | 근력 운동 목록 |
| `strengthExercises[].name` | string | 필수 | 운동명 |
| `strengthExercises[].sets` | array | 필수 | 세트 목록 |
| `sets[].weightKg` | number | 선택 | 중량 kg |
| `sets[].reps` | number | 선택 | 반복 횟수 |
| `sets[].rir` | number | 선택 | RIR |
| `sets[].restSeconds` | number | 선택 | 휴식 시간 |
| `bodyComposition` | object | 선택 | 체중·골격근량·체지방률 |
| `memo` | string | 선택 | 운동 메모 |

## 12. 컨디션 기록 데이터 초안

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `checkedOn` | string | 필수 | 클라이언트 기준 체크일 `YYYY-MM-DD` |
| `timeZone` | string | 필수 | IANA 타임존 |
| `weekNumber` | number | 선택 | 프로그램 주차. 기본값은 사용하지 않고 입력 시 검증 |
| `conditionScores` | array | 필수 | 일반 컨디션 점수 목록 |
| `conditionScores[].key` | string | 필수 | 문항 키 |
| `conditionScores[].label` | string | 필수 | 문항 라벨 |
| `conditionScores[].score` | number | 필수 | 0~5. 0은 미선택 |
| `muscleSoreness` | array | 필수 | 근육통 점수 목록 |
| `muscleSoreness[].key` | string | 필수 | 부위 키 |
| `muscleSoreness[].label` | string | 필수 | 부위 라벨 |
| `muscleSoreness[].score` | number | 필수 | 0~4. 0은 미선택 |
| `memo` | string | 선택 | 컨디션 메모 |

민감 문항은 이번 구현에서 제외한다. 기존 앱의 `성욕`, `발기 빈도 및 강도`, `월경 전/중/후 반응` 문항은 프로필·동의·노출 정책이 정해질 때까지 추가하지 않는다.

## 13. 리포트 집계 정책

| 항목 | 기준 |
| --- | --- |
| 운동 횟수 | 운동 기록 건수와 운동 완료일 수를 구분한다. 홈 카드 기본값은 기록 건수다. |
| 운동 완료일 | `performedOn` 또는 `completedOn` 기준으로 하루 1회만 계산한다. |
| 주간 기준 | 월요일 시작 주를 사용한다. |
| 총 볼륨 | 근력 세트의 `weightKg * reps` 합계다. 중량 없는 루틴 완료 기록은 볼륨 0으로 표시한다. |
| 유산소 시간 | `cardio.durationSeconds` 합계다. |
| 컨디션 평균 | 0점 미선택은 제외하고 선택된 일반 컨디션 점수만 평균낸다. |
| 근육통 평균 | 0점 미선택은 제외하고 선택된 근육통 점수만 평균낸다. |
| 체성분 추이 | 운동 기록에 포함된 체성분 값 중 0보다 큰 값을 측정 날짜순으로 표시한다. |

## 14. 구현 순서

| 순서 | 작업 | 산출물 | 완료 기준 |
| --- | --- | --- | --- |
| 1 | 서버 운동기록 모델 확장 | `workout-records` 수동 기록 DTO/schema/API | 수동 생성·수정·목록·상세·삭제 테스트 통과 |
| 2 | 서버 컨디션 도메인 추가 | `condition-records` 모듈 | 컨디션 CRUD, 날짜당 1건 정책 테스트 통과 |
| 3 | 서버 리포트 요약 추가 | `workout-reports/summary` | 운동·컨디션 요약 집계 테스트 통과 |
| 4 | Swagger 반영 | `/docs-json` | 신규 API 노출 |
| 5 | Orval 생성 | `client/src/shared/api/generated` | 클라이언트 타입 생성 |
| 6 | 프론트 API wrapper | `features/workout-records`, `features/condition-records`, `features/workout-reports` API | 완료 |
| 7 | 운동기록 홈 구현 | `/exercise` | 완료 |
| 8 | 운동 기록 목록·상세·삭제 | 목록/상세 화면 | 완료 |
| 9 | 개인 운동 입력·수정 | 수동 운동 폼 | 완료 |
| 10 | 컨디션 입력·목록·삭제 | 컨디션 화면 | 완료 |
| 11 | 운동 리포트 | 리포트 카드·차트 | 완료 |
| 12 | 문서 업데이트 | 스펙 상태 갱신 | 완료 |

## 15. 테스트 계획

| ID | 구분 | 검증 내용 | 대상 |
| --- | --- | --- | --- |
| TEST-ER-001 | 서버 단위 | 수동 운동 payload 검증과 저장 매핑 | `workout-records.service` |
| TEST-ER-002 | 서버 단위 | 운동 기록 수정 시 사용자 소유권을 확인한다. | `workout-records.service` |
| TEST-ER-003 | 서버 단위 | 운동 기록 삭제 후 주간 트래커 연결 기록을 정리한다. | `workout-records.service` |
| TEST-ER-004 | 서버 단위 | 컨디션 점수 범위를 검증한다. | `condition-records.schemas` |
| TEST-ER-005 | 서버 단위 | 같은 날짜 컨디션은 생성 대신 갱신한다. | `condition-records.service` |
| TEST-ER-006 | 서버 단위 | 리포트가 월요일 시작 주 기준으로 빈도를 계산한다. | `workout-reports.service` |
| TEST-ER-007 | 서버 E2E | 수동 운동 생성→목록→상세→수정→삭제 | E2E |
| TEST-ER-008 | 서버 E2E | 컨디션 생성→목록→상세→수정→삭제 | E2E |
| TEST-ER-009 | 클라이언트 단위 | 운동 기록 payload 생성과 숫자 검증 | 통과 |
| TEST-ER-010 | 클라이언트 단위 | 컨디션 점수 라벨과 payload 생성 | 통과 |
| TEST-ER-011 | 클라이언트 단위 | API wrapper 사용자 키, selector, invalidate | 통과 |
| TEST-ER-012 | 클라이언트 단위 | 리포트 추이 데이터 정렬·최근 8건 | 통과 |
| TEST-ER-013 | 클라이언트 전체 | lint, typecheck, jest, AIT build | 통과 |

## 16. 구현 완료 검증

2026-07-23 기준으로 아래 명령을 확인했다.

```bash
cd client
npm run lint
npm run typecheck
npm test -- --runInBand
npm run build
```

결과:

```text
lint 통과
typecheck 통과
10 test suites / 29 tests 통과
AIT build 통과
```

## 17. 이번 범위 제외 항목

| ID | 기능 | 미구현 상태를 남기는 이유 | 후속 구현 조건 |
| --- | --- | --- | --- |
| ER-X-001 | 트레이너 열람 | 일반 사용자 운동기록과 컨디션 저장 구조가 먼저 안정돼야 한다. 트레이너-회원 관계와 권한 API도 별도 도메인이다. | 사용자 기록 CRUD 완료 후 `trainer-records` 스펙 작성 |
| ER-X-002 | AI 조언 연동 | 기존 앱은 컨디션 저장 구조와 AI가 기대하는 필드가 다르다. 이번 구현에서는 AI 프롬프트 계약을 만들지 않는다. | 운동·컨디션 요약 DTO 확정 후 `ai-context` 스펙 작성 |
| ER-X-003 | 영상 촬영·자세 분석 | 카메라 권한, 실기기 동작, AI 응답 검증이 필요하다. | 활성 운동 고급 기능 스펙에서 별도 진행 |
| ER-X-004 | GPS·야외운동 실측 | 위치 권한, 지도·경로·실측 거리 처리가 필요하다. | 야외운동 스펙에서 별도 진행 |

## 18. 관련 파일

| 영역 | 파일 |
| --- | --- |
| 기존 운동기록 홈 | `2026-07-13/my-PT-Diary/app/(tabs)/exercise.tsx` |
| 기존 개인 운동 입력 | `2026-07-13/my-PT-Diary/app/exercise-form.tsx` |
| 기존 개인 운동 목록 | `2026-07-13/my-PT-Diary/app/exercise-list.tsx` |
| 기존 컨디션 입력 | `2026-07-13/my-PT-Diary/app/condition-form.tsx` |
| 기존 컨디션 목록 | `2026-07-13/my-PT-Diary/app/condition-list.tsx` |
| 기존 리포트 | `2026-07-13/my-PT-Diary/components/ProgressChartSection.tsx`, `2026-07-13/my-PT-Diary/app/progress-chart.tsx` |
| 기존 저장소 | `2026-07-13/my-PT-Diary/lib/storage.ts`, `2026-07-13/my-PT-Diary/lib/api/workout.api.ts` |
| 기존 타입 | `2026-07-13/my-PT-Diary/lib/types.ts` |
| QA 운동기록 | `2026-07-13/pt-diary-qa/exercise/README.md`, `2026-07-13/pt-diary-qa/exercise/my-pt-diary-qa-exercise-*.md` |
| 현재 루틴 완료 서버 | `server/src/modules/workout-records` |
| 현재 주간 트래커 | `server/src/modules/weekly-tracker`, `client/src/shared/api/weekly-tracker.ts` |
| 현재 활성 운동 | `client/src/features/active-workout`, `client/src/pages/active-workout.tsx` |
