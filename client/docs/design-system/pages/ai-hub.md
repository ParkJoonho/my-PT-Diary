# P-04 AI 허브 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

공통 반영으로 `TabPageLayout`의 탭·safe-area·본문 하단 계산을 적용했다. 이어 공통
`RowActionCard`에 `aiFeature` variant를 추가하고, leading·trailing icon을 원본 SVG
path로 교체했으며 원본에 없는 `미구현` badge와 pressed opacity를 제거했다.

제공된 AI 허브 캡처는 원본과 `ai-pt` 모두 6개 기능 card가 세로로 나열된 기본 상태를
보여준다. 이 화면은 data loading 분기가 거의 없어 기본 상태 코드와 캡처를 함께 보는
방식으로 비교 가능했다.

현재 `ai-pt`에 대응 route가 없는 아테나·자세·통합 피트니스 카드는 잘못된 대체
화면으로 보내지 않고 같은 외형을 유지한다. 신발 추천은 현재 체형 분석 화면의 shoe
mode가 실제 대응 기능을 제공하므로 `/ai-analysis` 진입을 유지한다.

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
- 공통 진입 카드: [`shared/components/row-action-card.tsx`](../../../src/shared/components/row-action-card.tsx)
- 원본 icon registry: [`shared/components/icons/pt-diary-icons.tsx`](../../../src/shared/components/icons/pt-diary-icons.tsx)
- 탭 shell: [`shared/components/tab-page-layout.tsx`](../../../src/shared/components/tab-page-layout.tsx)
- 하단 탭: [`shared/components/member-tab-bar.tsx`](../../../src/shared/components/member-tab-bar.tsx)

현재 구현은 원본 card list 메타데이터를 유지하고 공통 card와 icon registry로
렌더링한다.

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
└── MemberTabBar                            TabPageLayout에서 렌더링
```

레이아웃 뼈대는 거의 같다. 차이는 각 card 안의 title weight, icon primitive, badge, 탭
shell 책임 위치에서 발생한다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본 card list | 6개 card | 6개 card | 예 | 전체 구조 비교 가능 |
| 기능 사용 가능 표시 | 모든 card 동일 외형 | 동일 | 예 | 반영 완료 |
| 체형 분석 진입 | `/ai-analysis` | `/ai-analysis` | 예 | 구조 동일 |
| 트레이너 아테나 진입 | `/athena-chat` | route 없음 | 예 | 외형 일치, 기능 route 잔여 |
| 식단 분석 진입 | `/meal-analysis` | `/meal-analysis` | 예 | 구조 동일 |
| 자세 분석 진입 | `/posture-analysis` | route 없음 | 예 | 외형 일치, 기능 route 잔여 |
| 신발 추천 진입 | `/shoe-recommendation` | `/ai-analysis` | 예 | 임시 대체 경로 |
| 통합 피트니스 분석 진입 | `/fitness-state` | route 없음 | 예 | 외형 일치, 기능 route 잔여 |

기능 route 차이는 별도 마이그레이션 이슈로 남기고 시각 외형에는 섞지 않는다.

## 실제 시각 규칙 대조

### 화면 루트

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 배경 | `#F4F5F7` | 동일 | 일치 |
| 상단 padding | `16` | `16` | 일치 |
| 좌우 padding | `16` | `16` | 일치 |
| 카드 gap | `10` | `10` | 일치 |
| 하단 padding | `GLOBAL_TAB_BAR_CONTENT_H + inset + 16` | 동일 계산 | 공통 반영 완료 |

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
| subtitle | `13`, Regular, `#8E8E8E` | 동일 | 일치 |
| text gap | `2` | `2` | 일치 |
| chevron | Ionicons `chevron-forward 18` | 동일 path의 semantic SVG `18` | 일치 |
| pressed | 별도 pressed style 없음 | 없음 | 일치 |

card shell과 press feedback을 원본 값으로 맞췄다.

### 아이콘과 상태 badge

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 분석/식단/자세/신발/통합 아이콘 | Ionicons outline 22 | 원본 SVG path `22` | 일치 |
| 아이콘 배경색 | `#FFF0EA`, `#FFF8E1`, `#E8F8EE`, `#E5F0FF`, `#FFF3E0` | 동일 계열 | 일치 |
| title row | title 단독 | 동일 | 일치 |
| `미구현` badge | 없음 | 없음 | 일치 |

미구현 기능 상태는 문서와 테스트로 관리하며 원본 card 디자인에는 노출하지 않는다.

## 공통화 판정

### 이번 차수에서 확정되는 공통 후보

| 후보 | 분류 | 사용 페이지 | 원본 근거 | 결정 |
|---|---|---|---|---|
| row action card family | pattern | P-01 홈 quick action, P-03 PT trainer card, P-04 AI feature card | 세 화면 모두 leading visual + title/subtitle + trailing chevron의 세로 list action 구조를 반복 | `RowActionCard` + variant로 공통화 완료 |

다만 세 화면의 값은 완전히 같지 않다.

| variant | 대표 페이지 | 핵심 값 |
|---|---|---|
| quick-action | 홈, PT trainer | radius `16`, title `16 Medium`, subtitle gap `4~5`, image/icon `34` |
| ai-feature | AI hub | radius `14`, title `16 SemiBold`, subtitle gap `2`, icon circle `34` |

[`RowActionCard`](../../../src/shared/components/row-action-card.tsx)는 `leading` 또는
`imageSource`, title/subtitle, trailing chevron slot을 제공한다. 기본 quick-action과
`aiFeature` variant가 radius·title weight·text gap·chevron size 차이를 유지한다.

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 현재 `미구현` badge | page state | AI 허브에서 제거 | 원본 디자인 규칙이 아니라 현재 제품 상태 표시 |
| Lucide icon stroke 규칙 | icon system | 전역 기준 채택 금지 | 원본은 outline glyph 계열 |

## 반영 결과와 잔여 이슈

### 반영 완료

1. row action card family의 공통 primitive + `aiFeature` variant
2. 원본 Ionicons outline path `22`와 chevron path `18`
3. 원본 subtitle line height와 press feedback
4. 원본에 없는 `미구현` badge 제거

### 잔여 기능 이슈

- `AI 트레이너 아테나`, `AI 자세 분석`, `AI 통합 피트니스 분석`은 현재 대응 route가
  없다. 디자인 정확도를 해치지 않도록 별도 badge나 임의 대체 route를 붙이지 않고,
  각 대응 페이지 마이그레이션 단위에서 route를 연결해야 한다.
- Apps in Toss 동일 viewport 캡처가 없어 실기 검증은 아직 완료하지 않았다.

## 코드 검증

- 기본 6개 카드와 badge 비노출, 식단 route, 미대응 route 비이동 테스트
- 홈·PT 공통 row action 회귀 테스트 포함 관련 테스트 11개 통과
- TypeScript `tsc --noEmit` 및 변경 파일 Biome 검사 통과

## 실기 검증에 필요한 fixture

원본과 동일하게 badge 없는 기본 6개 card list를 같은 viewport에서 다시 촬영한다.
