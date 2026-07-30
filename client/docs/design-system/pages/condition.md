# P-05 내 정보 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 미진행
- 동일 상태 실기 검증: 미진행

이 화면은 다른 루트 탭과 달리 “원본을 스타일만 바꿔 옮긴 상태”가 아니다. 현재
`ai-pt`의 `/condition`은 원본의 프로필/로그아웃 페이지 대신, 사용자 키와 로컬
미리보기 상태를 보여주는 별도 페이지로 바뀌어 있다.

따라서 이 문서의 핵심 판정은 “어떤 카드 radius가 다른가”보다, 현재 페이지를 디자인
시스템의 근거로 쓰면 안 된다는 점을 명확히 남기는 데 있다.

## 실제 코드 경로

### 원본

- 라우트와 화면: [`app/(tabs)/condition.tsx`](<../../../../../2026-07-13/my-PT-Diary/app/(tabs)/condition.tsx>)
- 배경 컴포넌트: [`components/ParallaxBackground.tsx`](../../../../../2026-07-13/my-PT-Diary/components/ParallaxBackground.tsx)
- 인증 컨텍스트: [`lib/auth-context.tsx`](../../../../../2026-07-13/my-PT-Diary/lib/auth-context.tsx)
- root 탭 shell: [`components/GlobalTabBar.tsx`](../../../../../2026-07-13/my-PT-Diary/components/GlobalTabBar.tsx)
- 색상·그림자: [`constants/colors.ts`](../../../../../2026-07-13/my-PT-Diary/constants/colors.ts)

원본은 인증 사용자 정보(`name`, `email`)를 보여주는 단순 profile card와 logout button
으로 끝난다.

### `ai-pt`

- 라우트: [`src/pages/condition.tsx`](../../../src/pages/condition.tsx)
- 화면 조립: [`features/account/components/account-screen.tsx`](../../../src/features/account/components/account-screen.tsx)
- 배경 데코: [`features/account/components/account-background.tsx`](../../../src/features/account/components/account-background.tsx)
- 프로필 변환: [`features/account/lib/account-profile.ts`](../../../src/features/account/lib/account-profile.ts)
- 하단 탭: [`features/home/components/home-tab-bar.tsx`](../../../src/features/home/components/home-tab-bar.tsx)

현재는 Apps in Toss 사용자 계정 화면이 아니라, tracker user key와 로컬 미리보기 여부를
설명하는 진단성 페이지다.

## 렌더 트리 대조

```text
원본
ProfileScreen
├── ParallaxBackground                        body image 없으면 보통 null
├── AppHeader                                 이번 점검 제외
├── content
│   ├── profileCard
│   │   ├── avatar
│   │   └── name + email
│   └── logoutButton
└── GlobalMemberTabBar                        app root에서 렌더링
```

```text
ai-pt
AccountScreen
├── AccountBackground                         항상 decorative glow 렌더링
├── ScrollView
│   ├── titleBlock
│   │   ├── eyebrow
│   │   ├── title
│   │   └── subtitle
│   └── AccountProfileCard
│       ├── avatar
│       ├── displayName + previewBadge
│       ├── detailText
│       ├── helperText
│       └── userKeyPanel
└── HomeTabBar                                화면 내부에서 렌더링
```

원본의 핵심은 “짧은 프로필 + 로그아웃 액션”이고, 현재의 핵심은 “기술적 사용자 식별자
설명”이다. 두 페이지는 같은 정보 설계가 아니다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본 표시 | 사용자 이름 + 이메일 | 익명/미리보기 사용자 + 설명 + 사용자 키 | 아니오 | 정보 구조가 다름 |
| 개발 미리보기 상태 | 별도 없음 | `미리보기` badge 가능 | 아니오 | 현재 전용 상태 |
| 로그아웃 idle | logout button 표시 | 없음 | 아니오 | 기능 자체가 없음 |
| 로그아웃 진행 중 | 버튼 텍스트 `로그아웃 중…` | 없음 | 아니오 | 상태 자체가 없음 |
| 배경 데코 | body image 있을 때만 parallax | glow circle 3개 항상 표시 | 부분 가능 | 시각 구조가 다름 |
| 오류 상태 | 별도 없음 | Suspense error 추가 | 아니오 | 현재 전용 상태 |

제공된 캡처도 원본은 프로필 카드 + 로그아웃 버튼, 현재는 title block + user key panel을
보여주므로 같은 fixture로는 볼 수 없다.

## 실제 시각 규칙 대조

### 화면 루트

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 배경 | `Colors.background` | 동일 foundation + glow background | 부분 일치 |
| 상단 padding | `20` | `18` | 다름 |
| 좌우 padding | `16` | `16` | 일치 |
| 카드 간 gap | `12` | `16` | 다름 |
| 하단 padding | `GLOBAL_TAB_BAR_CONTENT_H + inset + 20` | `110 + inset` | 공통 shell 차이 |

배경 tone조차 현재는 원본보다 더 “연출된 페이지” 쪽으로 바뀌어 있다.

### 배경과 page title block

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| decorative background | `ParallaxBackground`, 사용자 body image 없으면 null | glow 3개를 항상 렌더링 | 다름 |
| page eyebrow | 없음 | `13` Medium muted | 원본에 없음 |
| page title | 없음 | `26` SemiBold | 원본에 없음 |
| page subtitle | 없음 | `14` Regular, lineHeight `21` | 원본에 없음 |

현재 title block은 “헤더 중복 제거” 이슈를 떠나, 원본에 존재하지 않는 본문 hero 영역이다.
디자인 시스템의 typography 기준으로 올리면 오히려 마이그레이션을 방해한다.

### 프로필 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| surface | 흰색, radius `16`, `iosShadow` | radius `18`, `iosShadow` | 다름 |
| padding | `20` | 가로 `18`, 세로 `20` | 다름 |
| avatar | `64 × 64`, inputBg, person icon `36` | `64 × 64`, inputBg, user icon `34` | 거의 동일 |
| 이름 | `18`, SemiBold | `18`, SemiBold | 일치 |
| 보조 텍스트 | email `13` Regular muted | detail `13` lineHeight `20`, helper `12` lineHeight `18` | 다름 |
| 레이아웃 | avatar + info 1행 | avatar 아래 설명 + panel까지 포함한 세로 card | 다름 |
| preview badge | 없음 | accentLight pill `11` | 현재 전용 상태 |
| userKey panel | 없음 | muted surface, radius `14`, padding `14` | 원본에 없음 |

avatar 원형과 이름 typography만 일부 닮아 있고, card의 책임 자체는 달라졌다.

### 로그아웃 영역

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| logout surface | 흰색, radius `14`, `iosShadow` | 없음 | 미이식 |
| logout icon | `log-out-outline 20`, red | 없음 | 미이식 |
| logout text | `16`, Medium, `#FF3B30` | 없음 | 미이식 |
| pressed state | `opacity: 0.75` | 없음 | 미이식 |

원본의 두 번째 핵심 요소인 logout button이 현재는 아예 없다. 이건 디자인 drift가
아니라 기능/정보 구조 미이식이다.

## 공통화 판정

### 공통화하지 말아야 할 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 현재 title block | reject | 전역 typography 기준 금지 | 원본 route에 없는 구조 |
| `AccountBackground` glow | reject | 배경 primitive 금지 | 현재 전용 연출 요소 |
| `userKeyPanel` | reject | account primitive 금지 | 원본 계정 화면과 무관한 진단 패널 |
| `previewBadge` | reject | 상태 badge 금지 | 로컬 미리보기 전용 상태 |

### 제한적으로 참고 가능한 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| avatar circle `64 × 64` + inputBg | primitive 후보 | 보류 | 원본과 현재가 닮았지만 한 페이지만으로 전역화할 근거는 약함 |
| profile name `18 SemiBold` | typography 후보 | 보류 | 다른 계정/프로필 계열 페이지 확인 필요 |

현재 `/condition`은 공통화 후보를 발견하는 페이지가 아니라, “이 페이지를 기반으로
디자인 시스템을 만들면 안 된다”는 경고를 남기는 페이지에 가깝다.

## 수정 후보

이 문서는 코드 수정 범위를 확정하기 위한 점검 결과이며 아직 구현하지 않았다.

1. `/condition`을 원본의 프로필/로그아웃 페이지 책임으로 되돌리기
2. title block과 glow background를 제거하고 원본의 단순 stacked card 구조 복원
3. Apps in Toss 사용자 정보 기반 `name`, `email` 표시 복원
4. logout button과 진행 중 상태 복원
5. tracker user key 안내가 꼭 필요하면 이 route가 아닌 별도 진단/설정 페이지로 분리

## 실기 검증에 필요한 fixture

최소한 다음 두 상태가 필요하다.

1. 이름과 이메일이 채워진 기본 프로필 상태
2. 로그아웃 버튼을 누른 진행 중 상태

현재 `ai-pt`는 두 상태 모두 같은 route에서 재현되지 않으므로, 실기 검증 전에 기능
책임부터 원본 쪽으로 다시 맞춰야 한다.
