# AI Hub 기능 분해

작성일자: 2026-07-28

## 1. 문서 목적

AI Hub 기능이 원본 앱에서 여러 화면과 API로 흩어져 있어, 마이그레이션 범위와 현재 구현 상태를 한 번에 이해하기 어렵다는 점을 해소하기 위해 기능 단위 문서 묶음으로 분해한다.

각 기능 문서는 원본 앱 `2026-07-13/my-PT-Diary`의 화면·서버 구현을 기준으로 기능을 분해하고, 현재 `ai-pt`에서 마이그레이션된 범위와 남은 제약을 함께 기록한다. QA 문서에서만 추가된 조건은 원본 스펙과 구분한다.

## 2. 관련 문서 목록

| 문서 | 다루는 범위 | 원본 진입점 / API | 원본 구현 판단 | 권장 구현 순서 |
| --- | --- | --- | --- | --- |
| [body-analysis.md](body-analysis.md) | 전신 사진 기반 체형 분석 본체 | `/ai-analysis`, `POST /api/ai/body-analysis` | 구현됨(결함 다수) | 1 |
| [analysis-history.md](analysis-history.md) | 분석 기록 저장, 이력 조회, 기록 비교 | `/analysis-history`, `GET /api/analysis-records`, `POST /api/analysis-records/compare` | 부분 구현 | 2 |
| [body-comparison.md](body-comparison.md) | 전·후 사진 직접 비교 | `/ai-analysis`, `POST /api/ai/body-comparison` | 구현됨(결함 일부 잔존) | 3 |
| [shoe-recommendation.md](shoe-recommendation.md) | 신발 밑창 기반 보행 분석·신발 추천 | `/ai-analysis` 내 선택 기능, AI Hub 카드 `/shoe-recommendation` | 부분 구현 | 4 |
| [meal-analysis.md](meal-analysis.md) | 식사 전·후 사진 분석, 식단 기록·일일 합계·AI 가이드 | `/meal-analysis`, 식단 분석·기록·가이드 API | 구현됨(가이드 계약 결함) | 5 |
| [my-body-style.md](my-body-style.md) | 나의 몸매 & 스타일, 몸매 예측, 스타일 추천 | `/my-body-style`, `POST /api/ai/predict-body`, `POST /api/ai/style-recommendation` | 구현됨(결함 다수) | 6 |

## 3. 범위 해석 기준

| 기준 | 해석 |
| --- | --- |
| 원본에서 구현된 기능 | 우선 마이그레이션 대상이다. |
| 원본에서 잘못 구현된 기능 | 마이그레이션하면서 수정 대상이다. |
| 원본에서 미구현된 기능 | 후순위다. |
| 같은 화면에 있어도 기능 목적이 다르면 | 문서를 분리한다. |

## 4. 현재 문서 분해 판단

| 항목 | 판단 근거 |
| --- | --- |
| `/ai-analysis`를 한 문서로 합치지 않은 이유 | 체형 분석 본체, 전후 비교, 신발 추천, 자세 분석이 한 화면에 섞여 있어 기능 판단이 어려워진다. |
| `analysis-history`를 분리한 이유 | 체형 분석 결과 저장과 재열람은 본체 분석과 구현 순서와 결함 포인트가 다르다. |
| `meal-analysis`를 분리한 이유 | 사진 분석뿐 아니라 별도 식단 기록 테이블, 일일 영양 합계, 저장 기록 기반 AI 가이드가 하나의 독립 흐름을 이룬다. |
| `my-body-style`를 분리한 이유 | 체형 분석 결과를 소비하는 후속 기능이며, 사용자 프로필/사진 저장 의존성이 추가된다. |
| `fitness-state`, `pose-analysis`를 이번 묶음에서 제외한 이유 | 체형 분석과 데이터 일부를 공유하지만, 별도 기능으로 다루는 편이 범위 통제가 쉽다. |

## 5. 현재 의사결정이 필요한 포인트

| ID | 항목 | 현재 판단 | 사용자 결정 필요 여부 |
| --- | --- | --- | --- |
| AIBODY-DEC-001 | 이번 배치에 `body-comparison`까지 포함할지 | 포함 완료 | 해소 |
| AIBODY-DEC-002 | `shoe-recommendation`를 체형 분석 배치에 같이 넣을지 | 원본 구현이지만 화면/라우트 구조가 뒤엉켜 후속 권장 | 필요 |
| AIBODY-DEC-003 | `my-body-style`를 체형 분석 묶음에 포함할지 | 원본 구현이지만 프로필/사진 저장 의존성 때문에 후속 권장 | 필요 |
