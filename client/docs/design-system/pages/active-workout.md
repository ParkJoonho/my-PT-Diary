# P-06 운동 진행 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

timer의 문자 play/pause를 원본과 hash가 같은 PNG asset으로 복원하고 시간
`letterSpacing: 2`를 복원했다. 이번 반영에서는 단계 type·휴식·종료 아이콘, 원본
액션 버튼 shell과 노출 조건, 상세 라우트의 하단 탭·safe area 계산까지 복원했다.

이 페이지의 핵심 차이는 font token이 아니라 화면 책임 자체다. 원본 `active-workout`
은 운동 타이머 화면이면서 동시에 음성 가이드, 영상 촬영, AI 자세 분석, 트레이너
피드백 요청, 촬영 프리뷰까지 포함한 복합 flow다. 현재 `ai-pt`는 메인 workout
상태의 디자인은 복원했지만 Apps in Toss가 지원하지 않는 Expo Speech·Camera flow는
포팅하지 않았다. 해당 액션을 누르면 지원되지 않는 실행 환경임을 명시하고 가짜
녹화·재생 상태를 만들지 않는다.

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
└── TabPageLayout
    ├── ActiveWorkoutScreen
    │   ├── timer bar
    │   ├── steps card
    │   │   ├── 체크박스
    │   │   ├── 운동 타입 태그 + 원본 아이콘
    │   │   ├── 원본 gold 음성가이드 액션
    │   │   ├── 원본 blue 영상촬영 액션
    │   │   └── 휴식 row + coffee 아이콘
    │   ├── countdown overlay
    │   └── saving overlay
    └── MemberTabBar
```

현재 화면은 원본의 메인 workout state를 복원했다. 카메라/프리뷰/피드백 flow는
Expo 전용 런타임 의존성 때문에 남아 있으며, 이는 디자인 token 문제가 아닌 별도
플랫폼 기능 이관 문제다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 루틴 로딩 | 있음 | 없음 | 아니오 | 현재가 축소됨 |
| 루틴 없음 | 있음 | 있음 | 가능 | 표현은 단순화됨 |
| 카운트다운 | 있음 | 있음 | 가능 | 거의 동일 |
| 운동 진행 | 있음 | 있음 | 가능 | step card 일부만 유지 |
| 일시정지 / 재개 | 있음 | 있음 | 가능 | shell 거의 동일, icon 체계 다름 |
| 음성 가이드 | 실제 speech | 원본 액션 shell + 플랫폼 안내 | 가능 | 시각 복원, 기능 이관 필요 |
| 영상 촬영 | 실제 camera flow | 원본 액션 shell + 플랫폼 안내 | 가능 | 시각 복원, 기능 이관 필요 |
| AI 자세 분석 | 있음 | 없음 | 가능 | 현재에 없음 |
| 트레이너 피드백 요청 | 있음 | 없음 | 가능 | 현재에 없음 |
| 촬영 프리뷰 | 있음 | 없음 | 가능 | 현재에 없음 |
| 저장 중 overlay | 없음 | 있음 | 부분 가능 | 현재에만 추가 |

## 실제 시각 규칙 대조

### 1. 루트 구조

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 화면 배경 | `Colors.background` | 동일 | 일치 |
| 메인 배경 장식 | 사용자 체형 이미지가 있을 때 `ParallaxBackground` | 대응 profile image 없음 | 동일 상태 구성 불가 |
| steps 카드 좌우 padding | `16` | `16` | 일치 |
| steps 카드 radius | `16` | `16` | 일치 |
| steps 카드 shadow | `iosShadow` | 동일 | 일치 |
| 하단 scroll padding | safe area + `GLOBAL_TAB_BAR_CONTENT_H` 반영 | `TabPageLayout`의 safe area + tab height + 원본 spacing | 일치 |

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
| pause/play 아이콘 | 이미지 asset | 원본과 hash가 같은 이미지 asset | 일치 |
| 종료 아이콘 | Ionicons `close`, `20` | 같은 path의 SVG, `20` | 일치 |
| 시간 letterSpacing | `2` | `2` | 일치 |

타이머 바는 layout token보다 icon system에서 차이가 난다. 이 영역은 global DS 수정이라기보다
운동 진행 전용 icon asset 복원 이슈에 가깝다.

### 4. 단계 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 카드 title | `17`, Regular | 동일 | 일치 |
| meta line | 없음 | 없음 | 일치 |
| 체크박스 크기 | `24` | `24` | 일치 |
| 완료 상태 | 초록 배경 + white check | 동일 | 거의 일치 |
| step row gap | `12` | `12` | 일치 |
| step name | `14`, SemiBold | 동일 | 일치 |
| step detail | `13`, SemiBold, accent | 동일 | 일치 |
| type tag padding | `8/3`, pill | 거의 동일 | 거의 일치 |
| type tag icon | `Ionicons` 포함 | 같은 path의 SVG 포함 | 일치 |
| 휴식 row | coffee icon + text | 같은 path의 coffee icon + text | 일치 |

기본 step card의 spacing은 꽤 잘 따라왔다. 현재 차이는 대부분 icon 제거와 보조 정보 표현 축소다.

### 5. 액션 버튼 영역

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 음성가이드 노출 조건 | 원본 가이드 사전에 있는 운동만 표시 | 원본 23개 이름 집합으로 동일 판정 | 일치 |
| 음성가이드 shell | gold tint, icon `14`, radius `8`, padding `10/5` | 동일 | 일치 |
| 영상촬영 shell | blue tint, videocam `14`, radius `8`, padding `10/5` | 동일 | 일치 |
| 상호작용 상태 | 실제 재생 중 gold solid + volume icon | 플랫폼 안내만 제공 | 기능 이관 필요 |
| 기능 연결 | Expo Speech·Camera 연결 | Apps in Toss 지원 API 없음 | 플랫폼 이관 필요 |

기존 `ActionChip + UnimplementedBadge`는 제거했다. 정지 상태의 시각과 노출 조건은
원본과 같고, 실제 재생·녹화 이후 상태만 플랫폼 기능 이관 범위로 남는다.

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

이 페이지의 메인 workout 디자인은 원본 기준으로 정렬했다. generic placeholder를
제거하고 페이지 전용 interaction primitive를 복원했으며, 상세 라우트에서도 원본처럼
하단 탭이 유지되도록 공통 shell을 사용한다.

## 반영

- [`src/features/active-workout/components/workout-step-list.tsx`](../../../src/features/active-workout/components/workout-step-list.tsx)에서
  추가 meta line과 `UnimplementedBadge`를 제거하고, type·휴식 아이콘과 원본
  gold/blue 액션 shell을 복원했다.
- [`src/features/active-workout/lib/voice-guide-availability.ts`](../../../src/features/active-workout/lib/voice-guide-availability.ts)에
  원본 가이드 사전의 23개 운동 이름을 이관해 노출 조건을 동일하게 만들었다.
- [`src/features/active-workout/components/active-timer-bar.tsx`](../../../src/features/active-workout/components/active-timer-bar.tsx)의
  종료 문자를 원본 `close` path SVG로 교체했다.
- [`src/shared/components/icons/pt-diary-icons.tsx`](../../../src/shared/components/icons/pt-diary-icons.tsx)에
  이 화면이 실제 사용하는 `walk`, `mic`, `videocam`, `cafe-outline`,
  `volume-high`, `close` path를 추가했다.
- [`src/pages/active-workout.tsx`](../../../src/pages/active-workout.tsx)를
  `TabPageLayout`으로 감싸 원본의 web/native 하단 tab·safe area 계산과 상세 route의
  선택 탭 없음 상태를 복원했다.

## 잔여 이슈

- 원본 음성 재생은 `expo-speech`, 촬영은 `expo-camera`에 직접 의존한다. 현재 저장소의
  [`docs/conventions/dependency-conventions.md`](../../conventions/dependency-conventions.md)는
  Apps in Toss 마이그레이션에 Expo 패키지를 추가하지 않도록 정하고 있으므로 실제
  재생·녹화·프리뷰·AI 자세 분석·트레이너 요청은 호환 API와 서버 계약이 정해진 뒤
  별도 기능 단위로 이관해야 한다.
- `ParallaxBackground`는 사용자 `bodyImage` 또는 `predictedBodyImage`가 있어야
  렌더된다. 현재 Apps in Toss 사용자 계약에는 해당 이미지 필드가 없어 같은 데이터
  상태를 구성할 수 없다.
- Apps in Toss 실기 캡처 환경이 없어 동일 상태 화면 검증은 진행하지 못했다.

## 반영 검증

- active-workout 관련 Jest 5 suites, 10 tests 통과
- TypeScript `tsc --noEmit` 통과
- 변경 파일 Biome check 통과
- `git diff --check` 통과
