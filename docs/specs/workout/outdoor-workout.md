# 야외운동 AI 계획 및 기록 저장

작성일자: 2026-07-27

## 1. 문서 목적

홈 화면의 `야외운동` 카드에서 진입하는 입력 화면, AI 코스 계획 생성, 결과 표시, 운동 기록 저장의 현재 마이그레이션 구현을 정리한다.

이 문서는 2026-07-27 기준 야외운동 백엔드/클라이언트 마이그레이션 결과와, 코드에 남겨둔 TODO를 함께 기록하는 기준 문서다.

## 2. 현재 구현 기준

| 구분 | 내용 |
| --- | --- |
| 홈 진입점 | `client/src/features/home/components/home-screen.tsx` |
| 입력 라우트 | `/outdoor-workout` |
| 결과 라우트 | `/outdoor-workout-result` |
| 클라이언트 feature | `client/src/features/outdoor-workout` |
| 결과 전달 방식 | zustand 메모리 store (`useOutdoorWorkoutStore`) |
| 계획 생성 API | `POST /api/outdoor-workout/plan` |
| 기록 저장 API | `POST /api/workout-records/manual` |
| 기록 저장 위치 | PostgreSQL `workout_records`, `workout_completions` |
| 로컬 저장소 사용 여부 | 사용하지 않음. 실패 시 로컬 fallback 없이 바로 서버 실패 처리 |
| 사용자 구분 | `x-user-key` |
| AI provider | OpenAI 호환 `chat/completions` |
| 기본 모델 | `gpt-4o-mini` |

## 3. 원본 존중 범위와 수정 범위

| 구분 | 결정 | 비고 |
| --- | --- | --- |
| 실제 지도/길찾기/등산로 분석 부재 | 원본 존중 | 직선 좌표 + 고도 샘플 기반 계획 유지 |
| GPS 실측 추적 부재 | 원본 존중 | 거리, 페이스, 고도 변화, 경로 이탈 추적 없음 |
| 계획값 기반 저장 | 원본 존중 | 실제 세션 측정값이 아니라 계획 추정값으로 저장 |
| 현재 위치 획득 | 원본 존중 | 앱인토스 위치 권한과 공식 SDK로 실제 좌표 획득, 실패 시 고정 좌표 fallback |
| 역지오코딩 실패 | 원본 존중 | 실제 좌표는 유지하고 표시명은 `내 위치` 사용 |
| 서버 저장 실패 표시 | 수정 | 실패 시 성공처럼 처리하지 않음 |
| 결과 전달 전역 변수 + sessionStorage | 수정 | zustand store로 교체 |
| 헤더 하트/더보기 무동작 버튼 | 수정 | 제거 |
| AI 키 없음 시 500 | 수정 | 503과 명시적 안내 메시지로 처리 |
| 로컬 저장 후 서버 동기화 | 변경 | 현재 앱은 로컬 저장소 없이 바로 DB 저장 |

## 4. 사용자 흐름

| 순서 | 사용자 행동 | 현재 구현 |
| --- | --- | --- |
| 1 | 홈에서 `야외운동` 카드를 누른다. | 홈 카드가 `/outdoor-workout`로 이동한다. |
| 2 | 입력 화면에서 위치를 확인한다. | 앱인토스 위치 권한을 확인·요청하고 `getCurrentLocation`으로 실제 좌표를 가져온다. 위치 획득 실패 시 `37.5665, 126.978`과 `서초동`을 사용하고, 실제 좌표의 역지오코딩을 사용할 수 없으면 `내 위치`로 표시한다. |
| 3 | 걷기/러닝 또는 등산을 고른다. | 상태값은 원본과 동일하게 `walking` 또는 `hiking`만 사용한다. |
| 4 | 1km, 2km, 3km 중 하나를 고른다. | 선택값은 `radiusKm`으로 유지한다. |
| 5 | 자동 목적지 토글을 켠다. | 현재 위치 주변 반경 안에서 임의 목적지 좌표를 만든다. |
| 6 | `코스 설계 시작`을 누른다. | 직선 route point 11개를 만들고 Open-Meteo 고도를 조회한 뒤 `POST /api/outdoor-workout/plan`을 호출한다. |
| 7 | AI 계획 생성이 성공한다. | 결과를 zustand store에 넣고 `/outdoor-workout-result`로 이동한다. |
| 8 | 결과 화면에서 코스 요약을 본다. | 요약, 거리/시간/칼로리/고도차, 고도 그래프, 구간 목록, 맞춤 조언을 표시한다. |
| 9 | `기록 저장`을 누른다. | 로컬 저장 없이 `POST /api/workout-records/manual`로 바로 DB 저장한다. |
| 10 | 저장 성공/실패를 확인한다. | 성공 시 완료 Alert, 실패 시 실패 Alert를 띄운다. |

## 5. 요구사항 및 구현 현황

| ID | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- |
| OW-001 | 홈의 야외운동 카드에서 실제 화면으로 진입해야 한다. | `QuickActionCard`가 `/outdoor-workout`로 이동하고 더 이상 미구현 배지를 붙이지 않는다. | 구현 | `client/src/features/home/components/home-screen.tsx` |
| OW-002 | 입력/결과 화면은 별도 라우트여야 한다. | `/outdoor-workout`, `/outdoor-workout-result`를 각각 분리했다. | 구현 | `client/src/pages/outdoor-workout.tsx`, `client/src/pages/outdoor-workout-result.tsx` |
| OW-003 | 결과 전달은 전역 변수나 sessionStorage에 의존하지 않아야 한다. | zustand `planResult` store로 전달한다. | 구현 | `client/src/features/outdoor-workout/stores/use-outdoor-workout-store.ts` |
| OW-004 | 앱인토스에서 현재 위치를 가져와야 한다. | `geolocation/access` 권한을 선언하고 공식 `getCurrentLocation` SDK로 실제 좌표를 가져오며, 실패 시 원본의 고정 좌표 fallback을 사용한다. | 구현 | `client/granite.config.ts`, `client/src/features/outdoor-workout/lib/get-current-location.ts` |
| OW-005 | 입력 화면은 운동 모드, 거리, 자동 목적지 선택 UI를 유지해야 한다. | 원본과 같은 정보 구조를 유지한 단순화된 UI를 제공한다. | 구현 | `client/src/features/outdoor-workout/components/outdoor-workout-screen.tsx` |
| OW-006 | 자동 목적지는 반경 안 임의 좌표로 생성해야 한다. | 현재 위치 기준 반경의 30~100% 구간에서 임의 방위 좌표를 만든다. | 구현 | `client/src/features/outdoor-workout/components/outdoor-workout-screen.tsx` |
| OW-007 | 계획 생성 입력은 직선 route point와 고도 샘플을 사용해야 한다. | 11개 직선 point를 만들고 Open-Meteo elevation을 조회한다. | 구현 | `client/src/features/outdoor-workout/lib/generate-route-points.ts`, `client/src/features/outdoor-workout/lib/fetch-elevation-data.ts` |
| OW-008 | AI 계획 생성은 서버 API를 통해 수행해야 한다. | 클라이언트는 `POST /api/outdoor-workout/plan`만 호출하고 프롬프트 구성은 서버가 맡는다. | 구현 | `client/src/features/outdoor-workout/api/outdoor-workout.ts`, `server/src/modules/outdoor-workout/outdoor-workout.controller.ts` |
| OW-009 | 서버는 입력 좌표·거리·모드·반경을 검증해야 한다. | Zod로 좌표 범위, 거리, mode, radius, elevationData를 검증한다. | 구현 | `server/src/modules/outdoor-workout/outdoor-workout.schemas.ts` |
| OW-010 | 서버는 AI 응답 구조를 검증해야 한다. | JSON 파싱 후 `OutdoorWorkoutPlanDto` 스키마로 다시 검증한다. | 구현 | `server/src/modules/outdoor-workout/outdoor-workout.service.ts` |
| OW-011 | AI 키가 없으면 원인 불명 500이 아니라 명시적 실패를 반환해야 한다. | API 키가 없으면 503 `야외운동 AI 기능이 아직 설정되지 않았어요.`를 던진다. | 구현 | `server/src/modules/outdoor-workout/openai-outdoor-workout-plan.client.ts` |
| OW-012 | 업스트림 AI 실패를 구분해야 한다. | OpenAI 호출 실패 또는 응답 구조 불일치를 502로 처리한다. | 구현 | `server/src/modules/outdoor-workout/openai-outdoor-workout-plan.client.ts`, `server/src/modules/outdoor-workout/outdoor-workout.service.ts` |
| OW-013 | 결과 화면은 요약, 구간, 조언을 보여야 한다. | 요약 카드, 고도 그래프, 세그먼트 목록, 맞춤 조언 카드를 표시한다. | 구현 | `client/src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx` |
| OW-014 | 고도 그래프는 고도 데이터가 유효할 때만 표시해야 한다. | `maxElev > minElev`일 때만 그래프 카드와 구간 목록을 렌더링한다. | 구현 | `client/src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx` |
| OW-015 | 헤더의 무동작 아이콘은 제거해야 한다. | 하트/더보기 없이 뒤로/닫기만 둔다. | 구현 | `client/src/features/outdoor-workout/components/outdoor-workout-screen.tsx`, `client/src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx` |
| OW-016 | 기록 저장은 현재 앱 구조에 맞게 바로 DB로 가야 한다. | 원본의 로컬 저장소 경유를 제거하고 `workout-records/manual` API로 바로 저장한다. | 구현 | `client/src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx`, `client/src/features/workout-records/api/workout-records.ts` |
| OW-017 | 저장 실패를 사용자에게 알려야 한다. | mutation 예외를 잡아 `저장 실패` Alert를 표시한다. | 구현 | `client/src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx` |
| OW-018 | 저장 성공 후 운동기록/리포트/주간 트래커가 갱신돼야 한다. | 기존 `useCreateManualWorkoutRecord()` invalidate 체인을 재사용한다. | 구현 | `client/src/features/workout-records/api/workout-records.ts` |
| OW-019 | 원본처럼 계획 기반 운동 기록 payload를 만들어야 한다. | 예상 시간에서 `durationSeconds`, `steps`, `exerciseTime`을 만들고 `bodyTypeExercises`를 strengthExercises로 변환한다. | 구현 | `client/src/features/outdoor-workout/lib/build-outdoor-workout-record-payload.ts` |
| OW-020 | 결과가 없을 때 결과 화면은 오작동 대신 안내를 보여야 한다. | plan store가 비어 있으면 안내 문구와 이전 화면 액션을 보여준다. | 구현 | `client/src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx` |

## 6. API 구현 현황

### 6.1 야외운동 계획 생성

| Method | 경로 | 목적 | 비고 |
| --- | --- | --- | --- |
| `POST` | `/api/outdoor-workout/plan` | 직선 route hint 기반 AI 계획 생성 | `x-user-key` 필요 |

### 계획 생성 요청 필드

| 필드 | 설명 |
| --- | --- |
| `startLat`, `startLng` | 시작 좌표 |
| `endLat`, `endLng` | 도착 좌표 |
| `distanceKm` | 현재 클라이언트가 계산한 직선 거리 |
| `mode` | `walking` 또는 `hiking` |
| `radiusKm` | `1`, `2`, `3` 중 하나 |
| `elevationData[]` | point index, lat/lng, elevation으로 구성된 샘플 고도 배열 |
| `bodyAnalysis?` | 체형분석 스냅샷 payload. 현재 클라이언트에서는 미전달 |

### 계획 생성 응답 필드

| 필드 | 설명 |
| --- | --- |
| `routeType` | 걷기/러닝 코스 또는 등산 코스 |
| `totalDistance` | AI가 설명용으로 작성한 예상 거리 |
| `estimatedTime` | 예상 소요 시간 |
| `estimatedCalories` | 예상 칼로리 |
| `elevationGain` | 예상 고도 상승 |
| `difficulty` | 난이도 |
| `summary` | 코스 요약 |
| `courseWaypoints[]` | AI가 생성한 waypoint 목록 |
| `segments[]` | 구간 정보 |
| `generalTips[]` | 일반 조언 |
| `bodyTypeExercises[]` | 체형 보조 운동 |
| `personalizedNote` | 개인화 조언 |

### 6.2 운동 기록 저장

| Method | 경로 | 목적 | 비고 |
| --- | --- | --- | --- |
| `POST` | `/api/workout-records/manual` | 야외운동 계획 기반 기록을 수동 운동 기록으로 저장 | 별도 outdoor 전용 저장 API는 만들지 않음 |

야외운동은 별도 테이블을 만들지 않고 기존 manual workout record 계약을 재사용한다.

| 매핑 필드 | 저장 방식 |
| --- | --- |
| `title` | `야외 걷기` 또는 `야외 등산` |
| `location` | `outdoor` |
| `durationSeconds` | `estimatedTime`에서 추출한 분 기반 값 |
| `cardio.steps` | 걷기 `예상분 × 100`, 등산 `예상분 × 80` |
| `exerciseTime` | `estimatedTime` 문자열 |
| `dailyReport` | `[야외] 모드 거리 · 시간 · 칼로리` |
| `strengthExercises` | `bodyTypeExercises`를 세트 1개짜리 운동으로 변환 |

## 7. 클라이언트/서버 데이터 흐름

| 단계 | 처리 |
| --- | --- |
| 1 | 홈 카드가 `/outdoor-workout`로 이동한다. |
| 2 | 입력 화면이 현재 위치 또는 fallback 좌표를 준비한다. |
| 3 | 사용자가 모드와 거리, 자동 목적지 여부를 정한다. |
| 4 | 클라이언트가 직선 point와 elevationData를 만든다. |
| 5 | 서버가 OpenAI prompt를 구성하고 `gpt-4o-mini`를 호출한다. |
| 6 | 서버가 응답 JSON을 검증한 뒤 plan을 반환한다. |
| 7 | 클라이언트가 plan과 elevationPoints를 zustand store에 저장한다. |
| 8 | 결과 화면이 store 데이터를 읽어 요약/그래프/조언을 렌더링한다. |
| 9 | `기록 저장` 시 클라이언트가 manual workout payload를 만들어 바로 DB 저장 mutation을 호출한다. |
| 10 | mutation 성공 시 운동기록 목록, 운동 리포트, 주간 트래커 캐시가 갱신된다. |

## 8. 테스트 근거

| 구분 | 파일 |
| --- | --- |
| 서버 서비스/통합 | `server/src/modules/outdoor-workout/__tests__/outdoor-workout.service.spec.ts`, `server/src/modules/outdoor-workout/__tests__/outdoor-workout.controller.integration.spec.ts` |
| 서버 OpenAI client | `server/src/modules/outdoor-workout/__tests__/openai-outdoor-workout-plan.client.spec.ts` |
| 클라이언트 API | `client/src/features/outdoor-workout/api/__tests__/outdoor-workout.test.ts` |
| 클라이언트 저장 payload | `client/src/features/outdoor-workout/lib/__tests__/build-outdoor-workout-record-payload.test.ts` |
| 홈 연결 | `client/src/features/home/__tests__/home-screen.test.tsx` |

## 9. TODO 및 후속 작업

아래 항목은 코드에 TODO로 남겨둔 내용과 현재 구현 갭을 함께 정리한 것이다.

| ID | TODO 항목 | 현재 상태 | 영향 | 근거 파일 |
| --- | --- | --- | --- | --- |
| OW-TODO-001 | 실제 지도/보행로/등산로 라우팅 엔진 연동 | 미구현 | 현재 plan 생성 입력은 실제 경로 geometry가 아니라 시작점-도착점 직선 + 샘플 고도다. AI가 설명하는 경로가 실제 통행 가능 경로와 다를 수 있다. | `server/src/modules/outdoor-workout/outdoor-workout.service.ts`, `client/src/features/outdoor-workout/components/outdoor-workout-screen.tsx` |
| OW-TODO-002 | GPS 기반 실측 거리/고도/페이스 추적 | 미구현 | 현재 운동 세션은 실제 야외 활동 측정이 아니라 화면용 흐름이다. 저장값도 실측 기록이 아니라 계획 추정값이다. | `server/src/modules/outdoor-workout/outdoor-workout.service.ts`, `client/src/features/outdoor-workout/components/outdoor-workout-screen.tsx`, `client/src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx`, `client/src/features/outdoor-workout/lib/build-outdoor-workout-record-payload.ts` |
| OW-TODO-003 | 체형분석 서버 재조회 연동 | 미구현 | 현재 서버는 optional `bodyAnalysis` payload를 받을 수 있지만, 장기적으로는 `analysis-records`가 마이그레이션되면 서버가 `x-user-key` 기준 최신 분석을 직접 조회해야 한다. 현재 클라이언트는 bodyAnalysis를 보내지 않는다. | `server/src/modules/outdoor-workout/outdoor-workout.service.ts` |
| OW-TODO-004 | 지역명 역지오코딩 연동 | 미구현 | 현재 위치 권한과 좌표 획득은 앱인토스 SDK로 마이그레이션했다. 앱인토스 SDK는 주소를 반환하지 않아 표시명은 원본의 역지오코딩 실패 fallback인 `내 위치`를 사용한다. | `client/src/features/outdoor-workout/lib/get-current-location.ts` |
| OW-TODO-005 | 음성안내 실제 기능 연결 | 미구현 | 결과 화면의 `음성안내 ON/OFF`는 UI 상태만 바뀌고 TTS나 음성 안내 엔진은 연결돼 있지 않다. | `client/src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx` |
| OW-TODO-006 | 계획값과 실측값 저장 구조 분리 | 미구현 | 현재는 원본 존중을 위해 `estimatedTime`, 추정 steps, AI 보조 운동을 그대로 manual workout record에 저장한다. 추후 GPS 세션이 들어오면 실측값과 계획값을 분리해야 한다. | `client/src/features/outdoor-workout/lib/build-outdoor-workout-record-payload.ts`, `client/src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx` |
| OW-TODO-007 | 재진입/앱 재시작 후 계획 복원 정책 정의 | 부분구현 | 전역 변수 + sessionStorage는 제거했지만 현재 zustand store도 메모리 기반이라 앱 재시작 후 결과 복원은 되지 않는다. 현재는 결과가 없으면 안내 화면을 보여준다. | `client/src/features/outdoor-workout/stores/use-outdoor-workout-store.ts`, `client/src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx` |
| OW-TODO-008 | route generator 자동화 동기화 | 부분구현 | 현재 `/outdoor-workout`, `/outdoor-workout-result`는 `router.gen.ts`에 수동 반영돼 있다. 라우트 생성 파이프라인 정비 전까지 새 라우트 추가 시 같은 수작업이 반복된다. | `client/src/router.gen.ts` |

## 10. 현재 갭 및 주의사항

| ID | 항목 | 현재 영향 |
| --- | --- | --- |
| OW-GAP-001 | 로컬 저장 fallback 없음 | 네트워크/서버 실패 시 기록은 저장되지 않으며, 원본처럼 나중에 서버 동기화하는 경로도 없다. |
| OW-GAP-002 | 결과 화면 직접 진입 제한 | 결과 데이터는 store에 있을 때만 표시된다. 직접 URL 진입이나 앱 재시작 후 복원은 지원하지 않는다. |
| OW-GAP-003 | bodyAnalysis 클라이언트 연동 미완료 | 서버 DTO는 준비됐지만 현재 클라이언트는 체형분석 데이터를 계획 API에 보내지 않는다. |
| OW-GAP-004 | AI 응답 의미의 한계 | 서버가 응답 구조는 검증하지만, waypoint/terrain/slope가 실제 지형과 맞는지는 검증하지 않는다. |
| OW-GAP-005 | 원본 저장 의미 유지 | 현재 야외운동 저장은 실운동 기록이 아니라 “AI 계획을 기록으로 남기는 흐름”에 가깝다. 제품 의미상 재정의가 필요할 수 있다. |
