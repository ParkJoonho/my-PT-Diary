# P-16 PT 수업일지 작성·수정 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 페이지는 [`exercise-form`](exercise-form.md)과 함께 기록 입력 계열의 핵심 기준
화면이다. 실제 코드 기준으로 보면 구조와 값이 거의 그대로 따라왔고, 차이는 주로

1. 상단 chrome에서의 패럴랙스 제거
2. 아이콘 소스 차이
3. 일부 입력 높이와 카드 내부 gap의 미세 조정

에 몰려 있다.

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
PtLessonFormScreen
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

구조만 보면 거의 1:1이다. 이 페이지는 “현재 `ai-pt`가 전반적으로 다르다”는 문제의
대표 사례가 아니라, 오히려 원본 구조를 꽤 잘 유지한 편이다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 새 수업일지 작성 | 있음 | 있음 | 가능 | 거의 동일 |
| 기존 수업일지 수정 | 있음 | 있음 | 가능 | 거의 동일 |
| 부위/도구 선택 | 있음 | 있음 | 가능 | 동일 |
| 운동 종목 추가/삭제 | 있음 | 있음 | 가능 | 동일 |
| 세트 추가/삭제 | 있음 | 있음 | 가능 | 동일 |
| 저장 | 있음 | 있음 | 가능 | 거의 동일 |

## 실제 시각 규칙 대조

### 1. 상단 chrome

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| background chrome | `ParallaxBackground` 있음 | 없음 | 다름 |
| header bg | `white`, borderBottom `1`, horizontal `16`, vertical `12` | 동일 | 거의 일치 |
| title | `17` SemiBold | 동일 | 일치 |
| save action | `36x36`, radius `10`, accent fill | 동일 | 일치 |
| left/right action | icon affordance | icon affordance | 일치 |

header 자체는 현재 범위 밖이지만, 실제 코드상으로도 이 화면은 기존 기록 폼들보다
원본에 더 가깝다. 최소한 text button으로 무너진 상태는 아니다.

### 2. section / input system

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| content gap | `padding 14`, `gap 20` | `padding 14`, `gap 20`, bottom `32` | 거의 일치 |
| section gap | `10` | `10` | 일치 |
| label | `12` Medium | `12` Medium | 일치 |
| input shell | `inputBg`, border `1`, radius `10`, padding `12`, text `14` | 동일 + `minHeight 46` | 거의 일치 |
| textarea | minHeight `60` | minHeight `70` | 미세 차이 |
| chip shell | horizontal `14`, vertical `8`, radius `20` | 동일 | 일치 |

폼 입력 시스템은 거의 그대로다. 이 계열은 이미 원본에 맞는 primitive 후보로 볼 수
있다.

### 3. 운동 종목 editor card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| card shell | radius `12`, border `1`, padding `10`, gap `6` | radius `12`, border `1`, padding `12`, gap `8` | 거의 일치 |
| 운동명 input | `15` SemiBold | 동일 | 일치 |
| set row | gap `4` | gap `6` | 미세 차이 |
| set input | radius `8`, centered, paddingY `7` | 동일 + `minHeight 38` | 거의 일치 |
| mini field | label `10`, input `13`, radius `6` | 동일 | 일치 |
| metric text | `13` / accent `14` | `13` / accent color 유지 | 거의 일치 |

현재 구현은 값 일부를 조금 정리했지만, 원본 editor card의 성격은 유지하고 있다.

### 4. 액션 affordance

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 운동 추가 | add-circle icon | `CirclePlus` icon | 의미 동일 |
| 운동 삭제 | trash-outline icon | `Trash2` icon | 의미 동일 |
| 세트 삭제 | remove-circle-outline icon | `CircleMinus` icon | 의미 동일 |
| 세트 추가 | plus icon + text | plus icon + text | 동일 |

여기는 `exercise-form`보다도 원본 affordance 보존도가 높다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| PT/form input shell | primitive 후보 | 가능 | `exercise-form`, `condition-form`, 이 페이지가 같은 축을 공유함 |
| section title + gap system | primitive 후보 | 가능 | 원본과 현재가 안정적으로 일치 |
| chip selector | primitive 후보 | 가능 | 부위/도구 선택에서 반복됨 |
| nested exercise editor card | pattern 후보 | 가능 | 기록 입력 계열 핵심 반복 구조 |
| set table row + mini metric row | pattern 후보 | 가능 | 폼 내부에서 재사용성이 높음 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| `ParallaxBackground` 유무 | reject | 전역 기준 금지 | 헤더/앱 셸 범위와 섞이면 안 됨 |
| PT 전용 요약 계산 로직 | page-only | 시각 시스템 대상 아님 | 디자인 시스템이 아니라 도메인 동작임 |

## 시스템 관점 결론

이 페이지는 “원본을 정확하게 붙이기 위한 디자인 시스템” 관점에서 좋은 기준 화면이다.

이유는:

1. section rhythm이 안정적이고
2. input/chip/card primitive가 원본과 거의 같고
3. add/remove/set affordance도 icon 기반으로 유지됐기 때문이다.

즉 PT/운동 기록 작성 계열 공통화는 이 페이지와 [`exercise-form`](exercise-form.md)
을 묶어서

- form section rhythm
- input shell
- chip selector
- nested exercise editor card
- set row / mini metric row

를 공통 primitive/pattern으로 뽑는 방식이 맞다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. `exercise-form`과 함께 기록 입력 공통 form primitive 기준 화면으로 승격
2. textarea/card/set-row의 미세 값 차이는 공통 primitive 추출 시 하나로 정리 검토
3. PT 입력 계열은 현재 `ai-pt` 쪽이 이미 원본 충실도가 높으므로, 다른 입력 화면을 이
   패턴에 맞추는 방향이 적절
