# P-15 컨디션 기록 작성·수정 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

폼 본문의 점수 버튼 row, 입력 shell, 섹션 리듬은 기존 서버 작성·수정 흐름을
유지하면서 원본 값으로 정렬했다. 축소돼 있던 상단 action, 근육 안내 affordance,
근육 정보 modal도 원본 아이콘과 실제 수치로 복원했다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/condition-form.tsx`](../../../../../2026-07-13/my-PT-Diary/app/condition-form.tsx)

### `ai-pt`

- 라우트: [`src/pages/condition-form.tsx`](../../../src/pages/condition-form.tsx)
- 화면: [`src/features/condition-records/components/condition-form-screen.tsx`](../../../src/features/condition-records/components/condition-form-screen.tsx)
- score row: [`src/features/condition-records/components/condition-score-row.tsx`](../../../src/features/condition-records/components/condition-score-row.tsx)
- muscle info modal: [`src/features/condition-records/components/condition-muscle-info-modal.tsx`](../../../src/features/condition-records/components/condition-muscle-info-modal.tsx)

## 렌더 트리 대조

```text
원본
ConditionFormScreen
├── ParallaxBackground
├── icon header
│   ├── close icon
│   ├── title
│   └── accent save icon button
└── ScrollView
    ├── 기본 정보
    ├── 컨디션 체크 score rows
    ├── 근육통 체크 score rows
    │   ├── hint badge with info icon
    │   └── muscle info modal
```

```text
ai-pt
TabPageLayout(activeKey=null)
└── ConditionFormScreen
    ├── edit query SuspenseSection
    └── KeyboardAvoidingView
        ├── icon header
        │   ├── close icon
        │   ├── title
        │   └── accent save icon / pending spinner
        ├── ScrollView
        │   ├── 기본 정보
        │   ├── 컨디션 체크 score rows
        │   └── 근육통 체크 score rows
        │       └── info icon hint badge
        └── muscle info modal
```

수정 데이터용 Suspense 경계는 전체 라우트가 아니라 실제 데이터를 소비하는
`EditConditionForm` 가까이에 유지했다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 새 기록 작성 | 있음 | 있음 | 가능 | 코드 기준 정렬 |
| 기존 기록 수정 | 있음 | 있음 | 가능 | Suspense + 서버 수정 유지 |
| 컨디션 점수 입력 | 있음 | 있음 | 가능 | 코드 기준 정렬 |
| 근육통 점수 입력 | 있음 | 있음 | 가능 | help icon까지 정렬 |
| 근육 위치 안내 modal | 있음 | 있음 | 가능 | image·icon·spacing 정렬 |
| 저장 | 있음 | 있음 | 가능 | icon / pending 상태 정렬 |

## 실제 시각 규칙 대조

### 1. 상단 chrome

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| background chrome | `ParallaxBackground` 있음 | 현재 계정 asset 없음 | 데이터 예외 |
| header action | close `24`, check `24` | 동일 SVG | 일치 |
| save shell | accent `36 × 36`, radius `10` | 동일 | 일치 |
| title | `17` SemiBold | 동일 | 일치 |
| header shell | white, horizontal `20`, vertical `12`, bottom border `1` | 동일 | 일치 |
| pending | 원본 저장 action 위치 | 같은 `36 × 36` shell의 spinner | 서버 상태 확장 |

원본 global header의 상단 safe-area 여백은 Apps in Toss 네이티브 상단 헤더 제외
정책에 따라 복제하지 않았다. 로컬 icon header는 P-13 폼과 같은 방식으로 본문
첫 행에 둔다.

### 2. 입력 shell

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| section gap | `24` | 동일 | 일치 |
| section title | `16` SemiBold | 동일 | 일치 |
| section subtitle | `11` Regular muted | 동일 | 일치 |
| input shell | `inputBg`, border `1`, radius `10`, padding `12` | 동일 | 일치 |
| 기본 정보 row gap | `10` | 동일 | 일치 |
| scroll content | padding `20`, gap `24` | 동일 | 일치 |
| 하단 여백 | global tab·safe area 회피 | `TabPageLayout` 계산값 | 일치 |

입력 계열은 원본 재현도가 높다.

### 3. score row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| row shell | white card, border `1`, radius `12`, `14/10` | 동일 | 일치 |
| label | `13` Medium | 동일 | 일치 |
| score button size | `32 × 32`, radius `8`, border `1` | 동일 | 일치 |
| selected color fill | score 기반 색상 | 동일 계열 | 일치 |
| score button text | `13` SemiBold | 동일 | 일치 |

컨디션/근육통 row는 같은 feature에서 `ConditionScoreRow`와
`MuscleSorenessScoreRow`로 공통 스타일을 공유하되, 도움말 action이 없는 일반
점수 row까지 무리하게 하나의 prop-heavy 컴포넌트로 합치지 않았다.

### 4. hint badge와 muscle info affordance

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| hint badge | information-circle `12` + text | 동일 SVG | 일치 |
| hint badge shell | info tint, radius `8`, gap `3`, `8/3` | 동일 | 일치 |
| muscle label help affordance | help-circle-outline `16`, gap `4` | 동일 SVG | 일치 |
| modal shell | overlay `0.55`, radius `20`, padding `20`, max width `360` | 동일 | 일치 |
| modal image | height `200`, radius `14`, `#1B2A4A` | 동일 | 일치 |
| modal close | close-circle `24` muted | 동일 SVG | 일치 |
| modal info | location/body/barbell `16` + label, value left `22` | 동일 | 일치 |

근육 이미지와 설명 데이터는 이미 원본 asset·문구를 이관한 상태여서 그대로
유지했다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| form input shell | primitive 후보 | 근거 확인 | `exercise-form`과 공통 |
| section title/subtitle rhythm | primitive 후보 | 근거 확인 | 폼 계열 공통 |
| score row | feature primitive | 적용 | condition feature 안에서 style 공유 |
| hint badge shell | page-only | 적용 | 근육통 설명에만 존재 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| text header action | reject | 기준 affordance 금지 | 원본은 close/check icon |
| `?` 문자 badge | reject | 임의 대체 금지 | 원본은 help-circle-outline |
| 임의 체형 배경 | reject | 데이터 없는 창작 금지 | 대응하는 현재 계정 asset 필드가 없음 |

## 시스템 관점 결론

이 페이지는 `exercise-form`과 함께 폼 shell의 두 번째 실제 근거다.

즉 공통화는

- input shell
- section heading rhythm
- selectable score button grid

를 중심으로 하고,

header action과 아이콘 affordance는 공통 아이콘 registry를 사용하고 각 폼의 실제
padding과 section gap은 원본 페이지 값으로 남긴다. 두 화면의 본문 수치가 서로
다르므로 지금 하나의 거대한 공통 폼 layout으로 합치지 않는다.

## 반영과 검증

- [`condition-form.tsx`](../../../src/pages/condition-form.tsx)에 하단 탭·safe area 회피 shell을 적용했다.
- [`condition-form-screen.tsx`](../../../src/features/condition-records/components/condition-form-screen.tsx)에 원본 KeyboardAvoiding 동작, icon header, 저장 spinner, content 간격, info badge를 반영했다.
- [`condition-score-row.tsx`](../../../src/features/condition-records/components/condition-score-row.tsx)의 border와 help-circle affordance를 원본에 맞췄다.
- [`condition-muscle-info-modal.tsx`](../../../src/features/condition-records/components/condition-muscle-info-modal.tsx)의 card, image, title, close 및 정보 icon row를 원본에 맞췄다.
- 저장 성공 후 현재 목록을 새로 쌓지 않고 원본처럼 이전 화면으로 돌아가도록 정렬했다.
- 공통 아이콘 registry에 `informationCircle`, `helpCircleOutline`,
  `closeCircle`, `location`을 추가했다.
- `src/features/condition-records` Jest `5` suites, `13` tests와 전체
  TypeScript typecheck, `git diff --check`를 통과했다.

동일 상태의 원본·Apps in Toss 실행 캡처는 아직 남아 있으므로 `실기 검증`은
완료로 표시하지 않는다. 캡처에서는 작은 화면에서 근육 modal의 `85%` 최대 높이와
원본 체형 배경의 플랫폼 예외를 우선 확인한다.
