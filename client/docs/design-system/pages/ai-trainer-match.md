# P-17 트레이너 매칭 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

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
TrainerMatchScreen
├── title row
│   ├── page title
│   └── sort dropdown
├── 안내 문구
├── trainer card list
│   ├── 기본/인기 목록
│   └── AI 추천 목록
├── trainer detail bottom sheet
└── bottom tab
```

상단 앱 chrome은 범위 밖으로 보더라도, 본문 패턴 자체는 거의 동일하다. 현재 차이는
“다른 화면처럼 전반적으로 디자인이 달라졌다”기보다는 AI 로딩 상태와 연결 상태 표현이
달라진 쪽에 더 가깝다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본순 목록 | 있음 | 있음 | 가능 | 거의 동일 |
| 인기순 목록 | 있음 | 있음 | 가능 | 거의 동일 |
| AI 추천 상태 | 있음 | 있음 | 가능 | 흐름 차이 있음 |
| 트레이너 상세 모달 | 있음 | 있음 | 가능 | 거의 동일 |
| 좋아요 | 있음 | 있음 | 가능 | 동일 |
| 연결 요청 상태 | 없음 | 있음 | 부분 | 현재 전용 상태 추가 |

## 실제 시각 규칙 대조

### 1. title row / sort dropdown

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| title row | marginBottom `14`, 좌우 정렬 | 동일 | 일치 |
| page title | `17` Medium | `17` Medium | 일치 |
| sort button | card bg, radius `8`, padding `10/6`, shadow | 동일 | 일치 |
| dropdown | radius `10`, minWidth `130`, top `34` | 동일 | 일치 |
| active option | accent text + check icon | 동일 | 일치 |

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
| gym text | `12` Regular muted | 동일 | 일치 |
| specialty tag | inputBg, radius `6`, `8/3` | 동일 | 일치 |
| footer divider | top border `1`, paddingTop `10` | 동일 | 일치 |

카드 shell은 현재 구현이 원본과 매우 가깝다.

### 4. AI 추천 / 연결 상태 표현

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| AI 로딩 카드 | 별도 loading card 존재 | 별도 loading card 없음 | 다름 |
| match reason row | GOLD tint row, radius `8`, padding `9` | 동일 | 일치 |
| score chip | gold tint badge | 동일 | 일치 |
| 연결 상태 tag | 없음 | accentLight badge 추가 | 현재 전용 |
| CTA | `PT 신청하기` 버튼 | 동일 + pending/locked 상태 | 현재 확장 |

현재는 시각 시스템이 틀어진 게 아니라, 원본의 일회성 AI 분석 로딩 흐름이 서버 질의형
추천 리스트로 바뀌면서 상태 패턴이 바뀌었다.

### 5. 상세 모달

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| presentation | bottom sheet | bottom sheet | 일치 |
| sheet shell | top radius `22`, paddingX `20`, paddingTop `12` | 동일 | 일치 |
| handle | width `38`, height `4` | 동일 | 일치 |
| avatar/name/rating block | 동일 구조 | 동일 구조 | 일치 |
| section title | `14` SemiBold | 동일 | 일치 |
| CTA button | accent filled, minHeight `48` | 동일 | 일치 |

모달은 원본 재현도가 아주 높다.

## 공통화 판정

### 공통 영역으로 올릴 수 있는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| sort dropdown shell | pattern 후보 | 가능 | 다른 정렬/필터 UI에도 재사용 가능 |
| profile list card shell | pattern 후보 | 가능 | avatar + meta + footer 조합이 안정적 |
| bottom sheet detail shell | pattern 후보 | 가능 | handle, header, section spacing이 반복 가능 |
| small tag / badge system | primitive 후보 | 가능 | specialty, cert, score chip에 공통 규칙 존재 |

### 공통화하면 안 되는 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 연결 요청 상태 badge | page-only | 공통화 보류 | 현재 서버 기능 확장에 종속된 상태 표현 |
| AI 추천 로딩 흐름 | reject | 공통 시스템 아님 | 데이터 fetch 방식 변화로 인한 화면 상태 차이 |

## 시스템 관점 결론

이 페이지는 “디자인 시스템이 전체적으로 달라졌다”는 문제의 핵심 원인 화면은 아니다.

오히려 실제 코드로 보면, 카드/드롭다운/모달 같은 본문 pattern은 원본과 상당히 가깝다.
즉 이 화면에서 얻을 교훈은

- 새로운 공통 primitive를 크게 다시 만들 필요는 없고
- 이미 맞아 있는 shell은 보존하고
- 상태 표현만 페이지 전용으로 분리해야 한다

는 쪽이다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. sort dropdown / trainer card / modal shell은 현재 형태를 공통 후보로 유지
2. 원본 기준 fidelity를 더 높이려면 AI 추천 로딩 card 상태를 별도 재도입 검토
3. 연결 요청 상태 badge는 전역 card 규칙으로 올리지 말고 페이지 전용 예외로 유지
