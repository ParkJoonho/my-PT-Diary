# AI 추천 트레이너

작성일자: 2026-07-29

## 1. 문서 목적

`/ai-trainer-match` 화면과 관련 서버 API가 현재 어떤 범위까지 구현됐는지 정리한다.

이 문서는 PT 탭의 `트레이너 연결` 카드 진입, 트레이너 카탈로그, 인기순/AI 추천순 정렬, 상세 모달, 찜, 연결 요청 생성까지를 다룬다.

## 2. 현재 범위

| 도메인 | 현재 범위 | 상태 |
| --- | --- | --- |
| 화면 진입 | `/pt-log` 카드 → `/ai-trainer-match` | 구현 |
| 트레이너 목록 | 승인된 시드 트레이너 목록 조회 | 구현 |
| 정렬 | 기본순, 인기순, AI 추천순 | 구현 |
| 추천 로직 | 운동기록/PT 일지/컨디션 기반 규칙 점수 계산 | 구현 |
| 상세 모달 | 트레이너 소개, 경력, 자격, 철학, 추천 이유 표시 | 구현 |
| 찜 | 사용자별 찜 저장과 상태 반영 | 구현 |
| 연결 요청 | 사용자별 요청 생성과 상태 반영 | 구현 |
| 트레이너 측 승인/거절 관리 | 회원-트레이너 관계 확정 워크플로 | 미구현 |

## 3. 구현 원칙

| 원칙 | 내용 |
| --- | --- |
| 시드 카탈로그 기준 | 현재 트레이너 목록은 DB 시드 카탈로그를 기준으로 한다. |
| 사용자 분리 | 추천과 연결 요청은 모두 `x-user-key` 기준으로 분리한다. |
| 찜 분리 | 트레이너 찜은 `trainer_likes` 테이블에서 사용자별로 분리한다. |
| 규칙 기반 추천 | 추천 점수는 LLM 응답이 아니라 서버 규칙 계산 결과다. |
| 설명 문구 결정성 | `matchReason`, `highlightTag`는 서버 템플릿 문구로 생성한다. |
| 요청 멱등성 | 동일 사용자-트레이너 조합은 `UNIQUE (user_key, trainer_id)`로 중복 생성을 막는다. |

## 4. 요구사항

| ID | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- |
| TM-001 | PT 탭의 `트레이너 연결` 카드에서 추천 화면으로 이동해야 한다. | `/pt-log` 카드 press가 `/ai-trainer-match`로 이동한다. | 구현 | `client/src/features/pt-logs/components/pt-log-screen.tsx`, `client/src/pages/ai-trainer-match.tsx` |
| TM-002 | 승인된 트레이너 카탈로그를 목록으로 보여야 한다. | `GET /api/trainers`가 승인된 시드 트레이너를 display order 기준으로 반환한다. | 구현 | `server/src/modules/trainers/trainers.catalog.ts`, `server/src/modules/trainers/trainers.controller.ts` |
| TM-003 | 인기순은 평점과 회원 수 기준으로 재정렬돼야 한다. | 클라이언트가 `rating DESC`, 동률 시 `memberCount DESC`로 정렬한다. | 구현 | `client/src/features/trainer-match/components/trainer-match-screen.tsx` |
| TM-004 | AI 추천순은 현재 사용자 기록을 바탕으로 계산돼야 한다. | 서버가 최근 PT 부위, 운동 활동량, 최근 컨디션/근육통 패턴으로 규칙 기반 점수를 계산한다. | 구현 | `server/src/modules/trainers/trainers.service.ts`, `server/src/modules/trainers/trainers.repository.ts` |
| TM-005 | 추천 결과에는 점수와 추천 사유가 함께 보여야 한다. | `matchScore`, `highlightTag`, `matchReason`를 응답하고 카드에 표시한다. | 구현 | `server/src/modules/trainers/dto/trainer-response.dto.ts`, `client/src/features/trainer-match/components/trainer-match-screen.tsx` |
| TM-006 | 트레이너 카드를 누르면 상세 정보를 볼 수 있어야 한다. | 상세 모달이 소개, 경력, 자격, 코칭 철학, 비용, 추천 이유를 렌더링한다. | 구현 | `client/src/features/trainer-match/components/trainer-match-screen.tsx` |
| TM-007 | 카드에서 트레이너를 찜하고 다시 열어도 상태가 유지돼야 한다. | 하트 버튼이 `PUT /api/trainers/:trainerId/like`를 호출하고 `trainer_likes`에 사용자별로 저장한다. | 구현 | `server/src/modules/trainers/trainers.controller.ts`, `server/src/modules/trainers/trainers.repository.ts`, `client/src/features/trainer-match/components/trainer-match-screen.tsx` |
| TM-008 | 상세에서 PT 연결 요청을 보낼 수 있어야 한다. | `POST /api/trainers/:trainerId/connect-request`를 호출하고 성공 시 요청 상태를 반영한다. | 구현 | `server/src/modules/trainers/trainers.controller.ts`, `client/src/features/trainer-match/api/trainers.ts` |
| TM-009 | 같은 트레이너에 중복 연결 요청을 만들면 안 된다. | 서버가 기존 요청이 있으면 새 row를 만들지 않고 기존 요청을 반환한다. | 구현 | `server/src/modules/trainers/trainers.repository.ts` |
| TM-010 | 이미 요청한 트레이너는 목록/상세에서 상태를 확인할 수 있어야 한다. | `connectRequestStatus`가 `pending/accepted/rejected`로 응답되고 카드/버튼에 반영된다. | 구현 | `server/src/modules/trainers/trainers.repository.ts`, `client/src/features/trainer-match/components/trainer-match-screen.tsx` |

## 5. 추천 점수 계산 기준

| 항목 | 현재 반영 방식 |
| --- | --- |
| 훈련 부위 일치 | 최근 PT 일지의 상위 부위와 트레이너 `focusBodyParts` 교집합 수를 점수에 반영한다. |
| 목표 태그 일치 | `strength`, `posture`, `rehab`, `core`, `performance`, `beginner`, `conditioning` 태그를 계산해 트레이너 `matchTags`와 매칭한다. |
| 초보자 적합성 | 최근 활동량이 낮으면 `beginnerFriendly` 가산점을 준다. |
| 자세/회복 적합성 | 최근 근육통/코어 비중이 높으면 `postureFriendly`, `rehabFriendly` 가산점을 준다. |
| 기본 신뢰도 | 평점과 기본 회원 수를 보정 점수로 더한다. |

## 6. API 구현 현황

| Method | 경로 | 목적 | 비고 |
| --- | --- | --- | --- |
| `GET` | `/api/trainers` | 승인된 트레이너 카탈로그 조회 | display order 기준 |
| `GET` | `/api/trainers/recommended` | 사용자별 추천 트레이너 조회 | 규칙 기반 점수 계산 |
| `GET` | `/api/trainers/connect-requests` | 현재 사용자의 연결 요청 목록 | 상태 확인 용도 |
| `PUT` | `/api/trainers/:trainerId/like` | 트레이너 찜 상태 저장 | 사용자별 영속화 |
| `POST` | `/api/trainers/:trainerId/connect-request` | 트레이너 연결 요청 생성 | 중복 요청 시 기존 row 반환 |

## 7. 데이터 계약

### 트레이너 카탈로그

| 필드 | 설명 |
| --- | --- |
| `specialties[]` | 전문 분야 라벨 |
| `focusBodyParts[]` | 집중 부위 라벨 |
| `career` | 경력 요약 |
| `certifications[]` | 자격/특이 이력 |
| `philosophy` | 코칭 철학 |
| `memberCount` | `base_member_count + accepted 요청 수` |
| `liked` | 현재 사용자 기준 찜 상태 |
| `connectRequestStatus` | 현재 사용자 기준 연결 요청 상태 |

### 추천 결과 추가 필드

| 필드 | 설명 |
| --- | --- |
| `matchScore` | 1~100 정수 점수 |
| `highlightTag` | 가장 앞단에 보여줄 추천 포인트 |
| `matchReason` | 추천 근거 1~2문장 |

### 연결 요청

| 필드 | 설명 |
| --- | --- |
| `trainerId` | 대상 트레이너 ID |
| `message` | 선택 메시지. 현재 클라이언트는 빈 payload도 허용 |
| `status` | `pending`, `accepted`, `rejected` |

## 8. 테스트 근거

| 구분 | 파일 |
| --- | --- |
| 서버 서비스 | `server/src/modules/trainers/__tests__/trainers.service.spec.ts` |
| 서버 컨트롤러 | `server/src/modules/trainers/__tests__/trainers.controller.integration.spec.ts` |
| 클라이언트 API 래퍼 | `client/src/features/trainer-match/api/trainers.ts` |
| 클라이언트 화면 | `client/src/features/trainer-match/components/trainer-match-screen.tsx` |

## 9. 현재 갭 및 주의사항

| ID | 항목 | 현재 영향 |
| --- | --- | --- |
| TM-GAP-001 | 거절된 연결 요청 재신청 처리 미정 | 클라이언트는 재신청 가능처럼 보이지만, 서버는 기존 `rejected` 요청을 그대로 반환한다. |
| TM-GAP-002 | 트레이너 측 승인/거절 UI 미구현 | 현재 회원 측 요청 생성만 있고, 트레이너 앱에서 상태를 바꾸는 흐름은 없다. |
| TM-GAP-003 | 추천 사유 LLM 생성 미구현 | 추천 이유는 서버 템플릿 문구라 다양성은 낮지만 테스트와 결정성은 높다. |
| TM-GAP-004 | 가격/지역/온라인 필터 UI 미구현 | 응답 필드는 있지만 목록 필터 컨트롤은 아직 없다. |
| TM-GAP-005 | 실제 회원 수 대신 시드 기본 회원 수를 사용한다. | `memberCount`는 `base_member_count`와 승인된 연결 요청 수의 합이다. |
