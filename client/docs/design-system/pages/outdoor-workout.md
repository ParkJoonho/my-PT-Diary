# P-07 야외운동 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 페이지의 핵심 차이는 색상 팔레트가 아니라 control primitive다. 원본은 하나의 흰 카드
안에 `회색 track + 흰 active segment` 구조를 반복해서 쓰고, 현재 `ai-pt`는 이를
`개별 chip 카드 + accent active fill` 패턴으로 바꿨다. 그래서 기능은 비슷해도 전체
질감이 원본보다 더 “태그/필터 UI”처럼 보인다.

헤더도 원본은 자체 앱 브랜드형이고 현재는 텍스트 뒤로/닫기형이지만, 사용자 지시상
헤더 자체는 현재 수정 범위의 핵심이 아니므로 이 문서에서는 구조 차이로만 기록한다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/(tabs)/outdoor-workout.tsx`](<../../../../../2026-07-13/my-PT-Diary/app/(tabs)/outdoor-workout.tsx>)
- 색상: [`constants/colors.ts`](../../../../../2026-07-13/my-PT-Diary/constants/colors.ts)
- 앱 로고: [`components/AppLogo.tsx`](../../../../../2026-07-13/my-PT-Diary/components/AppLogo.tsx)

### `ai-pt`

- 라우트: [`src/pages/outdoor-workout.tsx`](../../../src/pages/outdoor-workout.tsx)
- 화면: [`src/features/outdoor-workout/components/outdoor-workout-screen.tsx`](../../../src/features/outdoor-workout/components/outdoor-workout-screen.tsx)
- 위치 헬퍼: [`src/features/outdoor-workout/lib/get-current-location.ts`](../../../src/features/outdoor-workout/lib/get-current-location.ts)
- 거리 계산: [`src/features/outdoor-workout/lib/calculate-distance.ts`](../../../src/features/outdoor-workout/lib/calculate-distance.ts)
- 계획 결과 store: [`src/features/outdoor-workout/stores/use-outdoor-workout-store.ts`](../../../src/features/outdoor-workout/stores/use-outdoor-workout-store.ts)

## 렌더 트리 대조

```text
원본
OutdoorWorkoutScreen
├── branded header
│   ├── back
│   ├── AppLogo + PT Diary
│   ├── heart / more / divider / close
├── ScrollView
│   ├── page title "야외운동"
│   ├── location row
│   └── control card
│       ├── 운동 선택 segmented control
│       ├── 거리 선택 segmented control
│       ├── iOS toggle row
│       ├── CTA
│       ├── divider
│       └── AI 체형 분석 tip
└── body analysis 연동 상태 반영
```

```text
ai-pt
OutdoorWorkoutScreen
├── text header
│   ├── 뒤로
│   ├── "야외운동"
│   └── 닫기
├── ScrollView
│   ├── location row
│   └── control card
│       ├── 운동 선택 chips
│       ├── 거리 선택 chips
│       ├── iOS toggle row
│       ├── CTA
│       ├── divider
│       └── static AI tip
└── location unavailable / loading states
```

원본은 branded header와 page title을 분리하고, 카드 내부는 segmented-control 계열로
밀도 있게 구성한다. 현재는 헤더와 카드 내부 선택 UI를 모두 generic하게 단순화했다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 위치 로딩 | 있음 | 있음 | 가능 | 거의 동일 |
| 위치 실패 | 있음 | 있음 | 가능 | 현재가 더 단순 |
| 기본 선택 상태 | 있음 | 있음 | 가능 | control primitive가 다름 |
| 자동 목적지 off | 있음 | 있음 | 가능 | subtitle tone만 다름 |
| 자동 목적지 on | 있음 | 있음 | 가능 | 거의 동일 |
| 체형 분석 데이터 없음 | 안내 + `/ai-analysis` 이동 | 안내 + 준비중 alert | 가능 | 현재가 축소됨 |
| 체형 분석 데이터 있음 | 개인화 문구 반영 | 해당 상태 없음 | 가능 | 현재에 없음 |
| 코스 설계 중 | 있음 | 있음 | 가능 | 거의 동일 |

## 실제 시각 규칙 대조

### 1. 루트와 헤더

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 배경 | `#F4F5F7` | 동일 | 일치 |
| header 배경 | white | `Colors.card`(실질 white) | 거의 일치 |
| header 구조 | 로고형 branded header | 텍스트 back/title/close | 구조 다름 |
| scroll 상단 | page title 별도 존재 | 별도 page title 없음 | 다름 |
| scroll padding top | `24` | title block이 없어서 상대적으로 더 바로 시작 | 다름 |

헤더는 수정 범위 밖이지만, 여기서도 현재가 원본의 page chrome을 generic modal header처럼
단순화한 것은 기록해둘 필요가 있다.

### 2. 위치 row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| leading icon | custom orange location svg | orange dot 문자 | 다름 |
| 위치명 | `14` Medium | `15` SemiBold | 다름 |
| reset chip | white pill, border, `10/5` or `10/6` | 거의 동일 | 거의 일치 |
| row margin | 카드 바깥 여백 있음 | scroll 내부 기본 배치 | 다름 |

위치 row는 정보 구조는 같지만 icon과 font weight가 달라져서 원본보다 조금 더 무겁게 보인다.

### 3. 메인 control card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 카드 radius | `16` | `24` | 다름 |
| 카드 padding | `16/24` | `18/20` | 다름 |
| 카드 shadow | 매우 약한 `iosShadow` | 동일 계열 | 거의 일치 |
| section label | `13` Medium, muted | `15` SemiBold, text color | 다름 |
| divider | `#F0F2F5`, top `24` | `Colors.divider`, top `20` | 다름 |

현재는 control card가 더 둥글고, section label이 더 크고 진하다. 이 조합이 원본보다
카드 자체를 더 “블록형”으로 느끼게 만든다.

### 4. 운동 선택 / 거리 선택 primitive

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 선택 방식 | grouped segmented control | 독립 chip list | 구조 다름 |
| outer shell | `#F0F2F5`, radius `10`, padding `3`, height `44` | 없음 | 다름 |
| item base | 배경 없음 | `surfaceMuted`, radius `14`, shadow | 다름 |
| active item | white surface + 약한 shadow | accent fill | 다름 |
| text active | dark text | white text | 다름 |
| item font | `14` SemiBold | `14` SemiBold | 일치 |

이 페이지의 가장 중요한 차이다. 원본은 “control inset” 느낌이고, 현재는 “필터 chip”
느낌이다. 앞으로 다른 페이지까지 맞추려면 segmented control primitive를 원본 기준으로
따로 만들어야지, 현재 chip primitive를 확장하면 계속 어긋난다.

### 5. 자동 목적지 toggle row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| iOS toggle 애니메이션 | 있음 | 동일 계열 | 거의 일치 |
| row gap | `12` | `14` | 다름 |
| title | `14` SemiBold | 유사 | 거의 일치 |
| subtitle 기본 | `12` Regular, muted | 유사 | 거의 일치 |
| subtitle active | accent | 동일 | 일치 |

toggle 자체는 큰 문제가 없다. 오히려 이 영역은 원본에 충실한 편이다.

### 6. CTA와 AI tip

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| CTA radius | `14` | `16` | 다름 |
| CTA height | `56` | `52` minHeight | 다름 |
| CTA text | `16` Medium | `15` SemiBold | 다름 |
| tip icon | custom orange svg | `AIInfoIcon` | 다름 |
| tip link 행동 | 실제 `/ai-analysis` 이동 또는 체형 결과 반영 | 준비중 alert | 다름 |
| personalized tip | 있음 | 없음 | 다름 |

AI tip은 원본에서 “실제 다른 기능과 연결되는 cross-page card hint”인데, 현재는 단순
설명 블록으로 축소돼 있다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| iOS animated toggle | primitive 후보 | 가능 | 원본과 현재 모두 비슷한 구현을 유지 |
| location row + reset chip | pattern 후보 | 보류 | 결과 화면 P-08까지 확인 후 판단 |
| info tip row | pattern 후보 | 보류 | AI 안내 카드 계열로 반복되는지 추가 확인 필요 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 현재 `chip/chipActive` | reject | 전역 선택 primitive 금지 | 원본은 segmented control 계열 |
| 현재 `controlCard radius 24` | reject | 기준 card shell 금지 | 원본과 시각 톤이 다름 |
| 현재 placeholder AI tip link | reject | 공통 CTA 규칙 금지 | 원본은 실제 연결/개인화 문구가 있음 |

## 시스템 관점 결론

이 페이지는 “왜 전체적으로 달라졌는가”에 대한 근거를 잘 보여준다.

원본은

1. 하나의 card 안에서
2. 회색 track 위에
3. 흰 active inset을 올리는
4. 조밀한 control system

을 반복한다.

현재는 이를

1. 개별 chip 카드
2. accent active fill
3. 더 큰 radius
4. 더 진한 section label

로 다시 해석했다.

즉 앞으로 원본에 맞추려면 `선택 chip`을 계속 재활용하는 게 아니라, 원본 계열의
`SegmentedInsetControl` primitive를 별도로 만들어야 한다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. 야외운동의 선택 UI를 현재 `chip` 계열이 아니라 원본형 `segmented inset control`로 재정의
2. control card radius/padding/section label 무게를 원본 값으로 복원
3. AI tip을 단순 설명 블록이 아니라 실제 연동 가능한 cross-page hint pattern으로 복원
4. 위치 row leading icon과 text weight를 원본 기준으로 정리
