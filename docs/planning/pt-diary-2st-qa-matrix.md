# PT Diary 1차 이후 원본 변경 상세 마이그레이션 스펙

작성일: 2026-08-03

## 문서 목적

이 문서는 1차 원본 이후 2차 원본에 추가 또는 변경된 내용을 마이그레이션 앱으로 이어서 옮기기 위한 상세 작업 스펙이다. 커밋 단위 요약이 아니라, 실제 구현 작업을 나누기 위한 기능/스펙 단위로 작성한다.

이 문서는 마이그레이션 본의 현재 구현 상태를 판단하지 않는다. `마이그레이션 본 상태`, `구현율`, `마이그레이션 메모` 칼럼은 후속 점검과 구현 진행 기록을 위해 비워둔다.

## 비교 기준

- 1차 원본 기준 경로: `C:\Users\User\Desktop\ai-atena\pt-diary-origin\pt-diary-1st-demo\my-PT-Diary`
- 1차 원본 기준 커밋: `9f74558` (`2026-06-04`, `Add trainer details modal to display trainer information`)
- 2차 원본 경로: `C:\Users\User\Desktop\ai-atena\pt-diary-origin\pt-diary-2st-demo`
- 2차 원본 기준 커밋: `cdad3c3` (`2026-08-01`, `Remove unused assets and update attached files`)
- 비교 범위: `9f74558..cdad3c3`

## 칼럼 정의

- `변화`: `추가`, `변경`, `수정`, `운영/문서`, `테스트` 중 하나 이상.
- `타입`: `UI`, `프론트`, `백엔드`, `DB`, `테스트`, `문서`, `배포`, `플랫폼`, `운영` 중 하나 이상.
- `상세 스펙`: 원본 2차 기준으로 사용자가 볼 수 있거나 시스템이 수행해야 하는 동작.
- `구현 체크포인트`: 마이그레이션 앱에서 옮길 때 확인해야 할 구현 단위. 현재 구현 여부 판단은 하지 않는다.
- `마이그레이션 본 상태`, `구현율`, `마이그레이션 메모`: 후속 작업자가 작성한다.

## 홈/탭/공통 네비게이션

| ID | 도메인 | 변화 | 타입 | 상세 스펙 | 구현 체크포인트 | 근거 커밋 | 변경 파일 | 마이그레이션 본 상태 | 구현율 | 마이그레이션 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DMS-001 | 홈 화면 | 변경 | UI, 프론트 | 홈 화면의 운동 카드 spacing, 추천 트레이너 영역, 주요 CTA 카드 간격과 폰트 굵기가 2차 원본 기준으로 조정되었다. 홈은 첫 진입 화면이므로 카드 간 위계, 제목, 설명, 탭 하단 여백이 원본과 맞아야 한다. | 홈 화면 카드 구조, 추천 트레이너 섹션, 운동 카드 spacing, 하단 탭 safe area 간격을 2차 원본과 대조한다. | `fc989d1`, `f9b4fda`, `d0559cc`, `2829267`, `25995b6`, `f3c1fdd` | `app/(tabs)/index.tsx`, `components/GlobalTabBar.tsx`, `components/AppHeader.tsx`, `locales/*/home.ts` |  |  |  |
| DMS-002 | 홈 추천 트레이너 | 변경 | UI, 프론트 | 홈 화면에 표시되는 AI 추천 트레이너 카드의 문구, 카드 스타일, 좋아요/상호작용 방식이 2차 원본에서 정리되었다. 카드가 단순 정보가 아니라 트레이너 매칭 흐름으로 자연스럽게 이어져야 한다. | 홈 추천 트레이너 카드 컴포넌트, like 상태, 상세 이동/모달 진입 여부, 빈 상태 문구를 확인한다. | `f9b4fda`, `d0559cc`, `705ead9`, `9f74558`, `ff95077` | `app/(tabs)/index.tsx`, `app/ai-trainer-match.tsx` |  |  |  |
| DMS-003 | 홈 요약 데이터 | 변경 | 프론트, 백엔드 | 홈에서 운동/식단/PT/AI 분석 등 사용자의 최근 상태를 요약하는 문구와 데이터 참조 방식이 변경되었다. 언어별 표시와 기록 기반 추천 문구가 함께 들어간다. | 홈에서 호출하는 API와 로컬 데이터 소스, 기록 없을 때 fallback, 최근 분석/운동/식단 summary 표시 방식을 확인한다. | `25995b6`, `f1626ff`, `f3c1fdd` | `app/(tabs)/index.tsx`, `lib/report-text.ts`, `locales/*/home.ts`, `locales/*/workout.ts` |  |  |  |
| DMS-004 | 하단 탭/상단 헤더 | 변경 | UI, 프론트, 플랫폼 | expo-router 제거 흐름과 함께 커스텀 `GlobalTabBar`, `AppHeader`, navigationRef 기반 이동으로 정리되었다. 뒤로가기 버튼은 실제 navigation history가 있을 때만 표시되어야 한다. | 앱 탭 구조, member/trainer tab 분기, header back arrow 조건, root tab에서 비정상 back 이동이 없는지 확인한다. | `07fc4ea`, `12885c5`, `8e10777`, `f3c1fdd` | `components/GlobalTabBar.tsx`, `components/AppHeader.tsx`, `app/(tabs)/*`, `app/(trainer-tabs)/*`, `app/_layout.tsx` |  |  |  |
| DMS-005 | Expo Router 제거 | 변경 | 프론트, 플랫폼 | dead expo-router layout 파일과 typedRoutes 설정이 제거되고, React Navigation 기반 흐름이 검증되었다. 기존 route param 읽기 방식도 `useLocalSearchParams`에서 navigation params 기반으로 바뀐 화면이 있다. | 마이그레이션 라우터에서 원본 route path, params, replace/back 동작을 매핑한다. expo-router 전용 코드를 그대로 옮기지 않는다. | `fe37fe0`, `e04fa85`, `12885c5` | `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(trainer-tabs)/_layout.tsx`, `app/+native-intent.tsx`, `app/+not-found.tsx` |  |  |  |
| DMS-006 | 공통 UI/네트워크 안정화 | 추가, 변경 | UI, 프론트, 플랫폼, 운영 | vector icon/font loading 실패 감지, 공통 icon wrapper, fetch 실패 기반 network-status, offline banner가 추가되었다. 앱 실행 중 네트워크가 끊겨도 crash/white screen이 되지 않고 상단 banner가 표시되며, 연결 복구 후 자동 사라져야 한다. | 아이콘 로딩 fallback, 폰트 경고, API wrapper의 네트워크 오류 추적, 복구 ping, query invalidate, 배너 접근성 role을 확인한다. | `607605d`, `5c1a36e`, `fae8063`, `110ebcb`, `25995b6` | `lib/icons.tsx`, `components/ErrorFallback.tsx`, `components/OfflineBanner.tsx`, `lib/network-status.ts`, `lib/query-client.ts` |  |  |  |

## 운동/기록/컨디션

| ID | 도메인 | 변화 | 타입 | 상세 스펙 | 구현 체크포인트 | 근거 커밋 | 변경 파일 | 마이그레이션 본 상태 | 구현율 | 마이그레이션 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DMS-009 | 운동 홈 | 변경 | UI, 프론트 | 운동 탭의 주요 카드, 루틴 타이틀, 운동배우기 진입 카드, 기록 카드 간격과 폰트 굵기가 2차 원본 기준으로 변경되었다. | 운동 탭 첫 화면의 카드 density, title font weight, safe area, 하단 탭 여백을 확인한다. | `c4f51de`, `e257fa5`, `fc989d1`, `25995b6` | `app/(tabs)/exercise.tsx`, `app/exercise-guide.tsx`, `app/active-workout.tsx` |  |  |  |
| DMS-010 | 활성 운동 타이머 | 수정 | 프론트 | 활성 운동 타이머와 세션 기준 경과 시간 저장 흐름이 정리되었다. 앱 background/화면 이동 후에도 운동 시간 계산이 실제 시작 시점 기준으로 안정적이어야 한다. | 시작 시간 ref, interval 정리, 종료 시 duration 계산, 최소 1초 저장 조건을 확인한다. | `1db3fa5` | `app/active-workout.tsx` |  |  |  |
| DMS-012 | 활성 운동 영상 촬영 | 변경 | 프론트, 플랫폼 | 영상 촬영이 Expo Camera/View 계열에서 platform compatibility wrapper 및 vision-camera 계열 callback API에 맞게 조정되었다. 웹에서는 모바일 전용 안내를 보여준다. | camera permission, camera device, startRecording callback, stopRecording async, web unsupported alert를 확인한다. | `1db3fa5`, `352ff47` | `app/active-workout.tsx`, `lib/camera-compat.ts`, `lib/camera-compat.native.ts` |  |  |  |
| DMS-013 | 운동 영상 프레임/자세 피드백 | 변경 | 프론트, 백엔드, 플랫폼 | 활성 운동 중 촬영한 영상에서 thumbnail frame을 만들고 base64로 읽어 트레이너 피드백 또는 AI 자세 분석 요청에 사용한다. 트레이너 연결 없음, 프레임 추출 실패, AI 분석 실패, 빈 결과를 구분해 안내한다. | thumbnail 생성, base64 읽기, `/api/video-feedback`, `/api/ai/posture-analysis`, feedbackType, memberMessage, 실패 alert 분기를 확인한다. | `1db3fa5`, `f1626ff` | `app/active-workout.tsx`, `app/ai-analysis.tsx`, `app/trainer-video-feedback.tsx`, `server/routes.ts`, `server/ai-routes.ts`, `lib/video-thumbnails.ts`, `lib/fs.ts` |  |  |  |
| DMS-016 | 운동 종료 저장 | 변경 | 프론트, 백엔드 | 운동 종료 시 routine summary, 운동 시간, 완료 항목, 근력 운동 개수, 유산소 데이터를 개인 운동 기록으로 저장한다. 저장 완료 alert가 다국어 문구로 구성된다. | 저장 payload의 dailyReport, exerciseTime, exercises/cardio fields, routineUsage 저장 여부를 확인한다. | `1db3fa5`, `f1626ff` | `app/active-workout.tsx`, `lib/report-text.ts`, `server/routes.ts` |  |  |  |
| DMS-017 | 운동 기록 날짜 필터 | 추가 | UI, 프론트 | 운동 기록 목록에 날짜 필터와 전체 기록 보기 흐름이 추가되었다. 사용자는 특정 날짜 기록을 필터링하고, 전체 기록 목록으로 돌아갈 수 있어야 한다. | date filter UI, selected date state, full list toggle, empty state 문구를 확인한다. | `c0c7b7b` | `app/exercise-list.tsx` |  |  |  |
| DMS-018 | 운동 시간 문자열 파싱 | 수정 | 프론트 | `1시간 30분`, `1 hr 30 min` 같은 혼합 시간 문자열을 `parseInt`로 잘라먹지 않고 총 분/초로 계산한다. | 한국어/영어 시간 문자열 파서, 단일 시간/분/초, 잘못된 문자열 validation을 확인한다. | `b3affbe` | `app/exercise-list.tsx` |  |  |  |
| DMS-019 | 영어 화면 운동 기록 표시 | 변경 | 프론트 | 서버 통계에 쓰는 저장 값은 한국어를 유지하되, 영어 화면에서는 운동 타입과 운동 시간을 영어로 표시한다. | 저장 데이터와 표시 데이터 분리, legacy Korean display transform, report text formatter를 확인한다. | `369ce12` | `app/(tabs)/exercise.tsx`, `app/exercise-form.tsx`, `app/exercise-list.tsx`, `lib/report-text.ts` |  |  |  |
| DMS-020 | 운동 요약 언어별 저장 | 변경 | 프론트, 백엔드 | 운동 summary와 trainer feedback message가 사용자의 현재 언어로 저장된다. 기존 한국어 기록은 영어 화면에서 표시용으로 번역 처리된다. 저장 데이터와 표시 데이터 분리도 함께 포함된다. | dailyReport 생성, memberMessage 생성, admin stats에서 ko/en 패턴 모두 인식, legacy transform, report text formatter를 확인한다. | `f1626ff`, `369ce12` | `app/active-workout.tsx`, `app/exercise-form.tsx`, `app/trainer-video-feedback.tsx`, `server/admin-routes.ts`, `lib/report-text.ts` |  |  |  |
| DMS-021 | 컨디션/근육통 라벨 | 수정 | UI, 프론트 | 컨디션 점수와 근육통 점수의 라벨/색상 매핑을 공통 helper로 통합하고, 컨디션 5점 또는 평균 5.0은 `매우 좋음`으로 표시한다. 컨디션 화면, 기록 탭, 트레이너 회원 컨디션 조회가 동일 기준을 사용해야 한다. | label/color helper, soreness helper, 0점 처리, 평균 계산, form/list/report/trainer view 재사용 여부를 확인한다. | `9d58c8d`, `e86fcd9` | `app/condition-form.tsx`, `app/condition-list.tsx`, `app/(tabs)/exercise.tsx`, `app/trainer-condition-view.tsx`, `lib/helpers.ts` |  |  |  |
| DMS-024 | PT 일지 목록 UI | 변경 | UI, 프론트 | PT 일지 화면이 운동 기록 화면의 외형에 맞춰 정리되고, 카드/목록/상단 간격이 조정되었다. | PT log list card, empty state, date display, member/trainer 진입 경로를 확인한다. | `d39148a`, `25995b6`, `f3c1fdd` | `app/(tabs)/pt-log.tsx`, `app/pt-lesson-form.tsx`, `locales/*/pt.ts` |  |  |  |
| DMS-025 | PT 일지 FAB | 추가, 변경 | UI, 프론트 | PT 일지 화면의 새 기록 작성 액션이 floating action button으로 변경되었다. | FAB 위치, safe area, press target, 작성 화면 이동 param을 확인한다. | `4ace668`, `fbef368` | `app/(tabs)/pt-log.tsx` |  |  |  |

## 트레이너/회원 운영 기능

| ID | 도메인 | 변화 | 타입 | 상세 스펙 | 구현 체크포인트 | 근거 커밋 | 변경 파일 | 마이그레이션 본 상태 | 구현율 | 마이그레이션 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DMS-026 | AI 트레이너 매칭 화면 | 변경 | UI, 프론트 | 매칭 화면 제목, 추천 설명, 섹션 레이아웃, 카드 간격이 조정되었다. 사용자는 추천 근거를 읽고 자연스럽게 트레이너를 비교할 수 있어야 한다. | title, recommendation copy, card spacing, section header, scroll layout을 확인한다. | `ba458a1`, `1e2baef`, `f9ad420`, `b79feb1` | `app/ai-trainer-match.tsx` |  |  |  |
| DMS-027 | 트레이너 정렬 | 추가 | UI, 프론트 | 트레이너 매칭에 정렬 옵션이 추가되며, 인기순 등 기준으로 카드 목록을 정렬한다. 정렬 UI는 페이지 타이틀 옆에 놓인다. | sort state, sort option labels, sorting comparator, title row layout을 확인한다. | `f6e4dcc`, `a9d9815` | `app/ai-trainer-match.tsx` |  |  |  |
| DMS-028 | 트레이너 카드 좋아요 | 변경 | UI, 프론트, 백엔드 | 트레이너 카드의 찜/좋아요 인터페이스가 일관되게 정리되었다. 홈 카드와 매칭 카드의 인터랙션이 동일해야 한다. | like button state, optimistic update, duplicate request 방지, 홈/매칭 공통 스타일을 확인한다. | `ff95077`, `705ead9` | `app/ai-trainer-match.tsx`, `app/(tabs)/index.tsx` |  |  |  |
| DMS-029 | 트레이너 상세 모달 | 추가 | UI, 프론트 | 트레이너 카드에서 상세 정보를 볼 수 있는 모달이 추가되었다. 프로필, 소개, 전문 분야, 후기/지표 등 카드보다 자세한 정보가 표시된다. | modal open/close, selected trainer state, scrollable content, 접근성 close action을 확인한다. | `9f74558` | `app/ai-trainer-match.tsx` |  |  |  |
| DMS-030 | 트레이너 탭 구조 | 변경 | UI, 프론트 | 트레이너 홈, 회원, 일정, 영상, 이벤트, 매출, 프로필 탭의 레이아웃과 navigation 구조가 정리되었다. | trainer tab navigator, tab labels/icons, 각 탭의 목록/empty/loading state를 확인한다. | `25995b6`, `07fc4ea`, `15fbc6b` | `app/(trainer-tabs)/index.tsx`, `app/(trainer-tabs)/members.tsx`, `app/(trainer-tabs)/schedule.tsx`, `app/(trainer-tabs)/videos.tsx`, `app/(trainer-tabs)/events.tsx`, `app/(trainer-tabs)/revenue.tsx`, `app/(trainer-tabs)/profile.tsx` |  |  |  |
| DMS-031 | 트레이너 회원 컨디션 조회 | 변경 | UI, 프론트, 백엔드 | 트레이너가 회원의 컨디션/근육통 기록을 조회할 때 2차 원본의 점수 라벨/색상 매핑을 사용한다. | `/api/trainer/members/:memberId/condition-checks`, helper reuse, empty state를 확인한다. | `9d58c8d`, `25995b6` | `app/trainer-condition-view.tsx`, `server/trainer-routes.ts`, `lib/helpers.ts` |  |  |  |
| DMS-032 | 트레이너 영상 피드백 | 변경 | UI, 프론트, 백엔드 | 트레이너가 회원 자세 피드백 요청을 보고 답변하는 화면과 메시지 저장 언어 처리 방식이 조정되었다. | feedback list/detail, status update, trainer comment, language-specific message를 확인한다. | `f1626ff`, `25995b6` | `app/trainer-video-feedback.tsx`, `server/trainer-routes.ts`, `server/routes.ts` |  |  |  |
| DMS-033 | 트레이너 자세 촬영 | 변경 | 프론트, 플랫폼 | 트레이너가 회원 자세를 촬영하는 화면이 카메라 호환 레이어와 파일 읽기 유틸을 사용하도록 조정되었다. | camera permission, image/video capture, file base64, submit payload를 확인한다. | `25995b6`, `1db3fa5` | `app/trainer-posture-capture.tsx`, `lib/camera-compat.ts`, `lib/fs.ts` |  |  |  |
| DMS-034 | 트레이너 영양 관리 | 변경 | UI, 프론트, 백엔드 | 트레이너 nutrition 탭에서 회원 식단 기록, 식단 노트, AI 식단 가이드 요청 흐름을 제공한다. | member selector, meal records query, diet note get/post, diet-guide call을 확인한다. | `25995b6`, `1db3fa5` | `app/(trainer-tabs)/nutrition.tsx`, `server/trainer-routes.ts`, `server/routes.ts` |  |  |  |

## AI Hub/분석/식단/Athena

| ID | 도메인 | 변화 | 타입 | 상세 스펙 | 구현 체크포인트 | 근거 커밋 | 변경 파일 | 마이그레이션 본 상태 | 구현율 | 마이그레이션 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DMS-035 | AI Hub 카드 | 변경 | UI, 프론트 | AI Hub 카드 목록, 아이콘, 설명 문구, 진입 흐름이 다국어/새 레이아웃 기준으로 변경되었다. | 카드 6개 구성, 미구현 기능 안내, 실제 화면 이동, tab active state를 확인한다. | `25995b6`, `f3c1fdd`, `1db3fa5` | `app/(tabs)/ai-hub.tsx`, `locales/*/ai.ts`, `locales/*/analysis.ts` |  |  |  |
| DMS-036 | AI 분석 입력 UX | 변경 | UI, 프론트 | AI 체형/신발/자세/비교 분석 입력 화면에서 이미지 선택, 카메라/갤러리, optional inputs, alert 문구가 정리되었다. | image-picker wrapper, required image validation, optional field validation, failure alert를 확인한다. | `1db3fa5`, `25995b6`, `f3c1fdd` | `app/ai-analysis.tsx`, `app/my-body-style.tsx`, `lib/image-picker.ts`, `locales/*/analysis.ts` |  |  |  |
| DMS-037 | AI 분석 결과 UI | 변경 | UI, 프론트 | 체형/신발/자세/비교 분석 결과 카드의 섹션, 점수, 요약, 권장사항 표시가 조정되었다. | result schema mapping, null/partial response handling, section ordering, back/history actions를 확인한다. | `1db3fa5`, `4faf6f4` | `app/ai-analysis.tsx`, `app/analysis-history.tsx`, `locales/*/analysis.ts`, `locales/*/body.ts` |  |  |  |
| DMS-038 | 분석 이력 저장 | 변경 | 프론트, 백엔드 | AI 분석 성공 후 분석 기록을 사용자별로 저장하고, 저장 성공/실패와 분석 성공/실패를 구분한다. | `/api/analysis-records`, retry/save failed banner, duplicate save prevention, history invalidation을 확인한다. | `1db3fa5`, `f1626ff` | `app/ai-analysis.tsx`, `app/analysis-history.tsx`, `server/routes.ts`, `server/ai-routes.ts` |  |  |  |
| DMS-039 | 분석 이력 비교 | 변경 | UI, 프론트, 백엔드 | 분석 이력에서 기록을 선택해 비교하고, 변화 방향과 요약을 표시한다. | compare selectable types, body-only guard, compare endpoint, before/after presentation을 확인한다. | `1db3fa5`, `4faf6f4` | `app/analysis-history.tsx`, `server/ai-routes.ts` |  |  |  |
| DMS-040 | AI 모델 변경 | 변경 | 백엔드 | 서버 AI 라우트의 기본 LLM 모델이 `gpt-5-mini`로 변경되었다. STT는 별도 transcribe 모델을 사용한다. | AI client/model constants, env override 여부, logging, fallback error를 확인한다. | `2887705`, `0cbbb89` | `server/ai-routes.ts` |  |  |  |
| DMS-041 | 식단 분석 입력 | 변경 | UI, 프론트 | 식단 분석에서 식사 타입, 식전/식후 사진, 분석 버튼 활성화, 재분석/저장 액션이 정리되었다. | mealType enum, before photo required, after photo optional, disabled state, error alert를 확인한다. | `1db3fa5`, `f3c1fdd` | `app/meal-analysis.tsx`, `locales/*/meal.ts` |  |  |  |
| DMS-042 | 식단 분석 결과 | 변경 | UI, 프론트, 백엔드 | 식단 AI 결과에 음식별 중량/칼로리/탄단지/피드백/요약/먹는 속도 추정 등을 표시한다. | AI response schema, result sections, empty food result, invalid response guard를 확인한다. | `1db3fa5`, `4faf6f4` | `app/meal-analysis.tsx`, `server/ai-routes.ts`, `locales/*/meal.ts` |  |  |  |
| DMS-043 | 식단 기록 저장/일일 요약 | 변경 | 프론트, 백엔드 | 식단 분석 결과를 사용자별 날짜/식사 타입으로 저장하고, 오늘 영양 섭취 총합과 기록 목록을 조회한다. | `/api/meal-records`, `/api/meal-records/daily-summary`, date key, query invalidation을 확인한다. | `1db3fa5`, `f1626ff` | `app/meal-analysis.tsx`, `server/routes.ts`, `shared/schema.ts` |  |  |  |
| DMS-044 | AI 식단 가이드 | 변경 | 프론트, 백엔드 | 저장된 식단 기록을 바탕으로 AI 식단 가이드를 생성하고, 기록이 없을 때 일반 안내와 구분한다. | `/api/ai/diet-guide`, source meal count, guide result sections, retry/failed UI를 확인한다. | `1db3fa5` | `app/meal-analysis.tsx`, `server/ai-routes.ts`, `locales/*/meal.ts` |  |  |  |
| DMS-045 | Athena 채팅 | 변경 | UI, 프론트, 백엔드 | Athena 화면에서 1,000자 질문, 빠른 코칭 버튼, 대기/응답 상태, 최근 컨텍스트 기반 채팅을 제공한다. | `/api/ai/athena-chat`, messages payload, role validation, loading state, quick prompt buttons를 확인한다. | `1db3fa5`, `c5de714`, `f3c1fdd` | `app/athena.tsx`, `server/ai-routes.ts`, `locales/*/ai.ts` |  |  |  |
| DMS-046 | Athena STT | 변경 | 프론트, 백엔드, 플랫폼 | Athena 음성 입력은 web `MediaRecorder`, native `react-native-nitro-sound` 기반으로 녹음하고 서버 STT endpoint가 audio format을 정규화한다. | audio recorder abstraction, permission, file/blob conversion, `/api/ai/speech-to-text` payload를 확인한다. | `eddd221`, `e3fdbe6`, `352ff47`, `0cbbb89` | `app/athena.tsx`, `lib/audio-recorder.ts`, `server/ai-routes.ts`, `package.json`, `app.json` |  |  |  |
| DMS-047 | STT 에러 세분화 | 수정 | UI, 프론트, 백엔드 | STT 실패는 빈 오디오, 크기 초과, 지원하지 않는 포맷, upstream 실패, 빈 transcription 등으로 나뉘며 클라이언트가 구체 메시지를 보여준다. | server error code/message, client alert, diagnostic logs, web alert visibility를 확인한다. | `c5de714`, `ac8d4c2` | `app/athena.tsx`, `server/ai-routes.ts` |  |  |  |
| DMS-048 | 대화 저장 테이블 | 추가 | 백엔드, DB | replit chat/audio integration용 `conversations`, `messages` 테이블이 schema에 추가되었다. | 실제 서비스 사용 여부, conversation CRUD, message append/delete, user scope를 확인한다. | `e3fdbe6`, `352ff47` | `shared/schema.ts`, `server/replit_integrations/chat/routes.ts`, `server/replit_integrations/audio/routes.ts` |  |  |  |

## 야외운동/지도/고도

| ID | 도메인 | 변화 | 타입 | 상세 스펙 | 구현 체크포인트 | 근거 커밋 | 변경 파일 | 마이그레이션 본 상태 | 구현율 | 마이그레이션 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DMS-049 | 야외운동 GPS | 추가, 변경 | 프론트, 플랫폼 | 야외운동 계획은 현재 위치를 가져오고, 실패 시 서울/서초동 fallback을 사용한다. 위치 이름을 해석하지 못하면 `내 위치`를 표시한다. | permission request, current position, fallback coordinates, location name fallback을 확인한다. | `ee94194`, `3786431`, `1fc065e`, `e457dda` | `app/(tabs)/outdoor-workout.tsx`, `lib/location.ts`, `lib/geocache.ts`, `test/location.test.ts` |  |  |  |
| DMS-050 | 수동 위치 선택 | 추가 | UI, 프론트 | GPS가 불가능하거나 사용자가 직접 위치를 고르고 싶을 때 수동 위치 입력/선택 흐름을 제공한다. | manual picker open/close, search input, selected location state, confirm action을 확인한다. | `1fc065e`, `e457dda` | `app/(tabs)/outdoor-workout.tsx`, `lib/location.ts` |  |  |  |
| DMS-051 | 지도 핀 선택 | 추가 | UI, 프론트 | 위치 선택기에 지도 탭이 추가되어 OpenStreetMap에서 핀을 탭/드래그하고 확정할 수 있다. 확정하면 reverse geocode로 주소를 갱신한다. | map webview/component, pin drag state, confirm button, reverse geocode integration을 확인한다. | `fa68758`, `7518476`, `32dd32d` | `components/LocationMapPicker.tsx`, `app/(tabs)/outdoor-workout.tsx` |  |  |  |
| DMS-052 | 지도 오류 retry | 추가 | UI, 프론트 | 지도 타일이 실패하거나 timeout이면 명확한 오류 overlay와 retry 버튼을 표시한다. web/native map picker에서 모두 crash 없이 동작해야 한다. | tile load timeout, error overlay, retry button, native/web parity를 확인한다. | `7672502`, `bc9f29b` | `components/LocationMapPicker.tsx` |  |  |  |
| DMS-053 | Nominatim 프록시 | 추가 | 백엔드, 프론트 | geocoding/search/reverse geocode 요청을 클라이언트가 직접 Nominatim에 보내지 않고 백엔드 `/api/geocode/*`로 프록시한다. | `/api/geocode/search`, `/api/geocode/reverse`, query validation, client base URL을 확인한다. | `45e34e4` | `server/geocode-routes.ts`, `server/routes.ts`, `app/(tabs)/outdoor-workout.tsx`, `lib/geocache.ts` |  |  |  |
| DMS-054 | 지오코딩 캐시 | 추가, 수정 | 프론트, 백엔드, 테스트 | reverse geocode는 cache와 rate limit을 적용한다. 좌표가 50m 이상 이동하면 stale cache를 버리고, TTL expiry와 비정상 응답은 캐시하지 않는다. | cache key, 50m eviction, TTL, non-OK no-cache, Retry-After backoff를 확인한다. | `d051201`, `a0dac0c`, `aa0461b`, `ba5bfc3`, `346debd`, `d159ea8`, `b50c36a`, `4aaba33`, `0aa0904` | `lib/geocache.ts`, `server/geocode-routes.ts`, `test/location.test.ts` |  |  |  |
| DMS-055 | 고도 데이터 조회 | 추가 | 프론트 | 야외운동 경로 계획 전 route sample points의 고도를 조회하고, 결과 화면에 고도 그래프를 표시한다. | elevation API call, sample route points, failure fallback, result graph scale을 확인한다. | `ef98730`, `e558f79`, `e457dda` | `lib/elevation.ts`, `app/(tabs)/outdoor-workout.tsx`, `app/(tabs)/outdoor-workout-result.tsx`, `test/elevation.test.ts` |  |  |  |
| DMS-056 | 고도 실패 경고 | 추가, 변경 | UI, 프론트, 백엔드 | 고도 데이터 실패 시 조용히 평지로 가정하지 않고, 사용자 화면과 AI prompt에 고도 데이터 없음/평지 가정 경고를 전달한다. | warning banner/copy, AI prompt context, result screen notice, flat-terrain text를 확인한다. | `ef98730`, `e558f79` | `app/(tabs)/outdoor-workout.tsx`, `app/(tabs)/outdoor-workout-result.tsx`, `server/ai-routes.ts` |  |  |  |
| DMS-057 | 야외운동 AI payload | 변경 | 프론트, 백엔드, 테스트 | 야외운동 AI 계획 요청은 위치, 목적, 거리/시간, route points, elevationData 등을 포함하며 payload contract가 테스트로 검증된다. | request DTO, required/optional fields, real server integration, mock OpenAI tests를 확인한다. | `e457dda`, `1ab458c`, `4faf6f4` | `app/(tabs)/outdoor-workout.tsx`, `server/ai-routes.ts`, `test/outdoor-workout.test.ts`, `test/outdoor-plan-integration.test.ts` |  |  |  |
| DMS-058 | 야외운동 AI 응답 검증 | 수정 | 백엔드, 테스트 | AI 응답에서 `courseWaypoints`를 요구하고, 부분 응답이나 누락된 필드가 있으면 안전하게 실패 처리한다. | response schema, 500 path, error message, courseWaypoints required guard를 확인한다. | `1ab458c`, `4faf6f4` | `server/ai-routes.ts`, `test/outdoor-plan-integration.test.ts` |  |  |  |
| DMS-059 | 야외운동 결과 화면 | 변경 | UI, 프론트 | 결과 화면에 코스 요약, 고도차, 고도 그래프, waypoint, 호흡/휴식/주의사항/음성안내 토글 등이 표시된다. | result layout, elevation chart, waypoint list, voice toggle, save routine action을 확인한다. | `e558f79`, `1ab458c`, `f1626ff` | `app/(tabs)/outdoor-workout-result.tsx`, `lib/outdoor-plan-store.ts`, `locales/*/workout.ts` |  |  |  |

## 회복 스케줄/관리자/운영 DB

| ID | 도메인 | 변화 | 타입 | 상세 스펙 | 구현 체크포인트 | 근거 커밋 | 변경 파일 | 마이그레이션 본 상태 | 구현율 | 마이그레이션 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DMS-060 | 회복 스케줄 DB | 추가 | DB, 백엔드 | `recovery_schedules` 테이블이 추가되어 trainer/member/PT lesson 연결, title, scheduledDate, items, status, aiGenerated, trainerNote를 저장한다. | schema/table, migration SQL, user/trainer foreign keys, json items structure를 확인한다. | `4684e1d`, `25995b6` | `shared/schema.ts`, `server/recovery-routes.ts` |  |  |  |
| DMS-061 | 회원 회복 스케줄 화면 | 추가 | UI, 프론트, 백엔드 | 회원은 배정된 회복 스케줄 목록을 보고, 각 item을 체크/해제할 수 있다. 모든 item 완료 시 스케줄 status가 completed가 된다. | `/api/recovery-schedules`, item toggle endpoint, progress bar, completed state, empty state를 확인한다. | `4684e1d`, `25995b6` | `app/recovery-schedule.tsx`, `server/recovery-routes.ts`, `locales/*/recovery.ts` |  |  |  |
| DMS-062 | 트레이너 회복 스케줄 목록 | 추가 | UI, 프론트, 백엔드 | 트레이너는 전체/회원별 회복 스케줄 목록을 조회하고, draft/assigned/completed 상태를 관리할 수 있다. | `/api/trainer/recovery-schedules`, member filter, list cards, delete action을 확인한다. | `4684e1d`, `25995b6` | `app/trainer-recovery-schedules.tsx`, `server/recovery-routes.ts` |  |  |  |
| DMS-063 | 트레이너 회복 스케줄 작성 | 추가 | UI, 프론트, 백엔드 | 트레이너는 회원, PT lesson, 날짜, 회복 item, trainer note를 입력해 회복 스케줄을 draft 또는 assigned로 생성/수정한다. | create/update form, validation, assign action, item normalizer를 확인한다. | `4684e1d`, `25995b6` | `app/trainer-recovery-form.tsx`, `server/recovery-routes.ts` |  |  |  |
| DMS-064 | 회복 스케줄 AI draft | 추가 | 백엔드, 프론트 | 트레이너가 회원/최근 PT 정보를 바탕으로 AI 회복 스케줄 초안을 생성할 수 있다. AI 응답은 items/title/note로 정규화된다. | `/api/trainer/recovery-schedules/ai-draft`, OpenAI model, recent member context, invalid response guard를 확인한다. | `4684e1d` | `server/recovery-routes.ts`, `app/trainer-recovery-form.tsx` |  |  |  |
| DMS-065 | 관리자 인증 | 추가, 변경 | 백엔드, UI | 관리자 로그인, JWT 발급, `/api/admin/me`, admin dashboard 접근이 구현/확장되었다. | adminUsers table, password compare, JWT secret, adminAuth middleware, dashboard template을 확인한다. | `861894c` | `server/admin-routes.ts`, `server/templates/admin-dashboard.html`, `shared/schema.ts` |  |  |  |
| DMS-066 | 관리자 회원/트레이너 관리 | 추가, 변경 | 백엔드, UI, DB | 관리자는 회원 목록/상세, 회원 tier/status 변경, 트레이너 목록/승인/상세를 볼 수 있다. | list pagination/search/filter, update endpoints, trainer approve, detail join data를 확인한다. | `861894c` | `server/admin-routes.ts`, `server/templates/admin-dashboard.html` |  |  |  |
| DMS-067 | 관리자 회원 운동/분석 조회 | 추가, 변경 | 백엔드, UI | 관리자는 회원별 운동 기록, 분석 기록, body trend, payments를 조회한다. 영어 dailyReport 패턴도 routine count에 반영한다. | workout query, analysis query, body trend aggregation, ko/en report pattern을 확인한다. | `861894c`, `f1626ff` | `server/admin-routes.ts`, `server/templates/admin-dashboard.html` |  |  |  |
| DMS-068 | 관리자 매출 관리 | 추가, 변경 | 백엔드, UI | 관리자 매출 overview, 회원 매출, 트레이너 매출, 월별 요약 API가 추가/확장되었다. | member_payments, trainer_revenues query, create/delete revenue rows, monthly summary를 확인한다. | `861894c` | `server/admin-routes.ts`, `server/templates/admin-dashboard.html`, `shared/schema.ts` |  |  |  |
| DMS-069 | 멤버십 관리 | 추가 | 백엔드, DB, UI | `memberships` 테이블과 관리자 회원권 목록/회원별 조회/생성/수정/삭제 API가 추가되었다. active/expiring/expired filter를 지원한다. | memberships schema, CRUD endpoints, date comparison, PT sessions fields, pagination을 확인한다. | `861894c` | `shared/schema.ts`, `server/admin-routes.ts`, `server/templates/admin-dashboard.html` |  |  |  |
| DMS-070 | 출석 관리 | 추가 | 백엔드, DB, UI | `gym_attendance` 테이블과 오늘/주간 출석 요약, 최근 체크인, 수동 출석 등록/삭제, 회원별 출석 내역 API가 추가되었다. | attendance schema, summary aggregation, manual source, duplicate policy, member detail display를 확인한다. | `861894c` | `shared/schema.ts`, `server/admin-routes.ts`, `server/templates/admin-dashboard.html` |  |  |  |
| DMS-071 | 관리자 CRM/분석 | 추가 | 백엔드, UI | 관리자 CRM stats, trainer performance, monthly revenue summary, data analytics endpoint가 추가/확장되었다. | dashboard cards, aggregation SQL, dataAnalyticsLogs 사용 여부, empty data handling을 확인한다. | `861894c` | `server/admin-routes.ts`, `shared/schema.ts`, `server/templates/admin-dashboard.html` |  |  |  |
| DMS-072 | 테스트 계정 cleanup | 추가 | 백엔드, 운영, 테스트 | 개발/테스트 계정을 안전하게 정리하는 shared cleanup module, dev-only endpoint, CLI script, 일일 scheduler가 추가되었다. | cleanup target pattern, dependent row delete order, production guard, schedule env override를 확인한다. | `197f7a2`, `0059d54`, `873acdf`, `af0b459` | `server/test-cleanup.ts`, `server/cleanup-scheduler.ts`, `server/routes.ts`, `scripts/cleanup-test-accounts.ts`, `test/signup-persistence.test.ts` |  |  |  |
| DMS-073 | 회원가입 persistence 테스트 | 추가, 수정 | 백엔드, 테스트 | 회원가입이 API/UI/DB에 실제 저장되는지 검증하는 integration test가 추가되었다. 테스트 후 cleanup이 안전하게 동작해야 한다. | register endpoint, DB persistence, duplicate email, cleanup after test를 확인한다. | `873acdf` | `server/routes.ts`, `test/signup-persistence.test.ts`, `server/test-cleanup.ts` |  |  |  |

## i18n/문구/스토어/배포/테스트

| ID | 도메인 | 변화 | 타입 | 상세 스펙 | 구현 체크포인트 | 근거 커밋 | 변경 파일 | 마이그레이션 본 상태 | 구현율 | 마이그레이션 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DMS-074 | i18n 기반 | 추가 | 프론트, 문서, 테스트 | ko/en locale 구조와 `t()` helper가 추가되어 주요 화면 문구가 번역 key 기반으로 표시된다. | locale detection, key namespace, interpolation `%{var}`, fallback locale을 확인한다. | `f3c1fdd`, `dfae634` | `lib/i18n.ts`, `locales/index.ts`, `locales/ko/*`, `locales/en/*` |  |  |  |
| DMS-075 | 번역 검증 | 추가 | 테스트, 운영 | `npm run check:translations`가 추가되어 ko/en key structure와 placeholder 불일치를 자동 검증한다. | script command, CI/preflight 연결, 실패 메시지, nested key validation을 확인한다. | `dfae634`, `d73a74b` | `scripts/check-translations.ts`, `package.json` |  |  |  |
| DMS-076 | 스토어/배포 산출물 | 추가 | 문서, 배포, 플랫폼, 운영 | 영어/한국어 스토어 스크린샷, feature graphic, EAS build profiles, Expo dev-client 폰 설치 가이드, App Store/Google Play 제출 자동화 스크립트와 credential 가이드가 추가되었다. | 마이그레이션 앱 배포 방식에 맞게 asset 생성/보관 여부, build profile, credential path, submit script 필요 여부를 결정한다. | `eb6bf3c`, `7dfe1e4`, `e86fcd9`, `2445277`, `8e5cf2e`, `0d41855`, `76b8c73`, `60b225f`, `e829ac3`, `f39d8a6` | `docs/store-assets/*`, `scripts/store-screenshots*.mjs`, `app.json`, `eas.json`, `docs/phone-build.md`, `docs/store-credentials.md`, `docs/unattended-submit.md`, `scripts/eas-submit.sh` |  |  |  |
| DMS-077 | 테스트/운영/제품자료 | 추가 | 테스트, 문서, 운영 | typecheck, outdoor/location/elevation/signup 테스트, QA 기록, 향후 작업 문서, 피치덱/제품자료 generator가 추가되었다. 앱 기능 구현 대상과 운영 참고 자료를 구분해야 한다. | 마이그레이션 앱의 test runner에 맞는 equivalent test 작성 여부, 운영 문서 재작성 여부, pitch deck 산출물 보존 여부를 결정한다. | `d73a74b`, `4faf6f4`, `e457dda`, `873acdf`, `346debd`, `ba5bfc3`, `4684e1d`, `110ebcb`, `9fed082` | `package.json`, `test/*`, `docs/future-work.md`, `docs/qa/task-60-offline-banner-midsession.md`, `scripts/generate-pitch-deck.js`, `A2T_*` |  |  |  |

## 확인 명령

원본 변경 커밋:

```bash
git log --oneline --date=short 9f74558..cdad3c3 -- app lib server shared locales package.json app.json eas.json docs scripts test
```

원본 변경 파일:

```bash
git diff --name-only 9f74558..cdad3c3 -- app lib server shared locales package.json app.json eas.json docs scripts test
```

DB 관련 변경:

```bash
git diff --stat 9f74558..cdad3c3 -- shared/schema.ts server/recovery-routes.ts server/admin-routes.ts server/routes.ts server/test-cleanup.ts server/cleanup-scheduler.ts
```
