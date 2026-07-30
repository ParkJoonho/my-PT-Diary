# P-01 홈 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

공통 반영으로 `TabPageLayout`의 탭·safe-area·본문 하단 계산을 적용하고, section/row
typography와 quick action·routine의 chevron/play를 semantic icon으로 교체했다. 이어
홈 전용 주간 배지 조건과 배치, 루틴 초기 접힘, 카드 밀도, segmented shadow,
아코디언 typography·간격·연결선을 원본 값으로 복원했다.

제공된 원본·현재 홈 캡처는 선택 탭, 루틴 확장 상태, 주간 데이터가 서로 달라 전체
화면 pixel 비교에는 사용할 수 없다. 코드와 캡처에서 동일 상태로 확인할 수 있는
영역만 판정했다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/(tabs)/index.tsx`](<../../../../../2026-07-13/my-PT-Diary/app/(tabs)/index.tsx>)
- root 탭 shell: [`components/GlobalTabBar.tsx`](../../../../../2026-07-13/my-PT-Diary/components/GlobalTabBar.tsx)
- SVG 아이콘: [`components/TabIcons.tsx`](../../../../../2026-07-13/my-PT-Diary/components/TabIcons.tsx)
- 색상·그림자: [`constants/colors.ts`](../../../../../2026-07-13/my-PT-Diary/constants/colors.ts)

원본 홈은 주간 트래커, 루틴 선택, 빠른 진입 카드의 렌더링과 StyleSheet를
`index.tsx` 한 파일에 직접 가지고 있다.

### `ai-pt`

- 라우트: [`src/pages/index.tsx`](../../../src/pages/index.tsx)
- 화면 조립: [`features/home/components/home-screen.tsx`](../../../src/features/home/components/home-screen.tsx)
- 주간 트래커: [`features/home/components/weekly-tracker-card.tsx`](../../../src/features/home/components/weekly-tracker-card.tsx)
- 루틴 선택: [`features/workout-routines/components/routine-card.tsx`](../../../src/features/workout-routines/components/routine-card.tsx)
- 루틴 아코디언: [`features/workout-routines/components/routine-accordion.tsx`](../../../src/features/workout-routines/components/routine-accordion.tsx)
- 빠른 진입 카드: [`features/home/components/quick-action-card.tsx`](../../../src/features/home/components/quick-action-card.tsx)
- 탭 shell: [`shared/components/tab-page-layout.tsx`](../../../src/shared/components/tab-page-layout.tsx)
- 하단 탭: [`shared/components/member-tab-bar.tsx`](../../../src/shared/components/member-tab-bar.tsx)

현재는 원본의 한 파일을 기능별 컴포넌트로 분리했지만, 각 컴포넌트의 StyleSheet가
원본 실효값을 모두 그대로 유지한 것은 아니다.

## 렌더 트리 대조

```text
원본
HomeScreen
├── AppHeader                     이번 점검 제외
├── ScrollView
│   ├── 주간 트래커
│   ├── 루틴 선택
│   ├── 야외운동 quick card
│   └── 운동배우기 quick card
└── GlobalMemberTabBar            app root에서 렌더링
```

```text
ai-pt
HomeScreen
├── ScrollView
│   ├── WeeklyTrackerSection
│   ├── RoutineCard
│   ├── QuickActionCard(outdoor)
│   └── QuickActionCard(guide)
└── MemberTabBar                  TabPageLayout에서 렌더링
```

본문의 큰 구성 순서는 유지됐다. 구조적인 공통 차이는 하단 탭의 소유 위치다. 자세한
판정은 [`공통 영역 F-03·F-05`](../common.md)를 따른다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 초기 루틴 | `AI추천`, 헬스장, 모두 접힘 | 동일 | 코드 비교 가능 | 반영 완료 |
| 주간 기록 없음 | 월·화를 강제로 완료 처리 | API 결과를 그대로 표시 | 아니오 | 원본의 mock성 로직과 현재 실제 데이터가 다름 |
| streak 0 | 배지를 렌더링하지 않음 | 동일 | 코드·테스트 비교 가능 | 반영 완료 |
| 주간 데이터 로딩 | 별도 주간 카드 loading 없음 | Suspense loading card | 아니오 | 현재에 새 상태 추가 |
| 주간 데이터 오류 | 별도 주간 카드 오류 없음 | error card | 아니오 | 현재에 새 상태 추가 |
| AI 루틴 로딩 | 전용 loading UI 존재 | mock routine을 즉시 표시 | 아니오 | 상태 모델이 다름 |
| AI 루틴 없음 | 전용 empty UI 존재 | mock routine을 즉시 표시 | 아니오 | 상태 모델이 다름 |
| AI 루틴 있음 | API 결과 | mock data | fixture 필요 | 동일 fixture 미확보 |
| 루틴 탭 전환 | AI·헬스장·크로스핏·홈트 | 동일 | 코드 비교 가능 | 큰 구조 동일 |
| 루틴 펼침 | 사용자 조작 후 펼침 | 동일 | 코드·테스트 비교 가능 | 반영 완료 |
| AI fitness score | 데이터가 있으면 주간 카드에 추가 | 미구현 | fixture 필요 | 원본 상태 누락 |

제공된 홈 캡처도 원본은 `헬스장` 탭의 접힌 상태, 현재는 `AI추천`의 펼친 상태라 루틴
영역의 밀도와 높이를 직접 비교할 수 없다.

## 실제 시각 규칙 대조

### 화면 루트

| property | 원본 | `ai-pt` | 판정 |
|---|---|---|---|
| 배경 | `#F4F5F7` | 동일 | 일치 |
| 좌우 padding | `16` | `16` | 일치 |
| 상단 padding | `16` | `16` | 일치 |
| 카드 사이 gap | `10` | `10` | 일치 |
| 하단 padding | native `120`, web `100` | 같은 최소값 + safe-area 보호 | 공통 반영 완료 |

하단 padding은 홈 전용 값으로 고치지 않고 공통 `TabPageLayout`에서 해결해야 한다.

### 주간 트래커

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| surface | 흰색, radius `16`, `iosShadow` | 동일 | 일치 |
| padding | 좌우 `16`, 상하 `24` | 동일 | 일치 |
| 내부 gap | `16` | `16` | 일치 |
| 제목 | `17`, Medium | 동일 | 등록 충돌을 제외하면 코드 일치 |
| 제목·배지 배치 | `flex-start`, `gap: 16` | 동일 | 일치 |
| streak 배지 | `height: 21`, radius `9`, 좌우 `8` | 동일 | 일치 |
| streak 표시 조건 | `streakCount > 0` | 동일 | 일치 |
| 요일 원 | `24 × 24`, radius `12` | 동일 | 일치 |
| 요일 텍스트 | `13`, Regular | 동일 | 일치 |
| 완료 아이콘 | 원본 `CheckIcon` | 같은 SVG path | 일치 |

카드 자체가 달라진 것이 아니라 header 정렬과 상태 조건이 달라졌다. 제공된 캡처의
배지가 원본에서는 제목 옆, 현재에서는 우측 끝에 있는 현상과 코드가 일치한다.

### 루틴 선택 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| surface | 흰색, radius `16`, `iosShadow` | 동일 | 일치 |
| padding | 가로 `16`, 세로 `24` | 동일 | 일치 |
| 자식 gap | `14` | 동일 | 일치 |
| 제목 | `17`, Medium | 동일 | 코드 일치 |
| 4개 탭 | 높이 `40`, indicator `2`, 글자 `15` | 동일 | 일치 |
| AI 설명 | gap `10`, 글자 `13/20` | 동일 | 일치 |
| 위치 segmented | 높이 `38`, radius `8`, padding `3` | 동일 | 일치 |
| 활성 segmented | 흰색과 radius `7`, 약한 shadow | 동일 | 일치 |

원본의 web `boxShadow`와 native shadow/elevation 분기를 그대로 적용했다.

### 루틴 아코디언

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 접힌 행 | 최소 높이 `56`, 좌우 `16`, 세로 `16` | 고정 높이 `56`, 좌우 `16` | 거의 동일 |
| 행 배경·radius | `#F0F2F5`, radius `8` | 동일 | 일치 |
| 행 제목 | `15`, Regular | 동일 | 일치 |
| chevron | Ionicons `20` | 동일 path의 semantic SVG `20` | 일치 |
| body padding | 좌우 `16`, 위 `14`, 아래 `16` | 동일 | 일치 |
| 휴식행 gap | `6` | 동일 | 일치 |
| 단계 연결선 | width `2`, 상하 margin `4`, minHeight `14` | 동일 | 일치 |
| 단계 간 padding | `32`, 마지막 `0` | 동일 | 일치 |
| 운동명 | `14`, SemiBold | 동일 | 일치 |
| 우측 상세 | `13`, SemiBold | 동일 | 일치 |
| tag | radius `100`, `11` Regular | 동일 | 일치 |
| 시작 버튼 간격 | `marginTop: 24` | 동일 | 일치 |
| 시작 아이콘 | Ionicons play `16` | 동일 path의 semantic SVG `16` | 일치 |

아코디언의 원본 실효값을 복원했다. React Native web·native에서 같은 path를 쓰도록
아이콘 구현만 semantic SVG primitive로 유지한다.

### 빠른 진입 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| surface | 흰색, radius `16`, `iosShadow` | 동일 | 일치 |
| padding | 좌우 `16`, 상하 `19` | 동일 | 일치 |
| 최소 높이 | `72` | `72` | 일치 |
| 요소 gap | `14` | `14` | 일치 |
| 이미지 | `34 × 34` | 동일 asset, 동일 크기 | 일치 |
| 제목 | `16`, Medium | 동일 | 코드 일치 |
| 설명 | `13`, Regular | 동일 | 일치 |
| chevron | Ionicons `20` | 동일 path의 semantic SVG `20` | 일치 |

`shoes.png`, `video.png`의 파일 hash도 원본과 동일하다.

## 공통화 판정

### 공통 영역으로 올릴 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| `TabPageLayout` | pattern | 공통 확정 | 5개 루트 탭이 같은 탭·safe area 책임을 가짐 |
| `MemberTabBar` | pattern | 공통 확정 | 원본 root 공통 컴포넌트이며 현재도 여러 화면에서 사용 |
| semantic chevron·play | icon primitive | 공통 확정 | 홈 안의 여러 pattern에서 같은 의미로 반복 |
| 현재 `Colors`와 shadow | foundation | 유지 확정 | 원본과 값이 동일 |

### 홈 pattern으로 유지할 항목

| 후보 | 현재 판정 | 다음 확인 |
|---|---|---|
| `WeeklyTrackerCard` | 홈 pattern | 다른 화면으로 일반화하지 않음 |
| `RoutineCard` | 홈 pattern | 루틴 관련 상세 화면에서 재사용 여부 확인 |
| `RoutineAccordion` | 운동 루틴 pattern | active-workout 및 trainer routine 실제 코드 확인 |
| `QuickActionCard` | row action card family 후보 | P-03 트레이너 연결, P-04 AI feature row까지 확인돼 공통 primitive 후보로 승격 |

### 아직 전역화하지 않을 항목

- 카드 radius `16`
- 카드 내부 padding `16` 또는 `24`
- 화면 좌우 padding `16`
- 섹션·카드 gap `10`, `14`, `16`
- `17`, `16`, `15`, `13` typography 역할

홈 내부에서는 반복되지만 다른 루트 페이지의 실제 코드 점검이 끝나지 않았다.
두 번째 페이지에서 같은 의미와 값이 확인될 때 공통 token 또는 primitive로 올린다.

## 반영 결과와 잔여 이슈

### 반영 완료

1. 공통 `TabPageLayout`과 safe-area 기반 bottom inset
2. 하단 탭의 원본 높이·가로 보정·letter spacing
3. 주간 streak 배치와 `streakCount > 0` 조건
4. 루틴의 초기·탭 전환·장소 전환 접힘 상태
5. 루틴 카드 세로 padding `24`, gap `14`
6. segmented 활성 surface의 원본 shadow
7. 아코디언 typography·간격·연결선
8. chevron·play semantic vector icon

### 잔여 이슈

1. 원본은 AI 루틴 API의 loading·empty·loaded 상태를 가지지만 현재 서버·Orval
   계약에는 대응 API가 없어 정적 mock 루틴을 표시한다. 디자인 값과 별개인 API
   마이그레이션 단위에서 계약을 먼저 확정해야 한다.
2. 원본의 `AI Fitness Score`는 데이터가 있을 때 주간 카드에 나타나지만 현재 대응
   API와 동일 fixture가 없다.
3. 동일 fixture로 Apps in Toss 실행 화면을 촬영할 수 없어 실기 검증은 아직
   완료로 표시하지 않는다.

## 코드 검증

- `WeeklyTrackerCard`: streak 0 비노출과 양수 배지 노출 컴포넌트 테스트 추가
- `RoutineCard`: 초기 접힘, 장소 전환 시 접힘, 펼친 루틴 시작 전달 테스트
- 변경 파일 Biome 검사 통과
- TypeScript `tsc --noEmit` 통과

## 실기 검증에 필요한 fixture

최소한 다음 세 상태를 동일 데이터로 만들어야 한다.

1. 주간 기록 0일, AI 루틴 접힘
2. 주간 기록 2일, 헬스장 일반 루틴 탭, 모든 항목 접힘
3. 주간 기록 2일, AI 헬스장 첫 루틴 펼침

각 상태에서 같은 viewport, 같은 스크롤 위치로 촬영하고 Apps in Toss 상단 헤더는
비교 범위에서 제외한다.
