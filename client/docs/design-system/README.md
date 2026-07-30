# PT Diary 디자인 시스템 점검

## 목적

원본 PT Diary의 실제 실행 코드와 `ai-pt`의 실제 실행 코드를 페이지 단위로 대조한다.
각 페이지에 흩어진 시각 규칙을 확인하고, 둘 이상의 페이지에서 반복되는 규칙만 디자인
토큰·primitive·공통 pattern 후보로 올린다.

이 문서는 전체 점검 순서와 진행 상태를 관리하는 인덱스다. 상세 조사 결과는 이후
`pages/` 아래에 페이지별 문서로 작성한다.

## 판정 근거

다음 자료만 판정 근거로 사용한다.

1. 원본 라우트에서 실제로 렌더링되는 컴포넌트와 `StyleSheet`
2. 원본이 실제로 import하는 색상·그림자·아이콘·이미지
3. `ai-pt` 라우트에서 실제로 렌더링되는 컴포넌트와 `StyleSheet`
4. 동일한 데이터와 UI 상태에서 촬영한 원본·`ai-pt` 실행 화면

다음 자료는 디자인 값의 판정 근거로 사용하지 않는다.

- 원본과 `ai-pt`의 기존 디자인 문서 및 마이그레이션 문서
- 실제 import되지 않는 `components/ui` 등의 미사용 코드
- 라우트에서 도달할 수 없는 샘플·스냅샷 코드
- 구현 코드와 실행 화면으로 확인되지 않은 추정값

## 이번 점검에서 제외하는 항목

- Apps in Toss가 제공하는 네이티브 상단 헤더
- Apps in Toss 상단 헤더와 중복되는 원본 `AppHeader` 제거 작업
- 이미 확인된 원본 Pretendard Medium 등록 충돌의 재조사
- 로그인·회원가입 화면의 Apps in Toss 인증 전환

상단 헤더를 제외한 페이지 본문 타이포그래피의 크기, 줄높이, 자간, 색상과 배치는
계속 점검한다.

## 페이지 점검 단위

한 페이지는 단순히 `src/pages/*.tsx` 파일 하나만 뜻하지 않는다.

```text
라우트
└── 라우트가 실제로 렌더링하는 feature 컴포넌트
    ├── 해당 컴포넌트가 실제로 사용하는 하위 컴포넌트
    ├── StyleSheet와 inline style
    ├── 아이콘·SVG·이미지
    └── 빈 상태·데이터 상태·로딩·오류·모달·확장 상태
```

한 라우트 안에 여러 UI 상태가 있으면 별도 페이지로 쪼개지 않고 해당 페이지 문서의
상태 매트릭스에서 각각 점검한다. 공통 shell은 여러 페이지에 영향을 주므로 별도의
선행 점검 단위로 관리한다.

## 진행 상태

| 표시 | 의미 |
|---|---|
| `⬜` | 미점검 |
| `🔎` | 점검 중 |
| `🟨` | 일부 완료 또는 다음 단계 전에 해결할 차이가 기록됨 |
| `🛠️` | `ai-pt` 반영 중 |
| `✅` | 해당 체크 칼럼 완료 |
| `—` | 해당 없음 또는 현재 범위 제외 |

한 행 전체의 점검이 완료됐다는 뜻으로 `✅`를 사용하려면 마지막 `실기 검증` 칼럼까지
완료되어야 한다.

## 체크 칼럼 정의

| 칼럼 | 완료 조건 |
|---|---|
| 원본 코드 | 라우트에서 실제 렌더링되는 트리, StyleSheet, asset 의존성을 확인함 |
| 현재 코드 | `ai-pt`의 대응 렌더 트리, StyleSheet, asset 의존성을 확인함 |
| 상태 정렬 | 비교할 데이터·선택 탭·빈 상태·모달·확장 상태를 동일하게 고정함 |
| 규칙 추출 | 타이포그래피, 공간, 크기, 표면, 아이콘 규칙을 실제 코드에서 기록함 |
| 공통화 | 토큰·primitive·pattern 후보와 페이지 전용 예외를 구분함 |
| 반영 | 확정된 공통 규칙과 페이지 예외를 `ai-pt` 코드에 반영함 |
| 실기 검증 | 같은 상태의 실행 화면을 촬영해 원본과 비교하고 잔여 차이를 기록함 |

## 선행 공통 단위

| ID | 점검 단위 | 원본 실제 코드 | `ai-pt` 실제 코드 | 원본 코드 | 현재 코드 | 상태 정렬 | 규칙 추출 | 공통화 | 반영 | 실기 검증 |
|---|---|---|---|---|---|---|---|---|---|---|
| F-01 | [색상·그림자 foundation](common.md#f-01-색상그림자-foundation) | [`constants/colors.ts`](../../../../2026-07-13/my-PT-Diary/constants/colors.ts) | [`shared/constants/colors.ts`](../../src/shared/constants/colors.ts) | ✅ | ✅ | — | ✅ | ✅ | ✅ | ⬜ |
| F-02 | [폰트 asset과 본문 typography](common.md#f-02-폰트-asset과-본문-typography) | [`app/_layout.tsx`](../../../../2026-07-13/my-PT-Diary/app/_layout.tsx) 및 실제 화면 StyleSheet | [`shared/constants/typography.ts`](../../src/shared/constants/typography.ts) 및 실제 화면 StyleSheet | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| F-03 | [하단 탭 shell](common.md#f-03-하단-탭-shell) | [`components/GlobalTabBar.tsx`](../../../../2026-07-13/my-PT-Diary/components/GlobalTabBar.tsx) | [`shared/components/member-tab-bar.tsx`](../../src/shared/components/member-tab-bar.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| F-04 | [공통 SVG·이미지·아이콘 체계](common.md#f-04-공통-svg이미지아이콘-체계) | [`components/TabIcons.tsx`](../../../../2026-07-13/my-PT-Diary/components/TabIcons.tsx) 및 원본 asset import | [`shared/components/icons/pt-diary-icons.tsx`](../../src/shared/components/icons/pt-diary-icons.tsx), [`shared/lib/asset-url.ts`](../../src/shared/lib/asset-url.ts) 및 MinIO seed | ✅ | ✅ | — | ✅ | ✅ | ✅ | ⬜ |
| F-05 | [화면 배경·스크롤·안전영역](common.md#f-05-화면-배경스크롤안전영역) | 실제 페이지 루트 View·ScrollView | [`shared/components/tab-page-layout.tsx`](../../src/shared/components/tab-page-layout.tsx) 및 실제 페이지 루트 View·ScrollView | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |

## 현재 구현된 사용자 페이지

점검은 루트 탭 5개를 먼저 처리하고, 해당 화면에서 진입하는 상세 페이지를 다음
순서로 처리한다. 각 단위는 `pages/` 문서 확인 → 실제 코드 확인 → 원본 디자인 대조
→ 디자인 마이그레이션 → 이 README 갱신까지 마친 뒤에만 다음 ID로 이동한다.
디자인 판정은 과거 QA 문서보다 원본 앱의 현재 실제 코드를 우선한다.

| ID | 페이지 | 원본 실제 코드 | `ai-pt` 실제 코드 | 원본 코드 | 현재 코드 | 상태 정렬 | 규칙 추출 | 공통화 | 반영 | 실기 검증 |
|---|---|---|---|---|---|---|---|---|---|---|
| P-01 | [홈 `/`](pages/home.md) | [`app/(tabs)/index.tsx`](<../../../../2026-07-13/my-PT-Diary/app/(tabs)/index.tsx>) | [`src/pages/index.tsx`](../../src/pages/index.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-02 | [기록 `/exercise`](pages/exercise.md) | [`app/(tabs)/exercise.tsx`](<../../../../2026-07-13/my-PT-Diary/app/(tabs)/exercise.tsx>) | [`src/pages/exercise.tsx`](../../src/pages/exercise.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-03 | [PT `/pt-log`](pages/pt-log.md) | [`app/(tabs)/pt-log.tsx`](<../../../../2026-07-13/my-PT-Diary/app/(tabs)/pt-log.tsx>) | [`src/pages/pt-log.tsx`](../../src/pages/pt-log.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-04 | [AI `/ai-hub`](pages/ai-hub.md) | [`app/(tabs)/ai-hub.tsx`](<../../../../2026-07-13/my-PT-Diary/app/(tabs)/ai-hub.tsx>) | [`src/pages/ai-hub.tsx`](../../src/pages/ai-hub.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-05 | [내 정보 `/condition`](pages/condition.md) | [`app/(tabs)/condition.tsx`](<../../../../2026-07-13/my-PT-Diary/app/(tabs)/condition.tsx>) | [`src/pages/condition.tsx`](../../src/pages/condition.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-06 | [운동 진행 `/active-workout`](pages/active-workout.md) | [`app/active-workout.tsx`](../../../../2026-07-13/my-PT-Diary/app/active-workout.tsx) | [`src/pages/active-workout.tsx`](../../src/pages/active-workout.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-07 | [야외운동 `/outdoor-workout`](pages/outdoor-workout.md) | [`app/(tabs)/outdoor-workout.tsx`](<../../../../2026-07-13/my-PT-Diary/app/(tabs)/outdoor-workout.tsx>) | [`src/pages/outdoor-workout.tsx`](../../src/pages/outdoor-workout.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-08 | [야외운동 결과 `/outdoor-workout-result`](pages/outdoor-workout-result.md) | [`app/(tabs)/outdoor-workout-result.tsx`](<../../../../2026-07-13/my-PT-Diary/app/(tabs)/outdoor-workout-result.tsx>) | [`src/pages/outdoor-workout-result.tsx`](../../src/pages/outdoor-workout-result.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-09 | [운동배우기 `/exercise-guide`](pages/exercise-guide.md) | [`app/exercise-guide.tsx`](../../../../2026-07-13/my-PT-Diary/app/exercise-guide.tsx) | [`src/pages/exercise-guide.tsx`](../../src/pages/exercise-guide.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-10 | [운동 영상 `/exercise-video-viewer`](pages/exercise-video-viewer.md) | [`app/exercise-video-viewer.tsx`](../../../../2026-07-13/my-PT-Diary/app/exercise-video-viewer.tsx) | [`src/pages/exercise-video-viewer.tsx`](../../src/pages/exercise-video-viewer.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-11 | [운동 기록 목록 `/exercise-list`](pages/exercise-list.md) | [`app/exercise-list.tsx`](../../../../2026-07-13/my-PT-Diary/app/exercise-list.tsx) | [`src/pages/exercise-list.tsx`](../../src/pages/exercise-list.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-12 | [운동 기록 상세 `/exercise-record-detail`](pages/exercise-record-detail.md) | 원본에 독립 라우트 없음. `exercise-list`·`exercise-form` 흐름에서 실제 대응 범위 판정 | [`src/pages/exercise-record-detail.tsx`](../../src/pages/exercise-record-detail.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-13 | [운동 기록 작성·수정 `/exercise-form`](pages/exercise-form.md) | [`app/exercise-form.tsx`](../../../../2026-07-13/my-PT-Diary/app/exercise-form.tsx) | [`src/pages/exercise-form.tsx`](../../src/pages/exercise-form.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-14 | [컨디션 기록 목록 `/condition-list`](pages/condition-list.md) | [`app/condition-list.tsx`](../../../../2026-07-13/my-PT-Diary/app/condition-list.tsx) | [`src/pages/condition-list.tsx`](../../src/pages/condition-list.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-15 | [컨디션 기록 작성·수정 `/condition-form`](pages/condition-form.md) | [`app/condition-form.tsx`](../../../../2026-07-13/my-PT-Diary/app/condition-form.tsx) | [`src/pages/condition-form.tsx`](../../src/pages/condition-form.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-16 | [PT 수업일지 작성·수정 `/pt-lesson-form`](pages/pt-lesson-form.md) | [`app/pt-lesson-form.tsx`](../../../../2026-07-13/my-PT-Diary/app/pt-lesson-form.tsx) | [`src/pages/pt-lesson-form.tsx`](../../src/pages/pt-lesson-form.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-17 | [트레이너 매칭 `/ai-trainer-match`](pages/ai-trainer-match.md) | [`app/ai-trainer-match.tsx`](../../../../2026-07-13/my-PT-Diary/app/ai-trainer-match.tsx) | [`src/pages/ai-trainer-match.tsx`](../../src/pages/ai-trainer-match.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-18 | [AI 체형 분석 `/ai-analysis`](pages/ai-analysis.md) | [`app/ai-analysis.tsx`](../../../../2026-07-13/my-PT-Diary/app/ai-analysis.tsx) | [`src/pages/ai-analysis.tsx`](../../src/pages/ai-analysis.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-19 | [체형 분석 기록 `/analysis-history`](pages/analysis-history.md) | [`app/analysis-history.tsx`](../../../../2026-07-13/my-PT-Diary/app/analysis-history.tsx) | [`src/pages/analysis-history.tsx`](../../src/pages/analysis-history.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-20 | [식단 분석 `/meal-analysis`](pages/meal-analysis.md) | [`app/meal-analysis.tsx`](../../../../2026-07-13/my-PT-Diary/app/meal-analysis.tsx) | [`src/pages/meal-analysis.tsx`](../../src/pages/meal-analysis.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |
| P-21 | [운동 리포트 `/progress-chart`](pages/progress-chart.md) | [`app/progress-chart.tsx`](../../../../2026-07-13/my-PT-Diary/app/progress-chart.tsx) | [`src/pages/progress-chart.tsx`](../../src/pages/progress-chart.tsx) | ✅ | ✅ | 🟨 | ✅ | ✅ | ✅ | ⬜ |

## 원본에는 있으나 `ai-pt`에 아직 없는 사용자 페이지

이 목록도 삭제된 것으로 간주하지 않는다. 실제 마이그레이션 범위와 대응 라우트를
확정한 뒤 위 점검표에 편입한다.

| ID | 원본 페이지 | 원본 실제 코드 | `ai-pt` 상태 | 범위 확정 | 원본 코드 | 규칙 추출 | 구현 반영 | 실기 검증 |
|---|---|---|---|---|---|---|---|---|
| S-01 | AI 트레이너 아테나 | [`app/athena.tsx`](../../../../2026-07-13/my-PT-Diary/app/athena.tsx) | 대응 라우트 없음 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| S-02 | 통합 피트니스 분석 | [`app/fitness-state.tsx`](../../../../2026-07-13/my-PT-Diary/app/fitness-state.tsx) | 대응 라우트 없음 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| S-03 | 자세 추적 | [`app/posture-tracking.tsx`](../../../../2026-07-13/my-PT-Diary/app/posture-tracking.tsx) | 대응 라우트 없음 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| S-04 | 체형 스타일 | [`app/my-body-style.tsx`](../../../../2026-07-13/my-PT-Diary/app/my-body-style.tsx) | 대응 라우트 없음 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| S-05 | 내 피드백 | [`app/my-feedback.tsx`](../../../../2026-07-13/my-PT-Diary/app/my-feedback.tsx) | 대응 라우트 없음 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| S-06 | 인스타그램 연결 | [`app/instagram.tsx`](../../../../2026-07-13/my-PT-Diary/app/instagram.tsx) | 대응 라우트 없음 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| S-07 | 이벤트 목록 | [`app/events-list.tsx`](../../../../2026-07-13/my-PT-Diary/app/events-list.tsx) | 대응 라우트 없음 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| S-08 | 이벤트 상세 | [`app/event-detail.tsx`](../../../../2026-07-13/my-PT-Diary/app/event-detail.tsx) | 대응 라우트 없음 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

## 별도 범위

다음 페이지는 실제 원본 코드에는 있지만 현재 사용자용 `ai-pt` 라우트에는 없다.
디자인 점검에서 누락시키지 않기 위해 기록하되, 사용자 앱 마이그레이션 범위가
확정되기 전에는 페이지별 점검을 시작하지 않는다.

| 구분 | 원본 실제 페이지 | 현재 처리 |
|---|---|---|
| 인증 | `login.tsx`, `signup.tsx` | Apps in Toss 인증 정책 범위로 별도 관리 |
| 트레이너 탭 | `(trainer-tabs)/index`, `schedule`, `members`, `videos`, `revenue`, `events`, `nutrition`, `profile` | 범위 확정 전 보류 |
| 트레이너 상세 | `trainer-condition-view`, `trainer-exercise-guide`, `trainer-posture-capture`, `trainer-pt-lesson-form`, `trainer-routine-form`, `trainer-video-feedback` | 범위 확정 전 보류 |
| 트레이너 인증 | `trainer-login.tsx`, `trainer-signup.tsx` | 범위 확정 전 보류 |
| `ai-pt` 전용 | [`src/pages/about.tsx`](../../src/pages/about.tsx) | 대응 원본 없음. 유지 여부 별도 판정 |

## 페이지별 상세 문서 형식

각 페이지 문서는 다음 형식으로 작성한다.

### 1. 실제 코드 경로

- 원본 라우트 파일
- 원본이 실제 렌더링하는 컴포넌트
- 원본이 실제 import하는 asset과 공통 코드
- `ai-pt` 라우트 파일
- `ai-pt`가 실제 렌더링하는 feature 컴포넌트

### 2. 상태 매트릭스

| 상태 | 원본 재현 | `ai-pt` 재현 | 비교 가능 | 비고 |
|---|---|---|---|---|
| 기본 | ⬜ | ⬜ | ⬜ | |
| 데이터 없음 | ⬜ | ⬜ | ⬜ | |
| 데이터 있음 | ⬜ | ⬜ | ⬜ | |
| 로딩 | ⬜ | ⬜ | ⬜ | |
| 오류 | ⬜ | ⬜ | ⬜ | |
| 모달·확장·선택 상태 | ⬜ | ⬜ | ⬜ | 페이지에 존재하는 상태만 기록 |

### 3. 실제 시각 규칙 대조

| 영역 | 원본 실제 코드 | `ai-pt` 실제 코드 | 판정 | 공통화 대상 |
|---|---|---|---|---|
| 화면 배경·스크롤 | | | | |
| 본문 좌우·상하 여백 | | | | |
| 타이포그래피 | | | | |
| 섹션 사이 수직 리듬 | | | | |
| 카드·surface | | | | |
| 행 높이·내부 정렬 | | | | |
| 버튼·칩·배지 | | | | |
| 아이콘·이미지 | | | | |
| 그림자·border | | | | |
| 상태별 차이 | | | | |

`원본 실제 코드`에는 설명만 적지 않고 확인한 property와 값을 함께 기록한다.
같은 의미의 규칙이 둘 이상의 페이지에서 반복될 때만 공통화 대상으로 올린다.

### 4. 공통화 판정

| 후보 | 분류 | 사용 페이지 | 원본 근거 | 결정 |
|---|---|---|---|---|
| 예: 화면 좌우 여백 | token | | | |
| 예: 섹션 제목 | primitive | | | |
| 예: 아이콘+제목+설명+chevron 행 | pattern | | | |

분류 기준은 다음과 같다.

- `token`: 색상, 크기, 간격, radius, 그림자처럼 값 자체가 반복됨
- `primitive`: 텍스트, surface, 아이콘처럼 단일 시각 책임을 가짐
- `pattern`: 원본에서 같은 조립 구조가 여러 페이지에 반복됨
- `page-only`: 한 페이지에만 존재하며 공통화하면 오히려 원본 구조가 흐려짐

### 5. 반영과 검증

- 수정한 공통 token·primitive·pattern
- 유지한 페이지 전용 예외
- 원본과 의도적으로 다르게 유지한 플랫폼 예외
- 동일 상태의 원본·`ai-pt` 캡처
- 잔여 차이와 다음 조치

## 완료 기준

페이지는 다음 조건을 모두 만족해야 `✅`로 표시한다.

1. 원본과 `ai-pt`의 실제 렌더 트리를 모두 확인했다.
2. 비교 상태와 데이터를 동일하게 맞췄다.
3. 실제 코드값을 기준으로 시각 규칙을 기록했다.
4. 공통 규칙과 페이지 전용 예외를 구분했다.
5. 확정된 규칙을 `ai-pt`에 반영했다.
6. Apps in Toss 실행 환경에서 캡처해 원본과 다시 비교했다.
7. 남은 차이가 없거나 의도적인 플랫폼 예외로 문서화됐다.
