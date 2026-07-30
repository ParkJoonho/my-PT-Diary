# P-18 AI 체형 분석 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 페이지는 길고 복잡하지만, 실제 코드 기준으로 보면 “토큰이 틀어져서 전반적으로 다른
화면”이라기보다

1. 원본의 거대한 단일 화면을 현재가 여러 컴포넌트로 분해했고
2. 일부 기능 상태를 분리하거나 축소했고
3. 그 과정에서 몇몇 보조 패턴이 사라진

케이스에 가깝다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/ai-analysis.tsx`](../../../../../2026-07-13/my-PT-Diary/app/ai-analysis.tsx)

### `ai-pt`

- 라우트: [`src/pages/ai-analysis.tsx`](../../../src/pages/ai-analysis.tsx)
- 진입 화면: [`src/features/body-analysis/components/body-analysis-screen.tsx`](../../../src/features/body-analysis/components/body-analysis-screen.tsx)
- 결과 화면: [`src/features/body-analysis/components/body-analysis-result.tsx`](../../../src/features/body-analysis/components/body-analysis-result.tsx)
- 비교 섹션: [`src/features/body-analysis/components/body-comparison-section.tsx`](../../../src/features/body-analysis/components/body-comparison-section.tsx)
- 저장 배너: [`src/features/body-analysis/components/analysis-record-save-banner.tsx`](../../../src/features/body-analysis/components/analysis-record-save-banner.tsx)

## 렌더 트리 대조

```text
원본
AIAnalysisScreen
├── ParallaxBackground
├── header
├── info card
├── 운동 데이터 배너
├── 전신 사진 card
├── 다중 각도 사진 card
├── 신발 사진 card
├── 영상/자세 분석 영역
├── before/after 비교 영역
├── 입력 영역
├── analyze CTA
└── 결과 card 들
    ├── body type
    ├── ratio
    ├── posture
    ├── gait
    ├── prediction
    └── recommendation
```

```text
ai-pt
BodyAnalysisScreen
├── header
├── info card
├── context banner
├── 전신 사진 card
├── 다중 각도 expandable card
├── 신발 사진 card
├── body comparison section
├── 키/의료 입력 card
├── analyze CTA
└── 결과 컴포넌트
    ├── save banner
    ├── analyzedAt text
    ├── BodyAnalysisResultView
    └── retry CTA
```

즉 현재는 원본을 기능별 subcomponent로 분해했고, 원본 한 화면에 섞여 있던 일부 보조
기능을 다른 흐름으로 이동시켰다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본 체형 분석 진입 | 있음 | 있음 | 가능 | 거의 동일 |
| 신발 분석 진입 | 있음 | 있음 | 가능 | 거의 동일 |
| 다중 각도 확장 | 있음 | 있음 | 가능 | 동일 |
| before/after 비교 | 있음 | 있음 | 가능 | 현재는 별도 section으로 정리 |
| 자세 영상 분석 | 있음 | 없음 | 부분 | 기능 범위 차이 |
| 결과 표시 | 있음 | 있음 | 가능 | 구조 분해됨 |

## 실제 시각 규칙 대조

### 1. 상단 안내 / hero 영역

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| header title | `18` Medium | `18` Medium | 일치 |
| info card | radius `16`, padding `24`, bordered | radius `16`, padding `24`, bordered + shadow | 거의 일치 |
| info title | `20` Medium | `20` Medium | 일치 |
| info desc | `14` Regular, lineHeight `22` | 동일 | 일치 |
| tip row | `13` Regular 계열 | 동일 | 일치 |

기본 hero/info card는 현재도 원본 감도를 잘 유지한다.

### 2. 사진 업로드 section

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| section shell | card bg, radius `16`, padding `16`, border `1` | 동일 + shadow | 거의 일치 |
| section title | `15~16` Medium | `16` SemiBold 중심 | 거의 일치 |
| preview image | rounded preview | rounded preview | 일치 |
| action row | dual button row | dual button row | 일치 |
| optional item | 개별 사진 card 반복 | 개별 사진 card 반복 | 일치 |

사진 입력 계열의 primitive는 대부분 유지됐다. 이 페이지가 전반적으로 달라 보이면,
그 원인은 색/간격보다 “무엇을 한 블록으로 묶었느냐” 쪽이다.

### 3. 보조 상태 패턴

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 운동 데이터 배너 | green bordered banner | green tint context banner | 거의 일치 |
| photo date badge | 전신 사진 preview 위 검은 배지 | 없음 | 다름 |
| shoe hint list | muted tip list | 동일 | 일치 |
| multi-view count badge | 있음 | 있음 | 일치 |
| medical warning | warning box | warning box | 일치 |

여기서 실제로 빠진 건 `photo date badge`와 일부 특수 상태다. 이건 토큰 불일치보다
picker 래퍼 제약과 기능 이동의 영향이 더 크다.

### 4. analyze / retry CTA

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| analyze button | primary filled, height `52`, radius `14` | accent filled, minHeight `56`, radius `16` | 비슷하나 다름 |
| label size | `16` Medium | `16` SemiBold | 약간 다름 |
| retry button | outline accent CTA | outline accent CTA | 일치 |

대표 CTA는 현재가 조금 더 둥글고 강하게 보이지만, 완전히 다른 패턴은 아니다.

### 5. 결과 영역

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 결과 card 체계 | monolithic file 내부 여러 section card | `BodyAnalysisResultView` 내부 section card | 구조 분해만 됨 |
| body/gait/prediction section | card + title + score/row 패턴 | 동일 계열 | 거의 일치 |
| save state | 원본은 저장 흐름 inline | 현재는 별도 save banner | 현재 정리형 |

결과 화면도 본질적으로는 같은 card system 위에 있다. 차이는 조직화 방식이다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| info hero card | pattern 후보 | 가능 | AI 계열 첫 진입 설명 블록으로 재사용 가능 |
| photo upload section shell | pattern 후보 | 가능 | 사진 기반 분석 기능 전반에서 반복 가능 |
| dual action row | primitive 후보 | 가능 | 카메라/앨범 선택 affordance가 반복됨 |
| warning / context banner | primitive 후보 | 가능 | 성공/주의 문맥 배너로 재사용 가능 |
| analysis result section card | pattern 후보 | 가능 | body/meal/report 계열 결과 묶음에서 유사 패턴 존재 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 자세 영상 분석 흐름 | reject | 현재 공통화 금지 | 현재 화면 범위와 원본 범위가 다름 |
| screenMode별 copy 묶음 | page-only | 과도한 공통화 금지 | body/shoe 진입 문맥이 강함 |
| photo date badge | 보류 | 기술 제약 영향 | picker 계층 확장 전 디자인 기준으로 확정하면 안 됨 |

## 시스템 관점 결론

이 페이지는 “디자인 시스템 값이 잘못돼서 전체적으로 다르다”기보다, 원본의 큰 화면을
현재가 더 명시적인 섹션들로 분해하면서 인상 차이가 생긴 케이스다.

따라서 여기서의 핵심은 새로운 색/폰트 토큰을 찾는 게 아니라

- info card
- photo section card
- dual image action row
- context/warning banner
- analysis result section card

같은 반복 패턴을 공통화하고, 기능 범위 차이에서 생긴 상태 블록은 페이지 전용으로
남겨두는 것이다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. AI 분석 계열 공통 primitive로 `info card`, `photo section`, `banner`, `result section` 정리
2. `photo date badge`는 디자인 수정이 아니라 picker 기능 확장 여부와 함께 판단
3. 자세 영상 분석처럼 원본에 있었지만 현재 화면에서 빠진 기능은 디자인 drift가 아니라 범위 drift로 분리 기록
