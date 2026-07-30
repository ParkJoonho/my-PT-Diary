# P-02 기록 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

공통 반영으로 `TabPageLayout`의 탭·safe-area·본문/FAB 하단 계산과 공통 section title
typography를 적용했다. 이어 원본에 없는 `기록 / 운동 기록` intro를 제거하고, 오늘
운동·컨디션 snapshot, empty card, 단일 3분할 리포트 card, icon report tab을 원본
구조와 실효값으로 복원했다.

제공된 캡처는 `ai-pt`가 오늘 운동·컨디션 empty, 리포트 `0` 상태이고 원본은 리포트
데이터가 있는 상태라 전체 화면 pixel 비교에는 사용할 수 없다. empty card, 섹션 제목,
리포트 구조처럼 코드와 캡처에서 동시에 확인되는 영역만 판정했다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/(tabs)/exercise.tsx`](<../../../../../2026-07-13/my-PT-Diary/app/(tabs)/exercise.tsx>)
- 리포트 차트: [`components/ProgressChartSection.tsx`](../../../../../2026-07-13/my-PT-Diary/components/ProgressChartSection.tsx)
- root 탭 shell: [`components/GlobalTabBar.tsx`](../../../../../2026-07-13/my-PT-Diary/components/GlobalTabBar.tsx)
- 색상·그림자: [`constants/colors.ts`](../../../../../2026-07-13/my-PT-Diary/constants/colors.ts)

원본 기록 화면은 오늘 운동 카드, 오늘 컨디션 카드, 운동 리포트 메트릭, 차트 섹션을
대부분 [`exercise.tsx`](<../../../../../2026-07-13/my-PT-Diary/app/(tabs)/exercise.tsx>)
한 파일에서 직접 렌더링한다. 차트만 별도 컴포넌트로 분리돼 있다.

### `ai-pt`

- 라우트: [`src/pages/exercise.tsx`](../../../src/pages/exercise.tsx)
- 화면 조립: [`features/exercise-dashboard/components/exercise-screen.tsx`](../../../src/features/exercise-dashboard/components/exercise-screen.tsx)
- 대시보드 전용 카드: [`features/exercise-dashboard/components/dashboard-cards.tsx`](../../../src/features/exercise-dashboard/components/dashboard-cards.tsx)
- 리포트 차트: [`features/workout-reports/components/workout-report-chart-section.tsx`](../../../src/features/workout-reports/components/workout-report-chart-section.tsx)
- 리포트 포맷: [`features/workout-reports/components/report-format.ts`](../../../src/features/workout-reports/components/report-format.ts)
- 컨디션 배지 계산: [`features/condition-records/lib/condition-record-metadata.ts`](../../../src/features/condition-records/lib/condition-record-metadata.ts)
- 탭 shell: [`shared/components/tab-page-layout.tsx`](../../../src/shared/components/tab-page-layout.tsx)
- 하단 탭: [`shared/components/member-tab-bar.tsx`](../../../src/shared/components/member-tab-bar.tsx)

기록 목록용 `WorkoutRecordCard`와 대시보드 snapshot의 책임을 분리했다. 대시보드
전용 카드는 원본 3열 구조를 유지하고 현재 API DTO만 입력으로 받는다.

## 렌더 트리 대조

```text
원본
ExerciseScreen
├── AppHeader                               이번 점검 제외
├── ScrollView
│   ├── 오늘의 운동 section
│   │   ├── seeAll link + chevron
│   │   ├── ExerciseRecordCard list
│   │   └── 또는 empty card
│   ├── 오늘의 컨디션 section
│   │   ├── seeAll link + chevron
│   │   ├── ConditionRecordCard
│   │   └── 또는 empty card
│   └── 운동 리포트 section
│       ├── single summary card
│       └── ProgressChartSection
├── FAB
└── GlobalMemberTabBar                      app root에서 렌더링
```

```text
ai-pt
ExerciseScreen
├── ScrollView
│   ├── 오늘의 운동 section
│   │   └── TodayWorkoutSection
│   │       ├── DashboardWorkoutRecordCard list
│   │       └── 또는 empty card
│   ├── 오늘의 컨디션 section
│   │   └── TodayConditionSection
│   │       ├── DashboardConditionCard
│   │       └── 또는 empty card
│   └── InlineReportSection
│       ├── DashboardReportSummaryCard
│       └── WorkoutReportChartSection
├── FAB
└── MemberTabBar                            TabPageLayout에서 렌더링
```

원본과 현재의 대시보드 렌더 구조를 맞췄다. 데이터 조회는 현재 Orval suspense query와
소비처 가까운 `SuspenseSection`을 유지한다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 오늘 운동 없음 | empty card | 동일 | 코드 비교 가능 | 반영 완료 |
| 오늘 운동 있음 | 전용 dashboard card | 동일 구조의 전용 card | 코드·테스트 비교 가능 | 반영 완료 |
| 오늘 컨디션 없음 | empty card | 동일 | 코드 비교 가능 | 반영 완료 |
| 오늘 컨디션 있음 | 첫 항목 기반 요약 card | 동일 구조, 현재 점수 의미 유지 | 코드·테스트 비교 가능 | 반영 완료 |
| 리포트 합계 | 1개 summary card 내부 3분할 | 동일 | 코드·테스트 비교 가능 | 반영 완료 |
| 리포트 탭 전환 | icon+text pill | 동일 | 코드 비교 가능 | 반영 완료 |
| 로딩·오류 | 개별 section loading/error 없음 | Suspense error와 query refresh 있음 | 아니오 | 현재에만 새 상태 추가 |

현재 캡처는 원본과 `ai-pt` 모두 오늘 운동/컨디션 empty는 맞지만, 리포트 수치와
페이지 상단 구조가 달라 전체 스크롤 길이와 섹션 간 여백 검증까지는 이어지지 않는다.

## 실제 시각 규칙 대조

### 화면 루트와 섹션 헤더

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 배경 | `#F4F5F7` | 동일 | 일치 |
| 좌우 padding | `16` | `16` | 일치 |
| 상단 padding | `20` | `20` | 일치 |
| 섹션 간 세로 리듬 | `section marginBottom: 20` | 동일 | 일치 |
| 하단 padding | `GLOBAL_TAB_BAR_CONTENT_H + inset + 16` | 동일 계산 | 공통 반영 완료 |
| section title | `17`, Medium | 동일 | 코드 일치 |
| seeAll link | `13` Regular + chevron `13`, gap `2` | 동일 path의 semantic SVG 포함 | 일치 |
| 페이지 intro header | 없음 | 없음 | 일치 |

원본에 없는 앱 내부 intro chrome은 제거했다. Apps in Toss가 제공하는 네이티브 상단
헤더는 계속 비교 범위에서 제외한다.

### empty card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| surface | 흰색, radius `16`, `iosShadow` | 동일 | 일치 |
| 정렬 | `alignItems: center` | 동일 | 일치 |
| padding | `20/24` | 동일 | 일치 |
| 내부 gap | `10` | 동일 | 일치 |
| 본문 텍스트 | `13`, Regular, lineHeight `20`, center | 동일 | 일치 |
| CTA | 배경 없음, `13` SemiBold accent | 동일 | 일치 |

원본의 텍스트 링크형 CTA를 복원했다.

### 오늘 운동 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 카드 shell | 흰색, radius `16`, padding `16`, `iosShadow` | 동일 | 일치 |
| 정보 구조 | 3열 metric, 아이콘 포함, divider 없음 | 동일 | 일치 |
| metric label | `10` Regular | 동일 | 일치 |
| metric value | `13` SemiBold | 동일 | 일치 |
| 보조 요약 | 없음 | 없음 | 일치 |
| 아이콘 | `Ionicons` `13` | 원본 SVG path `13` | 일치 |

목록 화면의 `WorkoutRecordCard`는 건드리지 않고 대시보드 전용
`DashboardWorkoutRecordCard`를 추가했다.

### 오늘 컨디션 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 카드 shell | 운동 카드와 동일 shell | 동일 | 일치 |
| 정보 구조 | 3열 metric, 아이콘과 배지 포함 | 동일 | 일치 |
| 점수 기준 | `conditions[0]`, `muscleSoreness[0]` | 동일 | 일치 |
| 근육통 부위 | 첫 부위 + `+n` | 동일 | 일치 |
| metric label | `10` Regular | 동일 | 일치 |
| metric value | `13` SemiBold | 동일 | 일치 |

원본 대시보드 snapshot 구조를 복원했다. 다만 원본 `getConditionLabel`은
`1=매우 나쁨, 5=매우 좋음` 입력 의미와 반대로 낮은 점수를 좋음으로 표시하는 결함이
있다. 현재는 원본의 시각 구조를 유지하면서 올바른 점수 label·color를 사용한다.

### 운동 리포트

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| section gap | subtitle 아래 `14`, metric card 아래 `10` | 동일 | 일치 |
| metric 구조 | 1개 card 안에 3개 metric + divider | 동일 | 일치 |
| metric icon | `44 × 44`, radius `12`, Ionicons `22` | 원본 SVG path로 동일 | 일치 |
| metric value | `20`, Medium | 동일 | 일치 |
| metric label | `11`, Regular | 동일 | 일치 |
| chart card | 흰색, radius `16`, padding `16`, `iosShadow` | 동일 | 일치 |
| chart content width | 화면 좌우 `16` + 카드 안쪽 `16`을 뺀 `screenWidth - 64` | embedded variant로 동일 | 일치 |
| chart tab | icon + text pill | 원본 SVG path의 icon + text pill | 일치 |
| insight card | `#FFFDF5`, radius `12`, border `#F0E6C8`, padding `14`, lightbulb `18` | 동일 MDI path | 일치 |

차트 그리기 로직은 유지하고, 차트 바깥 summary와 tab/insight icon만 원본 구조로
복원했다. P-21 상세 페이지와 같은 차트 컴포넌트를 사용하되 기록 탭에서는
`embedded` variant로 상세 페이지 전용 좌우 `20` 여백이 중복되지 않게 분리했다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| chart surface `radius 16 + padding 16 + iosShadow` | pattern 후보 | 보류 | P-21 운동 리포트 페이지까지 확인 후 확정 |
| chart insight card | pattern 후보 | 보류 | 원본과 현재가 거의 같지만 기록 계열 전용인지 추가 확인 필요 |
| section title `17 Medium` + muted link `13` | primitive 후보 | 보류 | P-05, P-11에서도 같은 구조인지 더 확인 필요 |

### 기록 화면에서 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 목록용 `WorkoutRecordCard` | reject | 대시보드에서 재사용하지 않음 | 원본 루트 기록 화면 카드와 구조가 다름 |
| 평균 컨디션 요약 패턴 | reject | 대시보드에서 사용하지 않음 | 원본은 첫 항목 snapshot |
| 분리된 metric card 3장 row | reject | 대시보드에서 사용하지 않음 | 원본은 single summary card |
| dot chart tab | reject | 제거 | 원본 report tab은 icon+text pill |

### 다음 공통화 후보

1. 기록 대시보드 전용 `DashboardWorkoutRecordCard`
2. 기록 대시보드 전용 `DashboardConditionCard`
3. 기록 대시보드 전용 `DashboardReportSummaryCard`
4. 리포트 전용 icon tab

앞의 3개는 [`dashboard-cards.tsx`](../../../src/features/exercise-dashboard/components/dashboard-cards.tsx)에
페이지 전용 pattern으로 구현했다. icon tab은 P-21에서도 같은 리포트 컴포넌트를
사용하므로 해당 단위에서 공통화 범위를 최종 판정한다.

## 반영 결과와 잔여 이슈

### 반영 완료

1. 원본에 없는 `기록 / 운동 기록` intro 제거
2. `seeAll` link의 chevron과 gap `2`
3. 오늘 운동 dashboard snapshot card
4. 오늘 컨디션 첫 항목 snapshot card
5. 리포트 단일 3분할 summary card
6. report tab의 원본 icon+text pill
7. empty card와 section 수직 리듬
8. FAB의 원본 add icon과 shadow

### 의도적 버그 수정

- 원본의 컨디션 badge helper는 입력 안내와 반대로 낮은 점수를 좋음으로 표시한다.
  현재 API의 `1=매우 나쁨, 5=매우 좋음` 의미를 유지해 label·color 역전을 이식하지
  않았다.

### 잔여 이슈

- 같은 데이터 fixture와 Apps in Toss 실행 캡처가 없어 전체 스크롤 길이와 pixel
  비교는 아직 완료하지 않았다.

## 코드 검증

- 대시보드 카드 3종의 운동 요약·컨디션 snapshot·단일 리포트 구조 테스트 추가
- workout report와 기록 대시보드 관련 `4` suites, `16` tests 통과
- TypeScript `tsc --noEmit` 통과
- 변경 파일 Biome 검사 통과

## 실기 검증에 필요한 fixture

최소한 다음 세 상태를 동일 데이터로 만들어야 한다.

1. 오늘 운동 없음, 오늘 컨디션 없음, 리포트 합계 `0`
2. 오늘 운동 1건, 오늘 컨디션 없음, 리포트 데이터 1주치
3. 오늘 운동 1건, 오늘 컨디션 1건, 리포트 데이터 4주치

같은 viewport, 같은 스크롤 위치로 다시 촬영한다.
