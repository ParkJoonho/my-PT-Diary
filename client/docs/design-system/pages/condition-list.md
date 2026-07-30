# P-14 컨디션 기록 목록 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

이 페이지는 `exercise-list`에서 확인한 기록 목록 패턴을 그대로 따른다. 날짜 헤더,
필터 pill, 기간 캘린더, 하단 탭 회피 간격은 같은 규칙으로 정렬했고 컨디션
metric/badge만 도메인 전용 구성으로 유지했다.

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
TabPageLayout(activeKey=null)
└── ConditionRecordListScreen
    ├── SuspenseSection
    │   └── FlatList
    │       ├── list header
    │       │   ├── title
    │       │   └── filter pill
    │       ├── date headers
    │       ├── condition cards
    │       ├── empty state
    │       └── loading more
    ├── calendar modal
    └── floating add button
```

Apps in Toss 네이티브 상단 헤더와 중복되는 원본 `AppHeader`는 공통 제외 범위다.
현재 라우트의 임시 텍스트 헤더는 제거하고 원본처럼 제목과 필터를 리스트 본문에
배치했다. 데이터 쿼리의 Suspense 경계는 실제 소비처인 리스트 가까이에 유지했다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본 리스트 | 있음 | 있음 | 가능 | 코드 기준 정렬 |
| 날짜 필터 off/on | 있음 | 있음 | 가능 | icon·text·chevron 정렬 |
| 빈 상태 | icon + text | icon + text | 가능 | 상태별 문구까지 정렬 |
| 카드 상태 | 있음 | 있음 | 가능 | metric icon·surface 정렬 |
| 캘린더 모달 | 있음 | 있음 | 가능 | range cap·주말·안전영역 정렬 |

## 실제 시각 규칙 대조

### 1. 공통 list shell

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| filter pill shell | radius `20`, border, active tint | 동일 | 일치 |
| date header | gap `8`, `20/10`, today chip | 동일 | 일치 |
| loading more | `12` Regular muted | 동일 | 일치 |
| list content bottom | web `100`, native `safe + 100` | 탭 높이 + web `16` / native `40` | 일치 |
| floating add button | tab bar 위 `16` | tab bar 위 `16` | 일치 |

`TabPageLayout`의 실제 탭 높이를 기준으로 리스트와 FAB의 하단 여백을 계산해
기기 safe area가 달라도 원본 간격을 유지한다.

### 2. 상단 chrome

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| top chrome | `ParallaxBackground` + `AppHeader` | Apps in Toss native chrome | 플랫폼 예외 |
| list title | body 내부 `17` SemiBold | body 내부 `17` SemiBold | 일치 |

원본의 사용자 체형 이미지 기반 `ParallaxBackground`는 현재 계정 API에 같은 asset
필드가 없어 임의 이미지를 만들지 않았다. 이 잔여 차이는 실행 캡처에서 별도 확인한다.

### 3. filter button

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| content | calendar icon + text + chevron | 동일 SVG 체계 | 일치 |
| shell | border `1`, radius `20`, gap `5` | 동일 | 일치 |
| text size/color | `13` Medium, active accent | 동일 | 일치 |

기간이 선택된 상태에서는 원본과 같이 label과 아이콘을 accent 색으로 전환한다.

### 4. 컨디션 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| shell | white, radius `14`, `iosShadow`, border 없음 | 동일 | 일치 |
| row 구조 | 3열 metric + divider | 동일 | 일치 |
| metric label row | icon `13` + label | `person-outline`·`walk-outline`·`arm-flex-outline` | 일치 |
| 평균 점수/배지 | 있음 | 있음 | 거의 일치 |
| 근육통 부위 text | 1줄 요약 | 동일 | 일치 |
| badge size | radius `6`, `6/2` | 유사 | 거의 일치 |
| interaction | pressed opacity `0.85` | 동일 | 일치 |

세 metric의 의미는 컨디션 도메인에 속하므로 공통 카드로 추출하지 않았다.

### 5. empty state

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| leading icon | `heart-outline` `32` | 동일 | 일치 |
| 필터 없음 문구 | `+ 버튼을 눌러 컨디션을 체크하세요` | 동일 | 일치 |
| 필터 결과 없음 문구 | `다른 기간을 선택해 보세요` | 동일 | 일치 |
| top padding | `80` | 동일 | 일치 |

### 6. 캘린더 모달

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 모달 위치 | safe top + `90` | 동일 | 일치 |
| 월 이동 | chevron `20` | 동일 SVG | 일치 |
| 기간 선택 | start/end round cap + 중간 tint | 동일 | 일치 |
| 날짜 색상 | 일요일 error, 토요일 accent | 동일 | 일치 |
| 열 때 기준일 | client local today | 동일 | 일치 |

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| list header date grouping | primitive 후보 | 근거 확인 | `exercise-list`와 동일 패턴 |
| filter pill shell | primitive 후보 | 근거 확인 | 기록 리스트 계열 공통 |
| calendar range modal | pattern 후보 | 근거 확인 | 기록/컨디션 리스트 공통 |
| 3-column metric card shell | pattern 후보 | 보류 | 기록 카드와 컨디션 카드 내용 구조는 다르지만 grid shell은 유사 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 컨디션 metric 구성 | page-only | 도메인 혼합 방지 | 컨디션·근육통 의미와 badge는 이 페이지 전용 |
| 임의 체형 배경 | reject | 데이터 없는 창작 금지 | 원본 asset에 대응하는 현재 API 필드가 없음 |

## 시스템 관점 결론

이 페이지는 `exercise-list`와 함께 기록계 리스트 공통 시스템을 추출할 수 있는 두 번째
근거다. 다만 현재 두 feature가 각자 보유한 날짜·캘린더 컴포넌트를 즉시 하나로
합치면 도메인 상태와 API 의존성까지 결합된다. 이번 반영은 실제 값과 조립 규칙을
일치시키고, 공통 모듈 추출은 세 번째 소비처 또는 독립 API가 확인될 때 진행한다.

즉 공통화는

- date header
- filter pill
- calendar modal
- list spacing

을 묶고,

카드 내부 metric/icon/badge 의미는 각 도메인별로 남겨야 한다.

## 반영과 검증

- [`condition-list.tsx`](../../../src/pages/condition-list.tsx)에 하단 탭 회피 shell을 적용했다.
- [`condition-record-list-screen.tsx`](../../../src/features/condition-records/components/condition-record-list-screen.tsx)의 임시 헤더를 제거하고 리스트 header, 필터 SVG, 빈 상태, FAB 위치를 원본에 맞췄다.
- [`condition-record-card.tsx`](../../../src/features/condition-records/components/condition-record-card.tsx)에 metric icon, 무테 surface, iOS shadow, pressed opacity를 반영했다.
- [`condition-calendar-modal.tsx`](../../../src/features/condition-records/components/condition-calendar-modal.tsx)에 safe top, 월 이동 아이콘, range cap, 주말 색을 반영했다.
- 공통 아이콘 registry에 원본 `person-outline`을 추가했다.
- `src/features/condition-records` Jest `4` suites, `10` tests와 전체 TypeScript
  typecheck, `git diff --check`를 통과했다.

동일 데이터의 원본·Apps in Toss 실행 캡처는 아직 남아 있으므로 `실기 검증`은
완료로 표시하지 않는다. 캡처에서는 원본 체형 배경의 플랫폼 예외와 safe area별
FAB 위치를 우선 확인한다.
