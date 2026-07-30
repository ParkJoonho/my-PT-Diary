# P-11 운동 기록 목록 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

원본의 목록 header, 날짜 필터, 3열 record card, 빈 상태, 캘린더, 하단 탭과 작성 FAB를
복원했다. 목록에 추가돼 있던 설명 줄과 페이지 내부 임시 header를 제거해 원본의
밀도와 정보 위계로 정렬했다.

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
TabPageLayout(activeKey=null)
└── WorkoutRecordListScreen
    ├── SuspenseSection
    │   ├── FlatList
    │   │   ├── list header
    │   │   │   ├── title
    │   │   │   └── calendar filter button(icon + text + chevron)
    │   │   ├── date headers
    │   │   ├── workout record cards
    │   │   │   └── 3 metric columns with icons
    │   │   ├── empty state
    │   │   └── loading more
    │   └── calendar modal
    └── add FAB
```

Apps in Toss 네이티브 상단 header를 제외한 본문 트리와 전역 하단 shell을 원본 구조에
맞췄다. 서버 운동 기록 Suspense 경계도 실제 query 소비처 바로 위에 둔다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본 리스트 | 있음 | 있음 | 가능 | 동일 구조 |
| 날짜 필터 off | icon + 전체 + chevron | 동일 | 가능 | 일치 |
| 날짜 필터 on | accent tint | 동일 | 가능 | 일치 |
| 빈 상태 | icon + 2줄 텍스트 | 동일 | 가능 | 일치 |
| 더 불러오기 | 있음 | 있음 | 가능 | 일치 |
| 캘린더 모달 | range/dot/today/주말 상태 | 동일 | 가능 | 코드상 일치 |

## 실제 시각 규칙 대조

### 1. 상단 구조

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| page chrome | `ParallaxBackground` + `AppHeader` | Apps in Toss native header, in-page header 없음 | 플랫폼 예외 |
| list padding top | `20` | `20` | 일치 |
| list title | `17` Medium | `17` Medium | 일치 |
| bottom shell | 전역 하단 탭, 선택 없음 | `TabPageLayout(activeKey=null)` | 일치 |
| add action | 우하단 `52` FAB | 우하단 `52` FAB | 일치 |

원본에 없는 `닫기 / 운동 기록 / 작성` header는 제거했다. 원본 `ParallaxBackground`의
사용자 체형 이미지는 현재 account API 계약에 없어 추정 asset으로 대체하지 않았다.

### 2. 필터 row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| filter button shell | radius `20`, border `1`, `12/6` | 동일 | 일치 |
| active state | accent border + accent tint | 동일 | 일치 |
| 내부 구성 | calendar icon + text + chevron | 동일 SVG 구성 | 일치 |
| text size | `13` Medium | 동일 | 일치 |

filter shell, 비활성/활성 색상, icon과 chevron affordance를 원본 값으로 맞췄다.

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
| shell | white, radius `14`, `16/14`, `iosShadow` | 동일 | 일치 |
| metric row | 3열 + divider | 동일 | 일치 |
| metric label | time/run/arm-flex icon `13` + `11` Regular | 동일 vector icon + text | 일치 |
| metric value | `15` SemiBold | 동일 | 일치 |
| extra summary line | 없음 | 없음 | 일치 |
| press feedback | opacity `0.85` | 동일 | 일치 |

수동 기록의 서버 DTO 변환을 유지하면서 카드에 표시하는 시각 정보는 원본 3열 지표로
제한했다.

### 5. empty state

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| leading icon | `barbell-outline`, `32` | 동일 SVG icon | 일치 |
| title/subtitle | 상태별 2줄 텍스트 | 동일 문구 | 일치 |
| top padding | `80` | 동일 | 일치 |

필터 여부에 따른 title/subtitle과 leading icon을 모두 원본에 맞췄다.

### 6. 캘린더 모달

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| overlay | `#00000055` | 유사 | 거의 일치 |
| sheet | white, radius `20`, top safe area + `90`, strong shadow | 동일 | 일치 |
| month nav | icon chevron `20` | 동일 SVG chevron | 일치 |
| week/day grid | 범위 cap/중간, 도트, 오늘, 일·토 색상 | 동일 | 일치 |
| 버튼 행 | secondary / accent apply | 동일 | 일치 |

문자 화살표를 제거하고, 누락됐던 범위 시작/끝 반원과 주말 날짜 색상까지 복원했다.

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
| `WorkoutRecordCard.summary` 추가 라인 | reject | 기준 list card 금지 | 제거 완료 |
| text-only filter content | reject | 기준 affordance 금지 | icon + chevron 복원 |
| in-page header | reject | 기준 top chrome 금지 | 제거 완료 |

## 시스템 관점 결론

date header와 filter pill의 기존 원본 충실도는 유지하고, record card를 원본 정보량으로
좁혔다. calendar modal은 PT 목록과 동일한 원본 패턴이지만 feature 간 결합을 만들지
않도록 이번 단위에서는 각각의 실제 컴포넌트를 유지했다.

## 반영 결과

1. 원본에 없는 페이지 내부 text header 제거
2. 목록 header를 `FlatList.ListHeaderComponent`로 이동하고 top/horizontal spacing 복원
3. 날짜 filter에 calendar/chevron SVG와 `gap: 5` 복원
4. record card의 time/run/arm-flex 아이콘 복원 및 extra summary 제거
5. 빈 상태의 barbell icon과 상태별 원본 문구 복원
6. calendar의 icon nav, safe-area 위치, range cap, 주말 날짜 색상 복원
7. 선택 없는 하단 탭과 탭 위 작성 FAB, scroll bottom inset 복원
8. Orval Suspense query 소비처 가까이에 `SuspenseSection` 추가
9. 빈 상태·filter/FAB·card 정보량을 고정하는 컴포넌트 테스트 추가

## 잔여 차이와 검증

- 원본 `ParallaxBackground`의 사용자 체형 이미지는 현재 account API 계약에 없어
  반영하지 않았다.
- 수동 운동 기록은 원본처럼 작성·수정 form으로 이동하고, 루틴 완료 기록은 현재
  데이터 모델에 맞춰 읽기 전용 상세로 이동한다. 상세 화면 표현은 P-12에서 이어서
  점검한다.
- Apps in Toss 네이티브 상단 header를 포함한 동일 상태 실기 캡처는 아직 수행하지
  않았다.
- `npm test -- --runInBand src/features/workout-records`: 5 suites, 13 tests 통과
- `npm run typecheck`: 통과
- `git diff --check`: 통과
