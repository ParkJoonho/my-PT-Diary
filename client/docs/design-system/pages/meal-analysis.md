# P-20 식단 분석 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 페이지도 전체 인상은 원본과 많이 다르지 않다. 실제 코드 기준으로는

1. 상단 탭
2. 식사 타입 선택 row
3. 오늘 영양 summary card
4. 전/후 사진 분석 card
5. 결과/가이드 card

가 대부분 그대로 유지돼 있다. 큰 차이는 사진 촬영 시간 기반 보조 기능과 일부
세부 상태가 아직 미완성이라는 점이다.

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
MealAnalysisScreen
├── header
├── top tab bar
├── analysis tab
│   ├── DailyMealSummary
│   ├── MealTypeSelector
│   ├── MealPhotoSection
│   ├── analyze CTA
│   ├── MealAnalysisResult
│   └── TodayMealRecords
└── guide tab
    └── DietGuideTab
```

현재는 원본의 큰 화면을 subcomponent로 분해했을 뿐, 본문 조립 방식은 거의 같다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 분석 탭 기본 | 있음 | 있음 | 가능 | 거의 동일 |
| 가이드 탭 기본 | 있음 | 있음 | 가능 | 거의 동일 |
| 식사 전 사진만 선택 | 있음 | 있음 | 가능 | 동일 |
| 식사 전/후 사진 선택 | 있음 | 있음 | 가능 | 현재 일부 부가기능 미구현 |
| 분석 결과 표시 | 있음 | 있음 | 가능 | 거의 동일 |
| 오늘 기록/summary | 있음 | 있음 | 가능 | 동일 |

## 실제 시각 규칙 대조

### 1. 상단 탭 / 식사 타입 selector

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| top tab shell | card bg, radius `14`, padding `4` | 동일 | 일치 |
| active tab | primary bg | 동일 | 일치 |
| tab label | `14` SemiBold | 동일 | 일치 |
| meal type chip | card bg, radius `12`, paddingY `10` | 동일 | 일치 |
| active meal chip | accent fill + white text | 동일 | 일치 |

이 상단 선택 계열은 현재 구현이 원본과 거의 1:1이다.

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
| duration/speed 보조상태 | 실제 계산/표시 존재 | `UnimplementedBadge`로 보류 | 다름 |

이 영역도 기본 primitive는 맞다. 현재 눈에 띄는 차이는 시각값보다 “시간 기반 분석
부가기능”이 아직 완전히 복원되지 않았다는 점이다.

### 4. 분석 / 저장 CTA

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| analyze button | primary filled, radius `14`, `16`급 label | 거의 동일 | 거의 일치 |
| save / retry row | filled + outline CTA pair | 동일 계열 | 일치 |
| loading CTA | spinner + same shell | 동일 계열 | 일치 |

CTA 계열도 큰 drift가 없다.

### 5. 결과 / 가이드 card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| result card shell | radius `16`, padding `16` | 동일 | 일치 |
| calorie hero | `48` accent value + unit | 동일 | 일치 |
| macro row | 4열 stat block | 동일 | 일치 |
| guide CTA card | radius `20`, centered | 동일 | 일치 |
| guide content card | radius `20`, padding `20` | 동일 | 일치 |

결과와 가이드도 card system이 잘 유지돼 있다.

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
| 식사 시간/속도 보조 상태 | 보류 | 현재 공통화 금지 | 원본은 구현, 현재는 미완성 |
| 식단 영양 해석 문구 | page-only | 도메인 전용 | 식단 분석만의 의미 구조임 |

## 시스템 관점 결론

이 화면은 전반적인 디자인 시스템 drift의 핵심 원인 화면은 아니다.

실제 차이는 대부분

- component 분해
- 부가 기능 미구현
- 일부 상태 표현 보류

에서 오고, 본문 card / selector / CTA primitive는 원본과 매우 가깝다.

즉 여기서는 새 디자인 시스템을 만드는 것보다, 이미 맞아 있는

- top tab shell
- meal type selector
- summary/history card
- dual photo card
- result/guide card

를 공통 패턴으로 추출하는 게 우선이다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. `meal-analysis`의 top tab / selector / summary / result shell을 AI 결과 계열 공통 후보로 정리
2. 전/후 사진 시간 계산과 식사 속도 보조 상태는 디자인 문제가 아니라 기능 복원 항목으로 분리
3. 현재 `UnimplementedBadge`가 붙은 보조 상태는 전역 primitive 기준으로 승격하지 말고 미구현 예외로 유지
