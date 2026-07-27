# 운동 배우기 및 영상 가이드

작성일자: 2026-07-27

## 1. 문서 목적

홈 화면의 `운동배우기` 카드에서 진입하는 부위별·기구별 운동 가이드, 영상 재생, 좋아요 동작의 현재 구현을 정리한다.

이 문서는 2026-07-27 기준 운동배우기 마이그레이션 작업 결과를 기준으로 한다.

## 2. 현재 구현 기준

| 구분 | 내용 |
| --- | --- |
| 홈 진입점 | `client/src/features/home/components/home-screen.tsx` |
| 목록 라우트 | `/exercise-guide` |
| 영상 라우트 | `/exercise-video-viewer?guideId=...` |
| 서버 모듈 | `server/src/modules/exercise-guides` |
| 카탈로그 원본 | 서버 하드코딩 상수 20개 |
| 카탈로그 구성 | 부위별 12개, 기구별 8개 |
| 좋아요 저장소 | PostgreSQL `exercise_guide_likes` |
| 사용자 구분 | `x-user-key` |
| 영상 재생 | 웹 `iframe`, 네이티브 `react-native-webview` |
| 별도 범위 | 사진으로 기구 찾기 AI 기능은 미구현 |

## 3. 구현 원칙

| 원칙 | 내용 |
| --- | --- |
| 원본 UX 우선 | 원본 앱의 운동배우기 흐름과 정보 구조를 유지한다. |
| 카탈로그 임시 구조 | 운동 목록은 서버 DB가 아니라 서버 상수로 관리한다. |
| 추후 DB 이관 준비 | 서버 카탈로그 파일에 `exercise_guides` 테이블로 이전해야 한다는 TODO를 남긴다. |
| 좋아요 의미 분리 | `likedByMe`는 현재 사용자 상태, `likeCount`는 전체 사용자 수다. |
| 숫자 보존 | 원본에 있던 초기 좋아요 숫자는 `initialLikeCount`로 보존하고 표시 수에 합산한다. |
| 라우트 최소화 | 영상 화면에는 `guideId`만 넘기고 상세는 서버에서 다시 조회한다. |

## 4. 요구사항 및 구현 현황

| ID | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- |
| EG-001 | 홈의 운동배우기 카드에서 목록 화면으로 이동해야 한다. | `QuickActionCard`가 실제 `onPress`를 받고 홈에서 `/exercise-guide`로 연결된다. | 구현 | `client/src/features/home/components/home-screen.tsx`, `client/src/features/home/components/quick-action-card.tsx` |
| EG-002 | 운동배우기 카드는 더 이상 미구현 배지를 붙이지 않아야 한다. | `showUnimplementedBadge={false}`로 처리한다. | 구현 | `client/src/features/home/components/home-screen.tsx` |
| EG-003 | 운동 목록은 서버에서 내려와야 한다. | 클라이언트 정적 목록을 제거하고 `GET /api/exercise-guides` 응답으로 목록을 그린다. | 구현 | `client/src/features/exercise-guide/api/exercise-guides.ts`, `server/src/modules/exercise-guides/exercise-guides.controller.ts` |
| EG-004 | 운동 목록은 DB가 아니라 서버 하드코딩 카탈로그를 사용해야 한다. | 서버 `exercise-guides.catalog.ts`에 20개를 상수로 둔다. | 구현 | `server/src/modules/exercise-guides/exercise-guides.catalog.ts` |
| EG-005 | 부위별 12개, 기구별 8개 구성을 유지해야 한다. | 카탈로그 로드 시 개수와 ID 유일성을 검증한다. | 구현 | `server/src/modules/exercise-guides/exercise-guides.catalog.ts`, `server/src/modules/exercise-guides/__tests__/exercise-guides.service.spec.ts` |
| EG-006 | 부위별 탭은 선택한 부위만 필터링해야 한다. | `bodyPart === 선택값` 규칙으로 필터링한다. | 구현 | `client/src/features/exercise-guide/lib/filter-exercise-guides.ts` |
| EG-007 | 기구별 탭은 실제 기구 필터 UI와 필터링이 동작해야 한다. | `equipmentTypes.includes(선택값)` 기준으로 필터링한다. | 구현 | `client/src/features/exercise-guide/components/exercise-guide-filter-row.tsx`, `client/src/features/exercise-guide/lib/filter-exercise-guides.ts` |
| EG-008 | 기구별 탭에서 사진으로 기구 찾기 진입 UI는 유지해야 한다. | 카메라 카드와 액션시트는 유지하되 선택 시 `준비 중입니다.`만 보여준다. | 구현 | `client/src/features/exercise-guide/components/exercise-guide-screen.tsx` |
| EG-009 | 사진으로 기구 찾기 AI 기능을 임의로 추가하지 않아야 한다. | 촬영/갤러리 안내만 두고 실제 분석 흐름은 연결하지 않았다. | 구현 | `client/src/features/exercise-guide/components/exercise-guide-screen.tsx` |
| EG-010 | 카드 클릭 시 영상 화면으로 이동해야 한다. | `/exercise-video-viewer`로 이동하며 `guideId`만 넘긴다. | 구현 | `client/src/features/exercise-guide/components/exercise-guide-screen.tsx`, `client/src/pages/exercise-video-viewer.tsx` |
| EG-011 | 영상 화면은 항상 최신 메타데이터를 사용해야 한다. | 영상 화면이 `guideId`로 `GET /api/exercise-guides/:guideId`를 다시 호출한다. | 구현 | `client/src/features/exercise-guide/components/exercise-video-viewer-screen.tsx` |
| EG-012 | 원본의 설명, 기구, 타겟 근육 정보가 상세 화면에 보여야 한다. | `equipment`, `targetMuscles`, `description`을 서버 응답으로 내려 상세에서 렌더링한다. | 구현 | `server/src/modules/exercise-guides/exercise-guides.service.ts`, `client/src/features/exercise-guide/components/exercise-video-viewer-screen.tsx` |
| EG-013 | YouTube 영상은 웹/앱에서 재생 가능해야 한다. | 웹은 `iframe`, 네이티브는 `react-native-webview`를 사용한다. | 구현 | `client/src/features/exercise-guide/components/youtube-video-player.tsx` |
| EG-014 | YouTube URL은 embed URL로 정규화해야 한다. | watch/short/embed URL을 모두 `autoplay=1&rel=0` embed URL로 변환한다. | 구현 | `client/src/features/exercise-guide/lib/get-youtube-embed-url.ts` |
| EG-015 | 좋아요는 서버에 저장돼야 한다. | `PUT /api/exercise-guides/:guideId/like`가 `exercise_guide_likes`에 저장한다. | 구현 | `server/src/modules/exercise-guides/exercise-guides.controller.ts`, `server/src/modules/exercise-guides/exercise-guides.repository.ts` |
| EG-016 | 좋아요는 사용자별 상태와 전체 숫자를 동시에 가져야 한다. | 응답에 `likedByMe`, `likeCount`를 함께 반환한다. | 구현 | `server/src/modules/exercise-guides/exercise-guides.service.ts` |
| EG-017 | 원본 초기 좋아요 숫자는 유지돼야 한다. | `likeCount = initialLikeCount + DB 집계 수`로 계산한다. | 구현 | `server/src/modules/exercise-guides/exercise-guides.service.ts` |
| EG-018 | 목록과 상세의 좋아요 상태는 동기화돼야 한다. | mutation 성공 시 detail query와 list query prefix를 함께 갱신한다. | 구현 | `client/src/features/exercise-guide/api/exercise-guides.ts` |
| EG-019 | 좋아요 API는 멱등적인 상태 설정이어야 한다. | 토글이 아니라 `{ liked: boolean }`를 받는다. | 구현 | `server/src/modules/exercise-guides/dto/set-exercise-guide-like.dto.ts` |
| EG-020 | 없는 가이드 ID는 빈 화면이나 오작동 대신 실패 처리가 있어야 한다. | 서버는 404를 던지고, 라우트는 빈 `guideId`일 때 안내 화면을 보여준다. | 구현 | `server/src/modules/exercise-guides/exercise-guides.service.ts`, `client/src/pages/exercise-video-viewer.tsx` |

## 5. 서버 데이터 구조

### 5.1 카탈로그

| 항목 | 내용 |
| --- | --- |
| 파일 | `server/src/modules/exercise-guides/exercise-guides.catalog.ts` |
| 총 개수 | 20개 |
| 부위별 | 12개 |
| 기구별 | 8개 |
| 주요 필드 | `id`, `catalogType`, `title`, `bodyPart`, `equipment`, `equipmentTypes`, `duration`, `videoUrl`, `description`, `targetMuscles`, `initialLikeCount`, `displayOrder` |

### 5.2 좋아요 테이블

| 컬럼 | 설명 |
| --- | --- |
| `guide_id` | 가이드 ID |
| `user_key` | 현재 사용자 키 |
| `created_at` | 생성 시각 |

추가 규칙:

- Primary Key: `(guide_id, user_key)`
- Index: `guide_id`
- 현재는 카탈로그가 하드코딩 상수라 FK를 두지 않는다.
- 카탈로그를 DB 테이블로 옮길 때 FK를 추가해야 한다.

## 6. API 구현 현황

| Method | 경로 | 목적 | 비고 |
| --- | --- | --- | --- |
| `GET` | `/api/exercise-guides` | 전체 또는 타입별 목록 조회 | `catalogType?=body_part|equipment` |
| `GET` | `/api/exercise-guides/:guideId` | 단일 가이드 상세 조회 | 영상 화면에서 사용 |
| `PUT` | `/api/exercise-guides/:guideId/like` | 현재 사용자의 좋아요 상태 저장 | body: `{ liked: boolean }` |

### 목록/상세 응답 필드

| 필드 | 의미 |
| --- | --- |
| `id` | 가이드 ID |
| `catalogType` | `body_part` 또는 `equipment` |
| `title` | 운동명 또는 루틴명 |
| `bodyPart` | 대표 부위 |
| `equipment` | 장비/도구 설명 |
| `equipmentTypes` | 기구 필터용 배열 |
| `duration` | 표시용 재생 시간 |
| `videoUrl` | 원본 YouTube URL |
| `description` | 설명 |
| `targetMuscles` | 상세 표시용 타겟 근육 |
| `likeCount` | 원본 초기 숫자 + 전체 사용자 좋아요 수 |
| `likedByMe` | 현재 사용자가 눌렀는지 |

## 7. 클라이언트 데이터 흐름

| 순서 | 처리 |
| --- | --- |
| 1 | 홈 `운동배우기` 카드가 `/exercise-guide`로 이동한다. |
| 2 | 목록 화면이 `GET /api/exercise-guides`를 호출한다. |
| 3 | 클라이언트는 `catalogType`과 로컬 필터를 조합해 부위별/기구별 목록을 나눈다. |
| 4 | 카드 클릭 시 `/exercise-video-viewer?guideId=...`로 이동한다. |
| 5 | 상세 화면이 `GET /api/exercise-guides/:guideId`를 호출한다. |
| 6 | 좋아요 클릭 시 `PUT /api/exercise-guides/:guideId/like`를 호출한다. |
| 7 | mutation 성공 후 목록/상세 query를 같은 값으로 동기화한다. |

## 8. 테스트 근거

| 구분 | 파일 |
| --- | --- |
| 서버 서비스/통합 | `server/src/modules/exercise-guides/__tests__/exercise-guides.service.spec.ts`, `server/src/modules/exercise-guides/__tests__/exercise-guides.controller.integration.spec.ts` |
| 클라이언트 API | `client/src/features/exercise-guide/api/__tests__/exercise-guides.test.ts` |
| 클라이언트 필터/URL 유틸 | `client/src/features/exercise-guide/lib/__tests__/filter-exercise-guides.test.ts`, `client/src/features/exercise-guide/lib/__tests__/get-youtube-embed-url.test.ts` |
| 홈 연결 | `client/src/features/home/__tests__/home-screen.test.tsx` |

## 9. 현재 제한 및 후속 검토

| ID | 항목 | 현재 영향 |
| --- | --- | --- |
| EG-GAP-001 | 카탈로그 DB 미이관 | 운영 중 운동 가이드 수정, 정렬 변경, 영상 교체를 코드 수정 없이 처리할 수 없다. |
| EG-GAP-002 | 사진으로 기구 찾기 미구현 | 기구별 탭의 액션시트는 열리지만 실제 인식 흐름은 없다. |
| EG-GAP-003 | 서버 DB 의존 | PostgreSQL이 준비되지 않으면 Swagger는 열려도 운동배우기 API 호출은 실패한다. |
| EG-GAP-004 | 라우트 생성 파일 수동 반영 | 현재 `router.gen.ts`는 새 라우트가 포함된 상태지만, 자동 생성 파이프라인과 동기화 여부는 이후 확인이 필요하다. |
| EG-GAP-005 | 카탈로그 관리 기능 부재 | 관리자 화면, 노출 on/off, 초기 좋아요 수 조정 기능은 없다. |
