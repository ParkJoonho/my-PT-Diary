# P-19 체형 분석 기록 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

원본 실제 코드에 맞춰 고정 header·filter·compare CTA와 스크롤 목록의 책임을 다시
분리하고, loading/empty/selection/comparison/detail 상태를 복원했다. 현재가 누락했던
자세 분석과 통합 분석의 카드 요약 및 상세 본문도 원본 구조로 다시 구현했다.

이 페이지도 실제 코드상으로는 원본과 상당히 가깝다. 전반 차이는 디자인 토큰보다는

1. 상세/비교 결과를 별도 컴포넌트로 분리한 점
2. Orval Suspense query 경계를 목록과 상세 소비처에 각각 둔 점
3. 서버가 실제 허용하는 체형 기록만 비교 선택할 수 있게 한 점

에 있다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/analysis-history.tsx`](../../../../../2026-07-13/my-PT-Diary/app/analysis-history.tsx)

### `ai-pt`

- 라우트: [`src/pages/analysis-history.tsx`](../../../src/pages/analysis-history.tsx)
- 화면: [`src/features/body-analysis/components/analysis-history-screen.tsx`](../../../src/features/body-analysis/components/analysis-history-screen.tsx)
- 비교 결과: [`src/features/body-analysis/components/analysis-record-comparison-result.tsx`](../../../src/features/body-analysis/components/analysis-record-comparison-result.tsx)
- 상세 본문: [`src/features/body-analysis/components/analysis-record-detail-content.tsx`](../../../src/features/body-analysis/components/analysis-record-detail-content.tsx)

## 렌더 트리 대조

```text
원본
AnalysisHistoryScreen
├── header
├── filter chip row
├── compare CTA
├── empty/loading state
├── comparison result block
├── record card list
└── detail modal
    └── type-specific detail sections
```

```text
ai-pt
TabPageLayout(activeKey=null)
└── AnalysisHistoryScreen
    ├── fixed header
    ├── fixed filter chip row
    ├── conditional compare CTA
    ├── list-local Suspense/ErrorBoundary
    │   └── ScrollView
    │       ├── loading/empty state
    │       ├── comparison result block
    │       └── record card list
    ├── detail modal
    │   ├── fixed modal header
    │   └── detail-local Suspense/ErrorBoundary
    │       └── AnalysisRecordDetailContent
    └── MemberTabBar
```

구조적으로는 거의 동일하고, 현재 쪽이 record/detail/comparison을 역할별로 나눠 놓았다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 전체 필터 | 있음 | 있음 | 가능 | 동일 |
| 타입별 필터 | 있음 | 있음 | 가능 | 동일 |
| 선택 없음 | 있음 | 있음 | 가능 | 동일 |
| 2개 선택 후 비교 CTA | 있음 | 있음 | 가능 | 동일 |
| 비교 결과 표시 | 있음 | 있음 | 가능 | 구조 분리 |
| 상세 모달 | 있음 | 있음 | 가능 | 구조 분리 |
| 자세 분석 카드·상세 | 있음 | 있음 | 가능 | 복원 완료 |
| 통합 분석 카드·상세 | 있음 | 있음 | 가능 | 복원 완료 |

## 실제 시각 규칙 대조

### 1. header / filter row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| header 배치 | 목록 ScrollView 밖 고정 | 동일 | 일치 |
| header title | `18` Medium | `18` Medium | 일치 |
| header padding | H `16`, V `12` | 동일 | 일치 |
| filter row gap | `8` | `8` | 일치 |
| filter chip | radius `20`, border `1`, padding `16/8` | 동일 | 일치 |
| active chip | accent bg + white label | 동일 | 일치 |
| chip label | `13` SemiBold | 동일 | 일치 |

header와 filter는 데이터 query의 Suspense fallback 밖에 두어, 필터 전환과 로딩 중에도
원본 shell이 유지된다.

### 2. compare CTA / 힌트 문구

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| compare button | primary, height `48`, radius `14`, MB `8` | 동일 | 일치 |
| compare icon | compare-horizontal `20` | 원본 SVG path `20` | 일치 |
| compare label | `15` Medium | 동일 | 일치 |
| select hint | centered muted text `13` | 동일 | 일치 |
| close comparison button | border 없는 neutral action, PV `12` | 동일 | 일치 |

비교 액션 계열도 원본과 아주 가깝다.

### 3. record card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| card shell | H `16`, MB `10`, radius `14`, border `1.5`, padding `16`, shadow 없음 | 동일 | 일치 |
| selected state | accent tint + accent border | 동일 | 일치 |
| checkbox | `22x22`, border `2` | 동일 | 일치 |
| type/date row | 동일 구조 | 동일 구조 | 일치 |
| summary | `13` Regular, lineHeight `20` | 동일 | 일치 |
| mini score row | centered mini items | 동일 | 일치 |

체형 카드의 5점 점수 색, 자세 카드의 등급·운동명·정확도/위험도, 통합 카드의
종합 등급·점수까지 원본 분기를 복원했다. `body-comparison`은 현재 서버 저장 타입을
보이기 위한 현재 확장 카드로 유지한다.

### 4. 비교 결과 / 상세 모달

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| comparison header | H `16`, V `16`, border `2`, radius `16`, centered icon/title | 동일 | 일치 |
| result cards | H `16`, MB `10`, radius `14`, border `1`, shadow 없음 | 동일 | 일치 |
| detail modal | slide modal | slide modal | 일치 |
| detail header | card bg, bottom border, close/title/date 한 행 | 동일 | 일치 |
| detail content | H `16`, radius `14`, border `1` section cards | 동일 | 구조 분리 |

상세 query는 modal header 아래의 본문 소비처만 suspend한다. 상세를 불러오는 동안
modal 전체나 뒤의 목록이 사라지지 않는다.

### 5. 상태 차이

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 비교 가능 타입 | 모든 카드에서 선택 가능 | 체형만 선택 가능 | 원본 API 결함 보완 |
| body-comparison 카드 | 원본 중심 타입 3종 위주 | 현재 body-comparison 대응 추가 | 현재 확장 |
| loading state | large spinner + `기록 불러오는 중...` | 동일 | 일치 |
| empty state | analytics `48` + title `18` + 설명 `14/22` | 동일 | 일치 |

원본 UI는 자세·통합 기록도 선택할 수 있지만 현재 서버 비교 API는 체형 기록끼리만
허용한다. 현재의 disabled checkbox는 실패하는 CTA를 미리 막는 원본 결함 보완으로
유지했다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| filter chip row | pattern 후보 | 가능 | 기록/분석 목록류에 반복 가능 |
| selectable summary card | pattern 후보 | 가능 | checkbox + summary + chevron 구조가 안정적 |
| compare CTA shell | primitive 후보 | 가능 | 비교 기능이 있는 목록류에 재사용 가능 |
| slide detail modal shell | pattern 후보 | 가능 | close / centered title / content scroll 구조가 반복 가능 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 분석 타입별 요약 추출 규칙 | page-only | 시각 시스템 아님 | 데이터 해석 로직에 가까움 |
| body / posture / state-vector 점수 의미 | page-only | 공통화 금지 | 도메인별 의미가 다름 |

## 반영 결과

- [`analysis-history.tsx`](../../../src/pages/analysis-history.tsx)에 상세 route용
  `TabPageLayout(activeKey=null)`과 실제 탭 하단 inset을 연결했다.
- [`analysis-history-screen.tsx`](../../../src/features/body-analysis/components/analysis-history-screen.tsx)는
  header/filter/compare shell을 목록 ScrollView 밖으로 복원하고 list/detail query
  boundary를 각 소비처 가까이 분리했다.
- [`analysis-record-comparison-result.tsx`](../../../src/features/body-analysis/components/analysis-record-comparison-result.tsx)의
  shadow를 제거하고 원본 comparison header/card/badge/flow icon 수치로 정렬했다.
- [`analysis-record-detail-content.tsx`](../../../src/features/body-analysis/components/analysis-record-detail-content.tsx)에
  자세 분석의 폼·부상 위험·교정·추천 상세와 통합 분석의 점수·주간 계획·교정·영양·예측
  상세를 복원했다.
- 타입별 데이터 해석은 분석 도메인의 presentation 영역에 유지하고, 이 페이지에서만
  확인된 modal/record 조합을 성급히 전역 공통화하지 않았다.
- [`analysis-history-screen.test.tsx`](../../../src/features/body-analysis/components/__tests__/analysis-history-screen.test.tsx)를
  추가하고 상세 테스트를 확장했다. 전체 body-analysis 10개 suite, 28개 test,
  `tsc --noEmit`, `git diff --check`를 통과했다.

## 남은 범위

1. 원본 UI와 달리 비교 불가능 타입의 checkbox는 disabled로 표시한다. 서버 제한과
   정렬된 의도적 차이다.
2. 현재 서버에 추가된 `body-comparison` 타입 카드·상세는 원본 이후의 도메인 확장으로
   유지한다.
3. 실제 기기 캡처 기반 동일 상태 검증은 아직 진행하지 않았다.
