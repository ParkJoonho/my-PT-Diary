# P-10 운동 영상 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

원본의 `영상 → 제목/좋아요 → 장비 배지 → 타겟 근육 블록 → 운동 설명 블록`
정보 계층을 복원했다. 원본에 없던 페이지 내부 임시 헤더와 text heart를 제거하고,
아이콘·간격·count 노출 조건까지 원본 실제 코드에 맞췄다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/exercise-video-viewer.tsx`](../../../../../2026-07-13/my-PT-Diary/app/exercise-video-viewer.tsx)
- 좋아요 저장: [`lib/exerciseLikeStore.ts`](../../../../../2026-07-13/my-PT-Diary/lib/exerciseLikeStore.ts)

### `ai-pt`

- 라우트: [`src/pages/exercise-video-viewer.tsx`](../../../src/pages/exercise-video-viewer.tsx)
- 화면: [`src/features/exercise-guide/components/exercise-video-viewer-screen.tsx`](../../../src/features/exercise-guide/components/exercise-video-viewer-screen.tsx)
- 유튜브 player: [`src/features/exercise-guide/components/youtube-video-player.tsx`](../../../src/features/exercise-guide/components/youtube-video-player.tsx)
- embed URL 변환: [`src/features/exercise-guide/lib/get-youtube-embed-url.ts`](../../../src/features/exercise-guide/lib/get-youtube-embed-url.ts)

## 렌더 트리 대조

```text
원본
ExerciseVideoViewerScreen
├── ParallaxBackground
├── video container
├── ScrollView
│   ├── title row
│   │   ├── exercise name
│   │   └── heart icon + count
│   ├── equipment badge row
│   ├── target muscles info block
│   └── description info block
```

```text
ai-pt
TabPageLayout(activeKey=null)
└── ExerciseVideoViewerScreen
    ├── video container
    └── ScrollView
        ├── title row
        │   ├── guide title
        │   └── heart icon + count
        ├── equipment badge row
        ├── target muscles info block
        └── description info block
```

현재도 원본과 같은 정보 계층으로 렌더링한다. 루트 탭이 아닌 상세 화면이므로 하단 탭의
선택 상태는 두지 않고, 하단 탭에 본문이 가려지지 않도록 shell 높이를 scroll inset에
포함했다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본 영상 표시 | 있음 | 있음 | 가능 | 동일 구조 |
| 좋아요 0개 | heart만 표시, count 숨김 | heart만 표시, count 숨김 | 가능 | 일치 |
| 좋아요 있음 | icon + count | icon + count | 가능 | 일치 |
| 장비 정보 있음 | icon + text badge | icon + text badge | 가능 | 일치 |
| 타겟 근육 정보 있음 | 별도 info block | 별도 info block | 가능 | 일치 |
| 설명 있음 | 별도 info block | 별도 info block | 가능 | 일치 |
| route param 없음 | 별도 보호 없음 | empty fallback 있음 | 부분 가능 | 현재에만 추가 |

## 실제 시각 규칙 대조

### 1. 상단 구조

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 상단 배경 장식 | `ParallaxBackground` 있음 | 없음 | 다름 |
| in-page header | 없음 | 없음 | 일치 |
| container top spacing | safe area + 48 | Apps in Toss native header 아래 본문 시작 | 플랫폼 예외 |

원본 `ParallaxBackground`가 사용하는 사용자 체형 이미지는 현재 account API 계약에
없어 임의 이미지로 대체하지 않았다. Apps in Toss 네이티브 상단 헤더는 이번 점검의
공통 제외 범위다.

### 2. 영상 영역과 제목 row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| video container | 16:9 black | 동일 계열 | 거의 일치 |
| title size | `22` Medium | `22` Medium | 일치 |
| like button padding | horizontal `4`, vertical `8` | 동일 | 일치 |
| like icon | `Ionicons heart/heart-outline`, `24` | 원본 SVG registry heart/heartOutline, `24` | 일치 |
| like count 노출 | `> 0`일 때만 | `> 0`일 때만 | 일치 |

현재는 원본과 같은 vector heart affordance를 사용하면서 서버 좋아요 mutation을
유지한다.

### 3. 메타 배지

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| equipment badge | barbell icon `14` + text badge | 동일 | 일치 |
| badge bg | `#EEF2FF` | 동일 계열 | 거의 일치 |
| badge text | `13` Medium, primaryLight | 동일 | 일치 |
| target muscles 표현 | info block | info block | 일치 |

장비 정보만 badge에 두고 타겟 근육은 설명형 block으로 분리한 원본 계층을 복원했다.

### 4. info block

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| block shell | card, border `1`, radius `12`, padding `14` | 동일 | 일치 |
| icon | body/document 아이콘 `16` 포함 | 동일 SVG 아이콘 포함 | 일치 |
| label | `12` SemiBold | 동일 | 일치 |
| text | `14` Regular, lineHeight `22` | 동일 | 일치 |
| block 개수 | target muscles + description | target muscles + description | 일치 |

두 정보 블록의 shell과 leading icon, label, 본문 위계를 모두 원본에 맞췄다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| video detail title row | pattern 후보 | 보류 | 다른 영상/미디어 상세 페이지 반복 여부 확인 필요 |
| bordered info block shell | primitive 후보 | 가능 | 설명성 정보 card 패턴으로 재사용 가능 |
| equipment meta badge | primitive 후보 | 가능 | badge shell 자체는 원본과 큰 차이 없음 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| text-heart like button | reject | 전역 like affordance 금지 | 제거하고 icon 기반으로 복원 |
| target muscles badge 처리 | reject | 정보 계층 규칙 금지 | 제거하고 info block으로 복원 |
| in-page header | reject | 이 화면 기준 top chrome 금지 | 제거 완료 |

## 시스템 관점 결론

원본의 badge와 설명 block 계층, vector icon affordance, 상태별 count 노출 조건을
복원했다. 유튜브 player의 `Referer` 전달은 시각 규칙을 바꾸지 않으면서 YouTube 오류
153을 피하기 위한 현재 앱의 기능 보완으로 유지했다.

## 반영 결과

1. 원본에 없는 페이지 내부 임시 header 제거
2. 좋아요를 원본 vector heart와 동일한 padding·count 조건으로 변경
3. 장비 배지에 barbell 아이콘 복원
4. 타겟 근육을 body 아이콘이 있는 별도 info block으로 복원
5. 설명 block에 document 아이콘을 추가하고 shell spacing 복원
6. 상세 화면의 하단 탭 선택을 해제하고 scroll bottom inset에 탭 높이 반영
7. 좋아요 0개·있음, 정보 블록 구조를 고정하는 컴포넌트 테스트 추가

## 잔여 차이와 검증

- 원본 `ParallaxBackground`는 현재 account API에 body/predicted body 이미지 계약이
  없어 반영하지 않았다. 계약 없이 장식 이미지를 추정하지 않는다.
- 원본은 전역 하단 탭을 표시하면서 scroll bottom에 safe area만 더해 콘텐츠가 가릴 수
  있다. 현재는 탭 높이도 더해 이 문제를 수정했다.
- Apps in Toss 네이티브 상단 헤더와 동일 상태 실기 캡처는 아직 수행하지 않았다.
- `npm test -- --runInBand src/features/exercise-guide`: 6 suites, 16 tests 통과
- `npm run typecheck`: 통과
- `git diff --check`: 통과
