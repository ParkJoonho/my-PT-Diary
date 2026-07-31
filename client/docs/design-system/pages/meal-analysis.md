# P-20 식단 분석 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

원본 실제 코드에 맞춰 상세 route shell, 고정 header, 상단 tab, 식사 타입 순서,
사진·결과·가이드 아이콘을 정렬했다. 원본에 없던 상시 `미구현` 행은 제거하고 카메라로
전/후 사진을 촬영한 경우 실제 촬영 시각 차이를 계산해 식사 소요 시간 card와 서버
분석 payload에 반영한다.

이 페이지는 실제 코드 기준으로

1. 상단 탭
2. 식사 타입 선택 row
3. 오늘 영양 summary card
4. 전/후 사진 분석 card
5. 결과/가이드 card

를 feature component로 분리한 구조다. 앨범 사진의 EXIF 시각은 Apps in Toss API가
제공하지 않는 기술 제약으로 남아 있다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/meal-analysis.tsx`](../../../../../2026-07-13/my-PT-Diary/app/meal-analysis.tsx)

### `ai-pt`

- 라우트: [`src/pages/meal-analysis.tsx`](../../../src/pages/meal-analysis.tsx)
- 메인 화면: [`src/features/meal-analysis/components/meal-analysis-screen.tsx`](../../../src/features/meal-analysis/components/meal-analysis-screen.tsx)
- 사진 section: [`src/features/meal-analysis/components/meal-photo-section.tsx`](../../../src/features/meal-analysis/components/meal-photo-section.tsx)
- 결과 section: [`src/features/meal-analysis/components/meal-analysis-result.tsx`](../../../src/features/meal-analysis/components/meal-analysis-result.tsx)
- 오늘 기록/summary: [`src/features/meal-analysis/components/meal-today-sections.tsx`](../../../src/features/meal-analysis/components/meal-today-sections.tsx)
- 가이드 탭: [`src/features/meal-analysis/components/diet-guide-tab.tsx`](../../../src/features/meal-analysis/components/diet-guide-tab.tsx)

## 렌더 트리 대조

```text
원본
MealAnalysisScreen
├── ParallaxBackground
├── header
├── top tab bar
├── analysis tab
│   ├── 오늘 영양 summary
│   ├── 식사 타입 selector
│   ├── 전/후 사진 section
│   ├── analyze CTA
│   ├── 결과 card
│   └── 오늘 기록
└── guide tab
    ├── CTA / loading
    └── guide cards
```

```text
ai-pt
TabPageLayout(activeKey=null)
└── MealAnalysisScreen
    ├── fixed header
    ├── fixed top tab bar
    ├── ScrollView
    │   ├── analysis tab
    │   │   ├── summary-local Suspense boundary
    │   │   ├── MealTypeSelector
    │   │   ├── MealPhotoSection
    │   │   ├── conditional MealDurationCard
    │   │   ├── analyze CTA / MealAnalysisResult
    │   │   └── records-local Suspense boundary
    │   └── guide tab
    │       └── guide-local Suspense boundary / DietGuideTab
    └── MemberTabBar
```

현재는 원본의 큰 화면을 subcomponent로 분해했을 뿐, 본문 조립 방식은 거의 같다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 분석 탭 기본 | 있음 | 있음 | 가능 | 거의 동일 |
| 가이드 탭 기본 | 있음 | 있음 | 가능 | 거의 동일 |
| 식사 전 사진만 선택 | 있음 | 있음 | 가능 | 동일 |
| 식사 전/후 사진 선택 | 있음 | 있음 | 가능 | 동일 |
| 카메라 전/후 촬영 시간 | 있음 | 직접 입력 | 부분 | 플랫폼 API 제약 |
| 앨범 EXIF 촬영 시간 | 있음 | 없음 | 부분 | 플랫폼 API 제약 |
| 분석 결과 표시 | 있음 | 있음 | 가능 | 거의 동일 |
| 오늘 기록/summary | 있음 | 있음 | 가능 | 동일 |

## 실제 시각 규칙 대조

### 1. 상단 탭 / 식사 타입 selector

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| top tab shell | card bg, radius `14`, padding `4` | 동일 | 일치 |
| active tab | primary bg | 동일 | 일치 |
| tab label | `14` SemiBold | 동일 | 일치 |
| tab icon | camera / food-apple filled·outline `16` | 원본 SVG 계열 `16` | 일치 |
| meal type chip | card bg, radius `12`, paddingY `10` | 동일 | 일치 |
| active meal chip | accent fill + white text | 동일 | 일치 |
| meal type 순서 | 아침 → 점심 → 저녁 → 간식 | 동일 | 일치 |

header는 H `16`, V `12`, title `18` Medium, chevron `24`로 복원하고 query
boundary 밖에 두었다.

### 2. summary / history card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| summary card | radius `16`, padding `16`, white card | 동일 | 일치 |
| title | `15` Medium | 동일 | 일치 |
| value | `20` Medium | 동일 | 일치 |
| divider | 세로 divider `1` | 동일 | 일치 |
| history card | radius `16`, padding `16` | 동일 | 일치 |
| history row | bottom border + icon + kcal | 동일 | 일치 |

summary/history 계열은 이미 공통 card system 안에 잘 들어가 있다.

### 3. 사진 분석 section

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| photo card | radius `16`, padding `16` | 동일 | 일치 |
| before/after columns | dual photo layout | 동일 | 일치 |
| empty photo | dashed border, radius `12` | 동일 | 일치 |
| action buttons | filled + outline pair | 동일 | 일치 |
| help text | centered muted `12` | 동일 | 일치 |
| duration card | 값이 있을 때만 H `16`, MB `12`, padding `12`, radius `12` | 동일 | 일치 |
| duration label/value | `12` Medium / `16` Medium | 동일 | 일치 |
| speed hint | 너무 빠름/조금 빠름/적정/충분 | 동일 | 일치 |

Apps in Toss 카메라·앨범 API가 EXIF 촬영 시각을 반환하지 않으므로 원본 duration
card의 아이콘·제목·속도 판정은 유지하고 값만 키보드 없는
`-5 / -1 / 분 / +1 / +5` 인라인 피커로 확장했다. 기본값은 20분이며 1~60분 범위의
`eatingDurationMinutes`를 Orval mutation에 전달한다.

### 4. 분석 / 저장 CTA

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| analyze button | primary, PV `16`, radius `14`, label `16` Medium | 동일 | 일치 |
| analyze icon | food-apple `20` | 원본 SVG path `20` | 일치 |
| save / retry row | `2:1`, PV `14`, radius `14` | 동일 | 일치 |
| loading CTA | spinner + 동일 shell | 동일 | 일치 |

CTA 계열도 큰 drift가 없다.

### 5. 결과 / 가이드 card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| result card shell | radius `16`, padding `16` | 동일 | 일치 |
| calorie hero | `48` accent value + unit | 동일 | 일치 |
| result macro row | 3열 stat block | 동일 | 일치 |
| guide CTA card | radius `20`, centered | 동일 | 일치 |
| guide content card | radius `20`, padding `20` | 동일 | 일치 |
| guide macro row | 4열 stat block | wrap 없는 4열로 복원 | 일치 |

food-variant, walk/run/bike, speedometer, save, food-apple, robot,
star-circle, pie-chart 등 원본 icon affordance를 공통 SVG registry로 교체했다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| segmented top tab card | pattern 후보 | 가능 | 분석/가이드 전환처럼 반복 사용 가능 |
| meal type selector chip row | pattern 후보 | 가능 | icon + label 선택 패턴이 명확함 |
| summary metric card | pattern 후보 | 가능 | 기록 요약 카드로 재사용 가능 |
| dual photo compare card | pattern 후보 | 가능 | 전/후 사진 분석 UI로 반복 가능 |
| result / guide card shell | primitive 후보 | 가능 | AI 결과 페이지 전반에 공통 적용 가능 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 식사 시간/속도 보조 상태 | page-only | 공통화 금지 | 사진 source와 식사 도메인 계산에 종속 |
| 식단 영양 해석 문구 | page-only | 도메인 전용 | 식단 분석만의 의미 구조임 |

## 반영 결과

- [`meal-analysis.tsx`](../../../src/pages/meal-analysis.tsx)에 상세 route용
  `TabPageLayout(activeKey=null)`과 탭 하단 inset을 연결했다.
- [`meal-analysis-screen.tsx`](../../../src/features/meal-analysis/components/meal-analysis-screen.tsx)는
  원본 고정 header/tab과 식사 타입 순서를 복원하고 summary, records, guide Suspense
  boundary를 각 query 소비처 가까이 분리했다.
- [`pick-image.ts`](../../../src/features/body-analysis/lib/pick-image.ts)는 SDK에
  없는 촬영 시각을 합성하지 않고,
  [`meal-photo-section.tsx`](../../../src/features/meal-analysis/components/meal-photo-section.tsx)는
  원본 duration card 안에서 식사 시간을 인라인 피커로 선택하도록 한다.
- [`meal-analysis-result.tsx`](../../../src/features/meal-analysis/components/meal-analysis-result.tsx),
  [`diet-guide-tab.tsx`](../../../src/features/meal-analysis/components/diet-guide-tab.tsx),
  [`meal-today-sections.tsx`](../../../src/features/meal-analysis/components/meal-today-sections.tsx)의
  원본 icon과 행·divider 상태를 정렬했다.
- AI 결과/가이드의 내용 구조는 식단 도메인 feature에 유지하고, 탭 shell과 원본 icon
  registry만 공통 체계를 사용했다.
- [`meal-analysis-screen.test.tsx`](../../../src/features/meal-analysis/components/__tests__/meal-analysis-screen.test.tsx)를
  추가하고 구성 테스트를 확장했다. meal-analysis 4개 suite, 13개 test,
  `tsc --noEmit`, `git diff --check`를 통과했다.

## 남은 범위

1. Apps in Toss의 `fetchAlbumPhotos`/`openCamera` 응답은 EXIF를 제공하지 않아
   원본의 자동 계산 대신 직접 입력으로 동작한다.
2. 실제 기기 캡처 기반 동일 상태 검증은 아직 진행하지 않았다.
