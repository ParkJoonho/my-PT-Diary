# AI 분석 이력 및 기록 비교

작성일자: 2026-07-28

## 1. 문서 목적

체형 분석 결과 저장, 이력 조회, 상세 조회, 두 기록 비교 기능의 현재 마이그레이션 구현 상태를 정리한다.

이 문서는 2026-07-28 기준 `ai-pt` 백엔드/클라이언트 구현 결과를 기준으로 한다.

## 2. 현재 구현 기준

| 구분 | 내용 |
| --- | --- |
| AI Hub 진입 라우트 | `/ai-hub` |
| 클라이언트 라우트 | `/analysis-history` |
| 클라이언트 feature | `client/src/features/body-analysis` |
| 서버 엔드포인트 | `GET /api/analysis-records`, `GET /api/analysis-records/:recordId`, `POST /api/analysis-records/compare` |
| 서버 모듈 | `server/src/modules/analysis-records` |
| 사용자 구분 | `x-user-key` |
| 저장 위치 | PostgreSQL `analysis_records` |
| 현재 활성 기록 타입 | `body`, `body-comparison` |
| 비교 AI provider | OpenAI 호환 `chat/completions` |
| 비교 기본 모델 | `gpt-4o-mini` |
| raw image 저장 여부 | 저장하지 않음 |
| 클라이언트 비교 진입 | 목록에서 2건 선택 후 비교 버튼 노출 |

## 3. 구현 원칙

| 원칙 | 내용 |
| --- | --- |
| 공용 기록 저장소 | 체형 분석 전용이 아니라 추후 posture/state-vector도 같이 담을 수 있는 공용 `analysis_records` 테이블을 쓴다. |
| 사용자 분리 일관성 | 모든 조회/상세/비교는 `x-user-key` 기준으로만 처리한다. |
| 비교 대상 제한 | 이번 배치에선 `body` 타입끼리만 비교를 허용한다. |
| 비교 응답 검증 | AI 비교 결과도 JSON 파싱 후 Zod 스키마로 검증한다. |
| 이미지 비저장 | 기록에는 raw result 중심의 JSON만 남기고 원본 사진 base64는 저장하지 않는다. |

## 4. 현재 지원 범위

| 범위 | 현재 상태 |
| --- | --- |
| body 분석 기록 저장 | 구현 |
| 기록 목록 조회 | 구현 |
| 기록 상세 조회 | 구현 |
| body 타입 두 기록 비교 | 구현 |
| body 외 타입 저장 구조 수용 | 테이블 수준은 가능 |
| posture/state-vector 비교 | 미지원 |
| `/analysis-history` 클라이언트 화면 | 구현 |
| body 기록 카드 선택 | 구현 |
| body 기록 상세 모달 | 구현 |
| `body-comparison` 기록 카드/상세 | 구현 |

## 5. DB 구현 현황

### 5.1 테이블

| 컬럼 | 설명 |
| --- | --- |
| `id` | 기록 ID (`record_...`) |
| `user_key` | 현재 사용자 키 |
| `analysis_type` | `body`, `body-comparison`, `posture`, `state-vector` 중 하나 |
| `qualitative_data` | 요약성 텍스트/타입 정보 |
| `quantitative_data` | 점수/비율 등 수치 요약 |
| `raw_result` | 전체 분석 결과 JSON |
| `analyzed_at` | 분석 완료 시각 |
| `created_at` | 저장 시각 |

### 5.2 인덱스

| 인덱스 | 목적 |
| --- | --- |
| `(user_key, analyzed_at DESC, created_at DESC)` | 사용자별 최신순 이력 조회 |
| `(user_key, analysis_type, analyzed_at DESC, created_at DESC)` | 사용자+타입별 이력 조회 |

## 6. API 구현 현황

### 6.1 기록 목록 조회

| Method | 경로 | 목적 | 비고 |
| --- | --- | --- | --- |
| `GET` | `/api/analysis-records` | 현재 사용자 키 기준 이력 목록 조회 | `x-user-key` 필수 |

### 목록 query

| 필드 | 설명 |
| --- | --- |
| `type` | `body`, `body-comparison`, `posture`, `state-vector` 중 선택 |

### 목록 응답 필드

| 필드 | 설명 |
| --- | --- |
| `id` | 기록 ID |
| `analysisType` | 기록 타입 |
| `qualitativeData` | 요약 텍스트/타입 정보 |
| `quantitativeData` | 점수/비율 정보 |
| `analyzedAt` | 분석 시각 |
| `createdAt` | 저장 시각 |

### 6.2 기록 상세 조회

| Method | 경로 | 목적 | 비고 |
| --- | --- | --- | --- |
| `GET` | `/api/analysis-records/:recordId` | 현재 사용자 키 기준 단일 기록 상세 조회 | `x-user-key` 필수 |

상세 응답은 목록 필드에 `rawResult`를 추가로 포함한다.

### 6.3 기록 비교

| Method | 경로 | 목적 | 비고 |
| --- | --- | --- | --- |
| `POST` | `/api/analysis-records/compare` | body 분석 기록 두 건 비교 | `x-user-key` 필수 |

### 비교 요청 필드

| 필드 | 설명 |
| --- | --- |
| `recordId1` | 비교 기록 ID 1 |
| `recordId2` | 비교 기록 ID 2 |

### 비교 응답 필드

| 필드 | 설명 |
| --- | --- |
| `overallChange` | 전체 변화 요약 |
| `improvements` | 개선된 점 목록 |
| `declines` | 악화된 점 목록 |
| `bodyTypeChange` | 체형 타입 변화 |
| `postureChanges` | 자세 점수 변화 배열 |
| `quantitativeChanges` | 수치 변화 배열 |
| `recommendations` | 향후 권장사항 |
| `motivationalNote` | 짧은 격려 문구 |
| `olderRecord` | 더 이전 기록 메타 |
| `newerRecord` | 더 최근 기록 메타 |

## 7. 서버 데이터 흐름

| 단계 | 처리 |
| --- | --- |
| 1 | `body-analysis`와 `body-comparison`이 각각 검증된 결과를 `AnalysisRecordsService.createAnalysisRecord()`로 넘긴다. |
| 2 | repository가 `analysis_records`에 `user_key`, `analysis_type`, 요약 데이터와 raw result를 insert한다. |
| 3 | AI Hub 또는 체형 분석 화면에서 `/analysis-history`로 이동한다. |
| 4 | 클라이언트가 `GET /api/analysis-records?type=body` 또는 `type=body-comparison`를 호출해 최신순 목록을 렌더링한다. |
| 5 | 카드의 `상세 보기`를 누르면 `GET /api/analysis-records/:recordId`를 호출해 타입별 raw result 렌더러를 재사용한다. |
| 6 | 비교 요청 시 두 기록을 같은 `user_key` 기준으로 각각 조회한다. |
| 7 | 둘 중 하나라도 없으면 404를 반환한다. |
| 8 | 둘 중 하나라도 `analysis_type !== 'body'`면 400을 반환한다. |
| 9 | older/newer 순서를 정렬한 뒤 AI 비교 client에 넘긴다. |
| 10 | 비교 AI 응답을 Zod로 검증한 뒤 메타 정보와 함께 반환한다. |
| 11 | 클라이언트는 개선점/추천사항 중심 비교 결과를 카드로 표시한다. |

## 8. 요구사항 및 현재 구현 현황

| ID | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- |
| AH-001 | 체형 분석 결과를 사용자별 기록으로 저장해야 한다. | `analysis_records`에 `user_key` 기준으로 저장한다. | 구현 | `server/src/modules/analysis-records/analysis-records.repository.ts`, `server/src/modules/body-analysis/body-analysis.service.ts` |
| AH-002 | 저장 구조는 향후 다른 분석 타입도 담을 수 있어야 한다. | `analysis_type` enum 범위를 `body`, `body-comparison`, `posture`, `state-vector`로 잡아뒀다. | 구현 | `server/src/modules/analysis-records/analysis-records.schemas.ts`, `server/src/modules/analysis-records/dto/analysis-record-response.dto.ts` |
| AH-003 | 사용자는 자신의 분석 기록 목록을 최신순으로 조회할 수 있어야 한다. | `GET /api/analysis-records`를 구현했다. | 구현 | `server/src/modules/analysis-records/analysis-records.controller.ts`, `server/src/modules/analysis-records/analysis-records.service.ts` |
| AH-004 | 사용자는 단일 기록 상세를 조회할 수 있어야 한다. | `GET /api/analysis-records/:recordId`를 구현했다. | 구현 | `server/src/modules/analysis-records/analysis-records.controller.ts`, `server/src/modules/analysis-records/analysis-records.service.ts` |
| AH-005 | 사용자는 body 분석 기록 두 건을 비교할 수 있어야 한다. | `POST /api/analysis-records/compare`를 구현했다. | 구현 | `server/src/modules/analysis-records/analysis-records.controller.ts`, `server/src/modules/analysis-records/analysis-records.service.ts` |
| AH-006 | body가 아닌 기록은 비교 대상에서 막아야 한다. | 서버에서 `analysis_type !== 'body'`면 400을 반환한다. | 구현 | `server/src/modules/analysis-records/analysis-records.service.ts` |
| AH-007 | 비교 결과는 AI 응답 구조 검증 후 반환해야 한다. | `analysisRecordComparisonSchema`로 검증한다. | 구현 | `server/src/modules/analysis-records/openai-analysis-record-comparison.client.ts`, `server/src/modules/analysis-records/analysis-records.schemas.ts` |
| AH-008 | AI 키가 없을 때 비교 기능은 명시적으로 실패해야 한다. | 503 `체형 분석 비교 AI 기능이 아직 설정되지 않았어요.`를 반환한다. | 구현 | `server/src/modules/analysis-records/openai-analysis-record-comparison.client.ts` |
| AH-009 | 사용자는 AI Hub에서 실제 기록 화면으로 진입할 수 있어야 한다. | `/ai-hub` 카드와 `/ai-analysis` 상단 버튼에서 `/analysis-history`로 연결한다. | 구현 | `client/src/features/ai-hub/components/ai-hub-screen.tsx`, `client/src/features/body-analysis/components/body-analysis-screen.tsx` |
| AH-010 | 사용자는 기록 상세를 다시 열어 body 결과를 재열람할 수 있어야 한다. | 상세 모달에서 raw result를 `BodyAnalysisResultView`로 다시 그린다. | 구현 | `client/src/features/body-analysis/components/analysis-history-screen.tsx`, `client/src/features/body-analysis/components/body-analysis-result.tsx` |
| AH-011 | 사용자는 2개 기록을 선택했을 때만 비교를 실행해야 한다. | 선택이 2개일 때만 비교 버튼이 노출된다. | 구현 | `client/src/features/body-analysis/components/analysis-history-screen.tsx` |
| AH-012 | `body-comparison` 기록은 목록과 상세에서 다시 열 수 있어야 한다. | 전용 카드 제목/배지와 `BodyComparisonResultView` 상세 렌더러를 추가했다. | 구현 | `client/src/features/body-analysis/components/analysis-history-screen.tsx`, `client/src/features/body-analysis/components/body-comparison-result.tsx` |
| AH-013 | `body-comparison` 기록은 body 비교 선택과 섞이지 않아야 한다. | 카드 선택은 `body` 타입에서만 활성화하고, `body-comparison`은 상세 전용으로 처리한다. | 구현 | `client/src/features/body-analysis/components/analysis-history-screen.tsx`, `client/src/features/body-analysis/lib/analysis-record-presentation.ts` |

## 9. 현재 수정된 원본 결함

| ID | 원본 결함 | 현재 처리 |
| --- | --- | --- |
| AH-FIX-001 | 체형 이력 비교가 posture/state-vector까지 섞일 수 있던 문제 | 이번 배치에선 body 타입만 비교 허용 |
| AH-FIX-002 | 비교 AI 응답 스키마 검증이 없던 문제 | Zod 검증 추가 |
| AH-FIX-003 | raw result 상세 조회 API가 정리되지 않았던 문제 | `GET /api/analysis-records/:recordId` 추가 |
| AH-FIX-004 | 현재 앱 아키텍처와 맞지 않던 user id 기준 구조 | `x-user-key` 기반 저장/조회로 변환 |

## 10. 현재 남아 있는 제한 및 TODO

| ID | 항목 | 현재 영향 | 근거 파일 |
| --- | --- | --- | --- |
| AH-TODO-001 | posture/state-vector 상세 렌더링 정책 미정 | 공용 기록 저장소는 준비됐지만 각 타입별 상세 화면 정책은 아직 없다. | `server/src/modules/analysis-records/dto/analysis-record-response.dto.ts` |
| AH-TODO-002 | 삭제/수정 API 없음 | 현재 이력은 생성, 목록, 상세, 비교까지만 지원한다. | `server/src/modules/analysis-records/analysis-records.controller.ts` |
| AH-TODO-003 | 비교 결과 섹션 축약 | 현재 클라이언트는 변화 요약, 개선점, 추천사항 위주로만 보여주고 자세 변화/정량 변화 전체는 아직 다 펼치지 않는다. | `client/src/features/body-analysis/components/analysis-history-screen.tsx` |

## 11. 테스트 근거

| 구분 | 파일 |
| --- | --- |
| 서비스 | `server/src/modules/analysis-records/__tests__/analysis-records.service.spec.ts` |
| 컨트롤러 통합 | `server/src/modules/analysis-records/__tests__/analysis-records.controller.integration.spec.ts` |
| OpenAI client | `server/src/modules/analysis-records/__tests__/openai-analysis-record-comparison.client.spec.ts` |
| 클라이언트 API 래퍼 | `client/src/features/body-analysis/api/__tests__/analysis-records.test.ts` |
| 클라이언트 타입체크 | `client/package.json`의 `npm run typecheck` |
| 서버 타입체크 | `server/package.json`의 `npm run typecheck` |
| 클라이언트 전체 테스트 | `client/package.json`의 `npm test -- --runInBand` |
| 실DB 스모크 | `analysis_records` 테이블 생성 확인 |
