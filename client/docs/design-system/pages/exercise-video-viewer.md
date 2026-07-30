# P-10 운동 영상 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 페이지는 레이아웃 자체는 단순하지만, 현재 `ai-pt`가 원본의 정보 계층을 바꿔놓은
상태다. 원본은 `영상 → 제목/좋아요 → 장비 배지 → 타겟 근육 블록 → 운동 설명 블록`
순서인데, 현재는 `장비/타겟 근육`을 같은 배지 레벨로 올려서 의미가 섞였다.

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
ExerciseVideoViewerScreen
├── in-page header
├── video container
├── ScrollView
│   ├── title row
│   │   ├── guide title
│   │   └── text heart + count
│   ├── meta badge row
│   │   ├── equipment badge
│   │   └── target muscles badge
│   └── description info block
```

현재는 target muscles block이 사라졌고, 그 정보가 badge row로 승격됐다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본 영상 표시 | 있음 | 있음 | 가능 | 거의 동일 |
| 좋아요 0개 | heart만 표시, count 숨김 | count도 노출 | 가능 | 다름 |
| 좋아요 있음 | 있음 | 있음 | 가능 | affordance 다름 |
| 장비 정보 있음 | meta badge | badge | 가능 | 거의 유사 |
| 타겟 근육 정보 있음 | 별도 info block | meta badge | 가능 | 정보 계층 다름 |
| 설명 있음 | 별도 info block | 별도 info block | 가능 | 거의 유사 |
| route param 없음 | 별도 보호 없음 | empty fallback 있음 | 부분 가능 | 현재에만 추가 |

## 실제 시각 규칙 대조

### 1. 상단 구조

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 상단 배경 장식 | `ParallaxBackground` 있음 | 없음 | 다름 |
| in-page header | 없음 | `닫기 / 운동 영상` header | 다름 |
| container top spacing | safe area + 48 | `paddingTop: 16` header 후 content | 다름 |

현재는 원본의 배경 장식과 immersive top zone 대신, 일반 상세 화면 헤더를 넣었다.

### 2. 영상 영역과 제목 row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| video container | 16:9 black | 동일 계열 | 거의 일치 |
| title size | `22` Medium | `22` Medium | 일치 |
| like button padding | `4/8` | `0/4` 수준의 더 작은 클릭 영역 | 다름 |
| like icon | `Ionicons heart/heart-outline` | text glyph `♥/♡` | 다름 |
| like count 노출 | `> 0`일 때만 | 항상 텍스트 노출 | 다름 |

좋아요 affordance는 같은 기능이어도 현재 쪽이 원본보다 훨씬 저해상도처럼 보인다.

### 3. 메타 배지

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| equipment badge | icon + text badge | text badge | 다름 |
| badge bg | `#EEF2FF` | 동일 계열 | 거의 일치 |
| badge text | `13` Medium, primaryLight | 동일 | 일치 |
| target muscles 표현 | info block | same badge level | 다름 |

원본은 장비 정보만 badge에 두고, 타겟 근육은 설명형 block으로 분리했다. 현재는 이
계층이 무너져서 정보 위계가 평평해졌다.

### 4. info block

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| block shell | card, border, radius `12` | 동일 계열 | 거의 일치 |
| icon | body/document 아이콘 포함 | 없음 | 다름 |
| label | `12` SemiBold | 동일 | 거의 일치 |
| text | `14` Regular, lineHeight `22` | 동일 | 일치 |
| block 개수 | target muscles + description | description only | 다름 |

설명 block primitive는 거의 유지됐지만, 원본의 정보 블록 2개 중 1개가 빠졌다.

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
| 현재 text-heart like button | reject | 전역 like affordance 금지 | 원본은 icon 기반 |
| 현재 target muscles badge 처리 | reject | 정보 계층 규칙 금지 | 원본은 info block |
| 현재 in-page header | reject | 이 화면 기준 top chrome 금지 | 원본 구조와 다름 |

## 시스템 관점 결론

이 페이지는 token 미세조정보다 정보 위계를 원본으로 되돌리는 게 먼저다.

원본은

1. 장비는 badge
2. 타겟 근육은 설명 block
3. 설명은 별도 block

으로 계층을 나눈다.

현재는

1. 장비와 타겟 근육을 같은 badge level에 두고
2. 좋아요 affordance도 단순 text heart로 줄였다.

그래서 전체 화면이 “영상 상세 정보”보다 “간단한 텍스트 상세”처럼 보이게 된다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. like affordance를 원본 icon 기반으로 복원
2. target muscles를 badge가 아니라 별도 info block으로 복원
3. info block의 leading icon 유무를 원본 기준으로 복원
4. 상단 chrome은 별도 범위로 두되, 현재 header는 디자인 시스템 근거에서 제외
