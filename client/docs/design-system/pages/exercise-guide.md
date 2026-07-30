# P-09 운동배우기 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 페이지는 전체 레이아웃 틀은 비교적 원본을 따라왔지만, 일부 핵심 primitive를 더
단순하거나 다른 의미로 바꾸면서 톤이 달라졌다. 특히

1. 상단 타이틀/헤더 처리
2. 기구별 camera card
3. 기구별 filter 표현 방식
4. like affordance
5. 액션시트 톤

에서 차이가 크다.

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
│   ├── 부위별: 이미지/아이콘 필터
│   └── 기구별: camera card + 아이콘 필터
├── list card
│   └── routine cards
└── bottom action sheet
```

```text
ai-pt
ExerciseGuideScreen
├── in-page text header
├── segment tab
├── filter row
│   ├── 부위별: 이미지/All 필터
│   └── 기구별: accent camera card + 텍스트 필터
├── list card
│   └── guide cards
└── bottom modal sheet
```

구조는 비슷하지만, 현재는 원본의 “도구/아이콘/브랜드 밀도”를 줄이고 generic 텍스트 UI로
대체한 부분이 많다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 부위별 기본 목록 | 있음 | 있음 | 가능 | 전반 구조 유사 |
| 기구별 기본 목록 | 있음 | 있음 | 가능 | filter 표현 다름 |
| camera card 노출 | 있음 | 있음 | 가능 | 톤이 다름 |
| 목록 비어 있음 | icon + text empty | 텍스트 empty | 가능 | 현재가 축소됨 |
| like 토글 | local store | server mutation | 기능 비교 어려움 | 시각 affordance는 다름 |
| action sheet | 실제 촬영/앨범 진입형 레이아웃 | 준비중 alert modal | 가능 | 현재가 축소됨 |

## 실제 시각 규칙 대조

### 1. 상단 타이틀 구조

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 화면 진입 상단 | 앱 헤더 아래 title area | 닫기/제목/빈칸 header | 구조 다름 |
| title 크기 | `18`, Medium | `18`, SemiBold | 다름 |
| 상단 padding | safe area + `APP_HEADER_H` + title area `24` | container `paddingTop: 16` | 다름 |

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

### 3. 부위별 / 기구별 필터

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 부위별 icon tile | `44×44`, white, active accent border | 거의 동일 | 거의 일치 |
| 부위별 label | `11`, active accent | 동일 | 일치 |
| 기구별 filter | icon 기반 (`Ionicons`/`MaterialCommunityIcons`) | 텍스트 기반 | 다름 |
| 기구별 tile 내부 | icon 1개 | 텍스트 1개 | 다름 |
| 기구별 tile 아래 label | 1개 | 내부 텍스트와 외부 label가 중복 | 다름 |

현재 기구별 필터는 원본의 “아이콘 분류 UI”가 아니라 “텍스트가 안팎으로 반복되는 tile”
처럼 보이게 된다. 이건 페이지 전체 인상을 무겁고 덜 정돈되게 만드는 직접 원인이다.

### 4. camera card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 배경 | white | accent fill | 다름 |
| 아이콘 크기 | `20` | `24` | 다름 |
| 텍스트 | `15` Medium, dark text | `15` SemiBold, white text | 다름 |
| gap | `8` | `12` | 다름 |
| radius | `14` | `16` | 다름 |
| shadow | `iosShadowLight` | `iosShadow` | 다름 |

원본 camera card는 “보조 기능 entry card”이고, 현재는 메인 CTA처럼 강조돼 있다.
이 차이도 화면 전체를 더 공격적으로 보이게 만든다.

### 5. list card와 routine card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| list shell | white, radius `14`, `iosShadowLight` | `Colors.card`, radius `18`, shadow 없음 | 다름 |
| row padding | `24 / 16` | 동일 | 일치 |
| title | `15` Regular | 동일 | 일치 |
| meta | `13` Regular | 동일 | 일치 |
| body badge | `#F2F3F6`, radius `5` | 동일 | 일치 |
| like icon | heart image | text glyph `♥ / ♡` | 다름 |
| like 노출 | likes > 0일 때만 | 항상 버튼 렌더 | 다름 |

list 내부 row rhythm은 많이 맞췄지만, card shell과 like affordance가 달라서 결과적으로
“원본 느낌”은 약해진다.

### 6. empty state와 액션시트

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| empty state | search icon + text | title/subtitle 텍스트만 | 다름 |
| modal overlay | black `0.4` | black `0.2` | 다름 |
| modal container | white sheet | groupedBg sheet | 다름 |
| cancel card | 회색 배경 + dark text | white 배경 + blue text | 다름 |
| option text | `16` Medium | `16` Regular | 다름 |

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
| 현재 기구별 텍스트 filter tile | reject | 기준 filter 금지 | 원본은 아이콘 기반 |
| 현재 accent-filled camera card | reject | 기준 quick CTA 금지 | 원본은 neutral utility card |
| 현재 text-heart like button | reject | 전역 like affordance 금지 | 원본은 image heart + 조건부 노출 |
| 현재 modal cancel 스타일 | reject | 기준 action sheet 금지 | 원본과 감성이 다름 |

## 시스템 관점 결론

이 페이지는 “전체적으로 왜 달라졌는가”를 꽤 잘 보여준다.

원본은

1. neutral utility card
2. icon-heavy filter system
3. very light list shell
4. iOS-like action sheet

를 쓴다.

현재는

1. 강조된 accent card
2. text-heavy filter system
3. slightly heavier list shell
4. custom modal sheet

로 바뀌었다.

즉 앞으로 운동배우기 계열을 원본에 맞추려면, 지금의 generic card/filter/modal을 확장하는
방식보다 원본 기준

- `SegmentInsetTab`
- `IconFilterTile`
- `UtilityEntryCard`
- `IOSActionSheet`

패턴을 따로 정리하는 쪽이 맞다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. 기구별 filter를 원본의 icon tile 방식으로 복원
2. camera card를 accent CTA가 아니라 neutral utility card로 복원
3. list shell radius/shadow를 원본 기준으로 복원
4. like affordance를 원본 heart asset/노출 규칙 기준으로 재정의
5. action sheet overlay, cancel card, option typography를 원본 기준으로 복원
