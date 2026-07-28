# AI 체형 분석 본체

작성일자: 2026-07-28

## 1. 문서 목적

AI Hub의 `AI 체형 분석` 기능 중 전신 사진 기반 체형 분석 본체의 현재 마이그레이션 구현 상태를 정리한다.

이 문서는 2026-07-28 기준 `ai-pt` 백엔드/클라이언트 구현 결과를 기준으로 한다.

## 2. 현재 구현 기준

| 구분 | 내용 |
| --- | --- |
| AI Hub 진입 라우트 | `/ai-hub` |
| 클라이언트 라우트 | `/ai-analysis` |
| 클라이언트 feature | `client/src/features/body-analysis`, `client/src/features/ai-hub` |
| 서버 엔드포인트 | `POST /api/body-analysis/analyze` |
| 서버 모듈 | `server/src/modules/body-analysis` |
| 연동 기록 모듈 | `server/src/modules/analysis-records` |
| 사용자 구분 | `x-user-key` |
| AI provider | OpenAI 호환 `chat/completions` |
| 기본 모델 | `gpt-4o` |
| 운동 기록 컨텍스트 | 서버가 `workout_records`에서 최근 20건 조회 |
| 저장 위치 | PostgreSQL `analysis_records` |
| 저장 타입 | `analysis_type = 'body'` |
| 사진 raw base64 저장 여부 | 저장하지 않음 |
| 사진 선택 방식 | Toss/Granite 네이티브 모듈 `openCamera`, `fetchAlbumPhotos` |
| 아이콘 | `lucide-react-native` |

## 3. 구현 원칙

| 원칙 | 내용 |
| --- | --- |
| 원본 UX 존중 | 원본처럼 멀티모달 LLM에 전신 사진을 직접 보내는 구조를 유지한다. |
| 사용자 식별 일관성 | 원본 로그인 user id 대신 현재 앱 표준인 `x-user-key`를 사용한다. |
| 서버 컨텍스트 수집 | 운동 기록은 클라이언트가 로컬 데이터를 실어 보내지 않고, 서버가 DB에서 직접 조회한다. |
| 응답 검증 필수 | AI 응답은 JSON 파싱 후 Zod 스키마로 구조와 수치 범위를 검증한다. |
| 저장 결과 분리 | 분석 생성 성공과 이력 저장 성공을 하나로 뭉개지 않고 분리해 반환한다. |
| 이미지 비저장 | 민감한 원본 사진 base64는 기록 테이블에 남기지 않고 분석 결과 JSON만 저장한다. |

## 4. 현재 지원 범위

| 범위 | 현재 상태 |
| --- | --- |
| 정면 전신 사진 필수 | 구현 |
| 측면/후면/스쿼트 추가 사진 | 구현 |
| 키 입력 | 구현 |
| 의료 증상 입력 | 구현 |
| 최근 운동 기록 반영 | 구현 |
| 멀티모달 AI 체형 분석 | 구현 |
| 분석 결과 자동 저장 | 구현 |
| 저장 실패 분리 응답 | 구현 |
| AI 키 미설정 명시 오류 | 구현 |
| AI Hub 카드 진입 | 구현 |
| 클라이언트 `/ai-analysis` 화면 | 구현 |
| 분석 기록 화면 이동 버튼 | 구현 |
| 전·후 비교 섹션 | 구현 |
| 신발 추천 바로가기 | 미구현 배지로 유지 |
| PT 수업 기록 컨텍스트 병합 | 미구현 |
| 신발/보행 추천 | 이번 범위 제외 |

## 5. API 구현 현황

### 5.1 체형 분석 실행

| Method | 경로 | 목적 | 비고 |
| --- | --- | --- | --- |
| `POST` | `/api/body-analysis/analyze` | 현재 사용자 키 기준 체형 분석 실행 | `x-user-key` 필수 |

### 요청 필드

| 필드 | 설명 | 필수 여부 |
| --- | --- | --- |
| `imageBase64` | 정면 전신 사진 base64 | 필수 |
| `sideImageBase64` | 측면 사진 base64 | 선택 |
| `backImageBase64` | 후면 사진 base64 | 선택 |
| `squatImageBase64` | 스쿼트 사진 base64 | 선택 |
| `height` | 사용자 입력 키(cm) | 선택 |
| `medicalSymptoms` | 사용자가 직접 적는 증상/불편감 텍스트 | 선택 |
| `photoDate` | 사진 촬영일 `YYYY-MM-DD` | 선택 |

### 응답 필드

| 필드 | 설명 |
| --- | --- |
| `analysis` | 검증된 체형 분석 결과 JSON |
| `analyzedAt` | 서버가 분석 완료 시각으로 찍는 ISO timestamp |
| `recordSave.status` | `saved` 또는 `failed` |
| `recordSave.recordId` | 저장 성공 시 생성된 분석 기록 ID |
| `recordSave.message` | 저장 실패 시 사용자 안내 문구 |

## 6. 분석 결과 구조

현재 서버가 검증하는 핵심 결과 구조는 아래 범위다.

| 섹션 | 현재 상태 |
| --- | --- |
| `bodyType`, `bodyTypeDescription` | 검증 |
| `ratios.armToHeight`, `ratios.upperToLower` | 검증 |
| `upperBody` | 검증 |
| `lowerBody` | 검증 |
| `posture` | 검증 |
| `multiViewAnalysis` | 검증 |
| `prediction` | 검증 |
| `medicalAnalysis` | 검증 |
| `recommendations` | 검증 |
| `summary` | 검증 |
| `gaitAnalysis` | 이번 범위에서 제외 |
| `latestResearch` | 이번 범위에서 제외 |

## 7. 서버 데이터 흐름

| 단계 | 처리 |
| --- | --- |
| 1 | AI Hub 화면에서 `AI 체형 분석` 카드를 누르면 `/ai-analysis`로 이동한다. |
| 2 | 사용자가 카메라/앨범으로 정면 전신 사진을 고르고, 선택적으로 측면/후면/스쿼트 사진과 키·증상을 입력한다. |
| 3 | 클라이언트가 `x-user-key`와 함께 `POST /api/body-analysis/analyze`를 호출한다. |
| 4 | 컨트롤러가 `x-user-key`와 요청 본문을 검증한다. |
| 5 | 서비스가 `workout_records`에서 최근 운동 기록 20건을 직접 읽는다. |
| 6 | AI client가 사진 배열과 서버 조립 프롬프트를 OpenAI 호환 upstream으로 보낸다. |
| 7 | 서비스가 AI 응답을 JSON 파싱하고 `bodyAnalysisResultSchema`로 다시 검증한다. |
| 8 | 검증된 결과에서 `qualitativeData`, `quantitativeData`, `rawResult`를 분리한다. |
| 9 | `analysis_records`에 `analysis_type = 'body'`로 저장을 시도한다. |
| 10 | 저장 성공 여부와 무관하게 분석 자체는 반환하되, `recordSave.status`로 결과를 분리한다. |
| 11 | 클라이언트가 결과 카드, 자세/비율/다각도 분석/추천 섹션을 렌더링한다. |
| 12 | 이번 배치에 포함된 전·후 비교는 실제 섹션으로 연결하고, 아직 없는 원본 파생 기능만 `미구현` 배지로 남겨둔다. |

## 8. 요구사항 및 현재 구현 현황

| ID | 요구사항·기대 동작 | 현재 구현 | 상태 | 근거 파일 |
| --- | --- | --- | --- | --- |
| BA-001 | 체형 분석 요청은 현재 사용자 구분 하에서만 실행돼야 한다. | `x-user-key`가 없으면 400을 반환한다. | 구현 | `server/src/modules/body-analysis/body-analysis.controller.ts`, `server/src/common/decorators/user-key.decorator.ts` |
| BA-002 | 전신 사진이 없으면 요청을 막아야 한다. | `imageBase64`는 필수이며 길이도 검증한다. | 구현 | `server/src/modules/body-analysis/body-analysis.schemas.ts` |
| BA-003 | 선택 입력으로 측면/후면/스쿼트 사진을 받을 수 있어야 한다. | 세 필드 모두 optional로 받고, 있으면 이미지 배열에 포함해 AI로 보낸다. | 구현 | `server/src/modules/body-analysis/body-analysis.schemas.ts`, `server/src/modules/body-analysis/openai-body-analysis.client.ts` |
| BA-004 | 키 입력은 숫자 범위를 검증해야 한다. | 50~300cm 정수 범위로 검증한다. | 구현 | `server/src/modules/body-analysis/body-analysis.schemas.ts` |
| BA-005 | 의료 증상 입력은 빈 문자열을 막고 길이를 제한해야 한다. | 1~1000자 텍스트로 검증한다. | 구현 | `server/src/modules/body-analysis/body-analysis.schemas.ts` |
| BA-006 | 운동 기록 컨텍스트는 서버 기준 사용자 데이터만 사용해야 한다. | `workout_records`를 `user_key`로 직접 조회한다. 로컬 폴백은 사용하지 않는다. | 구현 | `server/src/modules/body-analysis/body-analysis.repository.ts`, `server/src/modules/body-analysis/body-analysis.service.ts` |
| BA-007 | 서버는 멀티모달 LLM에 사진과 텍스트 프롬프트를 함께 보내야 한다. | text 1개 + image_url N개 구조로 OpenAI 호환 API를 호출한다. | 구현 | `server/src/modules/body-analysis/openai-body-analysis.client.ts` |
| BA-008 | AI 응답은 구조 검증 후에만 클라이언트로 반환해야 한다. | JSON 파싱 후 `bodyAnalysisResultSchema`로 검증한다. | 구현 | `server/src/modules/body-analysis/body-analysis.service.ts`, `server/src/modules/body-analysis/body-analysis.schemas.ts` |
| BA-009 | AI 키가 없을 때 원인 불명 500 대신 명시적 실패를 반환해야 한다. | 503 `체형 분석 AI 기능이 아직 설정되지 않았어요.`를 반환한다. | 구현 | `server/src/modules/body-analysis/openai-body-analysis.client.ts` |
| BA-010 | 분석 성공 뒤 결과를 사용자별 이력으로 저장해야 한다. | `analysis_records`에 `body` 타입으로 저장을 시도한다. | 구현 | `server/src/modules/body-analysis/body-analysis.service.ts`, `server/src/modules/analysis-records/analysis-records.service.ts` |
| BA-011 | 분석 생성 성공과 저장 성공을 구분해야 한다. | `recordSave.status`를 응답에 포함한다. | 구현 | `server/src/modules/body-analysis/dto/body-analysis-response.dto.ts`, `server/src/modules/body-analysis/body-analysis.service.ts` |
| BA-012 | 원본 사진 raw base64를 기록 테이블에 남기지 않아야 한다. | `qualitative_data`, `quantitative_data`, `raw_result`만 저장한다. | 구현 | `server/src/modules/body-analysis/body-analysis.service.ts`, `server/src/modules/analysis-records/analysis-records.repository.ts` |
| BA-013 | AI Hub에서 구현된 체형 분석 카드만 실제 진입 가능해야 한다. | `/ai-hub` 화면을 만들고 체형 분석 카드는 실제 라우트로 연결했다. | 구현 | `client/src/features/ai-hub/components/ai-hub-screen.tsx`, `client/src/pages/ai-hub.tsx` |
| BA-014 | 원본 체형 분석 화면의 핵심 UI 블록을 유지해야 한다. | 정면 사진, 다각도 추가 사진, 키/증상 입력, 분석 결과 카드 구조를 원본 흐름에 맞춰 재구성했다. | 구현 | `client/src/features/body-analysis/components/body-analysis-screen.tsx`, `client/src/features/body-analysis/components/body-analysis-result.tsx` |
| BA-015 | 원본 `/ai-analysis` 안의 전·후 비교 흐름을 같은 화면 안에 유지해야 한다. | 체형 분석 화면 안에 실제 전·후 비교 토글 섹션을 이식했다. | 구현 | `client/src/features/body-analysis/components/body-analysis-screen.tsx`, `client/src/features/body-analysis/components/body-comparison-section.tsx` |
| BA-016 | 아직 안 옮긴 다른 파생 기능은 숨기지 말고 미구현 상태를 보여줘야 한다. | 신발 추천은 바로가기 카드와 미구현 배지로 남겨뒀다. | 구현 | `client/src/features/body-analysis/components/body-analysis-screen.tsx`, `client/src/features/ai-hub/components/ai-hub-screen.tsx` |

## 9. 현재 수정된 원본 결함

| ID | 원본 결함 | 현재 처리 |
| --- | --- | --- |
| BA-FIX-001 | 분석 요청이 로그인 없이 열려 있던 문제 | 현재 앱 기준 `x-user-key` 필수로 통일 |
| BA-FIX-002 | AI 응답을 구조 검증 없이 그대로 쓰던 문제 | 서버에서 Zod로 검증 |
| BA-FIX-003 | 분석 성공과 저장 실패를 구분하지 않던 문제 | `recordSave.status` 분리 반환 |
| BA-FIX-004 | 운동 기록 컨텍스트가 로컬 저장소 오염 가능성이 있던 문제 | 서버 DB 조회로 치환 |
| BA-FIX-005 | AI 키가 없을 때 500으로 떨어질 수 있던 문제 | 503 + 서버 warning/error 로그 |

## 10. 현재 남아 있는 제한 및 TODO

| ID | 항목 | 현재 영향 | 근거 파일 |
| --- | --- | --- | --- |
| BA-TODO-001 | PT 수업 기록 컨텍스트 미연동 | 현재는 `workout_records`만 참고하고, 원본의 PT 수업 컨텍스트는 아직 반영하지 않는다. | `server/src/modules/body-analysis/openai-body-analysis.client.ts` |
| BA-TODO-002 | `prediction`의 날짜 신뢰성 한계 | `photoDate` 필드는 서버에 있지만 현재 클라이언트 사진 선택 구현은 EXIF 촬영일 추출/보정 UI를 아직 제공하지 않는다. | `client/src/features/body-analysis/lib/pick-image.ts`, `server/src/modules/body-analysis/body-analysis.schemas.ts` |
| BA-TODO-003 | 의료 증상 상세 섹션 축약 | 원본보다 간결하게 렌더링하고 있어 전체 위험/재활 리스트까지는 아직 안 풀어냈다. | `client/src/features/body-analysis/components/body-analysis-result.tsx` |
| BA-TODO-004 | 신발/보행 분석 제외 | 원본 `gaitAnalysis`는 이번 범위에서 검증/반환 구조에 포함하지 않았다. | `server/src/modules/body-analysis/body-analysis.schemas.ts` |
| BA-TODO-005 | 신발 추천, 몸매&스타일 미구현 | 체형 분석 화면과 AI Hub에는 남겨두되 실제 라우트/연동은 아직 없다. | `client/src/features/ai-hub/components/ai-hub-screen.tsx`, `client/src/features/body-analysis/components/body-analysis-screen.tsx` |

## 11. 테스트 근거

| 구분 | 파일 |
| --- | --- |
| 서비스 | `server/src/modules/body-analysis/__tests__/body-analysis.service.spec.ts` |
| 컨트롤러 통합 | `server/src/modules/body-analysis/__tests__/body-analysis.controller.integration.spec.ts` |
| OpenAI client | `server/src/modules/body-analysis/__tests__/openai-body-analysis.client.spec.ts` |
| 클라이언트 API 래퍼 | `client/src/features/body-analysis/api/__tests__/body-analysis.test.ts` |
| 클라이언트 타입체크 | `client/package.json`의 `npm run typecheck` |
| 서버 타입체크 | `server/package.json`의 `npm run typecheck` |
| 클라이언트 전체 테스트 | `client/package.json`의 `npm test -- --runInBand` |
| 실DB 스모크 | `docker compose`로 띄운 Postgres + 서버 부팅 시 `Database schema is ready.` 및 `analysis_records` 테이블 생성 확인 |
