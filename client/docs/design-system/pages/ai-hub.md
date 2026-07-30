# P-04 AI 허브 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

제공된 AI 허브 캡처는 원본과 `ai-pt` 모두 6개 기능 card가 세로로 나열된 기본 상태를
보여준다. 이 화면은 data loading 분기가 거의 없어 기본 상태 코드와 캡처를 함께 보는
방식으로 비교 가능했다.

다만 현재 `ai-pt`는 일부 기능에 `미구현` badge를 추가했고, `AI 신발 추천`을
`/ai-analysis`로 연결하는 임시 경로를 넣어 원본의 기능 상태와 완전히 같지는 않다.
이 상태 차이는 시각 차이와 함께 기록한다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/(tabs)/ai-hub.tsx`](<../../../../../2026-07-13/my-PT-Diary/app/(tabs)/ai-hub.tsx>)
- root 탭 shell: [`components/GlobalTabBar.tsx`](../../../../../2026-07-13/my-PT-Diary/components/GlobalTabBar.tsx)
- 색상·그림자: [`constants/colors.ts`](../../../../../2026-07-13/my-PT-Diary/constants/colors.ts)

원본 AI 허브는 기능 카드 6개와 각 route 메타데이터를
[`ai-hub.tsx`](<../../../../../2026-07-13/my-PT-Diary/app/(tabs)/ai-hub.tsx>)
한 파일에 직접 가지고 있다.

### `ai-pt`

- 라우트: [`src/pages/ai-hub.tsx`](../../../src/pages/ai-hub.tsx)
- 화면 조립: [`features/ai-hub/components/ai-hub-screen.tsx`](../../../src/features/ai-hub/components/ai-hub-screen.tsx)
- 미구현 badge: [`shared/components/unimplemented-badge.tsx`](../../../src/shared/components/unimplemented-badge.tsx)
- 하단 탭: [`features/home/components/home-tab-bar.tsx`](../../../src/features/home/components/home-tab-bar.tsx)

현재 구현도 card list를 한 컴포넌트 안에 직접 가지고 있지만, icon 체계와 feature 상태
표시가 원본과 달라졌다.

## 렌더 트리 대조

```text
원본
AIHubScreen
├── AppHeader                               이번 점검 제외
├── ScrollView
│   └── AI feature card × 6
└── GlobalMemberTabBar                      app root에서 렌더링
```

```text
ai-pt
AiHubScreen
├── ScrollView
│   └── AI feature card × 6
└── HomeTabBar                              화면 내부에서 렌더링
```

레이아웃 뼈대는 거의 같다. 차이는 각 card 안의 title weight, icon primitive, badge, 탭
shell 책임 위치에서 발생한다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본 card list | 6개 card | 6개 card | 예 | 전체 구조 비교 가능 |
| 기능 사용 가능 표시 | 모든 card 동일 외형 | 일부 card에 `미구현` badge | 예 | 현재에만 추가 상태 존재 |
| 체형 분석 진입 | `/ai-analysis` | `/ai-analysis` | 예 | 구조 동일 |
| 트레이너 아테나 진입 | `/athena-chat` | route 없음 | 예 | badge와 disabled-like 상태 추가 |
| 식단 분석 진입 | `/meal-analysis` | `/meal-analysis` | 예 | 구조 동일 |
| 자세 분석 진입 | `/posture-analysis` | route 없음 | 예 | badge와 disabled-like 상태 추가 |
| 신발 추천 진입 | `/shoe-recommendation` | `/ai-analysis` | 예 | 임시 대체 경로 |
| 통합 피트니스 분석 진입 | `/fitness-state` | route 없음 | 예 | badge와 disabled-like 상태 추가 |

기능 route 차이는 디자인 시스템의 값 그 자체는 아니지만, card 우측 badge 유무와 눌림
행동을 바꾸므로 시각 비교에 영향을 준다.

## 실제 시각 규칙 대조

### 화면 루트

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 배경 | `#F4F5F7` | 동일 | 일치 |
| 상단 padding | `16` | `16` | 일치 |
| 좌우 padding | `16` | `16` | 일치 |
| 카드 gap | `10` | `10` | 일치 |
| 하단 padding | `GLOBAL_TAB_BAR_CONTENT_H + inset + 16` | `110 + inset` | 공통 shell 차이 |

이 화면은 탭 shell을 제외하면 리스트 여백 규칙이 원본과 사실상 같다.

### 기능 card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| surface | 흰색, radius `14`, `iosShadow` | 동일 | 일치 |
| padding | `16/19` | `16/19` | 일치 |
| minHeight | `72` | `72` | 일치 |
| 내부 gap | `14` | `14` | 일치 |
| leading circle | `34 × 34`, radius `999` | 동일 | 일치 |
| title | `16`, SemiBold, `#00192B` | `16`, SemiBold, `Colors.text` | foundation 기준 거의 동일 |
| subtitle | `13`, Regular, `#8E8E8E` | `13`, Regular, muted, `lineHeight: 18` | 미세 차이 |
| text gap | `2` | `2` | 일치 |
| chevron | Ionicons `chevron-forward 18` | `ChevronRight 18` | glyph 다름 |
| pressed | 별도 pressed style 없음 | `opacity: 0.78` | 현재에만 추가 |

card shell 자체는 매우 잘 맞다. 이 화면의 어긋남은 spacing보다 icon system과 badge
추가 여부에서 나온다.

### 아이콘과 상태 badge

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 분석/식단/자세/신발/통합 아이콘 | Ionicons outline 22 | Lucide 20, `strokeWidth: 2.1` | 다름 |
| 아이콘 배경색 | `#FFF0EA`, `#FFF8E1`, `#E8F8EE`, `#E5F0FF`, `#FFF3E0` | 동일 계열 | 일치 |
| title row | title 단독 | title + optional badge, gap `8` | 다름 |
| `미구현` badge | 없음 | accentLight pill, compact text `9` | 현재에만 추가 |

현재 badge는 기능 미이식 상태를 알려주기 위한 제품 판단이다. 원본 faithful migration
관점에서는 design primitive로 일반화할 근거가 아니라, 임시 상태 배지로 취급해야 한다.

## 공통화 판정

### 이번 차수에서 확정되는 공통 후보

| 후보 | 분류 | 사용 페이지 | 원본 근거 | 결정 |
|---|---|---|---|---|
| row action card family | pattern | P-01 홈 quick action, P-03 PT trainer card, P-04 AI feature card | 세 화면 모두 leading visual + title/subtitle + trailing chevron의 세로 list action 구조를 반복 | 공통 family 후보 확정 |

다만 세 화면의 값은 완전히 같지 않다.

| variant | 대표 페이지 | 핵심 값 |
|---|---|---|
| quick-action | 홈, PT trainer | radius `16`, title `16 Medium`, subtitle gap `4~5`, image/icon `34` |
| ai-feature | AI hub | radius `14`, title `16 SemiBold`, subtitle gap `2`, icon circle `34` |

따라서 하나의 하드코딩 card 컴포넌트보다, `leading / title / subtitle / trailing / badge`
slot을 가진 primitive와 variant token 집합으로 설계하는 편이 원본에 가깝다.

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 현재 `미구현` badge | page state | 전역화 보류 | 원본 디자인 규칙이 아니라 현재 제품 상태 표시 |
| Lucide icon stroke 규칙 | icon system | 전역 기준 채택 금지 | 원본은 outline glyph 계열 |

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. row action card family를 공통 primitive + variant token 형태로 재정의
2. AI 허브는 그 family의 `ai-feature` variant로 정리
3. chevron과 leading icon을 원본과 더 가까운 semantic icon 체계로 정리
4. `미구현` badge는 디자인 시스템 핵심이 아니라 임시 상태 표시로 격리
5. 기능 route가 없는 card의 visual disabled state 필요 여부를 별도 제품 판단으로 분리

## 실기 검증에 필요한 fixture

최소한 다음 두 상태를 다시 촬영해야 한다.

1. 원본과 동일하게 badge 없는 기본 card list
2. 현재처럼 일부 card에 `미구현` badge가 있는 상태

두 캡처를 분리해야 “디자인 차이”와 “기능 미구현 상태 표시 차이”를 섞지 않고 볼 수 있다.
