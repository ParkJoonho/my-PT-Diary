# P-03 PT 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 일부 완료
- 동일 상태 실기 검증: 미진행

공통 반영으로 `TabPageLayout`의 탭·safe-area·본문/FAB 하단 계산, section/row
typography, trainer row와 filter의 semantic chevron을 적용했다. 카드 radius·tag와
calendar sheet 위치 같은 PT 전용 차이는 아직 남아 있다.

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
- 수업일지 카드: [`features/pt-logs/components/pt-lesson-card.tsx`](../../../src/features/pt-logs/components/pt-lesson-card.tsx)
- 날짜 필터 modal: [`features/pt-logs/components/pt-log-calendar-modal.tsx`](../../../src/features/pt-logs/components/pt-log-calendar-modal.tsx)
- 포맷 함수: [`features/pt-logs/lib/pt-log-format.ts`](../../../src/features/pt-logs/lib/pt-log-format.ts)
- 탭 shell: [`shared/components/tab-page-layout.tsx`](../../../src/shared/components/tab-page-layout.tsx)
- 하단 탭: [`shared/components/member-tab-bar.tsx`](../../../src/shared/components/member-tab-bar.tsx)

현재는 원본의 시각 구조를 비교적 충실하게 옮겼지만, chevron/icon 체계와 card radius,
calendar modal 배치처럼 전체 인상에 누적되는 작은 차이가 남아 있다.

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
| 수업일지 있음 | PTLessonCard list | PtLessonCard list | 코드 비교 가능 | card shell과 tag 차이 존재 |
| 날짜 범위 선택 | inline calendar modal | inline calendar modal | 코드 비교 가능 | 위치와 shadow가 다름 |
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
| FAB | `52 × 52`, radius `26`, accent, shadow, bottom `tab + inset + 16` | bottom 계산 동일, shadow 단순화 | shell 계산 반영 완료 |

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
| text gap | `5` | `4` | 미세 차이 |
| chevron | Ionicons `chevron-forward 20` | `ArrowRight 18` | glyph 다름 |
| pressed | `opacity: 0.85`, scale `0.98` | `opacity: 0.84`, scale `0.98` | 미세 차이 |

이 card는 홈의 quick action card와 같은 계열이다. 원본과 현재가 둘 다 `34` 아이콘,
`16/19` padding, `72` 높이, title `16`, subtitle `13`, trailing chevron 구조를
공유한다.

### PT 수업일지 section header와 필터 버튼

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| section title | `17`, Medium | 동일 | 일치 |
| header marginBottom | `12` | `12` | 일치 |
| 필터 shell | radius `20`, border `1`, gap `5`, `12/6` padding | radius `20`, border `1`, gap `5`, `12/7` padding | 거의 동일 |
| 필터 active bg | `accent + 12%` | 동일 | 일치 |
| 필터 text | `13`, Medium | 동일 | 일치 |
| icon size | Ionicons `13` | Lucide `14` | 미세 차이 |

날짜 필터 버튼은 거의 동일하다. 이 영역은 token drift보다 icon primitive 차이가 크다.

### empty card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| surface | 흰색, radius `16`, `iosShadow` | 동일 | 일치 |
| padding | `20/24` | `20/24` | 일치 |
| 정렬 | center | center | 일치 |
| 내부 gap | `8` | `10` | 다름 |
| icon | `clipboard-outline 32` | `ClipboardList 32` | glyph 다름 |
| 본문 | `13`, Regular, lineHeight `20` | 동일 | 코드 일치 |
| CTA | `13` SemiBold accent, 배경 없음 | 동일 | 코드 일치 |

empty card는 전체적으로 가깝다. 현재 차이는 아이콘 glyph와 gap `2` 정도라, 다른
페이지에 비해 복원 비용이 낮다.

### PT 수업일지 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| surface | 흰색, radius `14`, `iosShadow` | radius `16`, `iosShadow` | 다름 |
| padding | `16/14` | `16/14` | 일치 |
| metric row | 3열, divider `1 × 36`, marginHorizontal `12` | 동일 | 일치 |
| metric icon | Ionicons `13` | Lucide `14` | 미세 차이 |
| metric label | `11`, Regular | 동일 | 일치 |
| metric value | `15`, SemiBold | 동일 | 일치 |
| tag row | borderTop `1`, marginTop `10`, paddingTop `10`, gap `5` | 동일 구조, gap `6` | 미세 차이 |
| tag chip | radius `5`, `7/2` padding | radius `6`, `8/3` padding | 다름 |

원본과 아주 비슷하지만, radius `14 → 16`과 tag chip 확대가 누적되면 카드가 더 둥글고
부풀어 보인다.

### calendar modal

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| overlay | `alignItems: center`, 상단 배치 | `alignItems: center`, `justifyContent: center`, `paddingHorizontal: 24` | 다름 |
| sheet 위치 | `marginTop: insets.top + 90` | 중앙 정렬 | 다름 |
| sheet shell | radius `20`, padding `16`, custom shadow | radius `20`, padding `16`, shared `iosShadow` | 거의 동일 |
| month title | `16`, SemiBold | 동일 | 일치 |
| week label | `11`, Medium | 동일 | 일치 |
| day label | `14`, Regular | 동일 | 일치 |
| range background | `accent + 1A` | 동일 | 일치 |
| action buttons | radius `12`, `14` text | 동일 계열, `minHeight: 46` 사용 | 거의 동일 |

calendar modal은 selection logic과 내부 cell 규칙은 사실상 그대로 옮겨졌다. 가장 큰
시각 차이는 sheet를 화면 위쪽에 띄우느냐, 가운데에 띄우느냐이다.

## 공통화 판정

### 이번 차수에서 새로 확인된 공통 pattern

| 후보 | 분류 | 사용 페이지 | 원본 근거 | 결정 |
|---|---|---|---|---|
| icon + title + subtitle + chevron row card | pattern | P-01 홈 quick action, P-03 PT trainer card | 두 화면 모두 `34` 아이콘, `16/19` padding, `72` 높이, title `16`, subtitle `13`, trailing chevron | 공통 후보 확정 |

위 pattern은 현재 홈의 [`QuickActionCard`](../../../src/features/home/components/quick-action-card.tsx)
와 PT의 trainer card가 사실상 같은 구조임을 보여준다. 이름은 `QuickActionCard`에
묶기보다 더 중립적인 공통 row action pattern으로 재정의하는 편이 낫다.

### 아직 공통화하지 않을 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| PT lesson metric card | pattern 후보 | 보류 | P-11 운동 기록 목록, P-16 수업일지 작성 흐름까지 확인 필요 |
| calendar filter button | primitive 후보 | 보류 | 다른 날짜 필터 페이지와 같은지 아직 확인되지 않음 |
| calendar modal top anchoring | layout rule | 보류 | 다른 modal도 같은 위치 규칙을 쓰는지 추가 확인 필요 |

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. 홈 quick action과 PT trainer card를 같은 공통 row action pattern으로 재정의
2. chevron 계열 icon primitive를 원본 glyph에 맞는 semantic icon으로 통일
3. PT lesson card radius와 tag chip spacing을 원본 값으로 복원
4. empty card gap을 원본 `8`로 복원
5. calendar modal을 원본처럼 상단 기준으로 띄울지 다른 modal 점검 후 결정
6. 데이터가 있는 list 상태와 date-range 선택 상태를 같은 fixture로 다시 촬영

## 실기 검증에 필요한 fixture

최소한 다음 세 상태를 동일 데이터로 만들어야 한다.

1. 수업일지 없음, 날짜 필터 `전체`
2. 수업일지 3건, 날짜 필터 `전체`
3. 수업일지 3건 중 1건만 남는 날짜 범위 선택 상태와 calendar modal open 상태

같은 viewport, 같은 스크롤 위치로 다시 촬영하고 header 비교에서는 Apps in Toss
네이티브 상단 영역을 계속 제외한다.
