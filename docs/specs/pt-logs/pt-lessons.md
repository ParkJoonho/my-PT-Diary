# PT 수업일지

작성일자: 2026-07-29

## 1. 문서 목적

`/pt-log` 탭의 PT 수업일지 기능이 현재 어떤 범위까지 서버와 클라이언트에 연결됐는지 정리한다.

이 문서는 회원용 PT 수업일지의 목록, 필터, 작성/수정/삭제, 주간 트래커 연동을 다루며, 트레이너 추천과 연결 요청은 [trainer-match.md](trainer-match.md)에서 별도로 다룬다.

## 2. 현재 범위

| 도메인 | 현재 범위 | 상태 |
| --- | --- | --- |
| PT 탭 진입 | 하단 탭 `PT` → `/pt-log` 라우트 연결 | 구현 |
| 수업일지 목록 | 사용자별 목록 조회, 최신순 정렬, 빈 상태 | 구현 |
| 날짜 필터 | 단일 날짜/기간 선택 필터, 달력 표시 점 | 구현 |
| 수업일지 생성 | 기본 정보, 부위, 기구, 웜업, 종목/세트, 메모 저장 | 구현 |
| 수업일지 수정 | 기존 PT 수업일지 조회 후 동일 폼에서 수정 | 구현 |
| 수업일지 삭제 | 목록 카드 long press 삭제 | 구현 |
| 입력 검증 | 저장 전 주요 입력 선검증, 저장 시 서버 상세 검증 | 구현 |
| 주간 트래커 연동 | PT 저장 시 `workout_completions.source = pt_lesson` 동시 생성 | 구현 |
| 트레이너 작성 일지 열람 | 회원 화면에서 트레이너가 작성한 별도 일지 조회 | 미구현 |

## 3. 구현 원칙

| 원칙 | 내용 |
| --- | --- |
| 서버 기준 | PT 수업일지의 기준 데이터는 PostgreSQL `pt_lessons` 테이블이다. |
| 사용자 분리 | 모든 CRUD는 `x-user-key` 기준으로 분리한다. |
| 완료 연쇄 | PT 수업일지 생성/수정/삭제는 연결된 `workout_completions`를 함께 반영한다. |
| 입력 밀도 유지 | 원본 앱의 고밀도 폼 구조와 세트 입력 흐름을 유지한다. |
| 요약 사전 계산 | 총 볼륨, 종목 수, 세트 수는 저장 시 `summary`에 함께 기록한다. |

## 4. 요구사항

| ID | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- |
| PTL-001 | `/pt-log` 탭으로 진입할 수 있어야 한다. | 홈 탭 바의 `pt-log`가 `/pt-log`로 이동한다. | 구현 | `client/src/features/home/components/home-tab-bar.tsx`, `client/src/pages/pt-log.tsx` |
| PTL-002 | 현재 사용자 기준 PT 수업일지 목록을 최신순으로 조회해야 한다. | `GET /api/pt-lessons`를 `x-user-key`와 함께 조회하고 `lesson_date DESC, created_at DESC` 기준으로 반환한다. | 구현 | `server/src/modules/pt-lessons/pt-lessons.controller.ts`, `server/src/modules/pt-lessons/pt-lessons.repository.ts`, `client/src/features/pt-logs/api/pt-lessons.ts` |
| PTL-003 | 목록에서 날짜 범위를 고르고 해당 범위만 필터링할 수 있어야 한다. | 클라이언트가 달력 모달에서 단일 날짜/기간을 고르고 `YYYY-MM-DD` 문자열 비교로 필터링한다. | 구현 | `client/src/features/pt-logs/components/pt-log-calendar-modal.tsx`, `client/src/features/pt-logs/components/pt-log-screen.tsx` |
| PTL-004 | 새 수업일지를 작성할 수 있어야 한다. | `/pt-lesson-form` create 모드에서 빈 draft로 시작해 `POST /api/pt-lessons`를 호출한다. | 구현 | `client/src/features/pt-logs/components/pt-lesson-form-screen.tsx`, `server/src/modules/pt-lessons/pt-lessons.controller.ts` |
| PTL-005 | 저장된 수업일지를 수정할 수 있어야 한다. | 목록 카드 선택 시 `lessonId`를 전달해 상세를 hydrate하고 `PUT /api/pt-lessons/:lessonId`를 호출한다. | 구현 | `client/src/pages/pt-lesson-form.tsx`, `client/src/features/pt-logs/api/pt-lessons.ts`, `server/src/modules/pt-lessons/pt-lessons.controller.ts` |
| PTL-006 | 수업일지를 삭제할 수 있어야 한다. | 목록 카드 long press 후 `DELETE /api/pt-lessons/:lessonId`를 호출한다. | 구현 | `client/src/features/pt-logs/components/pt-log-screen.tsx`, `server/src/modules/pt-lessons/pt-lessons.controller.ts` |
| PTL-007 | PT 저장 시 주간 트래커 완료도 함께 생성돼야 한다. | 저장 시 `pt_lessons`와 `workout_completions`를 같은 트랜잭션에서 저장하고 source는 `pt_lesson`으로 기록한다. | 구현 | `server/src/modules/pt-lessons/pt-lessons.repository.ts`, `server/src/modules/weekly-tracker/dto/create-weekly-workout.dto.ts` |
| PTL-008 | PT 수정 시 연결된 주간 완료 날짜와 note도 따라가야 한다. | update가 기존 `weekly_completion_id`를 읽어 `completed_on`, `note`를 함께 갱신한다. | 구현 | `server/src/modules/pt-lessons/pt-lessons.repository.ts` |
| PTL-009 | PT 삭제 시 연결된 주간 완료도 정리돼야 한다. | delete 후 `weekly_completion_id`가 있으면 같은 사용자 키의 `workout_completions`를 함께 삭제한다. | 구현 | `server/src/modules/pt-lessons/pt-lessons.repository.ts` |
| PTL-010 | 세트, 종목, 날짜, 세션 번호는 서버에서도 검증해야 한다. | Zod가 `lessonId` UUID, 날짜 형식, 세션 범위, 문자열 길이, 세트 수와 무게/횟수 범위를 검증한다. | 구현 | `server/src/modules/pt-lessons/pt-lessons.schemas.ts` |
| PTL-011 | 저장 전에 잘못된 값을 사용자에게 먼저 알려줘야 한다. | 클라이언트가 빈 날짜, 잘못된 날짜 형식, 세션 번호 1 미만, 빈 운동명, 음수 무게/횟수를 저장 전에 막는다. | 구현 | `client/src/features/pt-logs/lib/pt-lesson-validation.ts`, `client/src/features/pt-logs/components/pt-lesson-form-screen.tsx` |
| PTL-012 | 카드에서 총 볼륨과 부위 태그를 빠르게 볼 수 있어야 한다. | 목록 카드가 `summary.totalVolumeKg`와 `bodyParts` 태그를 렌더링한다. | 구현 | `client/src/features/pt-logs/components/pt-lesson-card.tsx` |
| PTL-013 | 생성/수정/삭제 후 PT 목록과 주간 트래커가 갱신돼야 한다. | mutation 성공 시 `pt-lessons` query prefix와 `weekly-tracker` query prefix를 invalidate한다. | 구현 | `client/src/features/pt-logs/api/pt-lessons.ts` |

## 5. API 구현 현황

| Method | 경로 | 목적 | 비고 |
| --- | --- | --- | --- |
| `GET` | `/api/pt-lessons` | PT 수업일지 목록 조회 | `from?`, `to?` |
| `GET` | `/api/pt-lessons/:lessonId` | PT 수업일지 상세 조회 | 수정 폼 hydrate 용도 |
| `POST` | `/api/pt-lessons` | PT 수업일지 생성 | 주간 완료도 함께 생성 |
| `PUT` | `/api/pt-lessons/:lessonId` | PT 수업일지 수정 | 연결된 주간 완료 날짜/note도 함께 갱신 |
| `DELETE` | `/api/pt-lessons/:lessonId` | PT 수업일지 삭제 | 연결된 주간 완료도 함께 삭제 |

## 6. 데이터 계약

### PT 수업일지 저장

| 필드 | 설명 |
| --- | --- |
| `date` | 클라이언트 기준 수업일 (`YYYY-MM-DD`) |
| `sessionNumber` | 정수 세션 번호 |
| `bodyParts[]` | 주요 훈련 부위 문자열 배열 |
| `equipment[]` | 사용 기구 문자열 배열 |
| `warmUp` | 웜업 메모 |
| `exercises[]` | 종목명, 세트, 휴식, RIR, 볼륨/LB/1RM/MAX를 포함한 상세 배열 |
| `comment` | 오늘의 한마디 메모 |

### PT 수업일지 응답

| 필드 | 설명 |
| --- | --- |
| `dayOfWeek` | `date` 기준 한글 요일 |
| `summary.exerciseCount` | 저장된 종목 수 |
| `summary.setCount` | 저장된 총 세트 수 |
| `summary.totalVolumeKg` | 각 종목 `volumeKg` 합계 |
| `createdAt` | 생성 시각의 Unix ms |

## 7. 테스트 근거

| 구분 | 파일 |
| --- | --- |
| 서버 서비스 | `server/src/modules/pt-lessons/__tests__/pt-lessons.service.spec.ts` |
| 서버 컨트롤러 | `server/src/modules/pt-lessons/__tests__/pt-lessons.controller.integration.spec.ts` |
| 클라이언트 타입/생성 API | `client/src/features/pt-logs/api/pt-lessons.ts`, `client/src/shared/api/generated/endpoints/pt-lessons/pt-lessons.ts` |

## 8. 현재 갭 및 주의사항

| ID | 항목 | 현재 영향 |
| --- | --- | --- |
| PTL-GAP-001 | 날짜 입력은 자유 텍스트다. | 서버 검증은 있지만, 클라이언트가 캘린더 입력으로 강제하지는 않는다. |
| PTL-GAP-002 | 폼 draft 영속화가 없다. | 작성 중 앱을 벗어나면 메모리 상태가 사라진다. |
| PTL-GAP-003 | 트레이너가 작성한 별도 회원 PT 일지와 통합되지 않았다. | 현재 회원용 `/pt-log`은 `pt_lessons`만 다루고, 트레이너 전용 작성 흐름은 없다. |
| PTL-GAP-004 | 운동 리포트 포함 정책이 아직 분리돼 있다. | PT 수업일지는 주간 트래커에는 반영되지만, 운동 리포트 총합 집계에는 아직 포함되지 않는다. |
| PTL-GAP-005 | 클라이언트 선검증과 서버 최대값 범위가 완전히 일치하지 않는다. | 클라이언트는 주요 오류를 먼저 막지만, 세션 500, 세트 50, 종목 30 같은 상한 초과는 아직 서버 오류로만 드러난다. |
| PTL-GAP-006 | 달력 모달의 오늘 날짜 기준이 UTC다. | 한국 시간 자정 직후에는 전날을 오늘로 표시할 수 있다. |
