# P-09 운동배우기 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

상단 title area, camera utility card, 목록 shell, like asset, empty state와 action sheet를
원본 실제 코드 기준으로 복원했다.

기존 문서에는 원본 기구별 탭이 icon filter를 렌더한다고 적혀 있었지만 실제 JSX를
재확인하면 `EQUIPMENT_TYPES`와 `FilterIcon`은 정의만 되고 소비되지 않는다. 원본
기구별 탭은 camera card와 전체 기구 목록만 렌더하므로 현재의 텍스트 기구 필터를
제거했다. 이 문서는 과거 판정보다 실제 렌더 코드를 우선해 정정했다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/exercise-guide.tsx`](../../../../../2026-07-13/my-PT-Diary/app/exercise-guide.tsx)
- root tab 높이 상수: [`components/GlobalTabBar.tsx`](../../../../../2026-07-13/my-PT-Diary/components/GlobalTabBar.tsx)
- 앱 헤더 상수: [`components/AppHeader.tsx`](../../../../../2026-07-13/my-PT-Diary/components/AppHeader.tsx)
- 좋아요 저장: [`lib/exerciseLikeStore.ts`](../../../../../2026-07-13/my-PT-Diary/lib/exerciseLikeStore.ts)

### `ai-pt`

- 라우트: [`src/pages/exercise-guide.tsx`](../../../src/pages/exercise-guide.tsx)
- 화면: [`src/features/exercise-guide/components/exercise-guide-screen.tsx`](../../../src/features/exercise-guide/components/exercise-guide-screen.tsx)
- 탭 selector: [`src/features/exercise-guide/components/exercise-guide-tab-selector.tsx`](../../../src/features/exercise-guide/components/exercise-guide-tab-selector.tsx)
- 필터 row: [`src/features/exercise-guide/components/exercise-guide-filter-row.tsx`](../../../src/features/exercise-guide/components/exercise-guide-filter-row.tsx)
- 리스트 카드: [`src/features/exercise-guide/components/exercise-guide-card.tsx`](../../../src/features/exercise-guide/components/exercise-guide-card.tsx)

## 렌더 트리 대조

```text
원본
ExerciseGuideScreen
├── AppHeader 영역(점검 제외)
├── title area
├── segment tab
├── filter row
│   └── 부위별: 이미지 필터
├── 기구별 camera utility card
├── list card
│   └── routine cards
└── bottom action sheet
```

```text
ai-pt
TabPageLayout
├── ExerciseGuideScreen
│   ├── title area
│   ├── segment tab
│   ├── 부위별 이미지/All 필터
│   ├── 기구별 camera utility card
│   ├── list card
│   │   └── guide cards
│   └── iOS-like bottom action sheet
└── MemberTabBar(선택 없음)
```

Apps in Toss 상단 헤더를 제외한 실제 렌더 구조를 원본과 맞췄다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 부위별 기본 목록 | 있음 | 있음 | 가능 | 전반 구조 유사 |
| 기구별 기본 목록 | 필터 없이 전체 표시 | 필터 없이 전체 표시 | 가능 | 일치 |
| camera card 노출 | 있음 | 동일 shell | 가능 | 일치 |
| 목록 비어 있음 | search icon + text | 같은 path SVG + text | 가능 | 일치 |
| like 토글 | local store | server mutation | 기능 비교 어려움 | 시각 affordance 일치 |
| action sheet | 두 option 모두 준비중 alert | 동일 | 가능 | 일치 |

## 실제 시각 규칙 대조

### 1. 상단 타이틀 구조

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 화면 진입 상단 | 앱 헤더 아래 title area | Apps in Toss 헤더 아래 title area | 플랫폼 제외 후 일치 |
| title 크기 | `18`, Medium | `18`, Medium | 일치 |
| title area | horizontal `16`, top `24`, bottom `0` | 동일 | 일치 |
| 하단 tab | 상세 route라 선택 없음 | `TabPageLayout activeKey={null}` | 일치 |

헤더는 범위 밖이지만, 현재는 원본의 title area를 in-page modal header로 바꿔서 상단
리듬이 다르다.

### 2. segment tab

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| container | `#EAEAEA`, radius `12`, padding `4` | 동일 | 일치 |
| tab radius | `10` | 동일 | 일치 |
| active shell | white + `iosShadowLight` | 동일 | 일치 |
| text | `15`, Medium / active SemiBold | 동일 | 일치 |

탭 selector는 거의 그대로 옮겨왔다. 이 페이지에서 문제의 중심은 탭이 아니다.

### 3. 부위별 필터와 기구별 실제 렌더

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 부위별 icon tile | `44×44`, white, active accent border | 동일 | 일치 |
| 부위별 label | `11`, active accent | 동일 | 일치 |
| 부위 item width | `52` | `52` | 일치 |
| 기구 filter 상수 | 정의됨 | 이관하지 않음 | 원본 미사용 코드 |
| 기구 filter 실제 JSX | 렌더되지 않음 | 렌더되지 않음 | 일치 |

원본의 미사용 `EQUIPMENT_TYPES` 선언을 실행 디자인의 근거로 오인하지 않는다.

### 4. camera card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 배경 | white | white | 일치 |
| 아이콘 크기 | `20` | `20` | 일치 |
| 텍스트 | `15` Medium, dark text | 동일 | 일치 |
| gap | `8` | `8` | 일치 |
| radius | `14` | `14` | 일치 |
| shadow | `iosShadowLight` | 동일 | 일치 |

원본 camera card는 “보조 기능 entry card”이고, 현재는 메인 CTA처럼 강조돼 있다.
이 차이도 화면 전체를 더 공격적으로 보이게 만든다.

### 5. list card와 routine card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| list shell | white, radius `14`, `iosShadowLight` | 동일 | 일치 |
| row padding | `24 / 16` | 동일 | 일치 |
| title | `15` Regular | 동일 | 일치 |
| meta | `13` Regular | 동일 | 일치 |
| body badge | `#F2F3F6`, radius `5` | 동일 | 일치 |
| like icon | heart PNG `16` | 원본과 hash가 같은 PNG `16` | 일치 |
| like 노출 | likes > 0일 때만 | `likeCount > 0`일 때만 | 일치 |
| like 저장 | local store | server mutation | 현재가 서버 연동으로 개선 |

list 내부 row rhythm은 많이 맞췄지만, card shell과 like affordance가 달라서 결과적으로
“원본 느낌”은 약해진다.

### 6. empty state와 액션시트

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| empty state | search icon `40` + text | 같은 path SVG `40` + text | 일치 |
| modal overlay | black `0.4` | black `0.4` | 일치 |
| modal container | white, horizontal `16`, top `12` | 동일 + safe area | 일치 |
| cancel card | `#F3F4F7`, radius `14`, dark text | 동일 | 일치 |
| option text | `16` Medium | `16` Medium | 일치 |
| handle | `36×4`, radius `2` | 동일 | 일치 |

원본 action sheet는 iOS 네이티브스러운 neutral 톤이고, 현재는 더 가벼운 커스텀 modal처럼
보인다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| segment tab selector | primitive 후보 | 가능 | 원본과 현재가 거의 동일 |
| body-part icon filter tile | primitive 후보 | 가능 | 부위 필터 계열은 안정적으로 맞아 있음 |
| list row content rhythm | pattern 후보 | 가능 | badge + title + meta + like row 구조가 반복 가능 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 기존 기구별 텍스트 filter tile | reject | 제거 완료 | 원본 실제 JSX에는 filter 없음 |
| 기존 accent-filled camera card | reject | 제거 완료 | 원본은 neutral utility card |
| 기존 text-heart like button | reject | 제거 완료 | 원본은 image heart + 조건부 노출 |
| 기존 modal cancel 스타일 | reject | 제거 완료 | 원본과 감성이 다름 |

## 시스템 관점 결론

원본의 neutral utility card, light list shell, 조건부 heart affordance, iOS-like action
sheet를 복원했다. segment tab과 body filter는 이미 일치해 유지했다.

## 반영

- [`src/features/exercise-guide/components/exercise-guide-screen.tsx`](../../../src/features/exercise-guide/components/exercise-guide-screen.tsx)에서
  임시 닫기 header를 제거하고 원본 title area, neutral camera card, empty state,
  action sheet 수치와 safe area를 복원했다.
- 원본 실제 JSX에 없는 기구별 filter를 제거하고 기구 catalog 전체를 표시한다. 현재의
  `filterEquipmentGuides` helper는 다른 소비 가능성을 위해 삭제하지 않았지만 이
  화면 디자인에는 사용하지 않는다.
- [`src/features/exercise-guide/components/exercise-guide-card.tsx`](../../../src/features/exercise-guide/components/exercise-guide-card.tsx)에서
  원본 heart PNG와 `likeCount > 0` 노출 조건을 복원하고 서버 mutation은 유지했다.
- [`src/features/exercise-guide/components/exercise-guide-filter-row.tsx`](../../../src/features/exercise-guide/components/exercise-guide-filter-row.tsx)는
  실제 소비 범위인 부위 이미지 필터만 소유하도록 정리하고 item width `52`를 복원했다.
- [`src/pages/exercise-guide.tsx`](../../../src/pages/exercise-guide.tsx)에
  `TabPageLayout`을 적용해 상세 route의 선택 없는 tab과 원본 web/native scroll
  bottom inset을 복원했다.

## 잔여 이슈

- 원본과 현재 모두 camera/gallery option은 실제 기구 판별 flow 대신 준비중 alert를
  표시한다. 플랫폼 이미지 선택과 기구 분석 API 계약이 정해져야 실제 기능을 연결할 수 있다.
- Apps in Toss 실기 환경에서 action sheet safe area와 하단 tab 중첩은 확인하지 못했다.

## 반영 검증

- exercise-guide 관련 Jest 5 suites, 14 tests 통과
- TypeScript `tsc --noEmit` 통과
- 변경 파일 Biome check 통과
- `git diff --check` 통과
