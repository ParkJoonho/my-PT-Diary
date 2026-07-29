# 내 정보 탭

작성일자: 2026-07-29

## 1. 문서 목적

회원용 하단 탭의 `내 정보` 화면이 원본 앱에서 어떤 역할을 했는지와, 현재 `ai-pt`에서 어디까지 마이그레이션됐는지 정리한다.

이 문서는 탭 진입, 화면 셸, 프로필 카드, 현재 범위에서 보여주는 사용자 식별 정보만 다룬다.

## 2. 현재 범위

| 도메인 | 현재 범위 | 상태 |
| --- | --- | --- |
| 탭 진입 | 하단 탭 `내 정보` → `/condition` 라우트 연결 | 구현 |
| 상단 셸 | 원본 분위기의 상단 브랜드 헤더 | 구현 |
| 배경 처리 | 원본의 부드러운 배경 분위기를 Granite 화면에 맞게 재구성 | 구현 |
| 프로필 카드 | 아바타, 사용자 이름 성격의 텍스트, 보조 설명 | 구현 |
| 사용자 식별 정보 | 현재 앱에서 사용하는 사용자 키 표시 | 구현 |
| 로그아웃 버튼 | 이번 범위에서 제외 | 제외 |

## 3. 구현 원칙

| 원칙 | 내용 |
| --- | --- |
| 원본 UX 우선 | 원본 `condition` 탭의 단순한 개인 페이지 구조와 정보 밀도를 유지한다. |
| 기능 분리 | 컨디션 기록 화면과 섞지 않고 `account` feature로 분리한다. |
| 화면 우선 | 이번 단계는 디자인과 진입 흐름 복원이 우선이며, 개인화 확장은 후속 범위로 둔다. |
| 현재 앱 기준 정보 | 현재 앱이 실제로 쓰는 사용자 식별 정보를 화면에 자연스럽게 노출한다. |
| 불필요한 액션 제거 | 이번 범위에 없는 버튼은 자리만 남기지 않고 화면에서도 제거한다. |

## 4. 원본 구현 기준

| 항목 | 원본 구현 |
| --- | --- |
| 탭 라우트 | `app/(tabs)/condition.tsx` |
| 탭 라벨 | `내 정보` |
| 하단 탭 키 | `condition` |
| 상단 구성 | `ParallaxBackground`, `AppHeader standalone` |
| 본문 구성 | 프로필 카드 1개 + 로그아웃 버튼 1개 |
| 카드 정보 | 아바타 아이콘, 사용자 이름, 이메일 |

## 5. 현재 구현 기준

| 항목 | 현재 구현 |
| --- | --- |
| feature 위치 | `client/src/features/account/**` |
| 페이지 라우트 | `client/src/pages/condition.tsx`, `client/pages/condition.tsx` |
| 탭 연결 | `client/src/features/home/components/home-tab-bar.tsx` |
| 화면 컴포넌트 | `client/src/features/account/components/account-screen.tsx` |
| 보조 로직 | `client/src/features/account/lib/account-profile.ts` |
| 테스트 | `client/src/features/account/components/__tests__/account-screen.test.tsx` |

## 6. 요구사항

| ID | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- |
| ACC-001 | 회원용 하단 탭의 `내 정보`를 누르면 실제 화면으로 이동해야 한다. | 탭 바의 `condition`이 `/condition`으로 이동한다. | 구현 | `client/src/features/home/components/home-tab-bar.tsx`, `client/src/pages/condition.tsx` |
| ACC-002 | 탭은 더 이상 미구현 상태로 남아 있지 않아야 한다. | 탭 데이터의 `condition` 항목을 `implemented: true`로 전환했다. | 구현 | `client/src/features/home/data/tabs.ts` |
| ACC-003 | 화면 상단은 원본처럼 브랜드 중심의 단순 헤더를 가져야 한다. | 아이콘과 `PT Diary` 텍스트를 가운데 정렬한 헤더를 사용한다. | 구현 | `client/src/features/account/components/account-screen.tsx` |
| ACC-004 | 본문 상단에는 `내 정보` 성격을 드러내는 제목 블록이 있어야 한다. | `내 정보`, `개인 페이지`, 보조 설명 1줄을 렌더링한다. | 구현 | `client/src/features/account/components/account-screen.tsx` |
| ACC-005 | 프로필 카드는 아바타와 핵심 식별 정보를 한 카드 안에 묶어야 한다. | 아바타 원형, 대표 이름 텍스트, 상세 설명, 보조 설명을 한 카드에 묶었다. | 구현 | `client/src/features/account/components/account-screen.tsx` |
| ACC-006 | 현재 앱에서 실제로 식별에 쓰는 값을 사용자에게 보여줘야 한다. | `useTrackerUserKey()`로 읽은 값을 `사용자 키` 패널에 표시한다. | 구현 | `client/src/features/account/components/account-screen.tsx`, `client/src/shared/api/user-key.ts` |
| ACC-007 | 개발 미리보기 환경과 실제 사용자 환경의 설명을 구분해야 한다. | `buildAccountProfile()`이 fallback 키 여부에 따라 이름/설명/배지를 다르게 만든다. | 구현 | `client/src/features/account/lib/account-profile.ts` |
| ACC-008 | 이번 범위에서 제외한 액션은 화면에서도 보이지 않아야 한다. | 로그아웃 버튼을 남기지 않고 프로필 카드만 보여준다. | 구현 | `client/src/features/account/components/account-screen.tsx` |
| ACC-009 | 사용자 정보 로딩은 소비처 가까이에 Suspense 경계를 둬야 한다. | `AccountProfileCard`를 `SuspenseSection`으로 감싸 화면 안쪽에서 로딩/오류를 처리한다. | 구현 | `client/src/features/account/components/account-screen.tsx` |

## 7. 화면 구성

### 7.1 상단 헤더

| 항목 | 현재 구성 |
| --- | --- |
| 배경 | 흰색 카드형 헤더 |
| 하단 구분선 | `cardBorder` 1줄 |
| 브랜드 | 앱 아이콘 + `PT Diary` |
| 정렬 | 가운데 정렬 |

### 7.2 본문

| 섹션 | 현재 구성 |
| --- | --- |
| 타이틀 블록 | `내 정보`, `개인 페이지`, 보조 설명 |
| 프로필 카드 | 아바타, 표시 이름, 설명, 사용자 키 패널 |
| 배경 장식 | 상/좌/하단 glow 형태의 장식 뷰 |

## 8. 테스트 근거

| 구분 | 파일 |
| --- | --- |
| 클라이언트 화면 | `client/src/features/account/components/__tests__/account-screen.test.tsx` |
| 라우트 연결 | `client/src/features/home/components/home-tab-bar.tsx`, `client/src/pages/condition.tsx` |

## 9. 현재 갭 및 후속 검토

| ID | 항목 | 현재 영향 |
| --- | --- | --- |
| ACC-GAP-001 | 원본의 이름/이메일 직접 표시는 아직 복원되지 않았다. | 현재 화면은 앱에서 실제 사용하는 사용자 키 중심으로 정보를 보여준다. |
| ACC-GAP-002 | 원본의 `AppHeader`와 `ParallaxBackground`를 1:1로 옮기진 않았다. | 현재는 Granite 화면 구조에 맞게 단순화한 브랜드 헤더와 배경 장식으로 대응한다. |
| ACC-GAP-003 | 프로필 수정, 사진 변경 같은 후속 액션은 없다. | 이번 범위는 개인 페이지 진입과 기본 표시 복원에 한정된다. |
| ACC-GAP-004 | 로그아웃 버튼은 범위에서 제외했다. | 원본의 하단 액션 버튼 영역은 현재 비워 두지 않고 제거한 상태다. |
