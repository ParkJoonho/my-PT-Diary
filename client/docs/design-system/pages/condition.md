# P-05 내 정보 화면 점검

## 점검 상태

- 원본 실제 코드: 점검 완료
- `ai-pt` 실제 코드: 점검 완료
- 상태 정렬: 부분 완료
- 시각 규칙 추출: 완료
- 공통화 판정: 완료
- 코드 반영: 완료
- 동일 상태 실기 검증: 미진행

공통 `TabPageLayout`의 탭·safe-area·본문 하단 계산을 유지하면서 원본의 profile
card + logout card 구조를 복원했다. 진단용 glow·title block·preview badge·user key
panel은 제거하고 원본 icon path와 모든 실효값을 적용했다.

Apps in Toss는 원본 앱의 자체 name/email 세션과 logout API를 제공하지 않는다.
따라서 이름은 익명/미리보기 사용자, 보조 한 줄은 익명 사용자 키로 매핑하고,
로그아웃 확인 후에는 플랫폼의 `closeView`로 미니앱을 닫는다.

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
- 프로필 변환: [`features/account/lib/account-profile.ts`](../../../src/features/account/lib/account-profile.ts)
- 탭 shell: [`shared/components/tab-page-layout.tsx`](../../../src/shared/components/tab-page-layout.tsx)
- 하단 탭: [`shared/components/member-tab-bar.tsx`](../../../src/shared/components/member-tab-bar.tsx)

현재는 원본의 정보 밀도와 카드 구조를 유지하고 Apps in Toss 익명 사용자 정보를
같은 두 줄 profile slot에 표시한다.

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
├── AccountContent
│   ├── profileCard
│   │   ├── avatar
│   │   └── displayName + anonymous user key
│   └── logoutButton
└── MemberTabBar                              TabPageLayout에서 렌더링
```

원본과 현재 모두 “짧은 프로필 + 로그아웃/종료 액션”의 같은 정보 구조를 사용한다.

## 상태 매트릭스

| 상태 | 원본 실제 코드 | `ai-pt` 실제 코드 | 비교 가능 | 판정 |
|---|---|---|---|---|
| 기본 표시 | 사용자 이름 + 이메일 | 익명 사용자 + 익명 키 | 부분 가능 | 플랫폼 데이터 예외, 구조 일치 |
| 개발 미리보기 상태 | 별도 없음 | 이름/보조 한 줄에만 매핑 | 부분 가능 | 별도 badge 제거 |
| 로그아웃 idle | logout button 표시 | 동일 | 코드·테스트 비교 가능 | 반영 완료 |
| 로그아웃 진행 중 | 버튼 텍스트 `로그아웃 중…` | 동일 | 코드·테스트 비교 가능 | 반영 완료 |
| 배경 데코 | body image 있을 때만 parallax | 별도 glow 없음 | 부분 가능 | 일반 상태 일치 |
| 오류 상태 | 별도 없음 | Suspense error 추가 | 아니오 | 현재 전용 상태 |

실기 캡처에서는 원본 name/email과 Apps in Toss 익명 사용자 표시의 데이터 차이를
제외하고 카드 배치와 크기를 비교해야 한다.

## 실제 시각 규칙 대조

### 화면 루트

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| 배경 | `Colors.background` | 동일, 별도 glow 없음 | 일치 |
| 상단 padding | `20` | 동일 | 일치 |
| 좌우 padding | `16` | `16` | 일치 |
| 카드 간 gap | `12` | 동일 | 일치 |
| 하단 padding | `GLOBAL_TAB_BAR_CONTENT_H + inset + 20` | 동일 계산 | 공통 반영 완료 |

일반 프로필 상태의 배경과 본문 여백을 원본 값으로 복원했다.

### 배경과 page title block

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| decorative background | `ParallaxBackground`, 사용자 body image 없으면 null | 별도 decorative background 없음 | 일반 상태 일치 |
| page eyebrow | 없음 | 없음 | 일치 |
| page title | 없음 | 없음 | 일치 |
| page subtitle | 없음 | 없음 | 일치 |

원본에 없는 본문 hero와 glow 컴포넌트를 제거했다.

### 프로필 카드

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| surface | 흰색, radius `16`, `iosShadow` | 동일 | 일치 |
| padding | `20` | 동일 | 일치 |
| avatar | `64 × 64`, inputBg, person icon `36` | 원본 SVG path `36` | 일치 |
| 이름 | `18`, SemiBold | `18`, SemiBold | 일치 |
| 보조 텍스트 | email `13` Regular muted | 익명 user key `13` Regular muted | 플랫폼 데이터 예외, 시각 일치 |
| 레이아웃 | avatar + info 1행 | 동일 | 일치 |
| preview badge | 없음 | 없음 | 일치 |
| userKey panel | 없음 | 없음 | 일치 |

Apps in Toss에서 제공 가능한 익명 식별자를 원본 email slot에 표시하는 플랫폼 예외만
남는다.

### 로그아웃 영역

| 영역 | 원본 실제 값 | `ai-pt` 실제 값 | 판정 |
|---|---|---|---|
| logout surface | 흰색, radius `14`, `iosShadow` | 동일 | 일치 |
| logout icon | `log-out-outline 20`, red | 원본 SVG path `20` | 일치 |
| logout text | `16`, Medium, `#FF3B30` | 동일 | 일치 |
| pressed state | `opacity: 0.75` | 동일 | 일치 |
| 진행 text | `로그아웃 중…` | 동일 | 일치 |

원본의 확인 alert와 진행 상태를 유지하되 최종 동작은 Apps in Toss의 `closeView`다.

## 공통화 판정

### 공통화하지 말아야 할 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| 현재 title block | reject | 제거 완료 | 원본 route에 없는 구조 |
| `AccountBackground` glow | reject | 컴포넌트 제거 완료 | 현재 전용 연출 요소 |
| `userKeyPanel` | reject | 제거 완료 | 원본 계정 화면과 무관한 진단 패널 |
| `previewBadge` | reject | 제거 완료 | 로컬 미리보기 전용 상태 |

### 제한적으로 참고 가능한 항목

| 후보 | 분류 | 판정 | 이유 |
|---|---|---|---|
| avatar circle `64 × 64` + inputBg | primitive 후보 | 보류 | 원본과 현재가 닮았지만 한 페이지만으로 전역화할 근거는 약함 |
| profile name `18 SemiBold` | typography 후보 | 보류 | 다른 계정/프로필 계열 페이지 확인 필요 |

profile과 logout은 이 페이지 전용 pattern으로 유지하며 다른 계정 화면을 확인하기
전까지 전역 primitive로 승격하지 않는다.

## 반영 결과와 플랫폼 예외

### 반영 완료

1. 원본의 profile + logout stacked card 구조
2. title block·glow·진단 panel·preview badge 제거
3. profile shell, avatar, typography와 원본 person SVG path
4. logout shell, 원본 log-out SVG path, pressed·진행 상태

### 플랫폼 예외

- Apps in Toss 익명 키 API는 원본 자체 계정의 name/email을 제공하지 않는다. 이름은
  `익명 사용자` 또는 `미리보기 사용자`, 보조 한 줄은 익명 키로 표시한다.
- 앱 소유 인증 세션이 없으므로 로그아웃 확인 후 `closeView`로 미니앱을 닫는다.

## 코드 검증

- profile/logout 전용 구조와 진단 UI 비노출 테스트
- 확인 후 `closeView` 호출과 `로그아웃 중…` 상태 테스트
- 관련 테스트 2개, TypeScript `tsc --noEmit`, 변경 파일 Biome 검사 통과

## 실기 검증에 필요한 fixture

최소한 다음 두 상태가 필요하다.

1. 이름과 이메일이 채워진 기본 프로필 상태
2. 로그아웃 버튼을 누른 진행 중 상태

두 상태를 같은 viewport에서 촬영하고 원본 name/email과 현재 익명 정보의 데이터
차이는 플랫폼 예외로 분리한다.
