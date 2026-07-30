# P-06 운동 진행 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 일부 완료
- 동일 상태 실기 검증: 미진행

공통 icon 반영 과정에서 timer의 문자 play/pause를 원본과 hash가 같은 PNG asset으로
복원하고 시간 `letterSpacing: 2`를 복원했다. 음성·촬영·피드백 flow와 나머지 페이지
전용 차이는 아직 남아 있다.

이 페이지의 핵심 차이는 font token이 아니라 화면 책임 자체다. 원본 `active-workout`
은 운동 타이머 화면이면서 동시에 음성 가이드, 영상 촬영, AI 자세 분석, 트레이너
피드백 요청, 촬영 프리뷰까지 포함한 복합 flow다. 현재 `ai-pt`는 이 중
`카운트다운 → 타이머 → 체크리스트 → 저장`만 남기고 나머지를 placeholder action으로
축소했다.

그래서 이 페이지는 “디자인 토큰이 달라져서 다르게 보인다”기보다, 원본의 interaction
pattern들이 빠지면서 전체 인상이 달라진 사례로 봐야 한다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/active-workout.tsx`](../../../../../2026-07-13/my-PT-Diary/app/active-workout.tsx)
- 하단 탭 높이 상수: [`components/GlobalTabBar.tsx`](../../../../../2026-07-13/my-PT-Diary/components/GlobalTabBar.tsx)
- 색상·그림자: [`constants/colors.ts`](../../../../../2026-07-13/my-PT-Diary/constants/colors.ts)
- 루틴 소스: [`lib/routines.ts`](../../../../../2026-07-13/my-PT-Diary/lib/routines.ts)
- 음성 가이드 사전: [`lib/exercise-guides.ts`](../../../../../2026-07-13/my-PT-Diary/lib/exercise-guides.ts)

### `ai-pt`

- 라우트: [`src/pages/active-workout.tsx`](../../../src/pages/active-workout.tsx)
- 메인 화면: [`src/features/active-workout/components/active-workout-screen.tsx`](../../../src/features/active-workout/components/active-workout-screen.tsx)
- 상단 타이머 바: [`src/features/active-workout/components/active-timer-bar.tsx`](../../../src/features/active-workout/components/active-timer-bar.tsx)
- 단계 리스트: [`src/features/active-workout/components/workout-step-list.tsx`](../../../src/features/active-workout/components/workout-step-list.tsx)
- 카운트다운 오버레이: [`src/features/active-workout/components/active-countdown-overlay.tsx`](../../../src/features/active-workout/components/active-countdown-overlay.tsx)
- 진행 상태 store: [`src/features/active-workout/stores/use-active-workout-store.ts`](../../../src/features/active-workout/stores/use-active-workout-store.ts)

## 렌더 트리 대조

```text
원본
ActiveWorkoutScreen
├── loading / routine-not-found state
├── camera permission state
├── camera recording state
│   ├── CameraView
│   ├── 녹화 countdown badge
│   └── record / stop button
├── recorded preview state
│   ├── preview header
│   ├── AI 자세 분석 버튼
│   ├── 트레이너 검토 요청 버튼
│   ├── 자세 분석 결과 카드
│   └── 다시 촬영 / 확인 버튼
└── main workout state
    ├── ParallaxBackground
    ├── timer bar
    ├── steps card
    │   ├── 체크박스
    │   ├── 운동 타입 태그 + 아이콘
    │   ├── 음성가이드 버튼(실기능)
    │   ├── 영상촬영 버튼(실기능)
    │   └── 휴식 row + 아이콘
    └── countdown overlay
```

```text
ai-pt
ActiveWorkoutRoute
├── routine-not-found state
└── ActiveWorkoutScreen
    ├── timer bar
    ├── steps card
    │   ├── 체크박스
    │   ├── 운동 타입 태그(텍스트만)
    │   ├── ActionChip "음성가이드" + 미구현 배지
    │   ├── ActionChip "영상촬영" + 미구현 배지
    │   └── 휴식 row(텍스트만)
    ├── countdown overlay
    └── saving overlay
```

현재 화면은 원본의 메인 workout state만 일부 남기고, 카메라/프리뷰/피드백 flow를 전부
삭제했다. 이 차이는 page-level primitive 문제이지 spacing 몇 개로 해결되는 문제가 아니다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 루틴 로딩 | 있음 | 없음 | 아니오 | 현재가 축소됨 |
| 루틴 없음 | 있음 | 있음 | 가능 | 표현은 단순화됨 |
| 카운트다운 | 있음 | 있음 | 가능 | 거의 동일 |
| 운동 진행 | 있음 | 있음 | 가능 | step card 일부만 유지 |
| 일시정지 / 재개 | 있음 | 있음 | 가능 | shell 거의 동일, icon 체계 다름 |
| 음성 가이드 | 실제 speech | placeholder chip | 가능 | 기능/시각 모두 축소 |
| 영상 촬영 | 실제 camera flow | placeholder chip | 가능 | 기능/시각 모두 축소 |
| AI 자세 분석 | 있음 | 없음 | 가능 | 현재에 없음 |
| 트레이너 피드백 요청 | 있음 | 없음 | 가능 | 현재에 없음 |
| 촬영 프리뷰 | 있음 | 없음 | 가능 | 현재에 없음 |
| 저장 중 overlay | 없음 | 있음 | 부분 가능 | 현재에만 추가 |

## 실제 시각 규칙 대조

### 1. 루트 구조

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 화면 배경 | `Colors.background` | 동일 | 일치 |
| 메인 배경 장식 | `ParallaxBackground` 있음 | 없음 | 다름 |
| steps 카드 좌우 padding | `16` | `16` | 일치 |
| steps 카드 radius | `16` | `16` | 일치 |
| steps 카드 shadow | `iosShadow` | 동일 | 일치 |
| 하단 scroll padding | safe area + `GLOBAL_TAB_BAR_CONTENT_H` 반영 | `40` 고정 | 다름 |

메인 card shell 자체는 거의 그대로 왔다. 그런데 원본은 배경 장식과 하단 안전영역 계산,
카메라·프리뷰 분기까지 포함한 페이지여서 전체 체감은 크게 다르다.

### 2. 카운트다운 오버레이

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| overlay 배경 | `rgba(0,0,0,0.8)` | 동일 | 일치 |
| 원형 stroke | `90 × 90`, border `3`, white | 동일 | 일치 |
| 숫자 크기 | `42`, Medium | 동일 | 일치 |
| 준비 텍스트 | `16`, SemiBold, accent | 동일 | 일치 |
| 건너뛰기 버튼 | radius `16`, `20/8`, translucent white | 동일 | 일치 |

카운트다운은 거의 복제 수준이다. 이 페이지에서 문제의 중심은 여기 아니다.

### 3. 상단 타이머 바

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| bar shell | 검정 반투명, radius `16`, height `70`, `24` 좌우 padding | 동일 | 일치 |
| 시간 텍스트 | `28`, Medium, white | 동일 | 일치 |
| 우측 액션 간격 | `16` | 동일 | 일치 |
| 종료 버튼 shell | `32 × 32`, white alpha bg | 동일 | 일치 |
| pause/play 아이콘 | 이미지 asset | 문자 glyph `▶`, `Ⅱ` | 다름 |
| 시간 letterSpacing | `2` | 없음 | 다름 |

타이머 바는 layout token보다 icon system에서 차이가 난다. 이 영역은 global DS 수정이라기보다
운동 진행 전용 icon asset 복원 이슈에 가깝다.

### 4. 단계 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 카드 title | `17`, Regular | 동일 | 일치 |
| meta line | 없음 | `duration · location` 추가 | 다름 |
| 체크박스 크기 | `24` | `24` | 일치 |
| 완료 상태 | 초록 배경 + white check | 동일 | 거의 일치 |
| step row gap | `12` | `12` | 일치 |
| step name | `14`, SemiBold | 동일 | 일치 |
| step detail | `13`, SemiBold, accent | 동일 | 일치 |
| type tag padding | `8/3`, pill | 거의 동일 | 거의 일치 |
| type tag icon | `Ionicons` 포함 | 없음 | 다름 |
| 휴식 row | coffee icon + text | 텍스트만 | 다름 |

기본 step card의 spacing은 꽤 잘 따라왔다. 현재 차이는 대부분 icon 제거와 보조 정보 표현 축소다.

### 5. 액션 버튼 영역

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 음성가이드 노출 조건 | 가이드가 있는 운동만 표시 | 근력/스트레칭 대부분 표시 | 다름 |
| 음성가이드 shell | gold tint, active state 존재 | 회색 neutral chip + 미구현 배지 | 다름 |
| 영상촬영 shell | blue tint, videocam icon | 회색 neutral chip + 미구현 배지 | 다름 |
| 상호작용 상태 | 재생중 active state | 없음 | 다름 |
| 기능 연결 | Speech API 연결 | 없음 | 다름 |

여기가 현재 화면 인상을 가장 크게 바꾸는 영역이다. 원본은 “진행 중 도움을 주는 실행형 액션”
이고, 현재는 “향후 구현 예정 배지”로 바뀌었다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| countdown overlay shell | pattern 후보 | 가능 | 원본과 현재가 거의 동일 |
| active timer bar shell | pattern 후보 | 가능 | 운동 진행 계열 전용 primitive로 분리 가능 |
| step checklist row 기본 리듬 | primitive 후보 | 가능 | checkbox-column + content-column 구조가 안정적 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 현재 `ActionChip + UnimplementedBadge` | reject | 전역 공통화 금지 | 원본 interaction pattern을 없앤 임시 구조 |
| 현재 meta line `duration · location` | reject | 기준 규칙 금지 | 원본 steps card title block에 없음 |
| 문자 glyph pause/play | reject | 전역 icon 규칙 금지 | 원본은 전용 asset/icon 사용 |

## 시스템 관점 결론

이 페이지에서 드러난 문제는 두 가지다.

1. layout token은 꽤 많이 맞췄는데 interaction primitive를 generic placeholder로 대체했다.
2. 그래서 “원본과 같은 디자인 시스템”이 아니라 “원본 shell 위에 축소 기능을 올린 상태”가 됐다.

즉 이 페이지를 맞추려면 색상/spacing 토큰 추가보다 아래 우선순위가 먼저다.

1. `ActiveActionChip`를 원본 기준으로 다시 정의
2. `voice guide / video capture / feedback flow`를 임시 배지 구조에서 분리
3. 운동 진행 계열 전용 icon set과 상태색 규칙을 복원

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. `ActionChip + UnimplementedBadge`를 디자인 시스템 근거에서 제외
2. 운동 진행 전용 `ActiveTimerBar` primitive는 유지하되 icon 체계를 원본 기준으로 복원
3. step type tag에서 icon 포함 여부를 원본 기준으로 재정의
4. 휴식 row의 보조 icon과 color semantics를 원본 기준으로 복원
5. 카메라/프리뷰/피드백 flow는 단순 “미구현”이 아니라 별도 패턴 누락으로 분류
