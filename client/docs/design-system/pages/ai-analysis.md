# P-18 AI 체형 분석 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

원본 실제 코드에 맞춰 고정 헤더, 안내 카드, 운동 데이터 배너, 사진 입력 카드, 다중
각도·전/후 비교 영역, 키·의료 입력, 분석·재시도 CTA를 반영했다. 원본 아이콘은
[`pt-diary-icons.tsx`](../../../src/shared/components/icons/pt-diary-icons.tsx)에 필요한
path를 추가해 사용했고, 이 페이지에만 존재하는 입력 조합은 feature 내부에 유지했다.

이 페이지는 길고 복잡하지만, 실제 코드 기준으로 보면 “토큰이 틀어져서 전반적으로 다른
화면”이라기보다

1. 원본의 거대한 단일 화면을 현재가 여러 컴포넌트로 분해했고
2. 현재 서버 API와 기록 저장 흐름을 연결했고
3. 원본의 실제 시각 규칙은 분해된 각 컴포넌트 안에 다시 정렬한

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
TabPageLayout(activeKey=null)
└── BodyAnalysisScreen
    ├── fixed header
    ├── ScrollView
    │   ├── info card
    │   ├── context banner
    │   ├── 전신 사진 card
    │   ├── 다중 각도 expandable card
    │   ├── 신발 사진 card
    │   ├── BodyComparisonSection
    │   ├── 키/의료 입력
    │   ├── analyze CTA
    │   └── 결과 컴포넌트
    │       ├── save banner
    │       ├── analyzedAt text
    │       ├── BodyAnalysisResultView
    │       └── retry CTA
    └── HomeTabBar
```

즉 현재는 원본을 기능별 subcomponent로 분해했고, 원본 한 화면에 섞여 있던 일부 보조
기능을 다른 흐름으로 이동시켰다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본 체형 분석 진입 | 있음 | 있음 | 가능 | 거의 동일 |
| 신발 분석 진입 | 있음 | 있음 | 가능 | 거의 동일 |
| 다중 각도 확장 | 있음 | 있음 | 가능 | 동일 |
| before/after 비교 | 있음 | 있음 | 가능 | 동일, feature component로 분리 |
| 자세 영상 분석 | 있음 | 없음 | 부분 | 기능 범위 차이 |
| 결과 표시 | 있음 | 있음 | 가능 | 구조 분해됨 |

## 실제 시각 규칙 대조

### 1. 상단 안내 / hero 영역

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| header title | `18` Medium | `18` Medium | 일치 |
| header | scroll 바깥, horizontal `16`, vertical `12` | 동일 | 일치 |
| info icon | wrapper 없는 `human-handsup 32` | 원본 SVG path `32` | 일치 |
| info card | radius `16`, padding `24`, border `1`, shadow 없음 | 동일 | 일치 |
| info title | `20` Medium | `20` Medium | 일치 |
| info desc | `14` Regular, lineHeight `22` | 동일 | 일치 |
| tip row | check-circle `16`, `13` Regular | 동일 | 일치 |

헤더는 스크롤 컨테이너 밖에 두어 원본처럼 고정하고, 하단은
`TabPageLayout`의 실제 inset을 전달한다.

### 2. 사진 업로드 section

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| section shell | H `16`, MB `16`, radius `16`, padding `16`, border `1`, shadow 없음 | 동일 | 일치 |
| section title | `15` Medium, icon `18` | 동일 | 일치 |
| preview image | radius `12`, 전신 `300`, 보조 `200` | 동일 | 일치 |
| action row | gap `12`, height `44`, radius `12` | 동일 | 일치 |
| optional item | input bg, padding/radius `12`, thumbnail `60×80` | 동일 | 일치 |

사진 입력 계열의 primitive는 대부분 유지됐다. 이 페이지가 전반적으로 달라 보이면,
그 원인은 색/간격보다 “무엇을 한 블록으로 묶었느냐” 쪽이다.

### 3. 보조 상태 패턴

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 운동 데이터 배너 | `#ECFDF5`, border `#A7F3D0`, fitness `18` | 동일 | 일치 |
| photo date badge | 전신 사진 preview 위 검은 배지 | 없음 | 다름 |
| shoe hint list | muted tip list | 동일 | 일치 |
| multi-view count badge | 있음 | 있음 | 일치 |
| 키 입력 | 일반 배경 위 label + `44` input + `cm` | 동일 | 일치 |
| medical input | bordered card, medical-bag `16`, textarea, warning | 동일 | 일치 |

운동 데이터 문구는 현재 서버가 실제 최근 운동 기록을 분석 입력에 포함하므로 유지하되,
현재 응답에 노출되지 않는 기록 건수를 만들어 표시하지 않았다. `photo date badge`는
서버 필드는 있지만 Granite 사진 선택 래퍼가 EXIF 촬영일을 주지 않아 코드 TODO로
남겼다.

### 4. analyze / retry CTA

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| analyze button | primary, height `52`, radius `14`, brain `20` | 동일 | 일치 |
| pending | spinner + `AI 분석 중...` | 동일 | 일치 |
| label size | `16` Medium | 동일 | 일치 |
| retry button | H `16`, MB `16`, height `48`, radius `12`, refresh `20` | 동일 | 일치 |

전/후 비교 CTA도 원본처럼 양쪽 사진이 있어야 활성화되고, 처리 중에는 아이콘 대신
spinner를 표시한다.

### 5. 전/후 비교

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| shell | photo section과 같은 border card | 동일 | 일치 |
| toggle | compare `18`, title `15` SemiBold, badge `20` | 동일 | 일치 |
| 선택 방식 | 갤러리 단일 선택 | 동일 | 일치 |
| image slot | dashed border `2`, height `140`, badge `24` | 동일 | 일치 |
| direction | arrow-forward `24` | 원본 SVG path `24` | 일치 |
| CTA | MT `14`, PV `14`, radius `14` | 동일 | 일치 |

### 6. 결과 영역

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

## 반영 결과

- [`ai-analysis.tsx`](../../../src/pages/ai-analysis.tsx)에 `TabPageLayout`을 적용하고
  원본 상세 route와 같은 비활성 탭 상태 및 하단 안전 여백을 연결했다.
- [`body-analysis-screen.tsx`](../../../src/features/body-analysis/components/body-analysis-screen.tsx)의
  고정 헤더와 입력 단계 전체를 원본 수치·아이콘·상태로 정렬했다.
- [`body-comparison-section.tsx`](../../../src/features/body-analysis/components/body-comparison-section.tsx)는
  현재에 추가됐던 카메라 선택을 제거하고 원본의 갤러리 단일 선택 구조로 복원했다.
- page-only 조합을 성급히 공통 컴포넌트로 올리지 않고, 탭 shell과 원본 icon registry만
  기존 공통 체계를 사용했다.
- [`body-analysis-screen.test.tsx`](../../../src/features/body-analysis/components/__tests__/body-analysis-screen.test.tsx)를
  추가했고 P-18 관련 8개 suite, 19개 test와 `tsc --noEmit`, `git diff --check`를
  통과했다.

## 남은 범위

1. 원본의 자세 영상 분석은 현재 API·화면에 없는 기능 범위 차이이므로 이번 디자인
   단위에서 임의 구현하지 않았다.
2. `photo date badge`는 picker가 EXIF 촬영일을 제공할 때 복원해야 한다.
3. AI 허브의 신발 카드도 원본에서는 같은 route로만 진입해 문맥이 소실되지만, 현재는
   entry store로 신발 모드와 해당 섹션 자동 이동을 보존한다. 이는 원본 진입 결함을
   보완한 동작이다.
4. 실제 기기 캡처 기반 동일 상태 검증은 아직 진행하지 않았다.
