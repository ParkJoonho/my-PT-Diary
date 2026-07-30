# P-02 기록 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 일부 완료
- 동일 상태 실기 검증: 미진행

공통 반영으로 `TabPageLayout`의 탭·safe-area·본문/FAB 하단 계산과 공통 section title
typography를 적용했다. 오늘 운동·컨디션·리포트의 페이지 전용 구조 차이는 아직
남아 있다.

현재 `ai-pt` 기록 화면 상단의 `기록 / 운동 기록` 블록은 원본에 없는 앱 내부 중복
header다. 사용자 지시상 이번 수정 범위에서는 제거하지 않으므로, 이 문서에는 구조
차이로만 기록하고 디자인 시스템 공통 규칙의 근거로 사용하지 않는다.

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
- 오늘 운동 카드: [`features/workout-records/components/workout-record-card.tsx`](../../../src/features/workout-records/components/workout-record-card.tsx)
- 리포트 차트: [`features/workout-reports/components/workout-report-chart-section.tsx`](../../../src/features/workout-reports/components/workout-report-chart-section.tsx)
- 리포트 포맷: [`features/workout-reports/components/report-format.ts`](../../../src/features/workout-reports/components/report-format.ts)
- 컨디션 배지 계산: [`features/condition-records/lib/condition-record-metadata.ts`](../../../src/features/condition-records/lib/condition-record-metadata.ts)
- 탭 shell: [`shared/components/tab-page-layout.tsx`](../../../src/shared/components/tab-page-layout.tsx)
- 하단 탭: [`shared/components/member-tab-bar.tsx`](../../../src/shared/components/member-tab-bar.tsx)

현재는 원본 대시보드 전용 카드 대신 기록 상세/목록용 컴포넌트를 재사용한 부분이 많다.
이 재사용이 화면의 전체 인상 차이를 크게 만든다.

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
│   ├── intro header(eyebrow + title)       원본에 없음, 추후 제거 대상
│   ├── 오늘의 운동 section
│   │   └── TodayWorkoutSection
│   │       ├── WorkoutRecordCard list
│   │       └── 또는 empty card
│   ├── 오늘의 컨디션 section
│   │   └── TodayConditionSection
│   │       ├── TodayConditionCard
│   │       └── 또는 empty card
│   └── InlineReportSection
│       ├── 3개의 SummaryMetricCard
│       └── WorkoutReportChartSection
├── FAB
└── MemberTabBar                            TabPageLayout에서 렌더링
```

원본은 하나의 대시보드 안에서 세 section을 직접 설계했고, 현재는 목록 카드와
리포트 카드 primitive를 다른 feature에서 끌어왔다. 그래서 font bug를 제외해도
카드 밀도, 정보 배치, 빈 상태의 성격이 전체적으로 달라진다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 오늘 운동 없음 | empty card | empty card | 부분 가능 | 버튼과 정렬 규칙이 다름 |
| 오늘 운동 있음 | 전용 dashboard card | `WorkoutRecordCard` 재사용 | 코드 비교 가능 | 구조가 다름 |
| 오늘 컨디션 없음 | empty card | empty card | 부분 가능 | 버튼과 정렬 규칙이 다름 |
| 오늘 컨디션 있음 | 첫 항목 기반 요약 card | 평균 점수 기반 3분할 card | 코드 비교 가능 | 의미와 시각 구조가 모두 다름 |
| 리포트 합계 | 1개 summary card 내부 3분할 | 3개 개별 metric card | 코드 비교 가능 | 구조가 다름 |
| 리포트 탭 전환 | icon+text pill | dot+text pill | 코드 비교 가능 | tab primitive가 다름 |
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
| 섹션 간 세로 리듬 | `section marginBottom: 20` | `content gap: 18` | 다름 |
| 하단 padding | `GLOBAL_TAB_BAR_CONTENT_H + inset + 16` | 동일 계산 | 공통 반영 완료 |
| section title | `17`, Medium | 동일 | 코드 일치 |
| seeAll link | `13` Regular + chevron `13` | `13` Regular만 존재 | 다름 |
| 페이지 intro header | 없음 | eyebrow `12` SemiBold, title `28` Bold, lineHeight `34` | 원본에 없는 구조 |

현재 intro header는 디자인 시스템 토큰의 차이라기보다 잘못 들어간 page chrome이다.
별도 제거 이슈로 다루고, 공통 typography 근거에서는 제외한다.

### empty card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| surface | 흰색, radius `16`, `iosShadow` | 흰색, radius `16`, hairline border, no shadow spread change | 다름 |
| 정렬 | `alignItems: center` | `alignItems: flex-start` | 다름 |
| padding | `20/24` | `18` 전체 | 다름 |
| 내부 gap | `10` | `12` | 다름 |
| 본문 텍스트 | `13`, Regular, lineHeight `20`, center | `14`, Regular, no lineHeight, left | 다름 |
| CTA | 배경 없음, `13` SemiBold accent | `accentLight` 배경, radius `10`, `12/9` padding | 다름 |

원본 기록 대시보드의 empty card는 단순한 텍스트 링크형 CTA이고, 현재는 입력 버튼처럼
보이는 secondary button으로 바뀌어 있다. 이 차이는 화면 전체의 tone을 바꾼다.

### 오늘 운동 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 카드 shell | 흰색, radius `16`, padding `16`, `iosShadow` | radius `14`, padding `16/14`, marginBottom `10`, `iosShadow` | 다름 |
| 정보 구조 | 3열 metric, 아이콘 포함, divider 없음 | 3열 metric + divider + 하단 summary text | 다름 |
| metric label | `10` Regular | `11` Regular | 다름 |
| metric value | `13` SemiBold | `15` SemiBold | 다름 |
| 보조 요약 | 없음 | `summary` 2줄 (`12`, lineHeight `18`) | 원본에 없음 |
| 아이콘 | `Ionicons` `13` | 없음 | 다름 |

현재 `WorkoutRecordCard`는 기록 목록 화면용 카드다. 원본 기록 대시보드 카드와 역할이
다르므로, 이 컴포넌트를 대시보드 공통 primitive로 승격하면 원본 UX에서 더 멀어진다.

### 오늘 컨디션 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 카드 shell | 운동 카드와 동일 shell | radius `14`, hairline border, padding `16/14` | 다름 |
| 정보 구조 | 3열 metric, 아이콘과 배지 포함 | 3열 metric, divider, 평균 점수/배지 표시 | 다름 |
| 점수 기준 | `conditions[0]`, `muscleSoreness[0]` | 전체 평균 점수 | 의미 다름 |
| 근육통 부위 | 첫 부위 + `+n` | `score >= 2` 필터 후 텍스트 | 의미 다름 |
| metric label | `10` Regular | `11` Regular | 다름 |
| metric value | `13` SemiBold | `15` SemiBold | 다름 |

컨디션 카드 차이는 단순 styling 문제가 아니다. 원본은 dashboard용 snapshot card이고
현재는 별도 요약 알고리즘을 가진 분석 카드다.

### 운동 리포트

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| section gap | subtitle 아래 `14`, metric card 아래 `10` | reportSection `gap: 12` | 다름 |
| metric 구조 | 1개 card 안에 3개 metric + divider | 3개 card를 가로 row에 배치 | 구조 다름 |
| metric icon | `44 × 44`, radius `12`, Ionicons `22` | `40 × 40`, radius `12`, dot `12 × 12` | 다름 |
| metric value | `20`, Medium | `19`, Medium | 다름 |
| metric label | `11`, Regular | `11`, Regular | 거의 동일 |
| chart card | 흰색, radius `16`, padding `16`, `iosShadow` | 동일 | 일치 |
| chart tab | icon + text pill | dot + text pill | 다름 |
| insight card | `#FFFDF5`, radius `12`, border `#F0E6C8`, padding `14` | 동일 | 일치 |

차트 그리기 로직과 insight card 자체는 거의 그대로 옮겨졌다. 큰 이질감은 차트 바깥의
metric summary 구조와 tab chip의 icon 제거에서 발생한다.

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
| `WorkoutRecordCard`의 현재 shell | reject | 대시보드 공통화 금지 | 원본 루트 기록 화면 카드와 구조가 다름 |
| `TodayConditionCard` 평균 요약 패턴 | reject | 대시보드 공통화 금지 | 원본 의미와 구조를 동시에 바꿈 |
| `SummaryMetricCard` 3장 row | reject | 대시보드 공통화 금지 | 원본은 single summary card |
| 현재 chart tab dot chip | reject | 전역 tab primitive로 승격 금지 | 원본 report tab은 icon+text pill |

### 다음 공통화 후보

1. 기록 대시보드 전용 `SummaryTripletCard`
2. 기록 대시보드 전용 `ConditionSnapshotCard`
3. 리포트 전용 `IconTabChip`

위 3개는 지금 당장 전역 primitive를 만들기보다, 원본 구조를 먼저 복원한 뒤 다른
페이지에서 반복되는지 확인해야 한다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. 중복 intro header 제거는 별도 범위로 분리하고, 이번 디자인 시스템 작업의 근거에서는 제외
2. `seeAll` link에 원본 chevron과 spacing 복원
3. 오늘 운동 section에 목록 카드 재사용을 멈추고 원본 dashboard card 구조 복원
4. 오늘 컨디션 section에 평균 요약 card 대신 원본 snapshot card 구조 복원
5. 리포트 합계 영역을 3개 분리 card가 아니라 1개 3분할 card로 복원
6. 차트 tab을 dot chip이 아니라 원본 icon+text pill로 복원
7. 동일 fixture로 원본과 `ai-pt`를 다시 촬영해 section gap과 전체 스크롤 길이 검증

## 실기 검증에 필요한 fixture

최소한 다음 세 상태를 동일 데이터로 만들어야 한다.

1. 오늘 운동 없음, 오늘 컨디션 없음, 리포트 합계 `0`
2. 오늘 운동 1건, 오늘 컨디션 없음, 리포트 데이터 1주치
3. 오늘 운동 1건, 오늘 컨디션 1건, 리포트 데이터 4주치

같은 viewport, 같은 스크롤 위치로 다시 촬영하고 앱 내부 중복 header 제거 이슈는
별도 체크리스트로 분리한다.
