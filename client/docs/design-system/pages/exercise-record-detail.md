# P-12 운동 기록 상세 화면 점검

## 점검 상태

- 원본 실제 코드: 대응 범위 판정 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 페이지는 원본 앱에 독립 라우트가 없다. 원본 기록 흐름은

1. `exercise-list` 목록 카드
2. `exercise-form` 편집 화면

으로 이어질 뿐, 현재 `ai-pt`처럼 별도의 상세 보기 화면을 두지 않는다.

그래서 이 페이지는 “원본에 맞는 디자인 시스템”의 기준점으로 쓰면 안 된다. 오히려
현재 앱이 편의상 만든 보조 화면으로 분리해서 봐야 한다.

## 실제 코드 경로

### 원본

- 직접 대응 라우트 없음
- 목록 흐름: [`app/exercise-list.tsx`](../../../../../2026-07-13/my-PT-Diary/app/exercise-list.tsx)
- 편집 흐름: [`app/exercise-form.tsx`](../../../../../2026-07-13/my-PT-Diary/app/exercise-form.tsx)

### `ai-pt`

- 라우트: [`src/pages/exercise-record-detail.tsx`](../../../src/pages/exercise-record-detail.tsx)
- 화면: [`src/features/workout-records/components/workout-record-detail-screen.tsx`](../../../src/features/workout-records/components/workout-record-detail-screen.tsx)

## 렌더 트리 대조

```text
원본
ExerciseListScreen
└── card press -> ExerciseForm(edit)
    ├── 기본 정보
    ├── 유산소
    ├── 컨디션 체크
    ├── 체성분
    ├── 식단 체크
    ├── 운동 종목
    └── 하루 일과 보고
```

```text
ai-pt
WorkoutRecordDetailScreen
├── in-page header
├── hero summary card
├── metric grid
├── 근력 운동 section
├── 루틴 항목 section
├── 체성분 section
├── 컨디션 체크 section
├── 식단 체크 section
├── 하루 일과 보고 section
└── 삭제 버튼
```

현재 화면은 원본 `exercise-form`의 정보를 “읽기 전용 카드 묶음”으로 재조합한 형태에
가깝다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 목록 진입 | 목록 카드 → 편집 | 목록 카드 → 상세 | 가능 | 흐름 다름 |
| 기록 요약 | 목록 카드 요약만 | hero + metric grid | 가능 | 현재에만 있음 |
| 세부 데이터 읽기 | 편집 폼 내부에서 확인 | 별도 상세 screen | 가능 | 현재에만 있음 |
| 수정 진입 | 바로 edit form | 상세 화면에서 수정 버튼 | 가능 | 흐름 다름 |
| 삭제 | 목록 long press / 편집 흐름 | 상세 하단 삭제 버튼 | 가능 | 흐름 다름 |

## 실제 시각 규칙 대조

### 1. 기준성 평가

| 항목 | 판정 | 이유 |
|---|---|---|
| root screen structure | 기준 불가 | 원본 독립 화면이 없음 |
| hero card | 기준 불가 | 원본에 없음 |
| metric grid | 기준 불가 | 원본에 없음 |
| section card 묶음 | 부분 비교 가능 | `exercise-form` section 구조를 읽기용으로 변환한 것 |

### 2. 현재 `ai-pt` 화면 자체의 성격

| 영역 | 현재 실제 값 | 판단 |
|---|---|---|
| hero | card border + radius `12` + accent kind label + big title | 현재 앱 전용 요약 카드 |
| metric grid | wrap grid + small cards radius `10` | 현재 앱 전용 overview pattern |
| section shell | bordered card radius `12` | form-derived read-only section |
| delete button | outlined danger button | 현재 앱 전용 destructive footer |

현재 페이지에서 반복되는 것은 “원본 primitive”가 아니라 `ai-pt`가 새로 만든
read-only detail pattern이다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| read-only detail section shell | pattern 후보 | 보류 | 원본 기준이 아니라 현재 앱 편의 패턴이기 때문 |
| metric overview tile | pattern 후보 | 보류 | 원본 마이그레이션 우선순위와 무관 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| hero card | reject | 원본 기준 시스템 금지 | 원본 앱에 없음 |
| metric grid | reject | 전역 summary tile 금지 | 원본 기록 흐름에 없음 |
| 상세 삭제 footer | reject | 원본 기준 destructive pattern 금지 | 원본에서 이 위치에 존재하지 않음 |

## 시스템 관점 결론

이 페이지에서 중요한 건 “뭘 고쳐야 하나”보다 “뭘 기준으로 삼으면 안 되나”다.

원본 UX 충실 마이그레이션 관점에서 보면:

1. 이 화면은 원본 등가 화면이 아니다.
2. 그래서 여기서 예뻐 보이거나 정리된 패턴을 전역 디자인 시스템으로 올리면 안 된다.
3. 원본 기준 시스템은 `exercise-list`와 `exercise-form`에서 추출해야 한다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. 이 페이지의 shell/hero/metric grid는 원본 기준 공통 패턴에서 제외
2. 기록 계열 공통화는 `exercise-list`, `exercise-form`, `condition-list`, `condition-form` 기준으로 진행
3. 이 화면은 필요하면 추후 “현재 앱 전용 상세 패턴”으로 별도 문서군으로 분리 검토
