# AI 식단 분석

작성일자: 2026-07-28

## 1. 목적과 기준

원본 앱의 [`AI 식단 분석` 화면][src-meal]을 기준으로 식사 전·후 사진 분석, 확인 후 기록 저장, 오늘 영양 합계와 식단 기록, 저장 기록 기반 AI 식단 가이드까지의 마이그레이션 상태를 정리한다.

- 원본의 화면 구성·정보 순서·조작 흐름을 클라이언트 기준으로 삼는다.
- 음식과 영양 수치는 원본처럼 사진에 기반한 AI 추정값이다.
- 외부 상품·칼로리 데이터베이스를 통한 사실성 검증은 원본에 없는 QA 기대사항이므로 추가하지 않는다.
- 클라이언트 조회는 Orval이 생성한 Suspense Query를 사용하고 식단 화면 가까이에 Suspense 경계를 둔다.

## 2. 원본과 현재 진입점

| 구분 | 원본 | 현재 |
| --- | --- | --- |
| AI Hub 카드 | `AI 식단 분석` 카드 | 같은 카드명·부제에서 실제 식단 화면으로 이동 |
| 화면 라우트 | `/meal-analysis` | `/meal-analysis` |
| 분석 | `POST /api/ai/meal-analysis` | `POST /api/meal-analysis/analyze` |
| 기록 저장 | `POST /api/meal-records` | `POST /api/meal-analysis/records` |
| 날짜별 기록 | `GET /api/meal-records?date=...` | `GET /api/meal-analysis/records?date=...` |
| 일일 합계 | `GET /api/meal-records/daily-summary?date=...` | `GET /api/meal-analysis/daily-summary?date=...` |
| 식단 가이드 | `POST /api/ai/diet-guide` | `POST /api/meal-analysis/guide` |

## 3. 원본 UX 구조

| 순서 | 식단 분석 탭 | 현재 구현 |
| :---: | --- | --- |
| 1 | 오늘 기록이 있으면 열량·단백질·탄수화물·지방과 끼니 수를 표시 | 구현 |
| 2 | 아침·점심·간식·저녁 중 식사 유형 선택 | 구현 |
| 3 | 식사 전 사진 필수, 식사 후 사진 선택 | 구현 |
| 4 | 카메라 또는 앨범에서 각 사진 선택·삭제 | 구현 |
| 5 | 식사 후 사진이 있으면 전·후 비교 분석 버튼으로 변경 | 구현 |
| 6 | 총열량, 탄단지, 영양 균형과 등급 표시 | 구현 |
| 7 | 인식 음식별 섭취율·열량·탄단지·추정 중량 표시 | 구현 |
| 8 | 걷기·달리기·자전거 소모 시간 표시 | 구현 |
| 9 | 식단 개선 조언과 선택 식사 속도 결과 표시 | 구현 |
| 10 | 종합 요약 뒤 기록 저장 또는 다시 분석 선택 | 구현 |
| 11 | 오늘 저장한 식단의 유형·열량·탄단지 표시 | 구현 |

| 순서 | 식단 가이드 탭 | 현재 구현 |
| :---: | --- | --- |
| 1 | 저장 기록 수에 따라 맞춤 가이드 또는 미리 보기 안내 | 구현 |
| 2 | AI 생성 중 로딩 상태 표시 | 구현 |
| 3 | 오늘 식단 평가 표시 | 구현 |
| 4 | 목표 열량·단백질·탄수화물·지방 표시 | 구현 |
| 5 | 추천 식사 구성과 음식·열량 표시 | 구현 |
| 6 | 오늘의 식단 팁 표시 | 구현 |
| 7 | 같은 화면에서 다시 생성 | 구현 |

## 4. 요구사항과 구현 상태

| ID | 기대 동작 | 현재 구현 | 상태 | 근거 |
| --- | --- | --- | :---: | --- |
| MEAL-001 | AI Hub 식단 카드가 실제 화면으로 이동한다. | 카드의 미구현 상태를 해제하고 `/meal-analysis`로 연결했다. | O | [AI Hub 화면][cur-hub], [식단 페이지][cur-page] |
| MEAL-002 | 식단 기록과 일일 합계는 현재 사용자·현지 날짜 기준으로 조회한다. | Toss 익명 사용자 키와 `getClientTodayDate()`를 사용하고 Orval Suspense Query의 사용자별 query key로 격리한다. | O | [식단 API][cur-api], [식단 화면][cur-screen] |
| MEAL-003 | 식사 전 사진과 식사 유형 없이는 분석하지 않는다. | 필수 사진 미선택 시 분석 버튼을 비활성화하고 서버도 사진·enum을 검증한다. | O | [식단 화면][cur-screen], [서버 스키마][server-schema] |
| MEAL-004 | 식사 후 사진을 선택하면 전·후 사진으로 실제 섭취량을 추정한다. | 두 사진을 원본 순서로 분석 API에 전달하고 버튼 문구도 `AI 전/후 비교 분석`으로 바뀐다. | O | [식단 화면][cur-screen], [서버 AI][server-ai] |
| MEAL-005 | 촬영 시간 차이로 식사 시간을 계산한다. | Apps in Toss의 카메라·앨범 응답에 EXIF/촬영 시각이 없어 자동 계산 문구 옆에 `미구현` 뱃지를 표시한다. 사진 전·후 분석 자체는 동작한다. | X | [사진 입력 UI][cur-photo], [현재 사진 선택기][cur-picker] |
| MEAL-006 | 원본 분석 결과 섹션을 축약 없이 표시한다. | 총열량, 탄단지, 영양 균형, 인식 음식, 운동 상쇄량, 조언, 식사 속도, 요약을 원본 순서로 분리 렌더링한다. | O | [분석 결과 UI][cur-result], [UI 테스트][cur-ui-test] |
| MEAL-007 | 분석 결과 확인 후에만 기록을 저장하거나 새 사진으로 다시 분석한다. | 분석과 저장 mutation을 분리하고 저장 성공 시 입력·결과만 초기화한다. | O | [식단 API][cur-api], [식단 상태][cur-store], [식단 화면][cur-screen] |
| MEAL-008 | 저장 후 오늘 기록과 영양 합계를 즉시 갱신한다. | 기록 저장 성공 시 사용자·날짜별 기록과 합계 query를 무효화한다. | O | [식단 API][cur-api], [API 테스트][cur-api-test] |
| MEAL-009 | 저장 기록이 없는 경우와 있는 경우를 구분해 식단 가이드를 만든다. | 화면 문구를 기록 수에 따라 나누고 서버 응답도 `sourceMealCount`를 반환한다. | O | [가이드 UI][cur-guide], [서버 서비스][server-service] |
| MEAL-010 | 가이드 응답과 화면 필드가 일치해야 한다. | `overallAssessment`, `macroTargets`, `mealPlan`, `tips`를 같은 계약으로 생성·검증·표시한다. | O | [가이드 UI][cur-guide], [서버 스키마][server-schema] |
| MEAL-011 | 외부 상품·칼로리 검증을 한 것처럼 표시하지 않는다. | 별도 상품 조회를 추가하지 않았고 AI 프롬프트도 사진과 일반적인 1인분에 따른 추정임을 명시한다. | O | [서버 AI][server-ai] |

## 5. 클라이언트 구조

| 영역 | 책임 | 파일 |
| --- | --- | --- |
| 페이지 | Granite `/meal-analysis` 라우트 등록 | [식단 페이지][cur-page] |
| 화면 조립 | 헤더·탭·Suspense 경계·mutation과 섹션 연결 | [식단 화면][cur-screen] |
| API | Orval 생성 함수, Suspense Query, 사용자 헤더, 캐시 무효화 | [식단 API][cur-api] |
| 상태 | 선택 탭·식사 유형·사진·분석 결과·가이드 상태 | [식단 상태][cur-store] |
| 사진 입력 | 원본 전·후 2열 사진 카드와 미구현 상태 표시 | [사진 입력 UI][cur-photo] |
| 결과 | 분석 결과 전체 섹션과 저장·재분석 동작 | [분석 결과 UI][cur-result] |
| 오늘 기록 | 일일 영양 합계와 저장 식단 목록 | [오늘 식단 UI][cur-today] |
| 가이드 | 생성 전·로딩·평가·목표·식사 구성·팁 | [가이드 UI][cur-guide] |

## 6. 검증

| 검증 | 결과 |
| --- | --- |
| Orval 생성 | 실행 중인 서버 `/docs-json` 기준 `npm run api:generate` 완료 |
| 식단·AI Hub 테스트 | 4개 suite, 11개 test 통과 |
| 클라이언트 전체 테스트 | 32개 suite, 88개 test 통과 |
| 타입 검사 | `npm run typecheck` 통과 |
| 정적 검사 | 식단·AI Hub 변경 파일 Biome 통과 |
| 프로덕션 빌드 | iOS·Android 번들 0 error, 0 warning |
| 실제 AI 호출 | 서버 환경에 OpenAI API 키가 없어 수행하지 않음 |

[src-meal]: <../../../../2026-07-13/my-PT-Diary/app/meal-analysis.tsx>
[cur-hub]: ../../../client/src/features/ai-hub/components/ai-hub-screen.tsx
[cur-page]: ../../../client/src/pages/meal-analysis.tsx
[cur-screen]: ../../../client/src/features/meal-analysis/components/meal-analysis-screen.tsx
[cur-api]: ../../../client/src/features/meal-analysis/api/meal-analysis.ts
[cur-store]: ../../../client/src/features/meal-analysis/stores/use-meal-analysis-store.ts
[cur-photo]: ../../../client/src/features/meal-analysis/components/meal-photo-section.tsx
[cur-picker]: ../../../client/src/features/body-analysis/lib/pick-image.ts
[cur-result]: ../../../client/src/features/meal-analysis/components/meal-analysis-result.tsx
[cur-today]: ../../../client/src/features/meal-analysis/components/meal-today-sections.tsx
[cur-guide]: ../../../client/src/features/meal-analysis/components/diet-guide-tab.tsx
[cur-api-test]: ../../../client/src/features/meal-analysis/api/__tests__/meal-analysis.test.ts
[cur-ui-test]: ../../../client/src/features/meal-analysis/components/__tests__/meal-analysis-components.test.tsx
[server-schema]: ../../../server/src/modules/meal-analysis/meal-analysis.schemas.ts
[server-ai]: ../../../server/src/modules/meal-analysis/openai-meal-analysis.client.ts
[server-service]: ../../../server/src/modules/meal-analysis/meal-analysis.service.ts
