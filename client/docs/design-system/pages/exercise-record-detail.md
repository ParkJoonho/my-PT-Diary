# P-12 운동 기록 상세 화면 점검

## 점검 상태

- 원본 실제 코드: 대응 범위 판정 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

이 페이지는 원본 앱에 독립 라우트가 없다. 원본 기록 흐름은

1. `exercise-list` 목록 카드
2. `exercise-form` 편집 화면

으로 이어질 뿐, 현재 `ai-pt`처럼 별도의 상세 보기 화면을 두지 않는다.

그래서 이 페이지는 “원본에 맞는 디자인 시스템”의 기준점으로 쓰지 않는다. 현재 서버가
루틴 완료 기록을 수동 기록과 다른 불변 데이터로 보존하기 위해 필요한 보조 화면으로
분리하고, 페이지 전용 hero·metric 패턴은 공통화하지 않았다. 원본 전역 shell에
해당하는 하단 탭과 scroll 안전영역만 반영했다.

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
TabPageLayout(activeKey=null)
└── WorkoutRecordDetailScreen
    └── SuspenseSection
        ├── in-page header
        └── ScrollView
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
가깝다. query의 Suspense 경계는 상세 소비처 바로 위에 유지했다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 수동 기록 진입 | 목록 카드 → 편집 | 목록 카드 → 편집 | 가능 | P-11에서 정렬 완료 |
| 루틴 완료 진입 | 목록 카드 → 편집 | 목록 카드 → 읽기 전용 상세 | 부분 가능 | 서버 데이터 모델 예외 |
| 기록 요약 | 목록 카드 요약만 | hero + metric grid | 가능 | 현재에만 있음 |
| 세부 데이터 읽기 | 편집 폼 내부에서 확인 | 별도 상세 screen | 가능 | 현재에만 있음 |
| 수정 진입 | 바로 edit form | 수동 기록만 바로 edit form | 부분 가능 | 루틴 기록은 수정 불가 |
| 삭제 | 목록 long press / 편집 흐름 | 상세 하단 삭제 버튼 | 가능 | 흐름 다름 |
| route param 없음 | 별도 보호 없음 | shell 내부 empty fallback | 부분 가능 | 현재에만 추가 |

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
| bottom shell | 선택 없는 전역 하단 탭 | 원본 공통 shell 반영 |
| scroll bottom | tab height + `20` | 하단 탭에 본문이 가려지지 않도록 보정 |

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

원본은 active workout 완료 시 루틴 항목을 `PersonalExercise`로 변환해 수정 가능한
형태로 저장한다. 현재 서버는 `source: routine`과 원본 step 완료 상태를 별도로 보존하며
수동 운동 update API는 이 레코드를 수정할 수 없다. 따라서 화면만 원본 편집 폼처럼
만들어 저장 실패를 유발하지 않고, 읽기 전용 예외를 유지했다.

## 반영 결과

1. 상세 라우트를 선택 상태 없는 `TabPageLayout`으로 감싸 원본 전역 하단 탭 복원
2. empty fallback도 동일 shell 안에서 표시
3. ScrollView bottom inset에 탭 높이와 여유 공간 반영
4. 상세 query의 `SuspenseSection`을 소비처 가까이에 유지
5. hero, metric grid, 상세 삭제 footer를 원본 공통 pattern 후보에서 제외
6. 수동 기록은 P-11에서 원본처럼 상세를 거치지 않고 바로 form으로 진입하도록 유지

## 잔여 차이와 검증

- 루틴 완료 기록의 읽기 전용 상세는 현재 서버 데이터 모델을 위한 명시적 예외다.
- 페이지 전용 시각 요소는 직접 대응 원본이 없어 임의로 재디자인하지 않았다.
- 해당 요소의 유지 여부는 데이터 모델을 바꾸는 별도 제품 결정 없이는 확정할 수 없다.
- Apps in Toss 동일 상태 실기 캡처는 아직 수행하지 않았다.
- `npm test -- --runInBand src/features/workout-records`: 5 suites, 13 tests 통과
- `npm run typecheck`: 통과
- `git diff --check`: 통과
