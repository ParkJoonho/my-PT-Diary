# P-14 컨디션 기록 목록 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 페이지는 전체 틀은 `exercise-list`와 거의 같은 패밀리다. 따라서

- 날짜 헤더
- 필터 pill
- 캘린더 모달 shell

은 공통화 후보로 강하고, 차이는 컨디션 카드 내부 metric/badge 구성에 집중된다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/condition-list.tsx`](../../../../../2026-07-13/my-PT-Diary/app/condition-list.tsx)

### `ai-pt`

- 라우트: [`src/pages/condition-list.tsx`](../../../src/pages/condition-list.tsx)
- 화면: [`src/features/condition-records/components/condition-record-list-screen.tsx`](../../../src/features/condition-records/components/condition-record-list-screen.tsx)
- 컨디션 카드: [`src/features/condition-records/components/condition-record-card.tsx`](../../../src/features/condition-records/components/condition-record-card.tsx)
- 캘린더 모달: [`src/features/condition-records/components/condition-calendar-modal.tsx`](../../../src/features/condition-records/components/condition-calendar-modal.tsx)

## 렌더 트리 대조

```text
원본
ConditionListScreen
├── ParallaxBackground
├── AppHeader
├── FlatList
│   ├── list header
│   ├── date headers
│   ├── condition cards
│   │   ├── 컨디션 metric + badge
│   │   ├── 근육통 metric + badge
│   │   └── 근육통 부위 metric
│   ├── empty state
│   └── loading more
└── calendar modal
```

```text
ai-pt
ConditionRecordListScreen
├── in-page text header
├── filter row
├── FlatList
│   ├── date headers
│   ├── condition cards
│   ├── empty state
│   └── loading more
└── calendar modal
```

기본 구조는 원본과 동일 계열이고, 상단 chrome과 card 내부 아이콘/미세 표현만 다르다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본 리스트 | 있음 | 있음 | 가능 | 매우 유사 |
| 날짜 필터 off/on | 있음 | 있음 | 가능 | 매우 유사 |
| 빈 상태 | icon + text | 텍스트만 | 가능 | 현재가 축소됨 |
| 카드 상태 | 있음 | 있음 | 가능 | 미세 표현 차이 |
| 캘린더 모달 | 있음 | 있음 | 가능 | 거의 동일 계열 |

## 실제 시각 규칙 대조

### 1. 공통 list shell

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| filter pill shell | radius `20`, border, active tint | 동일 | 일치 |
| date header | gap `8`, `20/10`, today chip | 동일 | 일치 |
| loading more | `12` Regular muted | 동일 | 일치 |
| list content bottom | safe area 기반 | `32` 고정 + container padding | 다름 |

리스트 계열 뼈대는 원본을 잘 따랐다.

### 2. 상단 chrome

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| top chrome | `ParallaxBackground` + `AppHeader` | `닫기 / 컨디션 기록 / 작성` header | 다름 |
| header title | 원본 list title은 body 내부 `17` SemiBold | 현재 header title `18` Bold | 다름 |

이 차이는 `exercise-list`와 같은 성격이다. 범위 밖이지만 시스템 근거에서는 제외해야 한다.

### 3. filter button

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| content | calendar icon + text + chevron | text만 | 다름 |
| text size/color | `13` Medium, active accent | 동일 | 거의 일치 |

필터 affordance가 약해진 점도 `exercise-list`와 동일하다.

### 4. 컨디션 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| shell | white, radius `14`, `iosShadow` | bordered white card, radius `14` | 거의 일치 |
| row 구조 | 3열 metric + divider | 동일 | 일치 |
| metric label row | icon + label | label만 또는 축소 | 다름 |
| 평균 점수/배지 | 있음 | 있음 | 거의 일치 |
| 근육통 부위 text | 1줄 요약 | 동일 | 일치 |
| badge size | radius `6`, `6/2` | 유사 | 거의 일치 |

컨디션 카드 자체는 원본 재현도가 꽤 높다. 가장 큰 차이는 metric label의 icon affordance다.

### 5. empty state

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| leading icon | `heart-outline` | 없음 | 다름 |
| title/subtitle | 유사 | 유사 | 거의 일치 |
| top padding | `80` | 동일 | 일치 |

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| list header date grouping | primitive 후보 | 가능 | `exercise-list`와 동일 패턴 |
| filter pill shell | primitive 후보 | 가능 | 기록 리스트 계열 공통 |
| calendar range modal | pattern 후보 | 가능 | 기록/컨디션 리스트 공통 |
| 3-column metric card shell | pattern 후보 | 보류 | 기록 카드와 컨디션 카드 내용 구조는 다르지만 grid shell은 유사 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 현재 text-only filter content | reject | 기준 affordance 금지 | 원본은 icon + chevron |
| 현재 in-page header | reject | 기준 top chrome 금지 | 원본 구조와 다름 |

## 시스템 관점 결론

이 페이지는 `exercise-list`와 함께 기록계 리스트 공통 시스템을 추출할 수 있는 근거다.

즉 공통화는

- date header
- filter pill
- calendar modal
- list spacing

을 묶고,

카드 내부 metric/icon/badge 의미는 각 도메인별로 남겨야 한다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. `exercise-list`와 함께 date header / filter pill / calendar modal을 공통 패턴으로 묶기
2. filter 버튼 내부 icon/chevron affordance 복원
3. condition card metric label iconography 복원
4. empty state leading icon 복원
