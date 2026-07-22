# Weekly Tracker

현재 서버에서 구현된 첫 도메인은 `weekly-tracker`다.

## 목적

홈 화면의 주간 운동 완료 상태를 사용자별로 계산해 내려주는 API를 제공한다.

기존 QA에서 문제였던 아래 항목을 먼저 해결하는 방향으로 시작했다.

- 월/화 하드코딩 제거
- 사용자별 데이터 분리
- 주간 완료일 계산의 서버 기준화
- 연속일 계산의 서버 기준화

## 현재 데이터 모델

테이블: `workout_completions`

컬럼:

- `id`
- `user_key`
- `completed_on`
- `source`
- `note`
- `created_at`

이 테이블은 현재 `DatabaseService`가 부팅 시 `CREATE TABLE IF NOT EXISTS`로 보장한다.

## 현재 API

### `POST /api/weekly-tracker/workouts`

운동 완료 레코드 1건 생성

본문:

- `completedOn: YYYY-MM-DD`
- `source: manual | personal_exercise | pt_lesson | routine | outdoor`
- `note?: string`

### `GET /api/weekly-tracker`

특정 기준일이 포함된 월요일-일요일 주간 요약 조회

쿼리:

- `referenceDate?: YYYY-MM-DD`

응답:

- `weekStartDate`
- `weekEndDate`
- `referenceDate`
- `streakCount`
- `totalCompletedDays`
- `days[]`

### `GET /api/weekly-tracker/workouts`

선택한 주의 원본 완료 기록 목록 조회

### `DELETE /api/weekly-tracker/workouts/:workoutId`

현재 사용자 키 소유 레코드만 삭제

## 현재 계산 규칙

- 주간 범위는 `referenceDate`가 포함된 월요일-일요일
- `completed_on`이 하루에 여러 건 있어도 `days[].completed`는 하루 단위 boolean
- `days[].completionCount`로 하루 완료 건수는 별도로 유지
- `streakCount`는 오늘 또는 어제부터 거꾸로 연속 완료일을 센다
- 오늘과 어제 둘 다 비어 있으면 `0`

## 현재 테스트 범위

유닛 테스트:

- 완료 레코드 생성 매핑
- 주간 요약 계산
- 오늘 비었을 때 어제 기준 streak 계산
- streak 0 계산
- 목록 매핑
- 삭제 위임/오류 전파

E2E 테스트:

- `x-user-key` 누락 400
- 잘못된 payload 400
- 생성 → 요약 → 목록 → 삭제 전체 흐름

## 아직 안 한 것

- `workout_records`, `pt_lessons`, `condition_checks`와의 자동 동기화
- 클라이언트 홈과의 실제 API 연동
- 인증 토큰 체계
- migration 파일 기반 스키마 관리
- OpenAPI 기반 Orval 생성 연결

## 다음 추천 작업

1. 클라이언트 홈 주간 트래커를 이 API에 연결
2. 현재 로컬 mock 데이터 제거
3. `workout-records` 도메인 도입 후 완료 기록 생성 경로 통합
4. `exercise-guides` 도메인 추가
