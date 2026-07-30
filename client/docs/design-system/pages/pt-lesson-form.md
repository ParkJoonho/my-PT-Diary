# P-16 PT 수업일지 작성·수정 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

이 페이지는 [`exercise-form`](exercise-form.md)과 함께 기록 입력 계열의 핵심 기준
화면이다. 서버 CRUD와 PT 계산 로직은 유지하고, Lucide 대체 아이콘과 입력·운동
카드의 미세 값을 원본 실제 코드로 정렬했다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/pt-lesson-form.tsx`](../../../../../2026-07-13/my-PT-Diary/app/pt-lesson-form.tsx)

### `ai-pt`

- 라우트: [`src/pages/pt-lesson-form.tsx`](../../../src/pages/pt-lesson-form.tsx)
- 화면: [`src/features/pt-logs/components/pt-lesson-form-screen.tsx`](../../../src/features/pt-logs/components/pt-lesson-form-screen.tsx)
- 옵션 데이터: [`src/features/pt-logs/data/pt-log-options.ts`](../../../src/features/pt-logs/data/pt-log-options.ts)
- form 계산 로직: [`src/features/pt-logs/lib/pt-lesson-form.ts`](../../../src/features/pt-logs/lib/pt-lesson-form.ts)

## 렌더 트리 대조

```text
원본
PTLessonFormScreen
├── ParallaxBackground
├── icon header
│   ├── close icon
│   ├── title
│   └── accent save icon button
└── ScrollView
    ├── 기본 정보
    ├── 운동 부위
    ├── 사용 도구
    ├── 웜업
    ├── 운동 종목
    │   ├── add icon
    │   ├── delete icons
    │   ├── set rows
    │   └── mini stats
    └── 오늘의 한마디
```

```text
ai-pt
TabPageLayout(activeKey=null)
└── PtLessonFormScreen
    ├── edit query SuspenseSection
    └── KeyboardAvoidingView
        ├── icon header
        │   ├── close icon
        │   ├── title
        │   └── accent save icon / pending spinner
        └── ScrollView
            ├── 기본 정보
            ├── 운동 부위
            ├── 사용 도구
            ├── 웜업
            ├── 운동 종목
            │   ├── add/delete icons
            │   ├── set rows
            │   └── mini stats
            └── 오늘의 한마디
```

수정 조회는 Orval이 생성한 Suspense query를 사용하고, 경계는 수정 데이터를
소비하는 `EditPtLessonForm` 가까이에 유지했다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 새 수업일지 작성 | 있음 | 있음 | 가능 | 코드 기준 정렬 |
| 기존 수업일지 수정 | 있음 | 있음 | 가능 | Suspense + 서버 수정 유지 |
| 부위/도구 선택 | 있음 | 있음 | 가능 | 코드 기준 정렬 |
| 운동 종목 추가/삭제 | 있음 | 있음 | 가능 | 원본 SVG 정렬 |
| 세트 추가/삭제 | 있음 | 있음 | 가능 | 크기·disabled color 정렬 |
| 저장 | 있음 | 있음 | 가능 | icon / pending 상태 정렬 |

## 실제 시각 규칙 대조

### 1. 상단 chrome

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| background chrome | `ParallaxBackground` 있음 | 없음 | 다름 |
| header bg | `white`, borderBottom `1`, horizontal `16`, vertical `12` | 동일 | 일치 |
| title | `17` SemiBold | 동일 | 일치 |
| save action | `36x36`, radius `10`, accent fill | 동일 | 일치 |
| close/save icon | Ionicons `24` | 동일 path의 공통 SVG `24` | 일치 |
| pressed/pending | pressed opacity `0.7` | `0.7`, pending spinner | 서버 상태 확장 |

원본 global header의 safe-area 공간은 Apps in Toss 네이티브 상단 헤더 제외 정책에
따라 복제하지 않았다. 원본 사용자 체형 asset에 대응하는 현재 계정 필드가 없어
`ParallaxBackground`도 임의 이미지로 대체하지 않는다.

### 2. section / input system

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| content gap | `padding 14`, `gap 20` | 동일 | 일치 |
| content bottom | global tab·safe area 회피 | `TabPageLayout` 계산값 | 일치 |
| section gap | `10` | `10` | 일치 |
| label | `12` Medium | `12` Medium | 일치 |
| input shell | `inputBg`, border `1`, radius `10`, padding `12`, text `14` | 동일, 임의 minHeight 제거 | 일치 |
| textarea | minHeight `60` | 동일 | 일치 |
| chip shell | horizontal `14`, vertical `8`, radius `20` | 동일 | 일치 |

폼 입력 시스템은 거의 그대로다. 이 계열은 이미 원본에 맞는 primitive 후보로 볼 수
있다.

### 3. 운동 종목 editor card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| card shell | radius `12`, border `1`, padding `10`, gap `6` | 동일 | 일치 |
| 운동명 input | `15` SemiBold | 동일 | 일치 |
| set header/row | gap `4`, header top `2` | 동일 | 일치 |
| set input | radius `8`, centered, `2/7`, 임의 minHeight 없음 | 동일 | 일치 |
| first mini row | gap `6`, top border/padding `6` | 동일 | 일치 |
| second mini row | gap `6`, border/padding 없음 | 동일 | 일치 |
| mini field | label `10`, input `13`, radius `6`, `4/5` | 동일 | 일치 |
| metric text | normal `13` SemiBold, accent `14` Medium | 동일 | 일치 |

현재 구현은 값 일부를 조금 정리했지만, 원본 editor card의 성격은 유지하고 있다.

### 4. 액션 affordance

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 운동 추가 | add-circle `24` | 동일 SVG | 일치 |
| 운동 삭제 | trash-outline `18` | 동일 SVG | 일치 |
| 세트 삭제 | remove-circle-outline `20` | 동일 SVG | 일치 |
| 세트 추가 | add `16` + text | 동일 SVG + text | 일치 |

RIR 입력도 원본처럼 `number-pad`, placeholder `0`으로 복원했다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| PT/form input shell | primitive 후보 | 근거 확인 | `exercise-form`, `condition-form`, 이 페이지가 같은 축을 공유함 |
| section title + gap system | primitive 후보 | 근거 확인 | 원본과 현재가 안정적으로 일치 |
| chip selector | feature primitive | 유지 | PT 부위/도구에서 반복 |
| nested exercise editor card | pattern 후보 | 근거 확인 | `exercise-form`과 같은 원본 조립 규칙 |
| set table row + mini metric row | pattern 후보 | 근거 확인 | 두 기록 폼에서 반복 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 임의 `ParallaxBackground` | reject | 데이터 없는 창작 금지 | 현재 계정 API에 대응 asset 필드가 없음 |
| PT 전용 요약 계산 로직 | page-only | 시각 시스템 대상 아님 | 디자인 시스템이 아니라 도메인 동작임 |

## 시스템 관점 결론

PT/운동 기록 작성 계열 공통화는 이 페이지와 [`exercise-form`](exercise-form.md)을
묶어서

- form section rhythm
- input shell
- chip selector
- nested exercise editor card
- set row / mini metric row

를 공통 primitive/pattern으로 뽑는 방식이 맞다. 다만 두 feature의 폼 상태와
payload 계산은 서로 다른 도메인이므로 이번에는 수치와 공통 SVG registry만
정렬했다. 조립 컴포넌트 추출은 도메인 로직을 받지 않는 독립 API를 먼저 설계해야 한다.

## 반영과 검증

- [`pt-lesson-form.tsx`](../../../src/pages/pt-lesson-form.tsx)에 하단 탭·safe area 회피 shell을 적용했다.
- [`pt-lesson-form-screen.tsx`](../../../src/features/pt-logs/components/pt-lesson-form-screen.tsx)에 원본 KeyboardAvoiding 동작, icon header, pending spinner와 원본 content 값을 반영했다.
- Lucide 대체 아이콘을 공통 원본 SVG의 close/checkmark/addCircle/trashOutline/removeCircleOutline/add로 교체했다.
- input·textarea의 임의 minHeight를 제거하고 exercise card, set row, 두 metric row,
  RIR 키보드와 placeholder를 원본 값으로 맞췄다.
- `src/features/pt-logs` Jest `3` suites, `8` tests와 전체 TypeScript typecheck,
  `git diff --check`를 통과했다.

동일 상태의 원본·Apps in Toss 실행 캡처는 아직 남아 있으므로 `실기 검증`은
완료로 표시하지 않는다. 캡처에서는 작은 화면의 마지막 textarea가 하단 탭 위까지
스크롤되는지와 체형 배경 플랫폼 예외를 확인한다.
