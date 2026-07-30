# P-17 트레이너 매칭 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

기존 `TabPageLayout`, 정렬, 카드, 상세 sheet 구조를 보존하면서 AI 추천
Suspense에 원본 전용 분석 loading card를 복원했다. Lucide로 대체돼 있던
star/heart/time/lightning/check 아이콘도 원본 path 기반 SVG로 정렬했다.

이 페이지는 전체 인상이 크게 무너진 화면은 아니다. 실제 코드 기준으로 보면

1. 정렬 드롭다운
2. 안내 문구
3. 트레이너 카드
4. 바텀시트 상세 모달

의 기본 구조와 값이 원본에 매우 가깝다. 차이는 주로 데이터 흐름 변화와 상태
표현 방식에 있다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/ai-trainer-match.tsx`](../../../../../2026-07-13/my-PT-Diary/app/ai-trainer-match.tsx)

### `ai-pt`

- 라우트: [`src/pages/ai-trainer-match.tsx`](../../../src/pages/ai-trainer-match.tsx)
- 화면: [`src/features/trainer-match/components/trainer-match-screen.tsx`](../../../src/features/trainer-match/components/trainer-match-screen.tsx)
- API: [`src/features/trainer-match/api/trainers.ts`](../../../src/features/trainer-match/api/trainers.ts)

## 렌더 트리 대조

```text
원본
AITrainerMatchScreen
├── ParallaxBackground
├── AppHeader
├── title row
│   ├── page title
│   └── sort dropdown
├── 안내 문구
├── AI loading card
├── trainer card list
└── trainer detail bottom sheet
```

```text
ai-pt
TabPageLayout(activeKey=pt-log)
└── TrainerMatchScreen
    ├── title row
    │   ├── page title
    │   └── sort dropdown
    ├── 안내 문구
    ├── catalog query Suspense
    ├── recommended query Suspense
    │   └── AI analysis loading card
    ├── trainer card list
    └── trainer detail bottom sheet
```

상단 앱 chrome은 범위 밖으로 보더라도, 본문 패턴 자체는 거의 동일하다. 현재 차이는
“다른 화면처럼 전반적으로 디자인이 달라졌다”기보다는 AI 로딩 상태와 연결 상태 표현이
달라진 쪽에 더 가깝다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본순 목록 | 있음 | 있음 | 가능 | 코드 기준 정렬 |
| 인기순 목록 | 있음 | 있음 | 가능 | 코드 기준 정렬 |
| AI 추천 로딩 | 별도 분석 card | Suspense 전용 분석 card | 가능 | 시각 정렬 |
| AI 추천 결과 | 있음 | 서버 추천 query | 가능 | 데이터 흐름 확장 |
| 트레이너 상세 모달 | 코드 존재하나 진입·style 결함 | 동작하는 bottom sheet | 부분 | 원본 버그 수정 |
| 좋아요 | 로컬 상태 | 서버 mutation | 가능 | 시각 정렬, 동작 확장 |
| 연결 요청 상태 | 없음 | 있음 | 부분 | 기존 서버 기능 유지 |

## 실제 시각 규칙 대조

### 1. title row / sort dropdown

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| title row | marginBottom `14`, 좌우 정렬 | 동일 | 일치 |
| page title | `17` Medium | `17` Medium | 일치 |
| sort button | card bg, radius `8`, padding `10/6`, shadow | 동일 | 일치 |
| dropdown | radius `10`, minWidth `130`, top `34` | 동일 | 일치 |
| chevron | 닫힘 down / 열림 up, `13` | 동일 semantic SVG | 일치 |
| active option | accent text + check `14` | 동일 원본 SVG | 일치 |
| pressed option | `inputBg` | 동일 | 일치 |

정렬 드롭다운은 사실상 그대로다. 이건 트레이너 페이지 전용이 아니라 list/filter
pattern의 기준 후보로 봐도 된다.

### 2. 안내 문구 / AI 설명 영역

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| row gap | `10` | `10` | 일치 |
| text | `13` Regular, lineHeight `20`, muted | 동일 | 일치 |
| icon 위치 | top offset 약 `3` | 동일 | 일치 |

설명 행의 톤도 거의 변하지 않았다.

### 3. 트레이너 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| card shell | radius `16`, padding `14`, shadow | 동일 | 일치 |
| avatar | `56x56`, radius `14` | 동일 | 일치 |
| name | `16` SemiBold | 동일 | 일치 |
| rating | star `12` + `13` SemiBold | 동일 SVG + text | 일치 |
| gym text | `12` Regular muted | 동일 | 일치 |
| specialty tag | inputBg, radius `6`, `8/3` | 동일 | 일치 |
| footer divider | top border `1`, paddingTop `10` | 동일 | 일치 |
| favorite | heart/heart-outline `20`, selected danger | 동일 SVG | 일치 |
| experience | time-outline `12` | 동일 SVG | 일치 |

카드 shell은 현재 구현이 원본과 매우 가깝다.

### 4. AI 추천 / 연결 상태 표현

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| AI 로딩 카드 | white, radius `14`, padding `32`, shadow, gap `10` | 동일 Suspense fallback | 일치 |
| 로딩 indicator | GOLD large | 동일 | 일치 |
| 로딩 문구 | `15` SemiBold + `13` Regular | 동일 | 일치 |
| 로딩 중 설명 | 숨김 | 숨김 | 일치 |
| match reason row | GOLD tint row, radius `8`, padding `9` | 동일 | 일치 |
| match icon | lightning-bolt `10` | 동일 SVG | 일치 |
| score chip | gold tint badge | 동일 | 일치 |
| 연결 상태 tag | 없음 | accentLight badge 추가 | 현재 전용 |
| CTA | `PT 신청하기` 버튼 | 동일 + pending/locked 상태 | 현재 확장 |

원본의 직접 `fetch` 기반 분석을 현재 Orval Suspense query로 되돌리지 않았다.
대신 실제 소비처 가까이의 `AsyncErrorBoundary + Suspense`는 유지하고 그 fallback만
원본 loading card로 맞췄다.

### 5. 상세 모달

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 원본 도달성 | 카드 prop으로 전달한 `onPress`를 소비하지 않음 | 카드 press로 sheet 열림 | 원본 버그 수정 |
| 원본 style | `modal*` style key를 참조하지만 StyleSheet에 정의 없음 | 명시된 sheet style | 원본 버그 수정 |
| presentation | 의도상 bottom sheet | 동작하는 bottom sheet | 의도 복원 |
| sheet shell | 의도된 top sheet 구조 | radius `22`, `20/12`, safe bottom + `24` | 버그 보완 |
| handle | 의도된 handle | `38 × 4` | 버그 보완 |
| close | close `22` | 동일 원본 SVG | 일치 |
| CTA button | `PT 신청하기` 의도 | accent `48` + 서버 상태 | 동작 확장 |

따라서 상세 sheet의 세부 StyleSheet 값은 원본의 “실제 값”으로 주장하지 않는다.
현재 값은 원본 JSX가 드러내는 bottom-sheet 의도와 이미 구현된 서버 연결 기능을
동작 가능하게 만든 버그 수정이다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| sort dropdown shell | pattern 후보 | 근거 확인 | 다른 정렬/필터 UI에도 재사용 가능 |
| profile list card shell | pattern 후보 | 근거 확인 | avatar + meta + footer 조합이 안정적 |
| bottom sheet detail shell | page-only | 공통 근거 부족 | 원본 style 정의가 누락돼 정확한 공통값을 추출할 수 없음 |
| small tag / badge system | primitive 후보 | 근거 확인 | specialty, cert, score chip에 공통 규칙 존재 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 연결 요청 상태 badge | page-only | 공통화 보류 | 현재 서버 기능 확장에 종속된 상태 표현 |
| AI 추천 loading card | page-only | 공통화 금지 | 분석 의미와 GOLD tone이 이 페이지에 종속 |

## 시스템 관점 결론

이 페이지는 “디자인 시스템이 전체적으로 달라졌다”는 문제의 핵심 원인 화면은 아니다.

오히려 실제 코드로 보면 카드와 드롭다운 pattern은 원본과 상당히 가깝다.
즉 이 화면에서 얻을 교훈은

- 새로운 공통 primitive를 크게 다시 만들 필요는 없고
- 이미 맞아 있는 shell은 보존하고
- 상태 표현만 페이지 전용으로 분리해야 한다
- 원본의 도달 불가 UI와 누락 StyleSheet는 그대로 복사하지 말고 명시적인 버그 수정으로
  기록해야 한다

는 쪽이다.

## 반영과 검증

- [`trainer-match-screen.tsx`](../../../src/features/trainer-match/components/trainer-match-screen.tsx)의 AI 추천 query에 원본 분석 loading card를 전용 Suspense fallback으로 반영했다.
- 로딩 동안 안내 문구를 숨기고, 추천 query 해결 후 카드 목록으로 전환하도록 상태를 정렬했다.
- sort up/down 및 active check, card star/heart/time/lightning, modal close를 원본 SVG 체계로 교체했다.
- 상세 sheet에 safe-area bottom 여백을 반영하고 원본의 카드 선택 handler/style 누락
  버그는 현재 동작 구현으로 유지했다.
- 연결 요청 badge와 pending/locked CTA는 이미 연결된 서버 계약이므로 페이지 전용
  확장으로 유지했다.
- `src/features/trainer-match` Jest `1` suite, `5` tests와 전체 TypeScript
  typecheck, `git diff --check`를 통과했다.

동일 상태의 원본·Apps in Toss 실행 캡처는 아직 남아 있으므로 `실기 검증`은
완료로 표시하지 않는다. 원본 상세 sheet는 실제 진입이 끊겨 직접 동일 상태를
촬영할 수 없다는 제한도 캡처 결과에 함께 남긴다.
