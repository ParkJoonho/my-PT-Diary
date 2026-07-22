# 마이그레이션 컨벤션

## 마이그레이션 목표

`my-PT-Diary 프로젝트`의 PT Diary 사용자 경험을 `Apps in Toss Granite 앱`으로 작고 검토 가능한 단위로 옮긴다.

1차 작업은 홈 화면 디자인을 보존하면서 QA 기준으로 드러난 기능 단위 스케폴딩을 잡는 것이다. 이후 백엔드와 기능을 붙이기 쉽도록 오래 유지 가능한 토대를 만드는 것이 목적이다.

## 현재 우선순위

1. 홈 화면의 시각 디자인을 최대한 보존한다.
2. 홈에서 보이는 기능이라도 독립 도메인으로 커질 수 있으면 별도 feature로 나눈다.
3. 아직 연결하지 않은 UI는 숨기지 않고 작은 `미구현` 뱃지를 붙인다.
4. 백엔드 계약이 준비되기 전까지 API 동작을 구현하지 않는다.
5. Expo 런타임 의존성을 피한다.

## 먼저 옮길 범위

홈 화면부터 시작하되, 홈 안에 모든 코드를 몰아넣지 않는다.

- `home`: 홈 대시보드 조립, 주간 트래커 카드 UI, 빠른 진입 카드 UI
- `app-shell`: 하단 탭바의 시각적 껍데기
- `workout-routines`: 루틴 선택 카드, 루틴 탭, 세그먼트 컨트롤, 루틴 아코디언 UI
- `workout-records`: 주간 트래커 데이터와 이후 완료 계산
- `active-workout`: 루틴 시작 후 운동 진행 화면
- `outdoor-workout`: 야외운동 입력과 결과 화면
- `exercise-guide`: 운동배우기 가이드와 영상 화면
- `equipment-recognition`: 사진으로 기구 찾기
- `auth`, `pt-logs`, `condition-records`, `trainer-match`, `ai-hub`와 AI 세부 기능은 README 수준의 스캐폴딩부터 잡는다.

## 아직 구현하지 않을 범위

스케폴딩 단계에서는 백엔드 의존 동작을 구현하지 않는다.

- 로그인/인증/세션 로직
- 개인화 AI 루틴 API 호출
- 트레이너 추천 API 호출
- 식단 분석 API 호출
- 야외운동 경로 생성
- 운동 영상 재생
- 운동 기록 영구 저장

원래 UI 형태는 유지하고, 동작이 연결되지 않은 부분에 `미구현` 뱃지를 붙인다.

## Apps in Toss 런타임 규칙

- Apps in Toss 기본 상단 헤더를 유지한다.
- `my-PT-Diary 프로젝트`의 `AppHeader`나 `GlobalHeader`를 옮기지 않는다.
- 자체 로그인/회원가입 화면을 옮기지 않는다.
- Expo Router를 옮기지 않는다.
- AsyncStorage를 직접 사용하지 않는다.
- 이후 기능에서 Apps in Toss 호환 전략이 확정되기 전까지 Expo 패키지를 추가하지 않는다.

## 원본 스냅샷

`docs/migration/source-snapshots` 아래 파일은 참고용이다. 직접 가져오지 않는다.

스냅샷의 코드가 필요하면 적절한 `src/features` 또는 `src/shared` 위치로 복사한 뒤 Granite 환경에 맞게 수정한다.
