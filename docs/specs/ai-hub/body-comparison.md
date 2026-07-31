# AI 전·후 사진 직접 비교

작성일자: 2026-07-28

## 1. 문서 목적

`/ai-analysis` 안에 포함된 전·후 사진 직접 비교 기능의 현재 마이그레이션 구현 상태를 정리한다.

이 문서는 2026-07-28 기준 `ai-pt` 백엔드/클라이언트 구현 결과를 기준으로 한다.

## 2. 현재 구현 기준

| 구분 | 내용 |
| --- | --- |
| AI Hub 진입 라우트 | `/ai-hub` |
| 클라이언트 라우트 | `/ai-analysis` |
| 클라이언트 feature | `client/src/features/body-analysis` |
| 서버 엔드포인트 | `POST /api/body-comparison/analyze` |
| 서버 모듈 | `server/src/modules/body-comparison` |
| 연동 기록 모듈 | `server/src/modules/analysis-records` |
| 사용자 구분 | `x-user-key` |
| AI provider | OpenAI 호환 `chat/completions` |
| 기본 모델 | `gpt-4o` |
| 저장 위치 | PostgreSQL `analysis_records` |
| 저장 타입 | `analysis_type = 'body-comparison'` |
| 사진 raw base64 저장 여부 | 저장하지 않음 |
| 사진 선택 방식 | `@apps-in-toss/framework`의 `fetchAlbumPhotos` |
| 사진 권한 | `photos/read` |
| 아이콘 | `lucide-react-native` |

## 3. 구현 원칙

| 원칙 | 내용 |
| --- | --- |
| 원본 UX 존중 | 원본처럼 `/ai-analysis` 내부에 전·후 비교 섹션을 유지한다. |
| 사용자 식별 일관성 | 현재 앱 표준인 `x-user-key` 기준으로 요청/저장을 통일한다. |
| 응답 검증 필수 | AI 응답은 JSON 파싱 후 Zod 스키마로 구조를 검증한다. |
| 저장 결과 분리 | 분석 생성 성공과 이력 저장 성공을 하나로 뭉개지 않고 분리해 반환한다. |
| 이미지 비저장 | 원본 사진 base64는 기록 테이블에 남기지 않고 분석 결과 JSON만 저장한다. |

## 4. 현재 지원 범위

| 범위 | 현재 상태 |
| --- | --- |
| Before / After 사진 각각 선택 | 구현 |
| Before / After 앨범 선택 | 구현 |
| 키 입력 연동 | 구현 |
| 전·후 비교 AI 분석 | 구현 |
| 결과 자동 저장 | 구현 |
| 저장 실패 분리 응답 | 구현 |
| AI 키 미설정 명시 오류 | 구현 |
| `/ai-analysis` 내부 섹션 토글 | 구현 |
| 분석 이력 카드/상세 연동 | 구현 |
| 동일 인물 검증 | 미구현 |
| 촬영일/촬영조건 검증 | 미구현 |
| 원본 사진 재조회용 파일 저장 | 미구현 |

## 5. API 구현 현황

### 5.1 전·후 비교 분석 실행

| Method | 경로 | 목적 | 비고 |
| --- | --- | --- | --- |
| `POST` | `/api/body-comparison/analyze` | 현재 사용자 키 기준 전·후 비교 분석 실행 | `x-user-key` 필수 |

### 요청 필드

| 필드 | 설명 | 필수 여부 |
| --- | --- | --- |
| `beforeImageBase64` | Before 전신 사진 base64 | 필수 |
| `afterImageBase64` | After 전신 사진 base64 | 필수 |
| `height` | 사용자 입력 키(cm) | 선택 |
| `notes` | 추가 메모 | 선택 |

### 응답 필드

| 필드 | 설명 |
| --- | --- |
| `comparison` | 검증된 전·후 비교 결과 JSON |
| `analyzedAt` | 서버가 분석 완료 시각으로 찍는 ISO timestamp |
| `recordSave.status` | `saved` 또는 `failed` |
| `recordSave.recordId` | 저장 성공 시 생성된 분석 기록 ID |
| `recordSave.message` | 저장 실패 시 사용자 안내 문구 |

## 6. 분석 결과 구조

현재 서버가 검증하는 핵심 결과 구조는 아래 범위다.

| 섹션 | 현재 상태 |
| --- | --- |
| `overallChange.grade`, `overallChange.score`, `overallChange.summary` | 검증 |
| `bodyChanges.upperBody/core/lowerBody` | 검증 |
| `postureChanges` | 검증 |
| `bodyComposition` | 검증 |
| `recommendations.keepDoing/improve/nextGoal` | 검증 |
| `motivationalMessage` | 검증 |

## 7. 서버 데이터 흐름

| 단계 | 처리 |
| --- | --- |
| 1 | 사용자가 `/ai-analysis`에서 전·후 비교 섹션을 열고 Before / After 사진을 각각 고른다. |
| 2 | 클라이언트가 `x-user-key`와 함께 `POST /api/body-comparison/analyze`를 호출한다. |
| 3 | 컨트롤러가 `x-user-key`와 요청 본문을 검증한다. |
| 4 | AI client가 Before / After 이미지와 서버 조립 프롬프트를 OpenAI 호환 upstream으로 보낸다. |
| 5 | 서비스가 AI 응답을 JSON 파싱하고 `bodyComparisonResultSchema`로 다시 검증한다. |
| 6 | 검증된 결과에서 `qualitativeData`, `quantitativeData`, `rawResult`를 분리한다. |
| 7 | `analysis_records`에 `analysis_type = 'body-comparison'`로 저장을 시도한다. |
| 8 | 저장 성공 여부와 무관하게 분석 자체는 반환하되, `recordSave.status`로 결과를 분리한다. |
| 9 | 클라이언트가 점수, 부위별 변화, 자세 변화, 체성분 추정, 추천사항을 렌더링한다. |
| 10 | `analysis-history`에서는 `body-comparison` 기록을 상세 전용 카드/모달로 다시 연다. |

## 8. 요구사항 및 현재 구현 현황

| ID | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- |
| BC-001 | 사용자는 전·후 사진 두 장을 골라야 비교를 시작할 수 있어야 한다. | 두 장이 모두 있어야 비교 버튼이 활성화된다. | 구현 | `client/src/features/body-analysis/components/body-comparison-section.tsx` |
| BC-002 | 서버는 두 장의 사진을 멀티모달 입력으로 비교 분석해야 한다. | Before / After 두 이미지를 함께 OpenAI 호환 API로 보낸다. | 구현 | `server/src/modules/body-comparison/openai-body-comparison.client.ts` |
| BC-003 | 결과는 등급, 점수, 부위별 변화, 자세 변화, 추천을 반환해야 한다. | 서버가 JSON 구조를 프롬프트로 강제하고 Zod로 다시 검증한다. | 구현 | `server/src/modules/body-comparison/body-comparison.schemas.ts`, `server/src/modules/body-comparison/body-comparison.service.ts` |
| BC-004 | 비교 결과는 기록으로 저장되어야 한다. | `analysis_records`에 `body-comparison` 타입으로 저장을 시도한다. | 구현 | `server/src/modules/body-comparison/body-comparison.service.ts`, `server/src/modules/analysis-records/analysis-records.service.ts` |
| BC-005 | 비교 결과 생성 성공과 저장 성공을 구분해야 한다. | `recordSave.status`와 `recordSave.message`를 응답/배너에 포함한다. | 구현 | `server/src/modules/body-comparison/dto/body-comparison-response.dto.ts`, `client/src/features/body-analysis/components/analysis-record-save-banner.tsx` |
| BC-006 | AI 키가 없을 때 원인 불명 500 대신 명시적 실패를 반환해야 한다. | 503 `체형 비교 분석 AI 기능이 아직 설정되지 않았어요.`를 반환한다. | 구현 | `server/src/modules/body-comparison/openai-body-comparison.client.ts` |
| BC-007 | 원본 `/ai-analysis` 흐름 안에서 비교 UI를 유지해야 한다. | 체형 분석 화면 안에 토글 섹션으로 이식했다. | 구현 | `client/src/features/body-analysis/components/body-analysis-screen.tsx`, `client/src/features/body-analysis/components/body-comparison-section.tsx` |
| BC-008 | 비교 결과는 분석 이력에서 다시 열어볼 수 있어야 한다. | `body-comparison` 카드와 상세 모달 렌더러를 추가했다. | 구현 | `client/src/features/body-analysis/components/analysis-history-screen.tsx`, `client/src/features/body-analysis/components/body-comparison-result.tsx` |
| BC-009 | Before / After 앨범 선택은 앱인토스 공식 권한 및 공개 SDK를 사용해야 한다. | Granite manifest에 `photos/read`를 선언하고 공통 picker가 권한 확인·요청 후 `fetchAlbumPhotos`를 호출한다. | 구현 | `client/granite.config.ts`, `client/src/features/body-analysis/lib/pick-image.ts` |

## 9. 현재 수정된 원본 결함

| ID | 원본 결함 | 현재 처리 |
| --- | --- | --- |
| BC-FIX-001 | 저장 실패가 사용자에게 보이지 않던 문제 | 저장 성공/실패를 분리해 응답하고 배너로 노출 |
| BC-FIX-002 | AI 응답을 구조 검증 없이 그대로 쓰던 문제 | 서버에서 Zod 검증 추가 |
| BC-FIX-003 | 이력 상세에 `body-comparison` 전용 렌더러가 없던 문제 | 카드/상세 분기 추가 |
| BC-FIX-004 | 큰 base64 요청이 본문 파싱 단계에서 막힐 수 있던 문제 | 서버 body parser limit를 125mb로 상향 |

## 10. 현재 남아 있는 제한 및 TODO

| ID | 항목 | 현재 영향 | 근거 파일 |
| --- | --- | --- | --- |
| BC-TODO-001 | 동일 인물 검증 없음 | 사용자가 어떤 사진을 넣든 첫 장은 Before, 둘째는 After로 처리한다. | `server/src/modules/body-comparison/openai-body-comparison.client.ts` |
| BC-TODO-002 | 촬영일/조명/거리 등 조건 검증 없음 | 시점·자세·촬영조건이 달라도 비교 분석은 그대로 수행된다. | `client/src/features/body-analysis/components/body-comparison-section.tsx` |
| BC-TODO-003 | 원본 사진 파일 저장 없음 | 현재 이력 상세는 분석 결과 텍스트/점수는 재열람 가능하지만 원본 Before / After 이미지는 저장하지 않는다. | `server/src/modules/analysis-records/analysis-records.repository.ts` |
| BC-TODO-004 | `notes` 클라이언트 입력 미연결 | 서버 스키마는 지원하지만 현재 화면은 키만 재사용하고 메모 입력은 아직 없다. | `server/src/modules/body-comparison/body-comparison.schemas.ts`, `client/src/features/body-analysis/components/body-comparison-section.tsx` |

## 11. 테스트 근거

| 구분 | 파일 |
| --- | --- |
| 서비스 | `server/src/modules/body-comparison/__tests__/body-comparison.service.spec.ts` |
| 컨트롤러 통합 | `server/src/modules/body-comparison/__tests__/body-comparison.controller.integration.spec.ts` |
| OpenAI client | `server/src/modules/body-comparison/__tests__/openai-body-comparison.client.spec.ts` |
| 클라이언트 API 래퍼 | `client/src/features/body-analysis/api/__tests__/body-comparison.test.ts` |
| 클라이언트 이미지 선택 | `client/src/features/body-analysis/lib/__tests__/pick-image.test.ts` |
| 클라이언트 컴포넌트 | `client/src/features/body-analysis/components/__tests__/body-comparison-result.test.tsx` |
| 클라이언트 표시 로직 | `client/src/features/body-analysis/lib/__tests__/analysis-record-presentation.test.ts` |
| 클라이언트 타입체크 | `client/package.json`의 `npm run typecheck` |
| 서버 타입체크 | `server/package.json`의 `npm run typecheck` |
| 클라이언트 전체 테스트 | `client/package.json`의 `npm test -- --runInBand` |
| 서버 비교/체형 테스트 | `server/package.json`의 `npm test -- body-analysis body-comparison --runInBand` |
