# P-19 체형 분석 기록 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 일부 완료
- 동일 상태 실기 검증: 미진행

공통 icon 반영으로 기록 카드의 trailing chevron과 비교 section의 확장 chevron을
Ionicons 원본 path 기반 semantic icon으로 교체했다. 목록·상세 modal pattern의 공통
추출은 아직 남아 있다.

이 페이지도 실제 코드상으로는 원본과 상당히 가깝다. 전반 차이는 디자인 토큰보다는

1. 상세/비교 결과를 별도 컴포넌트로 분리한 점
2. 비교 가능 타입 판정 로직을 더 명시적으로 넣은 점
3. 카드 내부 요약 정보 배치를 조금 정리한 점

에 있다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/analysis-history.tsx`](../../../../../2026-07-13/my-PT-Diary/app/analysis-history.tsx)

### `ai-pt`

- 라우트: [`src/pages/analysis-history.tsx`](../../../src/pages/analysis-history.tsx)
- 화면: [`src/features/body-analysis/components/analysis-history-screen.tsx`](../../../src/features/body-analysis/components/analysis-history-screen.tsx)
- 비교 결과: [`src/features/body-analysis/components/analysis-record-comparison-result.tsx`](../../../src/features/body-analysis/components/analysis-record-comparison-result.tsx)
- 상세 본문: [`src/features/body-analysis/components/analysis-record-detail-content.tsx`](../../../src/features/body-analysis/components/analysis-record-detail-content.tsx)

## 렌더 트리 대조

```text
원본
AnalysisHistoryScreen
├── header
├── filter chip row
├── compare CTA
├── empty/loading state
├── comparison result block
├── record card list
└── detail modal
    └── type-specific detail sections
```

```text
ai-pt
AnalysisHistoryScreen
├── header
├── filter chip row
├── compare CTA
├── empty/loading state
├── comparison result block
├── record card list
└── detail modal
    └── AnalysisRecordDetailContent
```

구조적으로는 거의 동일하고, 현재 쪽이 record/detail/comparison을 역할별로 나눠 놓았다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 전체 필터 | 있음 | 있음 | 가능 | 동일 |
| 타입별 필터 | 있음 | 있음 | 가능 | 동일 |
| 선택 없음 | 있음 | 있음 | 가능 | 동일 |
| 2개 선택 후 비교 CTA | 있음 | 있음 | 가능 | 동일 |
| 비교 결과 표시 | 있음 | 있음 | 가능 | 구조 분리 |
| 상세 모달 | 있음 | 있음 | 가능 | 구조 분리 |

## 실제 시각 규칙 대조

### 1. header / filter row

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| header title | `18` Medium | `18` Medium | 일치 |
| filter row gap | `8` | `8` | 일치 |
| filter chip | radius `20`, border `1`, padding `16/8` | 동일 | 일치 |
| active chip | accent bg + white label | 동일 | 일치 |
| chip label | `13` SemiBold | 동일 | 일치 |

여기서도 filter chip shell은 안정적으로 재현돼 있다.

### 2. compare CTA / 힌트 문구

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| compare button | primary filled, radius `14`, minHeight `48` | 동일 | 일치 |
| compare label | `15` Medium/SemiBold | 거의 동일 | 거의 일치 |
| select hint | centered muted text `13` | 동일 | 일치 |
| close comparison button | bordered neutral CTA | 동일 | 일치 |

비교 액션 계열도 원본과 아주 가깝다.

### 3. record card

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| card shell | radius `14`, border `1~1.5`, padding `16` | 동일 | 일치 |
| selected state | accent tint + accent border | 동일 | 일치 |
| checkbox | `22x22`, border `2` | 동일 | 일치 |
| type/date row | 동일 구조 | 동일 구조 | 일치 |
| summary | `13` Regular, lineHeight `20` | 동일 | 일치 |
| mini score row | centered mini items | 동일 | 일치 |

기록 카드도 거의 그대로다. 현재는 타입별 요약 추출을 helper로 정리했을 뿐 시각 패턴은
유지됐다.

### 4. 비교 결과 / 상세 모달

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| comparison header | 아이콘 + `18`급 title | 동일 | 일치 |
| result cards | rounded card stack | 동일 계열 | 거의 일치 |
| detail modal | slide modal | slide modal | 일치 |
| detail header | close + centered title/date | 동일 | 일치 |
| detail content | type-specific section cards | 동일 계열 | 구조 분리 |

차이는 “어떤 파일에 있느냐”지, 결과 패턴의 톤은 크게 변하지 않았다.

### 5. 상태 차이

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 비교 가능 타입 | 사용자가 선택 가능 | helper로 explicit 판정 | 현재 명시적 |
| body-comparison 카드 | 원본 중심 타입 3종 위주 | 현재 body-comparison 대응 추가 | 현재 확장 |
| empty state | 아이콘 + 안내문 | 동일 계열 | 거의 일치 |

이건 디자인 drift라기보다 도메인 상태 정리다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| filter chip row | pattern 후보 | 가능 | 기록/분석 목록류에 반복 가능 |
| selectable summary card | pattern 후보 | 가능 | checkbox + summary + chevron 구조가 안정적 |
| compare CTA shell | primitive 후보 | 가능 | 비교 기능이 있는 목록류에 재사용 가능 |
| slide detail modal shell | pattern 후보 | 가능 | close / centered title / content scroll 구조가 반복 가능 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 분석 타입별 요약 추출 규칙 | page-only | 시각 시스템 아님 | 데이터 해석 로직에 가까움 |
| body / posture / state-vector 점수 의미 | page-only | 공통화 금지 | 도메인별 의미가 다름 |

## 시스템 관점 결론

이 페이지는 현재 `ai-pt`의 본문 디자인 시스템이 원본에서 크게 벗어난 사례가 아니다.

오히려 여기서 확인되는 건, 현재가

- filter chip
- selectable summary card
- compare CTA
- detail modal shell

같은 반복 패턴을 꽤 잘 유지하고 있다는 점이다.

즉 분석 기록 계열은 새로 디자인 시스템을 발명할 게 아니라, 이미 맞아 있는 shell을
공통 패턴으로 추출하는 쪽이 더 중요하다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. filter chip row / selectable record card / detail modal shell을 공통 후보로 정리
2. 분석 타입별 summary mapping은 디자인 시스템이 아니라 presentation helper 층으로 유지
3. 현재 추가된 `body-comparison` 타입 대응은 전역 규칙으로 올리지 말고 분석 도메인 확장으로 분리 기록
