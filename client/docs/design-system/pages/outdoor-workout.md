# P-07 야외운동 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

이 페이지의 핵심 차이는 색상 팔레트가 아니라 control primitive였다. 원본의
`회색 track + 흰 active segment` 구조, 카드·CTA 수치, 위치 SVG, 체형 분석 연동을
실제 코드 기준으로 복원했다.

원본 자체 앱 브랜드 헤더는 Apps in Toss 네이티브 상단 헤더 제외 규칙에 따라 이관하지
않았다. 반영 전 임시 텍스트 뒤로/닫기 헤더도 제거하고 페이지 본문 title을 복원했다.

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
TabPageLayout
├── OutdoorWorkoutScreen
│   ├── ScrollView
│   │   ├── page title "야외운동"
│   │   ├── location row + original SVG
│   │   └── control card
│   │       ├── 운동 선택 inset segmented control
│   │       ├── 거리 선택 inset segmented control
│   │       ├── iOS toggle row
│   │       ├── CTA
│   │       ├── divider
│   │       └── Suspense 체형 분석 tip
│   └── location unavailable / loading states
└── MemberTabBar
```

Apps in Toss 상단 헤더를 제외한 본문과 하단 tab 구조는 원본과 같은 밀도로 정렬했다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 위치 로딩 | 있음 | 있음 | 가능 | 거의 동일 |
| 위치 실패 | 있음 | 있음 | 가능 | 현재가 더 단순 |
| 기본 선택 상태 | 있음 | 있음 | 가능 | control primitive가 다름 |
| 자동 목적지 off | 있음 | 있음 | 가능 | subtitle tone만 다름 |
| 자동 목적지 on | 있음 | 있음 | 가능 | 거의 동일 |
| 체형 분석 데이터 없음 | 안내 + `/ai-analysis` 이동 | 동일 | 가능 | 일치 |
| 체형 분석 데이터 있음 | 개인화 문구 반영 | Suspense query 결과로 동일 문구 반영 | 가능 | 일치 |
| 코스 설계 중 | 있음 | 있음 | 가능 | 거의 동일 |

## 실제 시각 규칙 대조

### 1. 루트와 헤더

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 배경 | `#F4F5F7` | 동일 | 일치 |
| header 배경 | white | `Colors.card`(실질 white) | 거의 일치 |
| header 구조 | 로고형 branded header | Apps in Toss 네이티브 헤더 | 플랫폼 제외 |
| scroll 상단 | page title 별도 존재 | page title 별도 존재 | 일치 |
| scroll padding top | `24` | `24` | 일치 |
| 하단 tab | global member tab | `TabPageLayout` member tab | 일치 |
| 하단 여백 | web tab + `60`, native safe area + tab + `40` | 동일 계산 | 일치 |

원본 브랜드 헤더와 Apps in Toss 네이티브 헤더는 비교 대상에서 제외했다.

### 2. 위치 row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| leading icon | custom orange location svg | 같은 path SVG | 일치 |
| 위치명 | `14` Medium | `14` Medium | 일치 |
| reset chip | white pill, border, `10/5`, refresh `12` | 동일 | 일치 |
| row gap | `6` | `6` | 일치 |

위치 row는 정보 구조는 같지만 icon과 font weight가 달라져서 원본보다 조금 더 무겁게 보인다.

### 3. 메인 control card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 카드 radius | `16` | `16` | 일치 |
| 카드 padding | `16/24` | `16/24` | 일치 |
| 카드 shadow | `0,0 / 0.05 / radius 1` | 페이지 전용으로 동일 | 일치 |
| section label | `13` Medium, muted | 동일 | 일치 |
| divider | `#F0F2F5`, top `24`, horizontal `8` | 동일 | 일치 |

현재는 control card가 더 둥글고, section label이 더 크고 진하다. 이 조합이 원본보다
카드 자체를 더 “블록형”으로 느끼게 만든다.

### 4. 운동 선택 / 거리 선택 primitive

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 선택 방식 | grouped segmented control | grouped segmented control | 일치 |
| outer shell | `#F0F2F5`, radius `10`, padding `3`, height `44` | 동일 | 일치 |
| item base | 배경 없음, radius `8` | 동일 | 일치 |
| active item | white surface + `0,1 / 0.06 / radius 3` | 동일 | 일치 |
| text active | dark text | dark text | 일치 |
| item font | `14` SemiBold | `14` SemiBold | 일치 |

이 페이지의 가장 중요한 차이다. 원본은 “control inset” 느낌이고, 현재는 “필터 chip”
느낌이다. 앞으로 다른 페이지까지 맞추려면 segmented control primitive를 원본 기준으로
따로 만들어야지, 현재 chip primitive를 확장하면 계속 어긋난다.

### 5. 자동 목적지 toggle row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| iOS toggle 애니메이션 | 있음 | 동일 계열 | 거의 일치 |
| row gap | `12` | `12` | 일치 |
| title | `14` SemiBold | 유사 | 거의 일치 |
| subtitle 기본 | `12` Regular, muted | 유사 | 거의 일치 |
| subtitle active | accent | 동일 | 일치 |

toggle 자체는 큰 문제가 없다. 오히려 이 영역은 원본에 충실한 편이다.

### 6. CTA와 AI tip

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| CTA radius | `14` | `14` | 일치 |
| CTA height | `56` | `56` | 일치 |
| CTA text | `16` Medium | `16` Medium | 일치 |
| tip icon | custom orange svg | 같은 path의 `AIInfoIcon` | 일치 |
| tip link 행동 | 실제 `/ai-analysis` 이동 또는 체형 결과 반영 | 동일 | 일치 |
| personalized tip | 있음 | 최근 body 분석 record로 동일 문구 구성 | 일치 |

AI tip은 원본에서 “실제 다른 기능과 연결되는 cross-page card hint”인데, 현재는 단순
설명 블록으로 축소돼 있다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| iOS animated toggle | primitive 후보 | 가능 | 원본과 현재가 같은 구현을 유지 |
| inset segmented control | primitive 후보 | feature-local 유지 | P-07 안에서 두 번 반복되지만 다른 페이지 확인 전 전역 승격 보류 |
| location row + reset chip | pattern 후보 | 보류 | 결과 화면 P-08까지 확인 후 판단 |
| info tip row | pattern 후보 | 보류 | AI 안내 카드 계열로 반복되는지 추가 확인 필요 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 기존 `chip/chipActive` | reject | 제거 완료 | 원본은 segmented control 계열 |
| 기존 `controlCard radius 24` | reject | 제거 완료 | 원본과 시각 톤이 다름 |
| 기존 placeholder AI tip link | reject | 제거 완료 | 원본은 실제 연결/개인화 문구가 있음 |

## 시스템 관점 결론

이 페이지에서 임의로 재해석됐던 chip control을 제거하고 원본의 조밀한 inset control을
복원했다. body 분석 데이터는 기존 Orval Suspense query를 소비처인 tip 가까이에서
호출하며, 코스 생성 payload에도 실제 qualitative/quantitative data를 전달한다.

## 반영

- [`src/features/outdoor-workout/components/outdoor-workout-screen.tsx`](../../../src/features/outdoor-workout/components/outdoor-workout-screen.tsx)에서
  임시 텍스트 헤더를 제거하고 page title, 위치 SVG·refresh 아이콘, 원본형 inset
  segmented control, 카드·CTA·divider·toggle 수치를 복원했다.
- 같은 화면의 체형 tip에 기존
  [`useAnalysisRecords`](../../../src/features/body-analysis/api/analysis-records.ts)를
  Suspense 경계와 함께 연결했다. 분석이 없으면 `/ai-analysis`로 이동하고, 있으면
  원본 개인화 문구와 코스 생성 payload에 반영한다.
- [`src/pages/outdoor-workout.tsx`](../../../src/pages/outdoor-workout.tsx)에
  `TabPageLayout`을 적용해 web/native 하단 tab과 safe area 여백, 상세 tab 선택 없음
  상태를 복원했다.
- 화면 전용 control shadow는 전역 `iosShadow`로 뭉개지 않고 원본의 더 약한 값을
  페이지 안에 유지했다.

## 잔여 이슈

- 원본과 현재 모두 실제 도로 geometry가 아니라 반경 기반 목적지와 직선 보간점으로
  계획을 생성한다. 디자인 이관과 별개로 지도 라우팅 엔진이 필요한 기능 한계다.
- 위치 권한·실제 GPS와 Apps in Toss 하단 탭을 포함한 동일 상태 실기 캡처는 실행
  환경이 없어 진행하지 못했다.

## 반영 검증

- outdoor-workout 관련 Jest 3 suites, 8 tests 통과
- TypeScript `tsc --noEmit` 통과
- 변경 파일 Biome check 통과
- `git diff --check` 통과
