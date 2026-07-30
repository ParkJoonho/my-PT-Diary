# P-03 PT 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

공통 반영으로 `TabPageLayout`의 탭·safe-area·본문/FAB 하단 계산과 section/row
typography를 적용했다. 이어 P-01과 반복되는 row action card를 공통 pattern으로
승격하고, PT 카드 radius·tag, 원본 icon path, FAB shadow, calendar sheet 위치와
주말 색상을 원본 값으로 복원했다.

제공된 PT 캡처는 원본과 `ai-pt` 모두 수업일지가 없는 기본 상태를 보여주지만, calendar
modal과 데이터가 있는 카드 상태는 확인되지 않았다. empty state와 trainer 진입 card는
캡처와 코드 양쪽으로 비교했고, list/card/calendar 세부는 코드 기준으로 기록했다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/(tabs)/pt-log.tsx`](<../../../../../2026-07-13/my-PT-Diary/app/(tabs)/pt-log.tsx>)
- root 탭 shell: [`components/GlobalTabBar.tsx`](../../../../../2026-07-13/my-PT-Diary/components/GlobalTabBar.tsx)
- 색상·그림자: [`constants/colors.ts`](../../../../../2026-07-13/my-PT-Diary/constants/colors.ts)

원본 PT 화면은 AI 추천 트레이너 card, 날짜 범위 필터, 수업일지 list, empty state, FAB,
calendar modal을 [`pt-log.tsx`](<../../../../../2026-07-13/my-PT-Diary/app/(tabs)/pt-log.tsx>)
한 파일에 직접 가지고 있다.

### `ai-pt`

- 라우트: [`src/pages/pt-log.tsx`](../../../src/pages/pt-log.tsx)
- 화면 조립: [`features/pt-logs/components/pt-log-screen.tsx`](../../../src/features/pt-logs/components/pt-log-screen.tsx)
- 공통 진입 카드: [`shared/components/row-action-card.tsx`](../../../src/shared/components/row-action-card.tsx)
- 수업일지 카드: [`features/pt-logs/components/pt-lesson-card.tsx`](../../../src/features/pt-logs/components/pt-lesson-card.tsx)
- 날짜 필터 modal: [`features/pt-logs/components/pt-log-calendar-modal.tsx`](../../../src/features/pt-logs/components/pt-log-calendar-modal.tsx)
- 포맷 함수: [`features/pt-logs/lib/pt-log-format.ts`](../../../src/features/pt-logs/lib/pt-log-format.ts)
- 탭 shell: [`shared/components/tab-page-layout.tsx`](../../../src/shared/components/tab-page-layout.tsx)
- 하단 탭: [`shared/components/member-tab-bar.tsx`](../../../src/shared/components/member-tab-bar.tsx)

원본의 화면 구조와 시각 실효값을 유지하면서 API 조회·삭제는 현재 Orval suspense
query 흐름을 사용한다.

## 렌더 트리 대조

```text
원본
PTLogScreen
├── AppHeader                               이번 점검 제외
├── FlatList
│   ├── AI 추천 트레이너 title
│   ├── trainer entry card
│   ├── PT 수업일지 section header
│   │   └── calendar filter button
│   ├── PTLessonCard list
│   └── 또는 empty card
├── FAB
├── CalendarModal
└── GlobalMemberTabBar                      app root에서 렌더링
```

```text
ai-pt
PtLogScreen
├── SuspenseSection
│   └── PtLogContent
│       ├── FlatList
│       │   ├── AI 추천 트레이너 title
│       │   ├── trainer entry card
│       │   ├── PT 수업일지 section header
│       │   │   └── calendar filter button
│       │   ├── PtLessonCard list
│       │   └── 또는 empty card
│       ├── FAB
│       └── PtLogCalendarModal
└── MemberTabBar                            TabPageLayout에서 렌더링
```

이 화면은 구조 자체는 거의 유지됐다. 차이는 대부분 shell 책임 위치, icon primitive,
card radius/tag spacing, calendar modal의 배치 방식에서 나온다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본 empty | empty card | empty card | 예 | 시각 비교 가능 |
| 기간 필터 empty | `해당 기간에 수업일지가 없어요` | 동일 문구 | 코드 비교 가능 | modal 적용 상태 캡처 필요 |
| 수업일지 있음 | PTLessonCard list | PtLessonCard list | 코드·테스트 비교 가능 | 반영 완료 |
| 날짜 범위 선택 | inline calendar modal | inline calendar modal | 코드 비교 가능 | 위치·shadow 반영 완료 |
| pull to refresh | local reload | query invalidate | 아니오 | 시각보다는 데이터 흐름 차이 |
| 로딩·오류 | 별도 loading/error 없음 | Suspense error 추가 | 아니오 | 현재에만 새 상태 추가 |

empty 상태는 현재 캡처로도 확인 가능하지만, 수업일지 카드가 하나 이상 있을 때의 밀도와
modal 위치는 동일 fixture로 다시 찍어야 한다.

## 실제 시각 규칙 대조

### 화면 루트

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 배경 | `#F4F5F7` | 동일 | 일치 |
| 좌우 padding | `16` | `16` | 일치 |
| 상단 padding | `20` | `20` | 일치 |
| 하단 padding | `GLOBAL_TAB_BAR_CONTENT_H + inset + 80` | 동일 계산 | 공통 반영 완료 |
| FAB | `52 × 52`, radius `26`, accent, shadow, bottom `tab + inset + 16` | 동일 | 일치 |

이 페이지의 큰 화면 인상은 root shell보다 내부 card 규칙이 더 중요하다. bottom inset은
[`공통 영역 F-03·F-05`](../common.md)를 따른다.

### AI 추천 트레이너 진입 card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| surface | 흰색, radius `16`, `iosShadow` | 동일 | 일치 |
| padding | `16/19` | `16/19` | 일치 |
| minHeight | `72` | `72` | 일치 |
| 내부 gap | `14` | `14` | 일치 |
| icon | `34 × 34`, trainer-icon.png | 동일 asset, 동일 크기 | 일치 |
| title | `16`, Medium, `#00192B` | 동일 | 코드 일치 |
| subtitle | `13`, Regular, `#8E8E8E` | 동일 | 코드 일치 |
| text gap | `5` | 동일 | 일치 |
| chevron | Ionicons `chevron-forward 20` | 동일 path의 semantic SVG `20` | 일치 |
| pressed | `opacity: 0.85`, scale `0.98` | 동일 | 일치 |

이 card는 홈의 quick action card와 같은 계열이다. 원본과 현재가 둘 다 `34` 아이콘,
`16/19` padding, `72` 높이, title `16`, subtitle `13`, trailing chevron 구조를
공유한다.

### PT 수업일지 section header와 필터 버튼

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| section title | `17`, Medium | 동일 | 일치 |
| header marginBottom | `12` | `12` | 일치 |
| 필터 shell | radius `20`, border `1`, gap `5`, `12/6` padding | 동일 | 일치 |
| 필터 active bg | `accent + 12%` | 동일 | 일치 |
| 필터 text | `13`, Medium | 동일 | 일치 |
| icon size | Ionicons `13` | 원본 SVG path `13` | 일치 |

날짜 필터 버튼은 거의 동일하다. 이 영역은 token drift보다 icon primitive 차이가 크다.

### empty card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| surface | 흰색, radius `16`, `iosShadow` | 동일 | 일치 |
| padding | `20/24` | `20/24` | 일치 |
| 정렬 | center | center | 일치 |
| 내부 gap | `8` | 동일 | 일치 |
| icon | `clipboard-outline 32` | 원본 SVG path `32` | 일치 |
| 본문 | `13`, Regular, lineHeight `20` | 동일 | 코드 일치 |
| CTA | `13` SemiBold accent, 배경 없음 | 동일 | 코드 일치 |

empty card의 원본 gap과 icon을 복원했다.

### PT 수업일지 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| surface | 흰색, radius `14`, `iosShadow` | 동일 | 일치 |
| padding | `16/14` | `16/14` | 일치 |
| metric row | 3열, divider `1 × 36`, marginHorizontal `12` | 동일 | 일치 |
| metric icon | Ionicons `13` | 원본 SVG path `13` | 일치 |
| metric label | `11`, Regular | 동일 | 일치 |
| metric value | `15`, SemiBold | 동일 | 일치 |
| tag row | borderTop `1`, marginTop `10`, paddingTop `10`, gap `5` | 동일 | 일치 |
| tag chip | radius `5`, `7/2` padding | 동일 | 일치 |

목록 카드의 원본 radius와 tag 밀도를 복원했다.

### calendar modal

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| overlay | `alignItems: center`, 상단 배치 | 동일 | 일치 |
| sheet 위치 | `marginTop: insets.top + 90` | 동일 | 일치 |
| sheet shell | radius `20`, padding `16`, custom shadow | 동일 | 일치 |
| month title | `16`, SemiBold | 동일 | 일치 |
| week label | `11`, Medium | 동일 | 일치 |
| day label | `14`, Regular | 동일 | 일치 |
| range background | `accent + 1A` | 동일 | 일치 |
| action buttons | radius `12`, `14` text, 세로 padding `12` | 동일 | 일치 |
| day weekend | 일요일 danger, 토요일 info | 동일 | 일치 |
| record dot | `bottom: 2`, `4 × 4` | 동일 | 일치 |

calendar modal의 selection logic을 유지하면서 원본 상단 위치·shadow·cell 색상을
복원했다.

## 공통화 판정

### 이번 차수에서 새로 확인된 공통 pattern

| 후보 | 분류 | 사용 페이지 | 원본 근거 | 결정 |
|---|---|---|---|---|
| icon + title + subtitle + chevron row card | pattern | P-01 홈 quick action, P-03 PT trainer card | 두 화면 모두 `34` 아이콘, `16/19` padding, `72` 높이, title `16`, subtitle `13`, trailing chevron | `RowActionCard`로 공통화 완료 |

공통 shell은 [`RowActionCard`](../../../src/shared/components/row-action-card.tsx)로
분리했다. 홈의 [`QuickActionCard`](../../../src/features/home/components/quick-action-card.tsx)는
asset 종류와 미구현 badge 여부만 감싸며, PT는 원본의 pressed opacity·scale만
페이지 사용처에서 전달한다.

### 아직 공통화하지 않을 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| PT lesson metric card | pattern 후보 | 보류 | P-11 운동 기록 목록, P-16 수업일지 작성 흐름까지 확인 필요 |
| calendar filter button | primitive 후보 | 보류 | 다른 날짜 필터 페이지와 같은지 아직 확인되지 않음 |
| calendar modal top anchoring | layout rule | 보류 | 다른 modal도 같은 위치 규칙을 쓰는지 추가 확인 필요 |

## 반영 결과와 잔여 이슈

### 반영 완료

1. 홈 quick action과 PT trainer card의 `RowActionCard` 공통화
2. chevron·calendar·clipboard·metric·add icon의 원본 SVG path
3. PT lesson card radius `14`와 tag gap/radius/padding
4. empty card gap `8`
5. FAB shadow
6. calendar modal의 safe-area 기반 상단 배치와 custom shadow
7. calendar 주말 날짜 색상과 record dot 위치

### 잔여 이슈

- 데이터가 있는 list, date-range 선택, modal open 상태의 동일 fixture 캡처가 없어
  실기 검증은 아직 완료하지 않았다.

## 코드 검증

- `PtLessonCard`의 3열 값·body part tag·press 전달 테스트 추가
- 공통 `RowActionCard`의 내용·press 전달 테스트 추가
- 홈 화면 회귀 테스트를 포함한 관련 테스트 11개 통과
- TypeScript `tsc --noEmit` 및 변경 파일 Biome 검사 통과

## 실기 검증에 필요한 fixture

최소한 다음 세 상태를 동일 데이터로 만들어야 한다.

1. 수업일지 없음, 날짜 필터 `전체`
2. 수업일지 3건, 날짜 필터 `전체`
3. 수업일지 3건 중 1건만 남는 날짜 범위 선택 상태와 calendar modal open 상태

같은 viewport, 같은 스크롤 위치로 다시 촬영하고 header 비교에서는 Apps in Toss
네이티브 상단 영역을 계속 제외한다.
