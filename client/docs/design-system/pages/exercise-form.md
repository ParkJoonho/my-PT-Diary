# P-13 운동 기록 작성·수정 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 페이지는 기록 계열에서 원본에 가장 가까운 축 중 하나다. section 순서, 입력 필드 계열,
운동 종목 카드 구조가 대부분 유지돼 있다. 차이는 주로

1. 상단 chrome
2. add/remove affordance
3. 일부 액션 버튼의 icon → text 전환

에 몰려 있다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/exercise-form.tsx`](../../../../../2026-07-13/my-PT-Diary/app/exercise-form.tsx)

### `ai-pt`

- 라우트: [`src/pages/exercise-form.tsx`](../../../src/pages/exercise-form.tsx)
- 화면: [`src/features/workout-records/components/manual-workout-form-screen.tsx`](../../../src/features/workout-records/components/manual-workout-form-screen.tsx)
- form store: [`src/features/workout-records/stores/use-manual-workout-form-store.ts`](../../../src/features/workout-records/stores/use-manual-workout-form-store.ts)
- form lib: [`src/features/workout-records/lib/manual-workout-form.ts`](../../../src/features/workout-records/lib/manual-workout-form.ts)

## 렌더 트리 대조

```text
원본
ExerciseFormScreen
├── ParallaxBackground
├── icon header
│   ├── close icon
│   ├── title
│   └── accent save icon button
└── ScrollView
    ├── 기본 정보
    ├── 유산소
    ├── 컨디션 체크
    ├── 체성분
    ├── 식단 체크
    ├── 운동 종목
    │   ├── add icon
    │   ├── delete icons
    │   ├── set rows
    │   └── mini stats
    └── 하루 일과 보고
```

```text
ai-pt
ManualWorkoutFormScreen
├── text header
│   ├── 닫기
│   ├── title
│   └── 저장
└── ScrollView
    ├── 기본 정보
    ├── 유산소
    ├── 컨디션 체크
    ├── 체성분
    ├── 식단 체크
    ├── 운동 종목
    │   ├── 운동 추가 text action
    │   ├── 삭제 text actions
    │   ├── set rows
    │   └── mini stats
    └── 하루 일과 보고
```

폼의 본문 정보 구조는 거의 같고, 상단/액션 affordance만 상당 부분 텍스트화됐다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 새 기록 작성 | 있음 | 있음 | 가능 | 거의 동일 |
| 기존 기록 수정 | 있음 | 있음 | 가능 | 거의 동일 |
| 기본 정보 입력 | 있음 | 있음 | 가능 | 동일 |
| 유산소/체성분/식단 | 있음 | 있음 | 가능 | 동일 |
| 운동 종목 편집 | 있음 | 있음 | 가능 | 액션 affordance 다름 |
| 저장 | 있음 | 있음 | 가능 | header button 체계 다름 |

## 실제 시각 규칙 대조

### 1. 상단 chrome

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| background chrome | `ParallaxBackground` 있음 | 없음 | 다름 |
| header bg | white | `Colors.card`/white | 거의 일치 |
| title | `17` SemiBold | 동일 | 일치 |
| left action | close icon | `닫기` text | 다름 |
| right action | accent filled icon button | `저장` text | 다름 |
| save pending 표현 | pressed opacity 중심 | `저장 중` text | 다름 |

상단은 구조보다 affordance 감도가 달라졌다. 원본은 compact icon header이고, 현재는
일반 텍스트 header다.

### 2. section / input system

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| section gap | `10` | 동일 | 일치 |
| content gap | `20` | 동일 | 일치 |
| input label | `12` Medium | 동일 | 일치 |
| input shell | `inputBg`, border `1`, radius `10`, padding `12` | 동일 | 일치 |
| textarea | minHeight `100` | 동일 | 일치 |
| row gap | `10` | 동일 | 일치 |

폼 본체의 기본 입력 시스템은 사실상 그대로 유지됐다.

### 3. 운동 종목 card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| card shell | bordered card radius `12`, padding `10` | 동일 | 일치 |
| 운동명 input | `15` SemiBold | 동일 | 일치 |
| set header | `10` Medium muted | 동일 | 일치 |
| set input | radius `8`, centered, bordered | 동일 | 일치 |
| footer mini fields | 동일 계열 | 동일 | 일치 |
| 총 볼륨 helper | `12` Regular muted | 동일 | 일치 |

여기는 원본 재현도가 높다. 기록 폼 공통화 기준은 이 페이지에서 뽑는 게 맞다.

### 4. 액션 affordance

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 운동 추가 | add-circle icon | `운동 추가` text | 다름 |
| 운동 삭제 | trash icon | `삭제` text | 다름 |
| 세트 삭제 | remove-circle-outline icon | `삭제` text | 다름 |
| 세트 추가 | plus icon + text | text만 | 다름 |

현재는 동작은 같지만, 원본보다 훨씬 문서형/관리형 폼처럼 보인다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| form input shell | primitive 후보 | 가능 | 기록/컨디션/PT 폼 계열에 공통 적용 가능 |
| section title + gap system | primitive 후보 | 가능 | 현재와 원본이 모두 안정적 |
| exercise card shell | pattern 후보 | 가능 | 반복 구조가 명확함 |
| mini field / mini stat row | pattern 후보 | 가능 | 폼 내부 반복성이 높음 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 현재 text-only header actions | reject | 기준 header action 금지 | 원본은 icon affordance 중심 |
| 현재 text-only add/remove actions | reject | 전역 destructive/add 규칙 금지 | 원본 affordance와 다름 |

## 시스템 관점 결론

이 페이지는 기록 계열 design system의 기준을 세우기 좋은 화면이다.

왜냐하면:

1. section 구조가 안정적이고
2. input shell이 원본과 거의 같고
3. exercise editor card도 대부분 유지돼 있기 때문이다.

즉 기록/컨디션/PT 작성 화면 공통화는 이 페이지에서

- form section rhythm
- input shell
- nested card editor
- mini stat row

를 뽑아가는 방식이 맞다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. form section/input/exercise card shell은 공통 form primitive 후보로 승격
2. 상단 save/close affordance는 원본 icon 기준으로 복원 검토
3. add/remove/set-delete 액션 affordance를 원본 icon 기반으로 복원
