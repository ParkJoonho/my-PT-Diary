# P-13 운동 기록 작성·수정 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

section 순서와 기본 input system은 유지하고, 원본 icon header와 운동 종목 편집
affordance를 복원했다. 기존 문서에서 동일하다고 판단했던 운동 카드 내부 mini field,
footer 구분선, gap에도 실제 값 차이가 있어 함께 정렬했다.

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
TabPageLayout(activeKey=null)
└── ManualWorkoutFormScreen
    ├── edit query용 SuspenseSection
    └── icon header
        ├── close icon
        ├── title
        └── accent save icon button
    └── ScrollView
        ├── 기본 정보
        ├── 유산소
        ├── 컨디션 체크
        ├── 체성분
        ├── 식단 체크
        ├── 운동 종목
        │   ├── add-circle icon
        │   ├── trash/remove-circle icons
        │   ├── set rows
        │   └── mini fields/stats
        └── 하루 일과 보고
```

작성은 query 없이 바로 렌더링하고, 수정 query의 Suspense 경계는 edit 소비처 바로
위에 유지한다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 새 기록 작성 | 있음 | 있음 | 가능 | 동일 구조 |
| 기존 기록 수정 | 있음 | 있음 | 가능 | 동일 구조 |
| 기본 정보 입력 | 있음 | 있음 | 가능 | 동일 |
| 유산소/체성분/식단 | 있음 | 있음 | 가능 | 동일 |
| 운동 종목 편집 | icon add/delete, set 추가/삭제 | 동일 | 가능 | 일치 |
| 저장 | accent icon button | accent icon button | 가능 | 일치 |
| 저장 중 | 별도 상태 없음 | 동일 위치 spinner + disabled | 부분 가능 | 현재 기능 보완 |

## 실제 시각 규칙 대조

### 1. 상단 chrome

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| background chrome | `ParallaxBackground` 있음 | 없음 | 다름 |
| header bg | white | white | 일치 |
| title | `17` SemiBold | 동일 | 일치 |
| left action | close icon `24` | 동일 SVG icon | 일치 |
| right action | accent `36×36`, radius `10`, check `24` | 동일 | 일치 |
| pressed opacity | `0.7` | `0.7` | 일치 |
| save pending 표현 | 별도 상태 없음 | button 내부 spinner | 현재 기능 보완 |

원본의 compact icon header를 복원했다. mutation pending 상태는 button의 위치와 크기를
유지한 채 spinner만 표시한다.

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
| card shell | bordered card radius `12`, padding `10`, gap `6` | 동일 | 일치 |
| 운동명 input | `15` SemiBold | 동일 | 일치 |
| set header | `10` Medium muted | 동일 | 일치 |
| set input | radius `8`, centered, bordered | 동일 | 일치 |
| 첫 footer | top border `1`, paddingTop `6`, gap `6` | 동일 | 일치 |
| 둘째 footer | 별도 row, gap `6` | 동일 | 일치 |
| mini input | radius `6`, `4/5`, centered, label `10` muted | 동일 | 일치 |
| mini stat | `13` SemiBold, volume만 `14` Medium accent | 동일 | 일치 |
| 전체 총 볼륨 helper | 없음 | 없음 | 일치 |

기존 현재 코드의 mini input은 radius `8`, `10/8`, label `11`이었고, 두 footer 모두
같은 padding을 사용했다. 실제 원본 값으로 정렬하고 현재에만 있던 전체 총 볼륨 문구는
제거했다.

### 4. 액션 affordance

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 운동 추가 | add-circle icon `24` | 동일 SVG icon | 일치 |
| 운동 삭제 | trash icon `18` | 동일 SVG icon | 일치 |
| 세트 header 마지막 칸 | 빈 공간 `22` | 빈 공간 `22` | 일치 |
| 세트 삭제 | remove-circle-outline `20`, 마지막 set muted | 동일 | 일치 |
| 세트 추가 | plus `16` + text | 동일 | 일치 |

모든 추가·삭제 동작은 기존 zustand form store에 그대로 연결했다.

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
| text-only header actions | reject | 기준 header action 금지 | icon header로 교체 완료 |
| text-only add/remove actions | reject | 전역 destructive/add 규칙 금지 | icon action으로 교체 완료 |

## 시스템 관점 결론

section rhythm과 input shell은 원본 및 현재 코드에서 안정적으로 반복되며, nested
exercise editor는 이 페이지 전용 pattern으로 유지했다. 조건/수업일지 form의 실제
구조는 각각 P-15, P-16에서 확인한 뒤에만 공통 form primitive로 올린다.

## 반영 결과

1. 선택 상태 없는 하단 탭 shell과 tab-safe scroll bottom inset 반영
2. 원본 close/check SVG 기반 icon header 복원
3. pending save는 동일 `36×36` button 내부 spinner로 표현
4. KeyboardAvoidingView의 iOS/기타 플랫폼 behavior 복원
5. add-circle, trash, remove-circle, plus action 복원
6. 세트 header의 text `삭제`를 원본 빈 `22` column으로 변경
7. exercise card gap, footer border/row, mini input/stat 값을 원본으로 정렬
8. 현재에만 있던 전체 총 볼륨 helper 제거
9. 원본 날짜 placeholder와 RIR number keyboard 복원
10. header/action/pending 상태를 고정하는 컴포넌트 테스트 추가

## 잔여 차이와 검증

- 원본 `ParallaxBackground`의 사용자 체형 이미지는 현재 account API 계약에 없어
  반영하지 않았다.
- 원본의 native scroll bottom은 safe area + `80`이고 현재도 tab `60` + 여유 `20`으로
  동일하다. web에서는 원본 `80`이 tab 아래로 가릴 수 있어 tab 높이 + `20`으로
  보정했다.
- 저장 validation과 Orval create/update mutation은 현재 서버 계약에 맞게 유지했다.
- Apps in Toss 동일 상태 실기 캡처는 아직 수행하지 않았다.
- `npm test -- --runInBand src/features/workout-records`: 6 suites, 16 tests 통과
- `npm run typecheck`: 통과
- `git diff --check`: 통과
