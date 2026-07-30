# P-15 컨디션 기록 작성·수정 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 페이지도 폼 본문은 원본에 상당히 가깝다. 점수 버튼 row, 입력 shell, 섹션 리듬은
대체로 유지됐고, 차이는 상단 chrome과 힌트/icon affordance에 집중된다.

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
ConditionFormScreen
├── text header
│   ├── 닫기
│   ├── title
│   └── 저장
└── ScrollView
    ├── 기본 정보
    ├── 컨디션 체크 score rows
    ├── 근육통 체크 score rows
    │   ├── text hint badge
    │   └── muscle info modal
```

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 새 기록 작성 | 있음 | 있음 | 가능 | 거의 동일 |
| 기존 기록 수정 | 있음 | 있음 | 가능 | 거의 동일 |
| 컨디션 점수 입력 | 있음 | 있음 | 가능 | 거의 동일 |
| 근육통 점수 입력 | 있음 | 있음 | 가능 | 거의 동일 |
| 근육 위치 안내 modal | 있음 | 있음 | 가능 | 거의 동일 계열 |
| 저장 | 있음 | 있음 | 가능 | header affordance 다름 |

## 실제 시각 규칙 대조

### 1. 상단 chrome

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| background chrome | `ParallaxBackground` 있음 | 없음 | 다름 |
| header action | close/check icons | text buttons | 다름 |
| title | `17` SemiBold | 거의 동일 | 일치 |
| header spacing | 원본은 safe-area 기반 상단 여백 | 현재는 `paddingTop: 16` 컨테이너 | 다름 |

### 2. 입력 shell

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| section gap | `24` | 동일 | 일치 |
| section title | `16` SemiBold | 동일 | 일치 |
| section subtitle | `11` Regular muted | 동일 | 일치 |
| input shell | `inputBg`, border, radius `10`, padding `12` | 동일 | 일치 |
| 기본 정보 row gap | `10` | 동일 | 일치 |

입력 계열은 원본 재현도가 높다.

### 3. score row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| row shell | white card, border, radius `12`, `14/10` | 동일 계열 | 거의 일치 |
| label | `13` Medium | 동일 | 일치 |
| score button size | `32 × 32`, radius `8` | 동일 계열 | 일치 |
| selected color fill | score 기반 색상 | 동일 계열 | 일치 |
| score button text | `13` SemiBold | 동일 | 일치 |

컨디션/근육통 score row는 공통 primitive 후보로 충분히 안정적이다.

### 4. hint badge와 muscle info affordance

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| hint badge | info icon + text | text만 | 다름 |
| hint badge shell | info tint, radius `8` | 동일 계열 | 거의 일치 |
| muscle label help affordance | help-circle icon | 별도 component 내 구현, 기능 유지 | 거의 일치 |
| muscle info modal | 있음 | 있음 | 거의 일치 |

현재는 힌트 badge에서만 원본의 아이콘 affordance가 빠졌다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| form input shell | primitive 후보 | 가능 | `exercise-form`과 공통 |
| section title/subtitle rhythm | primitive 후보 | 가능 | 폼 계열 공통 |
| score row | primitive 후보 | 가능 | condition domain 전용이지만 구조가 안정적 |
| hint badge shell | primitive 후보 | 가능 | 아이콘 포함 형태로 정리하면 됨 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 현재 text-only header actions | reject | 기준 header 금지 | 원본은 icon affordance |
| 현재 text-only hint badge content | reject | 기준 hint badge 금지 | 원본은 info icon 포함 |

## 시스템 관점 결론

이 페이지는 `exercise-form`과 함께 폼 시스템 공통화의 핵심 근거다.

즉 공통화는

- input shell
- section heading rhythm
- selectable score button grid

를 중심으로 하고,

header action과 아이콘 affordance는 원본 기준으로 따로 복원해야 한다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. `exercise-form`과 함께 form shell/input/section rhythm 공통화
2. score row primitive를 condition domain 공통으로 정리
3. header close/save affordance를 원본 icon 기준으로 복원
4. hint badge에 info icon affordance 복원
