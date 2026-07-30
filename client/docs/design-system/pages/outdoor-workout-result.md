# P-08 야외운동 결과 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 페이지는 겉보기에는 원본을 꽤 닮았지만, 실제로는 결과 카드 shell, 통계 row,
하단 액션 바, 운동 중 overlay가 전부 더 generic한 관리형 패턴으로 바뀌어 있다.

즉 “무슨 정보가 보이느냐”는 비슷한데, “그 정보가 어떤 화면 장치 위에 놓이느냐”가 달라서
전체 인상이 달라진다.

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
OutdoorWorkoutResultScreen
├── text header
├── ScrollView
│   ├── oversized page title
│   ├── 코스 요약 card
│   │   ├── difficulty chip
│   │   ├── summary text
│   │   └── wrapping stats grid
│   ├── 고도 그래프 card
│   │   ├── flat color bars
│   │   └── segment list
│   └── 맞춤 조언 card
├── inline bottom bar
├── inline countdown panel
└── inline workout control panel
```

원본은 “결과 화면 위에 운동 세션 layer를 덧씌우는 구조”이고, 현재는 “결과 화면 아래에
상태 패널을 추가하는 구조”에 가깝다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 결과 없음 | spinner 후 이전/홈 복귀 | EmptyState + 이전 화면 버튼 | 가능 | 현재가 다른 empty UX |
| 코스 요약 표시 | 있음 | 있음 | 가능 | 구조는 유사 |
| 고도 그래프 표시 | 있음 | 있음 | 가능 | 시각 처리 다름 |
| 맞춤 조언 표시 | 있음 | 있음 | 가능 | 거의 유사 |
| 저장 전 bottom bar | 있음 | 있음 | 가능 | 배치와 버튼 shell 다름 |
| 저장 완료 상태 | 있음 | 있음 | 가능 | 색/아이콘 표현 다름 |
| 카운트다운 | dark absolute overlay | white inline panel | 가능 | 구조 다름 |
| 운동 중 컨트롤 | dark absolute overlay | white inline panel | 가능 | 구조 다름 |
| 음성 안내 | UI 토글 only | UI 토글 only | 가능 | 기능 의미는 동일 |

## 실제 시각 규칙 대조

### 1. 헤더와 타이틀

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| header 구조 | branded header + logo/action cluster | 텍스트 back/title/close | 구조 다름 |
| page title | `18`, Medium | `28`, SemiBold | 다름 |
| scroll 상단 리듬 | `padding: 16`, title marginBottom `4` | title marginTop `20`, marginHorizontal `18` | 다름 |

헤더 자체는 제외 범위지만, title scale이 여기서도 크게 달라져 있다. 이건 전역 title token보다
현재 페이지가 원본보다 “상세 페이지형 대제목”을 쓰도록 바뀐 결과다.

### 2. 결과 카드 shell

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| card radius | `16` | `24` | 다름 |
| card padding | `24/20` | `18/18` | 다름 |
| card title | `16`, Medium | `17`, SemiBold | 다름 |
| summary text | `13`, lineHeight `20`, marginBottom `16` | `14`, lineHeight `22`, marginTop `10` | 다름 |

현재는 카드가 더 크고 둥글고 제목도 더 무겁다. 그래서 원본보다 결과 화면이 덜 조밀하고
더 “대시보드 카드”처럼 보인다.

### 3. 코스 요약 stats row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 배치 | 한 줄 4칸 + 세로 divider | wrap 가능한 4칸 grid | 다름 |
| label | `11` Regular | `12` Regular | 다름 |
| value | `16` Medium + unit 분리 | `15` SemiBold | 다름 |
| divider | 있음 | 없음 | 다름 |
| top spacing | `4` | `16` | 다름 |

이 영역이 체감 차이를 크게 만든다. 원본은 compact metric strip이고, 현재는 일반적인
summary grid다.

### 4. 고도 그래프와 segment list

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| bar chart top spacing | `32` | `16` | 다름 |
| bar fill | gradient | flat color | 다름 |
| bar gap | `6` | `10` | 다름 |
| segment row | divider 기준 row | top-border 기반 item | 다름 |
| segment name | `13` SemiBold | `15` SemiBold | 다름 |
| segment meta | `12` Regular | `13` Regular + margin-left | 다름 |

현재도 정보량은 비슷하지만, 원본의 chart card는 더 촘촘하고 시각적 강조가 강하다.

### 5. 하단 액션 바

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 위치 | absolute, tab bar 위 고정 | 일반 bottom section | 다름 |
| safe area / tab bar 보정 | 있음 | 없음 | 다름 |
| save button | 회색 fill, radius `14`, 고정 height `56` | white card + border, radius `16` | 다름 |
| start button | accent fill + play icon | accent fill, icon 없음 | 다름 |
| saved state | green accent button + check icon | pale green panel + custom check icon | 다름 |

원본은 “운동 세션을 시작하는 고정 액션 바” 느낌이고, 현재는 “폼 하단 저장 영역”에 더 가깝다.

### 6. 카운트다운 / 운동 중 overlay

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 패널 위치 | absolute floating overlay | inline panel | 다름 |
| 패널 배경 | `rgba(0,0,0,0.8)` | `rgba(255,255,255,0.94)` | 다름 |
| countdown circle | 투명 + white stroke | white fill circle | 다름 |
| countdown 숫자 | `42`, white Medium | `40`, accent SemiBold | 다름 |
| active timer | `52`, white Medium | `36`, dark SemiBold | 다름 |
| control row gap | `36` | `28` | 다름 |
| icon size | `36` | `28` | 다름 |

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
| 현재 `card radius 24` shell | reject | 기준 card 금지 | 원본 결과 카드와 톤이 다름 |
| 현재 wrapping stats grid | reject | 결과 summary 공통화 금지 | 원본은 compact strip + divider |
| 현재 white inline overlay | reject | 세션 overlay 공통화 금지 | 원본은 dark floating overlay |
| 현재 empty state | reject | 기준 empty 패턴 금지 | 원본은 empty screen보다 복귀 흐름에 가까움 |

## 시스템 관점 결론

이 페이지는 `P-07`과 연결해서 보면 더 명확하다.

야외운동 계열 원본은

1. branded header
2. compact white result cards
3. fixed bottom CTA
4. dark floating session overlay

라는 독자적인 화면 언어가 있다.

현재 `ai-pt`는 이를

1. generic text header
2. 더 큰 radius의 dashboard card
3. 일반 bottom section
4. white inline state panel

로 바꿨다.

즉 이 계열을 원본에 맞추려면 `야외운동 결과 카드/오버레이`를 별도 패턴으로 정의해야지,
현재 일반 카드 시스템에 흡수하면 계속 원본과 멀어진다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. 결과 card shell을 원본 기준 radius/padding/title weight로 복원
2. stats 영역을 wrapping grid가 아니라 compact metric strip으로 복원
3. 고도 그래프의 gradient/spacing/segment row 구조 복원
4. bottom CTA를 fixed action bar 패턴으로 복원
5. countdown/workout 패널을 white inline panel이 아니라 dark floating overlay로 복원
