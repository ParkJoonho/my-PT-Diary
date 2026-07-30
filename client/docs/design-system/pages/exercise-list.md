# P-11 운동 기록 목록 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 페이지는 리스트/필터/날짜 헤더 계열은 원본을 꽤 잘 따라왔지만, 핵심 record card와
상단 chrome이 달라져 있다. 그래서 얼핏 비슷해 보여도 “기록 리스트”의 밀도와 톤이
원본과 미묘하게 어긋난다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/exercise-list.tsx`](../../../../../2026-07-13/my-PT-Diary/app/exercise-list.tsx)
- 캘린더 모달: 동일 파일 내부 `CalendarModal`
- 배경/헤더: [`components/AppHeader.tsx`](../../../../../2026-07-13/my-PT-Diary/components/AppHeader.tsx)

### `ai-pt`

- 라우트: [`src/pages/exercise-list.tsx`](../../../src/pages/exercise-list.tsx)
- 화면: [`src/features/workout-records/components/workout-record-list-screen.tsx`](../../../src/features/workout-records/components/workout-record-list-screen.tsx)
- 기록 카드: [`src/features/workout-records/components/workout-record-card.tsx`](../../../src/features/workout-records/components/workout-record-card.tsx)
- 캘린더 모달: [`src/features/workout-records/components/workout-record-calendar-modal.tsx`](../../../src/features/workout-records/components/workout-record-calendar-modal.tsx)

## 렌더 트리 대조

```text
원본
ExerciseListScreen
├── ParallaxBackground
├── AppHeader
├── FlatList
│   ├── list header
│   │   ├── title
│   │   └── calendar filter button(icon + text + chevron)
│   ├── date headers
│   ├── exercise cards
│   │   └── 3 metric columns with icons
│   ├── empty state
│   └── loading more
└── calendar modal
```

```text
ai-pt
WorkoutRecordListScreen
├── in-page text header
├── filter row
│   ├── title
│   └── text-only filter button
├── FlatList
│   ├── date headers
│   ├── workout record cards
│   │   ├── 3 metric columns
│   │   └── extra summary line
│   ├── empty state
│   └── loading more
└── calendar modal
```

현재는 원본의 root-level page chrome을 in-page header로 바꾸고, card에 요약 텍스트를
추가했다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본 리스트 | 있음 | 있음 | 가능 | 전반 구조 유사 |
| 날짜 필터 off | 있음 | 있음 | 가능 | 거의 동일 |
| 날짜 필터 on | 있음 | 있음 | 가능 | 거의 동일 |
| 빈 상태 | icon + 2줄 텍스트 | 텍스트만 | 가능 | 현재가 축소됨 |
| 더 불러오기 | 있음 | 있음 | 가능 | 거의 동일 |
| 캘린더 모달 | 있음 | 있음 | 가능 | 세부 표현 다름 |

## 실제 시각 규칙 대조

### 1. 상단 구조

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| page chrome | `ParallaxBackground` + `AppHeader` | `닫기 / 운동 기록 / 작성` header | 구조 다름 |
| list padding top | `20` | container 내부 `paddingTop: 16` + header margin | 다름 |
| list title | `17` Medium | `17` SemiBold | 다름 |

상단 header는 범위 밖이지만, 현재는 원본보다 훨씬 “모달 상세” 같은 인상으로 시작한다.

### 2. 필터 row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| filter button shell | radius `20`, border `1`, `12/6` | 동일 | 일치 |
| active state | accent border + accent tint | 동일 | 일치 |
| 내부 구성 | calendar icon + text + chevron | text만 | 다름 |
| text size | `13` Medium | 동일 | 일치 |

필터 버튼 shell은 맞았지만, 아이콘/chevron을 빼면서 affordance가 약해졌다.

### 3. 날짜 헤더

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| date header gap | `8` | 동일 | 일치 |
| top/bottom padding | `20 / 10` | 동일 | 일치 |
| today chip | 배경 `#E6E9EE`, radius `5` | 동일 | 일치 |
| date text | `15` SemiBold | 동일 | 일치 |

날짜 헤더 계열은 원본에 매우 충실하다.

### 4. 운동 기록 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| shell | white, radius `14`, `16/14`, `iosShadow` | 동일 | 거의 일치 |
| metric row | 3열 + divider | 동일 | 일치 |
| metric label | icon + `11` Regular | 텍스트만 `11` Regular | 다름 |
| metric value | `15` SemiBold | 동일 | 일치 |
| extra summary line | 없음 | 있음 (`12`, lineHeight `18`) | 다름 |
| press feedback | opacity `0.85` | 동일 | 일치 |

현재 카드는 원본 카드에 정보를 더 얹은 버전이다. 문제는 이 추가 summary line이
리스트 화면의 조밀도를 바꾸고, 원본보다 카드가 더 “설명형”으로 보이게 만든다는 점이다.

### 5. empty state

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| leading icon | `barbell-outline` | 없음 | 다름 |
| title/subtitle | 2줄 텍스트 | 유사 | 거의 일치 |
| top padding | `80` | 동일 | 일치 |

empty state도 원본보다 단순화됐다.

### 6. 캘린더 모달

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| overlay | `#00000055` | 유사 | 거의 일치 |
| sheet | white, radius `20`, strong shadow | 유사 | 거의 일치 |
| month nav | icon chevron | 문자 `<` `>` | 다름 |
| week/day grid | 범위 선택/도트/오늘 표시 | 동일 계열 | 거의 일치 |
| 버튼 행 | secondary / accent apply | 동일 계열 | 일치 |

캘린더 모달은 구조적으로는 잘 왔다. 차이는 mostly iconography 수준이다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| date group header + today chip | primitive 후보 | 가능 | 원본과 현재가 매우 유사 |
| date-range filter pill shell | primitive 후보 | 가능 | condition-list 등 반복 가능성이 높음 |
| calendar range modal shell | pattern 후보 | 가능 | 리스트 계열 공통으로 재사용 가능 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 현재 `WorkoutRecordCard.summary` 추가 라인 | reject | 기준 list card 금지 | 원본 리스트 카드에 없음 |
| 현재 text-only filter content | reject | 기준 affordance 금지 | 원본은 icon + chevron 포함 |
| 현재 in-page header | reject | 기준 top chrome 금지 | 원본 구조와 다름 |

## 시스템 관점 결론

이 페이지는 “전체적으로 달라진 이유”가 거대한 토큰 문제라기보다,

1. 리스트 구조는 많이 보존했는데
2. 카드와 affordance를 조금씩 자기식으로 확장하면서
3. 화면 톤이 원본보다 설명적이고 덜 조밀해진

케이스다.

즉 기록 리스트 계열을 맞출 때는 새 primitive를 많이 만들기보다,

- date header
- filter pill
- calendar modal

은 공통화하고,

- record card는 원본 기준으로 다시 좁히는

방식이 맞다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. filter button 내부에 calendar/chevron affordance 복원
2. `WorkoutRecordCard`에서 리스트 전용 기준과 맞지 않는 summary line 제거 후보 검토
3. metric label icon 복원
4. empty state leading icon 복원
