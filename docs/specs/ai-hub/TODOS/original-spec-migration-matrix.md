# AI Hub 원본 스펙 마이그레이션 매트릭스

작성일자: 2026-07-28

## 목적과 판정 기준

원본 앱의 AI Hub 및 연결 기능을 코드와 [QA 추적 매트릭스][qa-matrix] 기준으로 분해하고, 현재 `ai-pt` 작업 트리의 백엔드 및 클라이언트 마이그레이션 여부를 한 표로 정리한다.

- 이 문서는 커밋된 코드만이 아니라 **2026-07-28 현재 작업 트리의 미커밋 변경도 포함**해 판정한다.
- `O`는 해당 기대 동작이 끝까지 연결되어 있고, 원본 결함을 그대로 남기지 않았으며, 클라이언트는 원본의 화면 구성·정보 구조·조작 흐름을 충실히 따르는 경우만 사용한다.
- 일부 필드·일부 화면·일부 결과만 있는 `부분 구현`은 `X`다.
- 클라이언트에 기능만 존재하더라도 원본 결과 섹션을 축약하거나 임의의 카드·필터·탭 구조로 다시 디자인한 경우 `X`다.
- 원본에서 잘못 구현된 항목은 QA 문서의 기대 동작을 마이그레이션 기준으로 삼는다. 원본 결함을 그대로 복제한 경우 `X`다.
- 현재 앱의 사용자 경계인 필수 `x-user-key`는 원본 로그인 사용자 분리의 대응 구현으로 인정한다.
- 서버 작업이 필요 없는 순수 진입·표시 스펙은 백엔드 `O`로 적고 판정 근거에 `서버 작업 불필요`라고 명시한다.

## 단일 마이그레이션 표

| ID | 영역 | 원본 스펙 / 기대 동작 | 백엔드 | 클라이언트 | 현재 코드 판정 근거 |
| --- | --- | --- | :---: | :---: | --- |
| AIHUB-001 | Hub | 로그인한 일반 사용자가 하단 `AI` 탭에서 AI 기능 목록을 연다. | O | O | 서버 작업 불필요. 현재 하단 탭의 `AI`가 `/ai-hub`로 이동하고 활성 탭도 표시한다. [현재 탭][cur-tabs] |
| AIHUB-002 | Hub | 원본의 6개 기능명·요약·아이콘·화살표 카드를 정적 목록으로 표시한다. | O | O | 서버 작업 불필요. 추가 카드와 미구현 배지를 제거해 6개 구성을 복원했고, `AI 자세 분석`도 원본에 대응하는 accessibility 아이콘으로 교체했다. [원본 Hub][src-hub] [현재 Hub][cur-hub] |
| AIHUB-003 | Hub | 카드를 누르면 실제 화면으로 이동하고, 미제공 기능이면 막힌 경로 대신 상태를 알린다. | O | O | 서버 작업 불필요. 체형 분석과 신발 추천은 실제 체형 분석 라우트의 대응 흐름으로 이동하고, 나머지는 `준비 중입니다.` 알림으로 막는다. 원본의 잘못된 404 이동은 수정했다. [현재 Hub][cur-hub] [현재 라우트][cur-routes] |
| AIHUB-004 | 체형 | Hub의 `AI 체형 분석`에서 전신 사진 분석 화면으로 진입한다. | O | O | `/ai-analysis` 라우트와 원본 제목·헤더·진입 흐름이 있다. [현재 Hub][cur-hub] [현재 체형 화면][cur-body-ui] |
| AIHUB-005 | 체형 | 민감한 신체 사진과 외부 AI 비용이 걸린 분석은 현재 사용자 경계 안에서만 실행한다. | O | O | 서버가 필수 `x-user-key`를 검증하고 클라이언트가 Toss 익명 사용자 키를 헤더에 넣는다. [사용자 키 서버][cur-user-key-server] [사용자 키 클라이언트][cur-user-key-client] |
| AIHUB-006 | 체형 | 카메라/갤러리에서 정면 전신 사진을 고르고, 데이터가 준비돼야 분석할 수 있으며 선택·분석 실패를 알린다. | O | O | 서버는 전신 이미지 필수·길이를 검증한다. 화면은 원본과 같은 필수 사진 카드, 카메라/갤러리 버튼, 미선택 비활성화, 실패 Alert를 갖는다. [현재 체형 스키마][cur-body-schema] [현재 체형 화면][cur-body-ui] |
| AIHUB-007 | 체형 | 현재 사용자의 사진 외 입력과 PT·개인 운동 기록만 반영하고, 실제 포함 데이터 범위를 사용자에게 알린다. | X | X | (QA 기대사항) 원본은 PT·개인 운동 기록을 읽어 분석에 넣지만, 사용자에게 실제 포함 범위와 조회 실패 여부를 구분해 알리는 흐름은 없다. 현재 서버 조회는 `user_key`로 안전하지만 `workout_records`만 읽고 원본 PT 수업 컨텍스트는 TODO이며, 화면 배너도 기록 유무·조회 실패와 무관하게 항상 최근 운동을 참고한다고 표시한다. [현재 운동 컨텍스트][cur-body-repo] [현재 체형 AI][cur-body-ai] [현재 체형 화면][cur-body-ui] |
| AIHUB-008 | 체형 | 키·증상은 선택 입력이며 제공된 값만 분석에 쓰고, 건강 정보의 참고용 한계를 안내한다. | O | O | 서버는 키 50~300cm, 증상 1~1000자를 검증하고 값이 없으면 의료 결과를 `null`로 요구한다. 화면도 원본처럼 키와 의료 증상을 별도 선택 입력으로 분리하고, 값이 있는 경우만 전송하며 의료 진단 대체 불가 안내를 표시한다. [원본 체형 화면][src-body-ui] [현재 체형 스키마][cur-body-schema] [현재 체형 화면][cur-body-ui] |
| AIHUB-009 | 체형 | 체형 타입, 신체 비율, 상·하체 특징, 자세 점수를 검증된 계약으로 받고 원본 결과 UI로 표시한다. | O | O | 서버 계약과 BODY MBTI·비율 바·상하체·자세 카드 구조를 복원했고, 상하체 평균 1.0 마커도 원본처럼 `값 × 50` 위치에 표시하도록 수정했다. [원본 체형 결과][src-body-ui] [현재 체형 스키마][cur-body-schema] [현재 체형 결과][cur-body-result] |
| AIHUB-010 | 체형 | `체성분 예측`을 표방하면 체중·근육량·체지방 등 제공 범위와 신뢰 한계를 보여준다. | X | X | (QA 기대사항) 원본 기본 체형 분석 계약과 화면에는 현재 체성분 예측 필드가 없고 Hub 부제만 `체성분 예측` 문구를 사용한다. 현재도 같은 상태다. [현재 체형 스키마][cur-body-schema] [현재 체형 결과][cur-body-result] |
| AIHUB-011 | 체형 | 사진 촬영일을 신뢰성 있게 얻거나 보정하고, 운동 기록 유무를 구분해 현재·3/6/12개월 예측을 제공한다. | X | X | (QA 기대사항) 원본은 EXIF 날짜를 시도하고 미래 예측을 표시하지만 촬영일 보정 및 운동 기록 유무 구분 UI는 없다. 현재 서버 필드는 있으나 현재 날짜와 기본 촬영일을 `2026-07-28`로 하드코딩하고 경과일도 실제 계산하지 않으며, 사진 선택기는 EXIF와 촬영일 보정 UI를 노출하지 않는다. [현재 체형 AI][cur-body-ai] [현재 사진 선택][cur-pick-image] [현재 체형 화면][cur-body-ui] |
| AIHUB-012 | 체형 | 분석 결과를 사용자별로 자동 저장하고 분석 성공과 저장 실패를 구분하며 재시도할 수 있다. | O | O | (저장 실패 구분·재시도는 QA 기대사항) 자동 저장과 `recordSave.saved/failed`를 분리했고, 실패 배너에서 AI 분석을 재실행하지 않고 기록 저장만 재시도한다. 재시도는 Orval 생성 API를 사용하며 사용자 키와 결정적 멱등 키를 전달하고, 서버도 같은 키를 동일 기록 ID로 upsert해 중복 저장을 막는다. 클라이언트·서버 테스트와 실제 API 중복 요청 스모크로 확인했다. [현재 체형 서비스][cur-body-service] [현재 저장 배너][cur-save-banner] [현재 기록 API][cur-create-record-api] [현재 이력 컨트롤러][cur-history-controller] |
| AIHUB-013 | 체형 | 자신의 체형 이력을 최신순으로 조회하고 같은 `body` 타입 두 건만 선택해 AI 비교한다. | O | O | 원본의 `전체/체형/자세/통합` 필터, `body` 기록만 선택하는 비교 제한, 전체 변화·체형 변화·개선·주의·자세·정량·추천·격려 결과를 복원했다. 뒤로가기·분석 타입·선택·비교 아이콘과 자세 변화의 `개선/유지/악화` 방향 아이콘도 원본 정보 표현에 맞게 복원했다. [원본 이력][src-history] [현재 이력 서버][cur-history-server] [현재 이력 화면][cur-history-ui] [현재 이력 비교 결과][cur-history-comparison] |
| AIHUB-014 | 체형 | Before/After 사진 두 장을 선택해 AI 전·후 비교 결과를 확인하고 기록으로 저장한다. | O | O | 원본과 같이 두 장이 준비돼야 비교할 수 있고 첫 사진을 Before, 두 번째 사진을 After로 보내 비교 결과를 표시·저장한다. 동일 인물·촬영일·순서·촬영 조건 검증은 원본에 없는 `(QA 기대사항)`이므로 원본 마이그레이션 O/X 판정 조건에서 제외했다. [원본 체형 화면][src-body-ui] [현재 비교 UI][cur-comparison-ui] [현재 비교 서버][cur-comparison-server] |
| AIHUB-015 | 아테나 | Hub의 아테나 카드에서 대화 화면으로 진입한다. | O | X | 순수 진입 스펙이라 서버 작업은 불필요하다. 현재는 카드가 미구현 알림만 표시하며 `/athena` 또는 `/athena-chat` 라우트가 없다. [현재 Hub][cur-hub] [현재 라우트][cur-routes] |
| AIHUB-016 | 아테나 | 1,000자 질문과 4개 빠른 코칭을 중복 없이 보내고 대기·실패·답변을 말풍선으로 표시한다. | X | X | 아테나 서버 모듈, API, 화면이 모두 없다. [현재 서버 모듈][cur-app-module] [현재 라우트][cur-routes] |
| AIHUB-017 | 아테나 | 마이크 녹음→음성 인식→질문 전송과 한국어 답변 TTS·자동 읽기 토글을 제공한다. | X | X | 음성 인식 API와 녹음/TTS 대화 UI가 없다. [현재 서버 모듈][cur-app-module] [현재 라우트][cur-routes] |
| AIHUB-018 | 아테나 | 승인된 트레이너 철학과 현재 사용자의 최신 통합 분석을 코칭 맥락으로 사용한다. | X | X | 트레이너 관계·상태 벡터 소비 로직과 아테나 화면이 없다. [현재 서버 모듈][cur-app-module] [현재 라우트][cur-routes] |
| AIHUB-019 | 아테나 | 현재 사용자의 최근 식단·운동·PT·컨디션을 실제 저장 구조에 맞게 코칭에 반영한다. | X | X | 관련 아테나 컨텍스트 조립과 화면이 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-020 | 아테나 | 한 화면 안에서 최근 대화 문맥을 유지하고 서버에는 제한된 최근 메시지만 보낸다. | X | X | 채팅 API와 메시지 상태 UI가 없다. [현재 서버 모듈][cur-app-module] [현재 라우트][cur-routes] |
| AIHUB-021 | 아테나 | 의료 진단·위험 운동·극단 식단을 막는 코칭 안전 경계를 둔다. | X | X | 아테나 프롬프트·응답 안전 처리·안내 UI가 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-022 | 아테나 | 채팅과 음성 인식 API는 현재 사용자만 호출할 수 있다. | X | X | 해당 API와 클라이언트 호출 자체가 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-023 | 아테나 | 메시지 role·문자열·길이를 런타임 검증하고 시스템 역할 주입을 막는다. | X | X | 채팅 요청 스키마와 화면 입력이 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-024 | 식단 | 사진→영양 분석→확인 후 저장→당일 합계→AI 가이드의 전체 흐름을 제공한다. | O | X | 서버에 분석, 사용자 선택 후 기록 저장, 날짜별 조회, 일일 합계, 저장 기록 기반 가이드 API가 분리되어 원본 흐름대로 연결됐다. 클라이언트 화면과 라우트는 아직 없다. [현재 식단 컨트롤러][cur-meal-controller] [현재 식단 서비스][cur-meal-service] [현재 라우트][cur-routes] |
| AIHUB-025 | 식단 | Hub 카드에서 식단 분석으로 진입하고 분석·저장·조회는 현재 사용자 기록만 다룬다. | O | X | 모든 식단 API가 필수 `x-user-key` 경계 안에 있고 저장·조회·합계·가이드는 `user_key`로 격리한다. Hub 카드는 아직 미구현 상태이며 식단 화면 라우트가 없다. [현재 식단 컨트롤러][cur-meal-controller] [현재 식단 저장소][cur-meal-repo] [현재 Hub][cur-hub] |
| AIHUB-026 | 식단 | 아침/점심/간식/저녁을 선택하고 식사 전 사진은 필수, 식사 후 사진은 선택으로 받는다. | O | X | 서버 요청 계약이 네 식사 유형 enum, 필수 식사 전 base64 사진, 선택 식사 후 사진을 원본과 같이 검증한다. 대응 사진 입력 화면은 아직 없다. [현재 식단 스키마][cur-meal-schema] [현재 식단 컨트롤러 테스트][cur-meal-controller-test] |
| AIHUB-027 | 식단 | 전·후 사진이 있으면 남긴 양과 신뢰 가능한 촬영 시간 차이로 섭취량·식사 속도를 추정한다. | O | X | 서버는 전·후 사진을 순서대로 멀티모달 입력에 넣어 남긴 양과 섭취율을 추정하고, 클라이언트가 전달한 선택 `eatingDurationMinutes`로 식사 속도 결과를 만든다. 원본처럼 EXIF 시간 추출은 클라이언트 책임이며, EXIF 신뢰성 보정은 원본에 없는 `(QA 기대사항)`이다. 현재 식단 클라이언트가 없어 촬영 시간 전달은 아직 연결되지 않았다. [현재 식단 AI][cur-meal-ai] [현재 식단 스키마][cur-meal-schema] |
| AIHUB-028 | 식단 | 음식별 중량·칼로리·탄단지·식이섬유·나트륨과 합계·균형·조언을 검증해 반환한다. | O | X | 서버가 원본의 음식별 추정량, 섭취율, 영양소와 전체 합계·균형·식단 조언·운동 상쇄량·요약 계약을 Zod로 검증한다. 외부 상품·칼로리 DB를 통한 사실성 검증은 원본에 없는 `(QA 기대사항)`이므로 추가하지 않았고 프롬프트도 외부 검증을 가장하지 않도록 했다. 결과 화면은 아직 없다. [현재 식단 스키마][cur-meal-schema] [현재 식단 AI][cur-meal-ai] |
| AIHUB-029 | 식단 | 총열량·영양소·인식 음식·AI 조언을 보고 저장 또는 새 사진 재분석을 선택한다. | O | X | 분석 응답과 기록 저장 API를 분리해 분석 직후 자동 저장하지 않고, 원본처럼 확인 후 저장하거나 다시 분석할 수 있는 서버 경계를 마련했다. 선택과 결과 표시를 담당할 클라이언트 화면은 아직 없다. [현재 식단 컨트롤러][cur-meal-controller] [현재 식단 서비스][cur-meal-service] |
| AIHUB-030 | 식단 | 사용자가 저장을 선택하면 사용자·식사유형·현지 식사일·분석 결과·영양 합계를 저장한다. | O | X | `meal_records`에 사용자 키, 식사 유형, 전달받은 `YYYY-MM-DD` 식사일, 전체 분석 JSON과 반올림한 영양 합계를 저장한다. 저장 버튼 UI는 아직 없다. [현재 식단 저장소][cur-meal-repo] [현재 DB 스키마][cur-database] |
| AIHUB-031 | 식단 | 현지 당일 기록의 열량·주요 영양소·끼니 수를 합산하고 각 끼니 요약을 재확인한다. | O | X | 날짜별 사용자 기록 조회와 열량·탄단지·식이섬유·나트륨·끼니 수의 일일 합계 API를 구현했고 실DB 스모크로 합산과 사용자 격리를 확인했다. 기록·합계 화면은 아직 없다. [현재 식단 저장소][cur-meal-repo] [현재 식단 저장소 테스트][cur-meal-repo-test] |
| AIHUB-032 | 식단 | 식사일 저장·당일 조회·합계에 회원 현지 날짜를 일관되게 쓴다. | O | X | 서버는 클라이언트가 현지 기준으로 전달하는 `YYYY-MM-DD`를 날짜 변환 없이 동일하게 저장·필터·합계·가이드 생성에 사용한다. 현지 날짜를 만들어 전달할 식단 클라이언트는 아직 없다. [현재 식단 스키마][cur-meal-schema] [현재 식단 저장소][cur-meal-repo] |
| AIHUB-033 | 식단 | 식사 유형·날짜·영양 수치의 enum·형식·범위를 서버에서 검증한다. | O | X | 서버가 식사 유형 enum, 날짜 형식, 사진 크기, 식사 시간, 음식·영양 수치·점수·비율 범위를 요청과 AI 응답 양쪽에서 검증한다. 클라이언트 입력 검증은 아직 없다. [현재 식단 스키마][cur-meal-schema] [현재 식단 서비스 테스트][cur-meal-service-test] |
| AIHUB-034 | 식단 | 저장된 식단으로 섭취 평가와 권장 식사 구성을 만들고 기록이 없으면 일반 안내임을 구분한다. | O | X | 서버가 현재 사용자·요청 날짜의 저장 기록만 가이드 컨텍스트로 사용하고, 기록이 없으면 일반 가이드를 요청하며 응답의 `sourceMealCount`를 0으로 내려 구분한다. 가이드 화면은 아직 없다. [현재 식단 서비스][cur-meal-service] [현재 식단 AI][cur-meal-ai] |
| AIHUB-035 | 식단 | 가이드의 평가·목표 영양소·식사 구성·개선 조언 계약을 화면과 일치시킨다. | O | X | 원본 서버와 화면 사이에 어긋나 있던 필드를 실제 원본 화면이 소비하는 `overallAssessment`, `macroTargets`, `mealPlan`, `tips` 계약으로 통일하고 서버에서 검증한다. 이를 표시할 현재 클라이언트는 아직 없다. [현재 식단 스키마][cur-meal-schema] [현재 식단 응답 DTO][cur-meal-response] |
| AIHUB-036 | 자세 | Hub의 자세 분석 카드에서 운동 영상 선택·촬영 및 교정 결과 화면으로 진입한다. | O | X | 순수 진입 스펙이라 서버 작업은 불필요하다. 현재 카드는 미구현 알림이며 자세 분석 라우트가 없다. [현재 Hub][cur-hub] [현재 라우트][cur-routes] |
| AIHUB-037 | 자세 | 최대 5초 운동 영상을 촬영/선택하고 3개 분석 프레임을 추출한다. | X | X | 현재 `/ai-analysis`에는 원본의 `자세 분석 영상` 섹션이 없고 프레임 추출 모듈도 없다. [원본 체형 화면][src-body-ui] [현재 체형 화면][cur-body-ui] |
| AIHUB-038 | 자세 | 현재 사용자만 유효 이미지 프레임을 제출하고 서버가 프레임 개수·형식을 검증한다. | X | X | 자세 분석 API·요청 스키마·클라이언트 호출이 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-039 | 자세 | 운동명, 정확도, 6개 폼 점수, 부상 위험, 교정 우선순위, 장점·요약을 검증된 계약으로 표시한다. | X | X | 자세 AI 응답 계약과 원본 결과 카드 UI가 없다. 현재 체형의 정지 사진 자세 평가는 이 영상 기능의 대체가 아니다. [현재 체형 스키마][cur-body-schema] [현재 라우트][cur-routes] |
| AIHUB-040 | 자세 | 자세 결과를 사용자별 `posture` 이력으로 저장하고 저장 실패를 구분해 재열람한다. | X | X | enum에는 `posture`가 있지만 생성 흐름과 자세 상세 렌더러가 없다. [현재 이력 스키마][cur-history-schema] [현재 이력 화면][cur-history-ui] |
| AIHUB-041 | 자세 | 승인된 트레이너 관계에 분석 프레임과 AI 요약을 피드백 요청으로 저장한다. | X | X | 트레이너 피드백 요청 API·관계 저장·버튼 UI가 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-042 | 자세 | 활성 운동에서도 같은 자세 계약으로 운동명·점수·교정·위험도를 표시한다. | X | X | 현재 활성 운동은 로컬 운동 세션 화면이며 자세 AI API를 호출하거나 결과를 표시하지 않는다. [현재 활성 운동][cur-active-workout] |
| AIHUB-043 | 신발 | Hub의 신발 추천 카드에서 보행·신발 추천 기능으로 진입한다. | O | O | 서버 작업 불필요. Hub의 신발 추천 카드는 `/ai-analysis`를 신발 진입 모드로 열고, 화면 제목·안내를 신발 추천으로 바꾼 뒤 원본 체형 분석 안의 신발 밑창 입력 섹션으로 자동 이동한다. [현재 Hub][cur-hub] [현재 체형 화면][cur-body-ui] [현재 신발 진입 상태][cur-body-entry-store] |
| AIHUB-044 | 신발 | 필수 정면 전신 사진과 선택 신발 밑창/뒤꿈치 사진을 함께 입력해 체형 분석 안에서 보행·신발 결과를 생성한다. | O | O | 원본과 같이 정면 전신 사진은 필수이고 신발 사진은 선택이며, 신발 사진을 제공하면 같은 분석 요청과 결과 화면에서 보행·신발 결과를 생성한다. 신발 사진만으로 시작하는 전용 입력 흐름은 원본에 없는 `(QA 기대사항)`이므로 원본 마이그레이션 O/X 판정 조건에서 제외했다. [원본 체형 화면][src-body-ui] [현재 체형 스키마][cur-body-schema] [현재 체형 화면][cur-body-ui] |
| AIHUB-045 | 신발 | 좌우·밑창 전체·마모·각도·조명 등 판독 가능성을 확인하고 불충분하면 결과 생성을 막는다. | X | X | (QA 기대사항) 원본에도 좌우·밑창 전체·촬영 품질 확인 단계가 없다. 현재 서버는 base64 길이만 검사하고 사진 내용·좌우·마모 판독성을 검증하지 않으며 화면에도 촬영 품질 확인 단계가 없다. [현재 체형 스키마][cur-body-schema] [현재 체형 화면][cur-body-ui] |
| AIHUB-046 | 신발 | 사진 증거 범위의 마모·보행 특성을 설명하고 측정과 AI 추정을 구분한다. | X | X | (QA 기대사항) 원본도 AI 결과를 측정과 추정으로 구분하지 않는다. 현재 역시 마모·보행 결과는 생성하지만 프롬프트와 UI가 이를 측정값처럼 표시하며 추정 근거·신뢰도 구분이 없다. [현재 체형 AI][cur-body-ai] [현재 체형 결과][cur-body-result] |
| AIHUB-047 | 신발 | 현재 사용자의 실제 운동 목적·최근 활동을 안전하게 반영하고 누락·조회 실패를 근거로 쓰지 않는다. | X | X | (QA 기대사항) 원본에도 주 사용 목적·러닝 거리·선호·예산 입력 및 기록 조회 실패 구분은 없다. 현재 서버 조회는 사용자별이지만 PT 수업·주 사용 목적·러닝 거리·선호·예산이 없고, 화면은 실제 반영 여부를 보여주지 않는다. [현재 운동 컨텍스트][cur-body-repo] [현재 체형 AI][cur-body-ai] |
| AIHUB-048 | 신발 | 기준 물체나 사용자 실측값으로 사이즈·발볼을 계산하고 사진만으로 확정할 수 없으면 측정을 안내한다. | X | X | (QA 기대사항) 원본에도 기준 물체·실측 입력·재측정 안내가 없다. 현재는 기준 길이 없이 AI가 `estimatedSize`, 발 길이·너비를 반드시 추정하고 UI가 `신발 사이즈 측정`으로 확정적으로 표시한다. [현재 체형 AI][cur-body-ai] [현재 체형 결과][cur-body-result] |
| AIHUB-049 | 신발 | 성별·연령대가 필요하면 사용자에게 받고 사진·사이즈로 민감 속성을 단정하지 않는다. | X | X | (QA 기대사항) 원본은 사용자 입력 없이 사진·사이즈에서 성별·연령을 추정한다. 현재 프롬프트와 화면도 원본처럼 성별·연령 추정, 성별 태그와 추정 근거를 표시한다. [현재 체형 AI][cur-body-ai] [현재 체형 결과][cur-body-result] |
| AIHUB-050 | 신발 | 실제 제품명·가격·사이즈·구매 가능성을 검증하고 추정 정보와 구매 정보를 구분한다. | X | X | (QA 기대사항) 원본에도 상품 카탈로그·가격·재고 검증 및 구매 링크가 없다. 현재 역시 별도 검증 없이 LLM 생성 제품명·가격 텍스트를 표시한다. [현재 체형 AI][cur-body-ai] [현재 체형 결과][cur-body-result] |
| AIHUB-051 | 신발 | 마모·보행·발 정렬·신체 영향·교정과 `현재/교정 후 × 일상/운동` 추천을 구분해 표시하고 불완전 응답을 막는다. | O | O | 서버가 전체 중첩 구조와 범위를 Zod로 검증한다. 화면은 원본의 섹션 순서, 2단 탭, 사이즈·추천 카드 구조를 유지하고 선택 전환을 구현했다. [현재 체형 스키마][cur-body-schema] [현재 체형 결과][cur-body-result] |
| AIHUB-052 | 신발 | 보행 조언을 의료 진단으로 단정하지 않고 통증·이상 시 전문 평가 한계를 명확히 알린다. | X | X | (QA 기대사항) 원본에도 보행/신발 전용 의료 한계·전문 평가 분기와 안내 UI가 없다. 현재도 실제 사진 범위만 쓰라는 일반 문구만 있고 전용 안전 안내는 없다. [현재 체형 AI][cur-body-ai] [현재 체형 결과][cur-body-result] |
| AIHUB-053 | 신발 | 사용자별 신발 결과를 저장하고 이력에서 마모·보행·사이즈·추천 전체를 다시 본다. | O | O | 서버가 전체 결과를 사용자별 `body` raw result로 저장하고, 이력 상세는 원본 이력용 체형 구조를 유지하면서 신발 결과가 있을 때 신발 전용 렌더러를 재사용한다. 마모·보행·발 정렬·신체 영향·사이즈·매칭 로직과 `현재/교정 후 × 일상/운동` 추천 전체를 다시 볼 수 있다. [현재 체형 서비스][cur-body-service] [원본 이력][src-history] [현재 이력 상세][cur-history-detail] |
| AIHUB-054 | 신발 | 전신·신발 사진 외부 AI 분석을 현재 사용자만 호출한다. | O | O | 필수 `x-user-key` 검증과 클라이언트 헤더 전달이 체형+신발 요청에 같이 적용된다. [사용자 키 서버][cur-user-key-server] [현재 체형 API][cur-body-api] |
| AIHUB-055 | 통합 | 체형·자세·보행·운동·컨디션을 종합해 점수·위험·계획·변화 예측을 제공한다. | X | X | 상태 벡터 생성 서버 모듈과 `/fitness-state` 화면이 없다. [현재 서버 모듈][cur-app-module] [현재 라우트][cur-routes] |
| AIHUB-056 | 통합 | Hub에서 통합 분석으로 진입하고 개인 입력·결과·이력은 현재 사용자만 다룬다. | X | X | Hub는 미구현 알림이고 상태 벡터 API·라우트가 없다. [현재 Hub][cur-hub] [현재 서버 모듈][cur-app-module] |
| AIHUB-057 | 통합 | 현재 사용자의 최신 체형·자세, 최근 PT·개인 운동·컨디션, 트레이너 맥락을 정해진 범위로 수집한다. | X | X | 통합 분석용 수집·소유권 검증·요청 화면이 없다. 기존 체형의 운동 조회만으로는 이 요구를 충족하지 않는다. [현재 서버 모듈][cur-app-module] |
| AIHUB-058 | 통합 | 분석 전/결과에서 실제 사용된 데이터와 없는 데이터를 구분해 고지한다. | X | X | 데이터 가용성 응답과 체크 UI가 없다. [현재 서버 모듈][cur-app-module] [현재 라우트][cur-routes] |
| AIHUB-059 | 통합 | 체형·보행·자세 근거를 구분해 종합하고 없는 항목을 추정 결과로 가장하지 않는다. | X | X | 통합 프롬프트·데이터 가용성 계약·결과 UI가 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-060 | 통합 | 1~100 종합/차원 점수, S~F 등급, 부상 위험, 즉시 행동·주간/교정/영양 계획, 1/3/6개월 예측을 검증한다. | X | X | 상태 벡터 AI client와 응답 스키마, 화면이 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-061 | 통합 | 종합 점수 구성과 고위험 부위·근거를 표시하고 의료 진단 한계를 안내한다. | X | X | 통합 점수·위험 결과 화면과 안전 안내가 없다. [현재 라우트][cur-routes] |
| AIHUB-062 | 통합 | 종합/주간계획/교정/예측 4개 탭에서 계획과 예측을 보고 다시 분석한다. | X | X | 4개 결과 탭과 재분석 UI, 대응 서버 계약이 없다. [현재 서버 모듈][cur-app-module] [현재 라우트][cur-routes] |
| AIHUB-063 | 통합 | 불완전한 AI 응답을 검증하고 이용 가능한 결과와 오류를 안전하게 구분한다. | X | X | 통합 분석 스키마·오류 처리·결과 화면이 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-064 | 통합 | 통합 결과를 사용자별 `state-vector` 기록으로 저장하고 재분석마다 별도 이력을 남긴다. | X | X | 이력 enum만 `state-vector`를 허용할 뿐 이를 생성하는 API/서비스와 화면이 없다. [현재 이력 스키마][cur-history-schema] [현재 서버 모듈][cur-app-module] |
| AIHUB-065 | 통합 | 저장한 종합 점수·계획·위험·예측을 이력 목록과 상세에서 같은 계약으로 재열람한다. | X | X | `state-vector` 상세 렌더러와 실제 생성 기록이 없다. [현재 이력 화면][cur-history-ui] |
| AIHUB-066 | 통합 | 최신 통합 결과를 홈 점수, 아테나 코칭, 개인화 루틴의 사용자 맥락으로 연결한다. | X | X | 최신 상태 벡터 소비 로직, 아테나, 통합 점수 배너 연동이 없다. [현재 서버 모듈][cur-app-module] |
| AICODE-001 | Hub 코드 대조 | 원본 Hub의 카드 구성은 정확히 6개이고 별도 `나의 몸매 & 스타일` 카드는 없다. | O | O | `나의 몸매 & 스타일` 카드와 미구현 배지를 제거해 원본과 같은 6개 카드 구성으로 복원했고 자세 분석 아이콘도 원본 구성에 맞췄다. [원본 Hub][src-hub] [현재 Hub][cur-hub] |
| AICODE-002 | 체형 코드 대조 | 측면·후면·스쿼트 사진 결과는 종합 점수뿐 아니라 각 뷰의 세부 정렬·가동성·불균형을 원본 섹션대로 표시한다. | O | O | 서버가 검증하는 side/back/squat 상세를 현재 결과 UI가 측면 정렬, 후면 비대칭·불균형, 스쿼트 정렬·가동성·균형 및 우선 교정 사항으로 구분해 표시한다. [원본 체형 결과][src-body-ui] [현재 체형 스키마][cur-body-schema] [현재 체형 결과][cur-body-result] |
| AICODE-003 | 체형 코드 대조 | 의료 결과는 위험 부위·등급·예방 팁, 대체 운동, 재활 주의, 생활 조언, 진료 권고를 원본 카드 구조로 모두 표시한다. | O | O | 현재 결과 UI가 증상·체형 영향, 근골격 위험과 예방 팁, 운동 대안, 재활 운동 주의, 생활 조언, 진료 권고와 면책 안내를 원본 순서로 표시한다. [원본 체형 결과][src-body-ui] [현재 체형 결과][cur-body-result] |
| AICODE-004 | 체형 코드 대조 | 원본이 생성·표시하는 최신 연구 기반 기술·트렌드 운동·영양 팁을 제공한다. | X | X | 현재 프롬프트는 `최신 연구 소개 같은 부가 섹션은 넣지 말라`고 명시하고 스키마·UI에서도 제거했다. 원본 기능을 의도적으로 제외한 상태다. [원본 체형 결과][src-body-ui] [현재 체형 AI][cur-body-ai] |
| AICODE-005 | 비교 코드 대조 | 전·후 비교 결과의 점수, 원본 사진, 부위/자세/체성분 변화, 유지·개선, 다음 목표, 동기 문구를 원본 순서로 표시한다. | O | O | 별도 비교 서버가 전체 계약을 검증하고, 현재 비교 결과 컴포넌트가 원본 섹션과 상호작용을 대부분 그대로 이식했다. 동일 인물·촬영 조건 검증은 원본에 없는 QA 기대사항이라 이 코드 대조 판정에서 제외했다. [원본 체형 화면][src-body-ui] [현재 비교 UI][cur-comparison-ui] [현재 비교 서버][cur-comparison-server] |

## 핵심 결론

- 현재 판정 합계는 백엔드 `O 34 / X 37`, 클라이언트 `O 20 / X 51`이다.
- 현재 실제로 끝까지 연결된 범위는 `AI Hub → 체형 분석`, `AI Hub → 신발 입력 섹션`, 정면/추가 사진 분석 요청, 사용자별 저장, 전·후 비교의 핵심 결과, 다각도·의료 상세, 그리고 체형 분석에 포함된 신발 결과의 메인 화면 렌더링이다.
- 체형 분석의 원본 UX 범위에서는 비율 마커, 멱등한 저장 재시도, 이력 화면과 신발 전체 재열람까지 보완했다. PT 컨텍스트, 촬영일, 현재 체성분 등 QA 기대사항과 원본의 최신 연구 섹션은 별도 미완료 항목으로 남아 있다.
- 식단 분석은 사진 분석, 확인 후 저장, 사용자별 날짜 조회와 일일 합계, 저장 기록 기반 가이드까지 백엔드가 마이그레이션됐지만 클라이언트 화면과 Hub 진입은 아직 미구현이다.
- 아테나, 영상 자세 분석, 통합 피트니스 분석은 카드 문구만 있고 백엔드와 실제 화면이 마이그레이션되지 않았다.
- 신발 추천은 원본 기준의 Hub 진입, 체형 분석 안의 선택 신발 입력, 서버 계약, 메인 결과 및 이력 전체 재열람까지 연결됐다. 신발만의 입력 흐름, 판독 검증, 실측, 민감 속성 처리, 상품 현재성, 의료 안전 경계는 원본에 없고 QA 기대사항으로 식별된 항목이다.
- Hub는 원본과 같은 6개 카드와 자세 분석 아이콘 구성으로 복원됐다.

## 확인 범위

- 원본 클라이언트: Hub, 체형/신발/영상 자세/전·후 비교, 이력, 아테나, 식단, 통합 분석, 활성 운동
- 원본 서버: AI 분석·채팅·식단 가이드·상태 벡터·기록 저장/비교 경로
- 현재 클라이언트: 생성 라우트 전체, Hub, 체형 입력/결과, 전·후 비교, 이력, 활성 운동
- 현재 서버: AppModule 전체 등록 모듈, body-analysis, body-comparison, analysis-records, workout-records, meal-analysis
- QA 기준: AI Hub 추적 매트릭스의 `AIHUB-001`~`AIHUB-066`과 도메인별 QA 문서
- 재검증: 클라이언트 전체 테스트 29개 suite/78개 test, 서버 전체 테스트 27개 suite/106개 test 통과
- 정적 검사: 클라이언트 변경 기능 범위 Biome와 서버 변경 파일 ESLint 통과
- 실제 API 확인: 같은 멱등 키로 분석 기록 생성 POST를 두 번 호출해 동일 기록 ID와 단일 저장 행을 확인했고, 식단 기록 생성·사용자별 날짜 조회·일일 합계와 스모크 기록 정리까지 확인
- 테스트 보강: 비율 마커 계산, Hub 카드 구성, 비교 결과 방향 표현, 신발 이력 전체 재열람과 식단 분석·기록·가이드 계약을 회귀 테스트로 확인

[qa-matrix]: <../../../../../2026-07-13/pt-diary-qa/ai-hub/AI_Hub_QA_추적매트릭스.csv>
[src-hub]: <../../../../../2026-07-13/my-PT-Diary/app/(tabs)/ai-hub.tsx>
[src-body-ui]: <../../../../../2026-07-13/my-PT-Diary/app/ai-analysis.tsx>
[src-history]: <../../../../../2026-07-13/my-PT-Diary/app/analysis-history.tsx>
[cur-hub]: ../../../../client/src/features/ai-hub/components/ai-hub-screen.tsx
[cur-tabs]: ../../../../client/src/features/home/components/home-tab-bar.tsx
[cur-routes]: ../../../../client/src/router.gen.ts
[cur-active-workout]: ../../../../client/src/features/active-workout/components/active-workout-screen.tsx
[cur-user-key-client]: ../../../../client/src/shared/api/user-key.ts
[cur-user-key-server]: ../../../../server/src/common/decorators/user-key.decorator.ts
[cur-pick-image]: ../../../../client/src/features/body-analysis/lib/pick-image.ts
[cur-body-api]: ../../../../client/src/features/body-analysis/api/body-analysis.ts
[cur-body-ui]: ../../../../client/src/features/body-analysis/components/body-analysis-screen.tsx
[cur-body-result]: ../../../../client/src/features/body-analysis/components/body-analysis-result.tsx
[cur-body-entry-store]: ../../../../client/src/features/body-analysis/stores/use-body-analysis-entry-store.ts
[cur-save-banner]: ../../../../client/src/features/body-analysis/components/analysis-record-save-banner.tsx
[cur-create-record-api]: ../../../../client/src/features/body-analysis/api/analysis-records.ts
[cur-comparison-ui]: ../../../../client/src/features/body-analysis/components/body-comparison-section.tsx
[cur-body-schema]: ../../../../server/src/modules/body-analysis/body-analysis.schemas.ts
[cur-body-ai]: ../../../../server/src/modules/body-analysis/openai-body-analysis.client.ts
[cur-body-service]: ../../../../server/src/modules/body-analysis/body-analysis.service.ts
[cur-body-repo]: ../../../../server/src/modules/body-analysis/body-analysis.repository.ts
[cur-comparison-server]: ../../../../server/src/modules/body-comparison/body-comparison.service.ts
[cur-history-ui]: ../../../../client/src/features/body-analysis/components/analysis-history-screen.tsx
[cur-history-detail]: ../../../../client/src/features/body-analysis/components/analysis-record-detail-content.tsx
[cur-history-comparison]: ../../../../client/src/features/body-analysis/components/analysis-record-comparison-result.tsx
[cur-history-controller]: ../../../../server/src/modules/analysis-records/analysis-records.controller.ts
[cur-history-server]: ../../../../server/src/modules/analysis-records/analysis-records.service.ts
[cur-history-schema]: ../../../../server/src/modules/analysis-records/analysis-records.schemas.ts
[cur-app-module]: ../../../../server/src/app.module.ts
[cur-database]: ../../../../server/src/database/database.service.ts
[cur-meal-controller]: ../../../../server/src/modules/meal-analysis/meal-analysis.controller.ts
[cur-meal-service]: ../../../../server/src/modules/meal-analysis/meal-analysis.service.ts
[cur-meal-schema]: ../../../../server/src/modules/meal-analysis/meal-analysis.schemas.ts
[cur-meal-ai]: ../../../../server/src/modules/meal-analysis/openai-meal-analysis.client.ts
[cur-meal-repo]: ../../../../server/src/modules/meal-analysis/meal-records.repository.ts
[cur-meal-response]: ../../../../server/src/modules/meal-analysis/dto/meal-analysis-response.dto.ts
[cur-meal-controller-test]: ../../../../server/src/modules/meal-analysis/__tests__/meal-analysis.controller.integration.spec.ts
[cur-meal-service-test]: ../../../../server/src/modules/meal-analysis/__tests__/meal-analysis.service.spec.ts
[cur-meal-repo-test]: ../../../../server/src/modules/meal-analysis/__tests__/meal-records.repository.spec.ts
