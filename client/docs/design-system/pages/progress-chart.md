# P-21 운동 리포트 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

원본의 고정 헤더, 로딩 상태, 의미 기반 요약 카드, 가로 기간 탭, 차트 카드와 인사이트
카드를 실제 코드값으로 대조해 반영했다. 서버의 운동 리포트 집계와 Orval 기반 Suspense
조회는 유지하고, Suspense 경계만 데이터 소비처 가까이 내려 로딩 중에도 페이지 헤더가
유지되게 했다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/progress-chart.tsx`](../../../../../2026-07-13/my-PT-Diary/app/progress-chart.tsx)

### `ai-pt`

- 라우트: [`src/pages/progress-chart.tsx`](../../../src/pages/progress-chart.tsx)
- 메인 화면: [`src/features/workout-reports/components/workout-report-screen.tsx`](../../../src/features/workout-reports/components/workout-report-screen.tsx)
- 차트 섹션: [`src/features/workout-reports/components/workout-report-chart-section.tsx`](../../../src/features/workout-reports/components/workout-report-chart-section.tsx)
- 포맷/탭 정의: [`src/features/workout-reports/components/report-format.ts`](../../../src/features/workout-reports/components/report-format.ts)
- Suspense 조회 wrapper: [`src/features/workout-reports/api/workout-report-summary.ts`](../../../src/features/workout-reports/api/workout-report-summary.ts)
- 공통 아이콘: [`src/shared/components/icons/pt-diary-icons.tsx`](../../../src/shared/components/icons/pt-diary-icons.tsx)
- 화면 회귀 테스트: [`src/features/workout-reports/components/__tests__/workout-report-screen.test.tsx`](../../../src/features/workout-reports/components/__tests__/workout-report-screen.test.tsx)

## 렌더 트리 대조

```text
원본
ProgressChartScreen
├── ParallaxBackground
├── 고정 header
├── loading
└── ScrollView
    ├── semantic summary cards
    ├── horizontal tab row
    ├── chart card
    └── insight card
```

```text
ai-pt
TabPageLayout(activeKey=null)
├── 고정 header
└── 가까운 AsyncErrorBoundary + Suspense
    ├── loading
    └── ScrollView
        ├── semantic summary cards
        └── WorkoutReportChartSection
            ├── horizontal tab row
            ├── chart card
            └── insight card
```

원본의 전역 회원 탭에 대응하도록 상세 라우트에도 `TabPageLayout`을 적용하고 모든 탭을
비활성 상태로 표시한다. 하단 inset은 공통 shell이 계산하며 원본의 탭 위 `20` 간격을
유지한다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 반영 결과 |
|---|---|---|---|---|
| 데이터 로딩 | 큰 accent spinner + `데이터 로딩 중...` | 동일 | 코드 비교 완료 | 헤더 밖의 가까운 Suspense fallback으로 복원 |
| volume 탭 | 선·면 차트, 통계, 조건부 인사이트 | 동일 | 가능 | 유지 |
| weight 탭 | 선·면 차트, 통계, 조건부 인사이트 | 동일 | 가능 | 유지 |
| bodyComp 탭 | 이중 선 차트와 legend | 동일 | 가능 | 유지 |
| condition 탭 | 보라색 선·면 차트와 통계 | 동일 | 가능 | 유지 |
| frequency 탭 | 막대 차트와 통계 | 동일 | 가능 | 유지 |
| 차트 데이터 없음 | analytics outline `28` + `13` 문구, gap `8` | 동일 | 코드 비교 완료 | 누락 아이콘 복원 |
| API 오류 | 원본 별도 오류 UI 없음 | 오류 경계 문구 | 직접 비교 불가 | 네트워크 앱의 복구 가능한 예외로 유지 |

같은 데이터로 실행한 원본·`ai-pt` 캡처 비교는 아직 수행하지 않았다. 따라서 상태 정렬과
실기 검증은 완료로 올리지 않는다.

## 실제 시각 규칙 대조

### 1. header와 로딩

| 영역 | 원본 실제 값 | 반영한 `ai-pt` 값 | 판정 |
|---|---|---|---|
| header | 좌우 `16`, 상하 `12`, back `40 x 40` | 동일 | 일치 |
| back icon | chevron back `24`, text color | 공통 semantic chevron `24` | 일치 |
| title | `18`, weight `700` | 동일 | 일치 |
| loading | flex center, gap `12`, large accent spinner | 동일 | 일치 |
| loading text | `14`, secondary | 동일 | 일치 |

기존에는 전체 화면이 Suspense fallback으로 교체돼 헤더도 사라졌고 `닫기` 텍스트를
사용했다. 헤더를 경계 밖으로 옮기고 원본 chevron affordance를 복원했다.

### 2. summary card

| 영역 | 원본 실제 값 | 반영한 `ai-pt` 값 | 판정 |
|---|---|---|---|
| row | 좌우 `20`, gap `10`, 하단 `16` | 동일 | 일치 |
| shell | radius `14`, padding `14`, border `1` | 동일 | 일치 |
| surface | card + cardBorder, 그림자 없음 | 동일 | 일치 |
| value | `20`, weight `800` | 동일 | 일치 |
| label | `11`, secondary | 동일 | 일치 |
| semantic icon | fitness / weight-lifter / calendar, `20` | 동일 의미의 공통 SVG | 일치 |

기존의 `44` accent square와 내부 dot, radius `16`, shadow, 강제 최소 높이는 제거했다.
MaterialCommunityIcons의 `weight-lifter` 의미는 공통 SVG registry의 `weightLifter`로
추가했다.

### 3. tab row

| 영역 | 원본 실제 값 | 반영한 `ai-pt` 값 | 판정 |
|---|---|---|---|
| scroll | 좌우 `20`, 하단 `16` | 동일 | 일치 |
| tab shell | gap `6`, 좌우 `14`, 상하 `8`, radius `20`, border `1` | 동일 | 일치 |
| tab icon | `16` | `16` | 일치 |
| tab text | `13`, weight `600` | 동일 | 일치 |
| active | primary surface + white content | 동일 | 일치 |

### 4. chart card와 차트

| 영역 | 원본 실제 값 | 반영한 `ai-pt` 값 | 판정 |
|---|---|---|---|
| card | 좌우 `20`, radius `16`, padding `16`, border `1`, 하단 `16` | 동일 | 일치 |
| shadow | 없음 | 제거 | 일치 |
| chart width | `min(screenWidth - 40, 500)` | 동일 | 일치 |
| chart height | `220` | 동일 | 일치 |
| chart label | `14`, weight `700`, 하단 `8` | 동일 | 일치 |
| legend | dot `10`, gap `6`, text `11` | 동일 | 일치 |
| stat row | 상단 `12`, paddingTop `12`, divider | 동일 | 일치 |
| empty | analytics outline `28`, gap `8`, text `13` | 동일 | 일치 |

선·면·이중 선·막대 차트의 축, 날짜 label, dot, gradient, 통계 계산 구조는 이미 원본과
같아 유지했다.

### 5. insight card

| 영역 | 원본 실제 값 | 반영한 `ai-pt` 값 | 판정 |
|---|---|---|---|
| shell | 좌우 `20`, 하단 `16`, radius `12`, padding `14` | 동일 | 일치 |
| surface | `#FFFDF5`, border `#F0E6C8` | 동일 | 일치 |
| icon | lightbulb-outline `18`, `#D4AF37` | 동일 의미의 공통 SVG | 일치 |
| text | `13`, lineHeight `20` | 동일 | 일치 |

현재 실제 코드는 점검 전 문서에 적혔던 `TIP` badge가 아니라 이미 lightbulb SVG를 쓰고
있었다. 실제 코드 우선 원칙에 따라 해당 설명을 바로잡았다.

## 공통화 판정

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 회원 탭이 보이는 상세 화면 shell | 기존 pattern 사용 | 적용 | `TabPageLayout activeKey=null`로 반복 규칙 사용 |
| semantic icon registry | 기존 primitive 확장 | 적용 | 원본 weight-lifter를 화면 전용 벡터 중복 없이 제공 |
| horizontal pill tab row | pattern 후보 | 보류 | 구조는 반복되지만 탭 데이터·scroll 동작까지 같은 소비처가 아직 적음 |
| chart card shell | pattern 후보 | 보류 | 현재는 리포트 전용 SVG 계산과 강하게 결합됨 |
| insight card | pattern 후보 | 보류 | 유사 카드가 더 생길 때 primitive 승격 가능 |
| 요약 카드 | page-only | 유지 | 리포트 집계 의미와 3열 폭에 맞춘 화면 전용 구조 |

## 반영과 검증

### 코드 반영

1. 상세 화면에 비활성 회원 탭 shell과 원본 하단 간격을 적용했다.
2. 헤더를 데이터 경계 밖에 고정하고 원본 chevron, 크기, 여백을 복원했다.
3. Suspense fallback을 조회 소비처 가까이 내리고 원본 spinner·문구를 적용했다.
4. summary 카드의 추상 accent를 semantic icon으로 교체하고 border·radius·padding을
   원본 값으로 복원했다.
5. 탭 아이콘 `16`, 좌우 scroll padding, 카드 margin과 border, 차트 빈 상태 icon을
   복원했다.
6. 실제 원본의 system weight를 유지해야 하는 텍스트는 `fontWeight` 값으로 맞췄다.

### 자동 검증

- 운동 리포트 관련 Jest: `3` suites, `13` tests 통과
- 전체 client Jest: `57` suites, `160` tests 통과
- TypeScript `tsc --noEmit` 통과
- 변경한 TypeScript/TSX `5`개 파일 Biome check 통과
- `git diff --check` 통과
- 화면 테스트에서 semantic summary icon, 뒤로가기, 숫자 포맷, 로딩 중 고정 헤더를 검증

### 남은 실기 검증

- Apps in Toss 실행 환경에서 동일한 리포트 데이터를 준비한다.
- 다섯 탭의 데이터 있음/없음 상태를 원본과 같은 화면 폭으로 각각 캡처한다.
- 실제 폰트 rasterization, SVG plot 폭, 하단 회원 탭과 마지막 insight 간격을 확인한다.
