# F-01~F-05 공통 영역 점검

## 점검 상태

- 실제 코드 대조: 완료
- 공통화 판정: 완료
- `ai-pt` 코드 반영: 완료
- 동일 상태 실기 캡처 검증: 미진행

이 문서는 원본과 `ai-pt`에서 실제로 import·렌더링되는 코드만 비교한다. 기존 디자인
문서와 실제 사용되지 않는 원본 `components/ui`는 근거로 사용하지 않았다.

## F-01 색상·그림자 foundation

### 실제 코드

- 원본: [`constants/colors.ts`](../../../../2026-07-13/my-PT-Diary/constants/colors.ts)
- 현재: [`src/shared/constants/colors.ts`](../../src/shared/constants/colors.ts)

### 확인 결과

두 파일의 색상 key와 값, `gradeColors`, `iosShadow`, `iosShadowLight`의 실효값은
동일하다. 차이는 quote와 formatting, 웹 `boxShadow`의 TypeScript cast 제거뿐이다.

| 항목 | 원본 | `ai-pt` | 판정 |
|---|---|---|---|
| 앱 배경 | `#F4F5F7` | `#F4F5F7` | 동일 |
| 기본 surface | `#FFFFFF` | `#FFFFFF` | 동일 |
| 본문 텍스트 | `#00192B` | `#00192B` | 동일 |
| 보조 텍스트 | `#6B7280` | `#6B7280` | 동일 |
| 흐린 텍스트 | `#8E8E8E` | `#8E8E8E` | 동일 |
| 흐린 아이콘 | `#B8C1CC` | `#B8C1CC` | 동일 |
| accent | `#FF6A33` | `#FF6A33` | 동일 |
| 기본 그림자 | opacity `0.07`, radius `8`, elevation `2` | 동일 | 동일 |
| 약한 그림자 | opacity `0.05`, radius `4`, elevation `1` | 동일 | 동일 |

### 판정

- 현재 화면의 전체적인 색감 차이는 공통 색상 파일의 이식 실패로 발생한 것이 아니다.
- 현재 `Colors`와 두 shadow는 원본 호환 foundation으로 유지할 수 있다.
- 같은 값에 여러 이름이 붙어 있지만 다른 페이지의 실제 사용처를 확인하기 전에는
  이름을 합치거나 제거하지 않는다.
- 새 semantic token이 필요하면 기존 값을 바꾸지 않고 alias를 추가하는 방식으로
  진행한다.

## F-02 폰트 asset과 본문 typography

### 실제 코드

- 원본 등록: [`app/_layout.tsx`](../../../../2026-07-13/my-PT-Diary/app/_layout.tsx)
- 원본 font asset: `assets/fonts/*.ttf`
- 현재 등록: [`react-native.config.js`](../../react-native.config.js)
- 현재 font asset: `src/assets/fonts/*.ttf`

### 확인 결과

Regular, Medium, SemiBold, Bold 네 파일의 SHA-256은 원본과 `ai-pt`가 각각 동일하다.
폰트 바이너리 교체나 손상은 없다.

원본은 `expo-font`의 `useFonts`로 등록하고, 현재는 React Native asset linking으로
등록한다. 두 앱 모두 화면 StyleSheet에서 `fontFamily`, `fontSize`, `lineHeight`를
직접 지정하며 공통 typography primitive는 없다.

이미 확인된 원본 Medium 등록 충돌은 이 점검에서 다시 판정하지 않는다. 다만 그
충돌과 별개로, 마이그레이션 과정에서 실제 `fontSize`와 `fontFamily`가 변경된 곳은
페이지별 문서에 별도로 기록한다.

### 판정

- 폰트 asset은 현재 foundation으로 그대로 사용할 수 있다.
- 지금 단계에서 TDS Text나 다른 글꼴로 교체할 근거는 없다.
- 전체 페이지 문서를 대조한 결과, 같은 의미와 값이 반복된 `tabLabel`,
  `sectionTitle`, `rowActionTitle`, `rowActionSubtitle`만 공통 typography로 확정했다.
- line height가 페이지마다 다른 본문과 원본에 없는 현재 전용 hero title은 전역
  typography로 올리지 않는다.

### 반영

- [`src/shared/constants/typography.ts`](../../src/shared/constants/typography.ts)에
  Pretendard family 이름과 확정된 네 역할을 정의했다.
- 탭 label, 홈·기록·PT section title, 홈·PT row action에 적용했다.
- AI feature title처럼 원본에서 weight가 다른 variant와 페이지 전용 본문은 직접 값을
  유지했다.

## F-03 하단 탭 shell

### 실제 코드

- 원본: [`components/GlobalTabBar.tsx`](../../../../2026-07-13/my-PT-Diary/components/GlobalTabBar.tsx)
- 원본 장착 위치: [`app/_layout.tsx`](../../../../2026-07-13/my-PT-Diary/app/_layout.tsx)
- 현재 탭: [`src/shared/components/member-tab-bar.tsx`](../../src/shared/components/member-tab-bar.tsx)
- 현재 shell: [`src/shared/components/tab-page-layout.tsx`](../../src/shared/components/tab-page-layout.tsx)

반영 전 `HomeTabBar`는 홈, 기록, PT, AI, 내 정보와 트레이너 매칭 화면이 각각 직접
렌더링했다. 현재는 해당 소비 화면을 공통 `TabPageLayout`으로 감싸고
`MemberTabBar`의 높이와 위치 계산을 한 곳으로 옮겼다. 앱 전체 인증 shell에서 모든
상세 라우트에 탭을 장착하는 작업은 인증·라우팅 범위가 확정될 때까지 남아 있다.

### 구조 대조

| 항목 | 원본 실제 코드 | `ai-pt` 실제 코드 | 판정 |
|---|---|---|---|
| 장착 위치 | 앱 root에서 `GlobalMemberTabBar`를 한 번 렌더링 | 기존 소비 화면별 `TabPageLayout` | 인증 root 통합은 남음 |
| 표시 범위 | 인증된 사용자 상세 라우트까지 root에서 유지 | 루트 탭 5개와 트레이너 매칭 | 상세 라우트 통합은 남음 |
| native 콘텐츠 높이 | `60` | `60` | 동일 |
| native 전체 높이 | `60 + insets.bottom` | `60 + insets.bottom` | 동일 |
| native 하단 padding | `insets.bottom` | `insets.bottom` | 동일 |
| web 전체 높이 | `50 + 34 = 84` | `50 + 34 = 84` | 동일 |
| 가로 보정 | `(520 - screenWidth) / 8` | 동일, 음수는 `0` | 동일 |
| 탭 아이콘 | 원본 custom SVG, `24` | 같은 SVG, `24` | 동일 |
| 탭 내부 | `gap: 3`, `paddingTop: 8` | 동일 | 동일 |
| 라벨 | `10`, `letterSpacing: -0.1` | 동일 | 동일 |
| 활성·비활성 색상 | `#00192B`, `#B8C1CC` | 동일 | 동일 |

### 판정

반영 전 탭의 가장 큰 공통 문제는 시각 asset이 아니라 shell 책임의 이동이었다.

현재는 `TabPageLayout`이 탭 높이와 safe area를 한 번 계산하지만 인증 app root에
장착한 것은 아니다. 따라서 기존 탭 소비 화면의 계산 중복은 해결됐고, 상세 라우트
전체의 표시 범위 통합은 인증·라우팅 범위 확정 뒤 처리해야 한다.

### 공통화 결정

다음 공통 pattern이 필요하다.

```text
TabPageLayout
├── page content
├── safe-area 기반 content bottom inset
└── MemberTabBar
```

- `MemberTabBar`는 높이, safe area, 가로 보정, 라벨 typography를 소유한다.
- 루트 탭 화면은 `activeKey`와 content만 제공한다.
- 각 페이지 StyleSheet의 임의 `paddingBottom`은 제거 대상이다.
- 실제 구현 시 Apps in Toss 런타임의 하단 safe area 값을 확인한 뒤 원본 계산식을
  그대로 쓸지 플랫폼용 계산으로 치환할지 결정한다.

### 반영

- [`src/shared/components/member-tab-bar.tsx`](../../src/shared/components/member-tab-bar.tsx)에
  탭 렌더링과 navigation 책임을 이동했다.
- [`src/shared/components/tab-page-layout.tsx`](../../src/shared/components/tab-page-layout.tsx)가
  native `60 + insets.bottom`, web `50 + 34`, 원본 가로 보정
  `(520 - width) / 8`을 계산한다.
- 탭 label의 `letterSpacing: -0.1`을 복원했다.
- 홈·기록·PT·AI·내 정보와 현재 탭을 표시하는 트레이너 매칭에 적용했다.

## F-04 공통 SVG·이미지·아이콘 체계

### 실제 코드

- 원본 SVG: [`components/TabIcons.tsx`](../../../../2026-07-13/my-PT-Diary/components/TabIcons.tsx)
- 현재 SVG: [`src/shared/components/icons/pt-diary-icons.tsx`](../../src/shared/components/icons/pt-diary-icons.tsx)
- 원본 이미지: `assets/images`
- 현재 이미지: `src/assets/images`

### 확인 결과

현재 파일의 다음 SVG path는 원본에서 그대로 옮겨졌다.

- `TimeIcon`
- `AIInfoIcon`
- `CheckIcon`
- `FireIcon`
- `ChatIcon`
- `HomeTabIcon`
- `HistoryTabIcon`
- `PTTabIcon`
- `AITabIcon`
- `MyTabIcon`

홈에서 사용하는 `shoes.png`, `video.png`도 원본과 현재 SHA-256이 동일하다.

반면 원본이 Ionicons로 그리던 chevron과 play를 현재 일부 컴포넌트에서 `›`, `⌃`,
`⌄`, `▶` 같은 Text glyph로 대체했다. 이 glyph는 폰트 metric에 종속되므로 원본과
모양, baseline, stroke가 달라진다.

### 공통화 결정

- 이미 옮긴 SVG path와 이미지 asset은 유지한다.
- 아이콘을 화면에서 라이브러리명이나 Text glyph로 직접 선택하지 않도록 semantic
  icon registry를 둔다.
- 우선 필요한 공통 이름은 `chevronRight`, `chevronUp`, `chevronDown`, `play`다.
- 원본의 실제 vector와 대조가 끝나기 전까지 임의의 Lucide 대체 아이콘을 공통
  기준으로 승격하지 않는다.

### 반영

- Ionicons 7.4 원본 SVG path로 `chevronRight`, `chevronUp`, `chevronDown`, `play`
  semantic registry를 [`pt-diary-icons.tsx`](../../src/shared/components/icons/pt-diary-icons.tsx)에
  추가했다.
- 홈 quick action, 루틴 accordion, AI hub, PT, 트레이너 매칭, 체형 분석과 분석 기록의
  대응 chevron을 registry로 교체했다.
- 운동 진행 timer의 play/pause는 이미 이관되어 있던 원본 PNG가 원본과 hash까지
  같음을 확인하고 문자 glyph 대신 해당 asset을 사용하도록 복원했다.
- 의미가 다른 flow arrow와 아직 registry가 확정되지 않은 leading icon은 Lucide를
  일괄 치환하지 않았다.

## F-05 화면 배경·스크롤·안전영역

### 실제 구조

원본 루트 탭 화면은 각 페이지 콘텐츠와 root `GlobalMemberTabBar`가 분리되어 있다.
반영 전에는 각 페이지 컨테이너 안에 ScrollView와 `HomeTabBar`가 같이 들어갔다.
현재는 `TabPageLayout`이 ScrollView 소비자와 `MemberTabBar`를 조립한다.

홈 기준 실제 값은 다음과 같다.

| 항목 | 원본 | `ai-pt` |
|---|---|---|
| 배경 | `#F4F5F7` | 동일 |
| ScrollView | `flex: 1` | 동일 |
| 본문 좌우 padding | `16` | `16` |
| 본문 상단 padding | `16` | `16` |
| 카드 사이 gap | `10` | `10` |
| native 본문 하단 padding | `120` | 최소 `120`, 큰 safe area에서는 자동 증가 |
| 탭 safe area | root에서 `insets.bottom` 반영 | `TabPageLayout`에서 반영 |

다른 루트 화면도 현재는 `TabPageLayout`이 tab height와 페이지별 마지막 여백을 합산한다.

### 공통화 결정

- 배경색과 기본 ScrollView 구성은 원본과 동일하므로 유지한다.
- 루트 탭 화면의 bottom inset 계산은 F-03의 `TabPageLayout`으로 이동한다.
- 화면 좌우 padding `16`과 카드 사이 gap `10`은 홈에서 확인됐지만, 다른 페이지
  점검 전에는 제품 전체 token으로 확정하지 않는다.
- Apps in Toss 네이티브 상단 헤더는 이 layout의 소유 범위에 포함하지 않는다.

### 반영

- `TabPageLayout`이 `contentBottomInset`과 `floatingActionBottomInset`을 소비 화면에
  제공하도록 구현했다.
- 루트 탭 5개와 트레이너 매칭에서 `104`, `110 + inset`, `120` 등으로 흩어져 있던
  하단 값을 제거했다.
- 홈은 원본의 web `100`, native `120` 최소 여백을 보존하면서 더 큰 safe area에서는
  콘텐츠가 탭에 가려지지 않도록 계산한다.
- 기록·PT FAB는 원본처럼 web `24`, native `tabBarHeight + 16`을 사용한다.

## 공통 후보 요약

| 후보 | 분류 | 판정 | 근거 |
|---|---|---|---|
| 현재 `Colors` | foundation | 유지 | 원본과 실효값 동일 |
| `iosShadow`, `iosShadowLight` | foundation | 유지 | 원본과 실효값 동일 |
| Pretendard font asset | foundation | 유지 | 네 파일 hash 동일 |
| `MemberTabBar` | pattern | 신규 정리 필요 | 5개 루트 탭 공통 |
| `TabPageLayout` | pattern | 신규 필요 | 탭·safe area·content inset 책임 통합 |
| semantic icon registry | primitive/adapter | 신규 필요 | vector 대신 Text glyph 사용 방지 |
| `tabLabel`, `sectionTitle`, row action typography | token/primitive | 확정·반영 | 전체 페이지 대조에서 같은 역할과 값 반복 |
| 전역 card·spacing scale | token/pattern | 보류 | 전체 페이지에서 역할별 값이 안정적으로 반복되지 않음 |

## 반영 검증

- `npm run typecheck`: 통과
- `npm test -- --runInBand`: 36 suites, 99 tests 통과
- `npm run build`: iOS·Android Apps in Toss artifact 생성 통과
- 공통 layout 계산 test: native safe area, web 84px tab, 홈 최소 하단 여백 검증
- 변경 파일 Biome 검사: 통과
- 전체 `src`, `pages` Biome 검사: 이번 변경과 무관한 기존 운동배우기 계열 format과
  lint 불일치 27건으로 실패

## 실기 검증 전 확인 사항

1. Apps in Toss 실기기에서 `insets.bottom` 값과 콘텐츠 끝 위치 캡처
2. 같은 viewport에서 원본과 `MEMBER_TAB_H_PAD` 정렬 비교
3. 원본·현재의 동일 상태 fixture와 스크롤 위치 확보
4. 페이지별로 남은 card·surface·상태 차이 반영 후 최종 캡처
