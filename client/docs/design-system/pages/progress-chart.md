# P-21 운동 리포트 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 화면은 구조는 원본을 꽤 잘 따라왔지만, 상단 summary 카드의 의미 표현이 현재에서
조금 더 추상화됐다. 즉 전반적으로 다른 화면이라기보다

1. 리포트 탭/차트/인사이트 패턴은 거의 유지됐고
2. summary card의 아이콘 의미층이 약해진

케이스다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/progress-chart.tsx`](../../../../../2026-07-13/my-PT-Diary/app/progress-chart.tsx)

### `ai-pt`

- 라우트: [`src/pages/progress-chart.tsx`](../../../src/pages/progress-chart.tsx)
- 메인 화면: [`src/features/workout-reports/components/workout-report-screen.tsx`](../../../src/features/workout-reports/components/workout-report-screen.tsx)
- 차트 섹션: [`src/features/workout-reports/components/workout-report-chart-section.tsx`](../../../src/features/workout-reports/components/workout-report-chart-section.tsx)
- 포맷/탭 정의: [`src/features/workout-reports/components/report-format.ts`](../../../src/features/workout-reports/components/report-format.ts)

## 렌더 트리 대조

```text
원본
ProgressChartScreen
├── ParallaxBackground
├── header
├── summary cards
├── horizontal tab row
├── chart card
└── insight card
```

```text
ai-pt
WorkoutReportScreen
├── text header
├── summary cards
├── WorkoutReportChartSection
│   ├── horizontal tab row
│   ├── chart card
│   └── insight card
└── Suspense boundary
```

현재는 데이터 취득과 차트 렌더링을 명확히 분리했지만, 페이지 조립 구조 자체는 원본과
거의 같다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 데이터 로딩 | 있음 | 있음 | 가능 | 거의 동일 |
| volume 탭 | 있음 | 있음 | 가능 | 동일 |
| weight 탭 | 있음 | 있음 | 가능 | 동일 |
| bodyComp 탭 | 있음 | 있음 | 가능 | 동일 |
| condition 탭 | 있음 | 있음 | 가능 | 동일 |
| frequency 탭 | 있음 | 있음 | 가능 | 동일 |

## 실제 시각 규칙 대조

### 1. summary card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| shell | radius `14`, padding `14`, bordered | radius `16`, padding `18`, shadow | 거의 일치 |
| count/value | `20` 강조 값 | `20` Medium | 거의 일치 |
| label | `11` muted | 동일 | 일치 |
| top accent | 실제 아이콘 사용 | color dot + accent square | 다름 |

여기서 가장 눈에 띄는 차이는 원본이 summary card에 의미 있는 아이콘을 쓰는데, 현재는
더 추상적인 dot/square 조합으로 바뀌었다는 점이다.

### 2. tab row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| horizontal scroll tabs | 있음 | 있음 | 일치 |
| tab shell | radius `20`, border `1`, padding `14/8` | 동일 | 일치 |
| active tab | primary bg + white text | 동일 | 일치 |
| inactive tab | card bg + secondary text | 동일 | 일치 |

탭 선택계는 거의 그대로다.

### 3. chart card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| chart card shell | radius `16`, padding `16`, bordered | radius `16`, padding `16`, shadow | 거의 일치 |
| line/bar chart 구조 | 동일 타입별 분기 | 동일 타입별 분기 | 일치 |
| legend / stat row | 있음 | 있음 | 일치 |
| empty chart | icon + text | 동일 계열 | 일치 |

차트 표현은 현재가 원본을 매우 충실하게 옮겼다.

### 4. insight card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| shell | `#FFFDF5`, border `#F0E6C8`, radius `12` | 동일 | 일치 |
| icon/label | lightbulb icon 중심 | `TIP` badge + text | 약간 다름 |
| text | `13`, lineHeight `20` | 동일 | 일치 |

인사이트 card의 톤은 유지됐지만, 현재는 원본의 아이콘 표현 대신 `TIP` badge를 더
강하게 드러낸다.

### 5. header / page chrome

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| root chrome | Parallax + back icon header | text close header | 다름 |
| page title | `18` 강조 | `18` Bold | 거의 일치 |

헤더는 이번 범위 밖이지만, 페이지 인상 차이에 일부 영향을 준다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| horizontal pill tab row | pattern 후보 | 가능 | 리포트/분석 탭 전환에 재사용 가능 |
| chart card shell | pattern 후보 | 가능 | 다양한 리포트 카드에 반복 가능 |
| insight card | pattern 후보 | 가능 | 데이터 해석/권장 문구 패턴으로 재사용 가능 |
| empty chart state | primitive 후보 | 가능 | 차트형 화면 공통 empty state로 사용 가능 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 현재 summary dot/square accent | reject | 원본 기준 아님 | 원본은 의미 아이콘을 사용함 |
| 탭별 insight 문구 생성 로직 | page-only | 시각 시스템 아님 | 데이터 해석 로직에 가까움 |

## 시스템 관점 결론

이 화면은 차트/탭/인사이트 패턴은 원본과 잘 붙어 있다. 그래서 전반적인 시스템 문제를
보여주는 화면이라기보다, “일부 핵심 semantic affordance가 빠지면 전체 인상이
밋밋해진다”는 걸 보여주는 화면이다.

특히 summary card는 수치만 맞추는 걸로 끝나지 않고, 원본처럼

- 운동 횟수
- 총 볼륨
- 컨디션 체크

를 구분하는 semantic iconography를 같이 가져가야 한다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. chart card / tab row / insight card는 현재 패턴을 공통 후보로 유지
2. summary card는 현재 추상 accent dot 대신 원본의 의미 아이콘 기반으로 복원 검토
3. 리포트 계열 공통화 시 수치 카드도 “semantic icon + value + label” 구조를 기준으로 정리
