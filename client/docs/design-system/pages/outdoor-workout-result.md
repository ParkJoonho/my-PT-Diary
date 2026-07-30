# P-08 야외운동 결과 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

결과 카드 shell, 통계 row, SVG gradient 고도 그래프, 하단 액션 바, 운동 중 overlay를
원본 실제 코드 기준으로 복원했다. 저장 API와 현재 store는 유지하면서 화면 장치만
원본 야외운동 결과 계열로 정렬했다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/(tabs)/outdoor-workout-result.tsx`](<../../../../../2026-07-13/my-PT-Diary/app/(tabs)/outdoor-workout-result.tsx>)
- 결과 store: [`lib/outdoor-plan-store.ts`](../../../../../2026-07-13/my-PT-Diary/lib/outdoor-plan-store.ts)
- 색상: [`constants/colors.ts`](../../../../../2026-07-13/my-PT-Diary/constants/colors.ts)
- 앱 로고: [`components/AppLogo.tsx`](../../../../../2026-07-13/my-PT-Diary/components/AppLogo.tsx)

### `ai-pt`

- 라우트: [`src/pages/outdoor-workout-result.tsx`](../../../src/pages/outdoor-workout-result.tsx)
- 화면: [`src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx`](../../../src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx)
- 결과 store: [`src/features/outdoor-workout/stores/use-outdoor-workout-store.ts`](../../../src/features/outdoor-workout/stores/use-outdoor-workout-store.ts)
- 기록 payload: [`src/features/outdoor-workout/lib/build-outdoor-workout-record-payload.ts`](../../../src/features/outdoor-workout/lib/build-outdoor-workout-record-payload.ts)

## 렌더 트리 대조

```text
원본
OutdoorWorkoutResultScreen
├── branded header
├── ScrollView
│   ├── page title
│   ├── 코스 요약 card
│   │   ├── difficulty chip
│   │   ├── summary text
│   │   └── 1줄 stats row + divider
│   ├── 고도 그래프 card
│   │   ├── gradient bars
│   │   └── segment legend
│   └── 맞춤 조언 card
├── fixed bottom bar
│   ├── 저장 버튼
│   └── 운동시작 버튼
├── absolute countdown overlay
└── absolute workout overlay
    ├── large timer
    ├── 음성안내
    ├── 일시정지
    └── 종료
```

```text
ai-pt
TabPageLayout
├── OutdoorWorkoutResultScreen
│   ├── ScrollView
│   │   ├── page title
│   │   ├── compact 코스 요약 card + 4칸 metric strip
│   │   ├── SVG gradient 고도 그래프 card + segment legend
│   │   └── 맞춤 조언 card
│   ├── fixed bottom bar
│   ├── absolute dark countdown overlay
│   └── absolute dark workout overlay
└── MemberTabBar(선택 없음)
```

결과 화면 위에 운동 세션 layer를 덧씌우는 원본 구조를 복원했다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 결과 없음 | spinner 후 이전/홈 복귀 | spinner + `goBack` | 가능 | 일치 |
| 코스 요약 표시 | 있음 | 있음 | 가능 | 구조는 유사 |
| 고도 그래프 표시 | 있음 | 있음 | 가능 | 시각 처리 다름 |
| 맞춤 조언 표시 | 있음 | 있음 | 가능 | 거의 유사 |
| 저장 전 bottom bar | 있음 | tab 위 fixed bar | 가능 | 일치 |
| 저장 완료 상태 | green CTA + white check icon | 동일 | 가능 | 일치 |
| 카운트다운 | dark absolute overlay | 동일 | 가능 | 일치 |
| 운동 중 컨트롤 | dark absolute overlay | 동일 | 가능 | 일치 |
| 음성 안내 | UI 토글 only | UI 토글 only | 가능 | 기능 의미는 동일 |

## 실제 시각 규칙 대조

### 1. 헤더와 타이틀

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| header 구조 | branded header + logo/action cluster | Apps in Toss 네이티브 헤더 | 플랫폼 제외 |
| page title | `18`, Medium | `18`, Medium | 일치 |
| scroll 상단 리듬 | `padding: 16`, title marginBottom `4` | 동일 | 일치 |
| 하단 tab 활성 상태 | 상세 route라 선택 없음 | `activeKey={null}` | 일치 |

헤더 자체는 제외 범위지만, title scale이 여기서도 크게 달라져 있다. 이건 전역 title token보다
현재 페이지가 원본보다 “상세 페이지형 대제목”을 쓰도록 바뀐 결과다.

### 2. 결과 카드 shell

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| card radius | `16` | `16` | 일치 |
| card padding | `24/20` | `24/20` | 일치 |
| card title | `16`, Medium | `16`, Medium | 일치 |
| summary text | `13`, lineHeight `20`, marginBottom `16` | 동일 | 일치 |
| card shadow | `0,0 / 0.05 / radius 1` | 페이지 전용으로 동일 | 일치 |

현재는 카드가 더 크고 둥글고 제목도 더 무겁다. 그래서 원본보다 결과 화면이 덜 조밀하고
더 “대시보드 카드”처럼 보인다.

### 3. 코스 요약 stats row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 배치 | 한 줄 4칸 + 세로 divider | 동일 | 일치 |
| label | `11` Regular | `11` Regular | 일치 |
| value | `16` Medium + unit `13` SemiBold | 동일 parsing 적용 | 일치 |
| divider | `1 × 32`, `#F0F2F5` | 동일 | 일치 |
| top spacing | `4` | `4` | 일치 |

이 영역이 체감 차이를 크게 만든다. 원본은 compact metric strip이고, 현재는 일반적인
summary grid다.

### 4. 고도 그래프와 segment list

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| bar chart top spacing | `32` | `32` | 일치 |
| bar fill | gradient | `react-native-svg` linear gradient | 일치 |
| bar gap | `6` | `6` | 일치 |
| segment row | 별도 divider + padding `12` | 동일 | 일치 |
| segment name | `13` SemiBold | `13` SemiBold | 일치 |
| segment meta | `12` Regular | `12` Regular | 일치 |

현재도 정보량은 비슷하지만, 원본의 chart card는 더 촘촘하고 시각적 강조가 강하다.

### 5. 하단 액션 바

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 위치 | absolute, tab bar 위 고정 | 동일 | 일치 |
| safe area / tab bar 보정 | 있음 | `TabPageLayout.tabBarHeight` 반영 | 일치 |
| save button | 회색 fill, radius `14`, height `56` | 동일 | 일치 |
| start button | accent fill + play `16` | 같은 path SVG 포함 | 일치 |
| saved state | green accent button + check `20` | 같은 path SVG 포함 | 일치 |

원본은 “운동 세션을 시작하는 고정 액션 바” 느낌이고, 현재는 “폼 하단 저장 영역”에 더 가깝다.

### 6. 카운트다운 / 운동 중 overlay

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 패널 위치 | tab 위 `10`, 좌우 `10`, absolute | 동일 | 일치 |
| 패널 배경 | `rgba(0,0,0,0.8)`, radius `20`, height `170` | 동일 | 일치 |
| countdown circle | `90`, 투명 + white stroke `3` | 동일 | 일치 |
| countdown 숫자 | `42`, white Medium | 동일 | 일치 |
| active timer | `52`, white Medium, letterSpacing `2` | 동일 | 일치 |
| control row gap | `36` | `36` | 일치 |
| icon size | `36` | 원본과 hash가 같은 PNG `36` | 일치 |

이 부분은 사실상 별도 component family다. 원본의 “세션 overlay”가 현재에선 일반 패널로
바뀌어서, 결과 화면의 긴장감이 사라졌다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| difficulty chip 의미 체계 | primitive 후보 | 가능 | 난이도 색 의미는 유지 가능 |
| result info card family | pattern 후보 | 보류 | P-07/P-08만의 야외운동 전용 계열일 수 있음 |
| segment legend row | pattern 후보 | 보류 | 다른 route result 화면 반복 여부 확인 필요 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 기존 `card radius 24` shell | reject | 제거 완료 | 원본 결과 카드와 톤이 다름 |
| 기존 wrapping stats grid | reject | 제거 완료 | 원본은 compact strip + divider |
| 기존 white inline overlay | reject | 제거 완료 | 원본은 dark floating overlay |
| 기존 EmptyState | reject | 제거 완료 | 원본은 spinner 후 복귀 흐름 |

## 시스템 관점 결론

P-07/P-08 야외운동 계열은 generic dashboard 카드와 inline panel에서 분리했다. 결과
카드와 세션 overlay의 수치는 이 화면 안에서 원본대로 유지하며, 다른 결과 화면을
확인하기 전에는 전역 card primitive로 승격하지 않는다.

## 반영

- [`src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx`](../../../src/features/outdoor-workout/components/outdoor-workout-result-screen.tsx)에서
  compact card, difficulty chip, 단위가 분리된 4칸 metric strip을 복원했다.
- Expo LinearGradient를 추가하지 않고 기존 `react-native-svg`의 gradient로 원본 고도
  막대를 재현하고 segment divider·타이포그래피를 정렬했다.
- CTA bar를 tab 위 absolute 위치로 옮기고 save/start/saved 세 상태의 shell과
  play/check 아이콘을 복원했다.
- countdown과 active workout을 좌우 `10`, tab 위 `10`인 dark overlay로 복원하고
  timer·control 아이콘·텍스트 수치를 정렬했다.
- [`src/pages/outdoor-workout-result.tsx`](../../../src/pages/outdoor-workout-result.tsx)에
  `TabPageLayout`을 적용해 scroll bottom inset과 fixed layer의 tab 높이를 한 계산에서
  사용한다.
- [`src/shared/components/tab-page-layout.tsx`](../../../src/shared/components/tab-page-layout.tsx)와
  [`src/shared/components/member-tab-bar.tsx`](../../../src/shared/components/member-tab-bar.tsx)는
  상세 route에서 원본처럼 선택 탭이 없는 `activeKey={null}`을 허용한다.

## 잔여 이슈

- 원본과 현재 모두 음성안내 toggle은 실제 TTS를 연결하지 않고 UI 상태만 변경한다.
- 실제 GPS session 추적 없이 화면 timer와 계획값 기반 저장을 사용하는 원본 기능
  한계도 그대로 남아 있다.
- Apps in Toss 실기 환경에서 tab·fixed CTA·overlay 중첩 캡처는 진행하지 못했다.

## 반영 검증

- outdoor-workout 전체 Jest 4 suites, 11 tests 통과
- TypeScript `tsc --noEmit` 통과
- 변경 파일 Biome check 통과
- `git diff --check` 통과
