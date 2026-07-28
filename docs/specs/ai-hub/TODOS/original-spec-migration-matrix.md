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
| AIHUB-002 | Hub | 원본의 6개 기능명·요약·아이콘·화살표 카드를 정적 목록으로 표시한다. | O | X | 서버 작업 불필요. 카드 외형은 원본에 가깝지만 현재는 원본에 없던 `나의 몸매 & 스타일`을 추가해 7개이며, 미구현 배지도 원본에 없다. [원본 Hub][src-hub] [현재 Hub][cur-hub] |
| AIHUB-003 | Hub | 카드를 누르면 실제 화면으로 이동하고, 미제공 기능이면 막힌 경로 대신 상태를 알린다. | O | O | 서버 작업 불필요. 체형 분석은 실제 라우트로 이동하고 나머지는 `준비 중입니다.` 알림으로 막는다. 원본의 잘못된 404 이동은 수정했다. [현재 Hub][cur-hub] [현재 라우트][cur-routes] |
| AIHUB-004 | 체형 | Hub의 `AI 체형 분석`에서 전신 사진 분석 화면으로 진입한다. | O | O | `/ai-analysis` 라우트와 원본 제목·헤더·진입 흐름이 있다. [현재 Hub][cur-hub] [현재 체형 화면][cur-body-ui] |
| AIHUB-005 | 체형 | 민감한 신체 사진과 외부 AI 비용이 걸린 분석은 현재 사용자 경계 안에서만 실행한다. | O | O | 서버가 필수 `x-user-key`를 검증하고 클라이언트가 Toss 익명 사용자 키를 헤더에 넣는다. [사용자 키 서버][cur-user-key-server] [사용자 키 클라이언트][cur-user-key-client] |
| AIHUB-006 | 체형 | 카메라/갤러리에서 정면 전신 사진을 고르고, 데이터가 준비돼야 분석할 수 있으며 선택·분석 실패를 알린다. | O | O | 서버는 전신 이미지 필수·길이를 검증한다. 화면은 원본과 같은 필수 사진 카드, 카메라/갤러리 버튼, 미선택 비활성화, 실패 Alert를 갖는다. [현재 체형 스키마][cur-body-schema] [현재 체형 화면][cur-body-ui] |
| AIHUB-007 | 체형 | 현재 사용자의 사진 외 입력과 PT·개인 운동 기록만 반영하고, 실제 포함 데이터 범위를 사용자에게 알린다. | X | X | 서버 조회는 `user_key`로 안전하지만 `workout_records`만 읽고 원본 PT 수업 컨텍스트는 TODO다. 화면 배너는 기록 유무·조회 실패와 무관하게 항상 최근 운동을 참고한다고 표시한다. [현재 운동 컨텍스트][cur-body-repo] [현재 체형 AI][cur-body-ai] [현재 체형 화면][cur-body-ui] |
| AIHUB-008 | 체형 | 키·증상은 선택 입력이며 제공된 값만 분석에 쓰고, 건강 정보의 참고용 한계를 안내한다. | O | X | 서버는 키 50~300cm, 증상 1~1000자를 검증하고 값이 없으면 의료 결과를 `null`로 요구한다. 화면 기능은 있지만 원본의 별도 `키 입력` 카드와 `의료 증상` 카드 대신 임의의 `추가 입력` 통합 카드로 재구성했다. [원본 체형 화면][src-body-ui] [현재 체형 스키마][cur-body-schema] [현재 체형 화면][cur-body-ui] |
| AIHUB-009 | 체형 | 체형 타입, 신체 비율, 상·하체 특징, 자세 점수를 검증된 계약으로 받고 원본 결과 UI로 표시한다. | O | X | 서버는 I/V/A/H/X/O, 비율, 상·하체, 1~5 자세 점수를 Zod로 검증한다. 현재 결과는 원본의 중앙 BODY MBTI 카드와 비율 막대·평균/장단 라벨을 없애고 가로 hero와 숫자 박스로 다시 디자인했다. [원본 체형 결과][src-body-ui] [현재 체형 스키마][cur-body-schema] [현재 체형 결과][cur-body-result] |
| AIHUB-010 | 체형 | `체성분 예측`을 표방하면 체중·근육량·체지방 등 제공 범위와 신뢰 한계를 보여준다. | X | X | 현재 기본 체형 분석 계약과 화면에도 현재 체성분 예측 필드가 없다. Hub 부제만 원본 문구를 유지한다. [현재 체형 스키마][cur-body-schema] [현재 체형 결과][cur-body-result] |
| AIHUB-011 | 체형 | 사진 촬영일을 신뢰성 있게 얻거나 보정하고, 운동 기록 유무를 구분해 현재·3/6/12개월 예측을 제공한다. | X | X | 서버 필드는 있으나 현재 날짜와 기본 촬영일을 `2026-07-28`로 하드코딩하고 경과일도 실제 계산하지 않는다. 사진 선택기는 EXIF를 노출하지 않고 촬영일 배지·보정 UI도 없다. [현재 체형 AI][cur-body-ai] [현재 사진 선택][cur-pick-image] [현재 체형 화면][cur-body-ui] |
| AIHUB-012 | 체형 | 분석 결과를 사용자별로 자동 저장하고 분석 성공과 저장 실패를 구분하며 재시도할 수 있다. | O | X | 서버는 `body` 기록 저장을 시도하고 `recordSave.saved/failed`를 분리한다. 화면은 성공/실패 배너는 표시하지만 저장만 다시 시도하는 동작은 없다. [현재 체형 서비스][cur-body-service] [현재 저장 배너][cur-save-banner] |
| AIHUB-013 | 체형 | 자신의 체형 이력을 최신순으로 조회하고 같은 `body` 타입 두 건만 선택해 AI 비교한다. | O | X | 서버는 사용자 소유권과 `body` 타입을 강제한다. 현재 이력 화면은 원본의 `전체/체형/자세/통합` 필터를 `체형/전·후/전체`로 바꾸고 카드·상세 구조를 재설계했으며, 비교 결과도 체형 변화·악화·자세/정량 변화·격려 문구를 생략했다. [원본 이력][src-history] [현재 이력 서버][cur-history-server] [현재 이력 화면][cur-history-ui] |
| AIHUB-014 | 체형 | Before/After가 같은 사람의 시간 순서 사진임을 확인하고 촬영 조건 차이를 고려해 사진 기반 변화로 제시한다. | X | X | 두 장 분석·결과·저장은 있으나 동일 인물, 촬영일, 순서, 조명·거리 조건을 확인하거나 검증하지 않는다. [현재 비교 UI][cur-comparison-ui] [현재 비교 서버][cur-comparison-server] |
| AIHUB-015 | 아테나 | Hub의 아테나 카드에서 대화 화면으로 진입한다. | O | X | 순수 진입 스펙이라 서버 작업은 불필요하다. 현재는 카드가 미구현 알림만 표시하며 `/athena` 또는 `/athena-chat` 라우트가 없다. [현재 Hub][cur-hub] [현재 라우트][cur-routes] |
| AIHUB-016 | 아테나 | 1,000자 질문과 4개 빠른 코칭을 중복 없이 보내고 대기·실패·답변을 말풍선으로 표시한다. | X | X | 아테나 서버 모듈, API, 화면이 모두 없다. [현재 서버 모듈][cur-app-module] [현재 라우트][cur-routes] |
| AIHUB-017 | 아테나 | 마이크 녹음→음성 인식→질문 전송과 한국어 답변 TTS·자동 읽기 토글을 제공한다. | X | X | 음성 인식 API와 녹음/TTS 대화 UI가 없다. [현재 서버 모듈][cur-app-module] [현재 라우트][cur-routes] |
| AIHUB-018 | 아테나 | 승인된 트레이너 철학과 현재 사용자의 최신 통합 분석을 코칭 맥락으로 사용한다. | X | X | 트레이너 관계·상태 벡터 소비 로직과 아테나 화면이 없다. [현재 서버 모듈][cur-app-module] [현재 라우트][cur-routes] |
| AIHUB-019 | 아테나 | 현재 사용자의 최근 식단·운동·PT·컨디션을 실제 저장 구조에 맞게 코칭에 반영한다. | X | X | 관련 아테나 컨텍스트 조립과 화면이 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-020 | 아테나 | 한 화면 안에서 최근 대화 문맥을 유지하고 서버에는 제한된 최근 메시지만 보낸다. | X | X | 채팅 API와 메시지 상태 UI가 없다. [현재 서버 모듈][cur-app-module] [현재 라우트][cur-routes] |
| AIHUB-021 | 아테나 | 의료 진단·위험 운동·극단 식단을 막는 코칭 안전 경계를 둔다. | X | X | 아테나 프롬프트·응답 안전 처리·안내 UI가 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-022 | 아테나 | 채팅과 음성 인식 API는 현재 사용자만 호출할 수 있다. | X | X | 해당 API와 클라이언트 호출 자체가 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-023 | 아테나 | 메시지 role·문자열·길이를 런타임 검증하고 시스템 역할 주입을 막는다. | X | X | 채팅 요청 스키마와 화면 입력이 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-024 | 식단 | 사진→영양 분석→확인 후 저장→당일 합계→AI 가이드의 전체 흐름을 제공한다. | X | X | 식단 분석·식단 기록·식단 가이드 서버 모듈과 화면이 모두 없다. [현재 서버 모듈][cur-app-module] [현재 라우트][cur-routes] |
| AIHUB-025 | 식단 | Hub 카드에서 식단 분석으로 진입하고 분석·저장·조회는 현재 사용자 기록만 다룬다. | X | X | Hub는 미구현 알림만 표시하고 관련 API·라우트가 없다. [현재 Hub][cur-hub] [현재 서버 모듈][cur-app-module] |
| AIHUB-026 | 식단 | 아침/점심/간식/저녁을 선택하고 식사 전 사진은 필수, 식사 후 사진은 선택으로 받는다. | X | X | 요청 스키마와 사진 입력 화면이 없다. [현재 서버 모듈][cur-app-module] [현재 라우트][cur-routes] |
| AIHUB-027 | 식단 | 전·후 사진이 있으면 남긴 양과 신뢰 가능한 촬영 시간 차이로 섭취량·식사 속도를 추정한다. | X | X | 전·후 식사 사진 분석과 EXIF 시간 처리 모두 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-028 | 식단 | 음식별 중량·칼로리·탄단지·식이섬유·나트륨과 합계·균형·조언을 검증해 반환한다. | X | X | 음식 멀티모달 분석 API·응답 스키마·결과 화면이 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-029 | 식단 | 총열량·영양소·인식 음식·AI 조언을 보고 저장 또는 새 사진 재분석을 선택한다. | X | X | 결과 확인·저장·재분석 UI가 없다. [현재 라우트][cur-routes] |
| AIHUB-030 | 식단 | 사용자가 저장을 선택하면 사용자·식사유형·현지 식사일·분석 결과·영양 합계를 저장한다. | X | X | `meal_records` 저장 모듈과 저장 버튼 UI가 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-031 | 식단 | 현지 당일 기록의 열량·주요 영양소·끼니 수를 합산하고 각 끼니 요약을 재확인한다. | X | X | 당일 식단 조회/합계 API와 화면이 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-032 | 식단 | 식사일 저장·당일 조회·합계에 회원 현지 날짜를 일관되게 쓴다. | X | X | 식단 날짜 처리 자체가 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-033 | 식단 | 식사 유형·날짜·영양 수치의 enum·형식·범위를 서버에서 검증한다. | X | X | 식단 저장 스키마와 입력 검증 UI가 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-034 | 식단 | 저장된 식단으로 섭취 평가와 권장 식사 구성을 만들고 기록이 없으면 일반 안내임을 구분한다. | X | X | 식단 가이드 API와 빈 기록/개인 기록 분기 UI가 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-035 | 식단 | 가이드의 평가·목표 영양소·식사 구성·개선 조언 계약을 화면과 일치시킨다. | X | X | 가이드 계약과 결과 화면이 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-036 | 자세 | Hub의 자세 분석 카드에서 운동 영상 선택·촬영 및 교정 결과 화면으로 진입한다. | O | X | 순수 진입 스펙이라 서버 작업은 불필요하다. 현재 카드는 미구현 알림이며 자세 분석 라우트가 없다. [현재 Hub][cur-hub] [현재 라우트][cur-routes] |
| AIHUB-037 | 자세 | 최대 5초 운동 영상을 촬영/선택하고 3개 분석 프레임을 추출한다. | X | X | 현재 `/ai-analysis`에는 원본의 `자세 분석 영상` 섹션이 없고 프레임 추출 모듈도 없다. [원본 체형 화면][src-body-ui] [현재 체형 화면][cur-body-ui] |
| AIHUB-038 | 자세 | 현재 사용자만 유효 이미지 프레임을 제출하고 서버가 프레임 개수·형식을 검증한다. | X | X | 자세 분석 API·요청 스키마·클라이언트 호출이 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-039 | 자세 | 운동명, 정확도, 6개 폼 점수, 부상 위험, 교정 우선순위, 장점·요약을 검증된 계약으로 표시한다. | X | X | 자세 AI 응답 계약과 원본 결과 카드 UI가 없다. 현재 체형의 정지 사진 자세 평가는 이 영상 기능의 대체가 아니다. [현재 체형 스키마][cur-body-schema] [현재 라우트][cur-routes] |
| AIHUB-040 | 자세 | 자세 결과를 사용자별 `posture` 이력으로 저장하고 저장 실패를 구분해 재열람한다. | X | X | enum에는 `posture`가 있지만 생성 흐름과 자세 상세 렌더러가 없다. [현재 이력 스키마][cur-history-schema] [현재 이력 화면][cur-history-ui] |
| AIHUB-041 | 자세 | 승인된 트레이너 관계에 분석 프레임과 AI 요약을 피드백 요청으로 저장한다. | X | X | 트레이너 피드백 요청 API·관계 저장·버튼 UI가 없다. [현재 서버 모듈][cur-app-module] |
| AIHUB-042 | 자세 | 활성 운동에서도 같은 자세 계약으로 운동명·점수·교정·위험도를 표시한다. | X | X | 현재 활성 운동은 로컬 운동 세션 화면이며 자세 AI API를 호출하거나 결과를 표시하지 않는다. [현재 활성 운동][cur-active-workout] |
| AIHUB-043 | 신발 | Hub의 신발 추천 카드에서 보행·신발 추천 기능으로 진입한다. | O | X | 체형 분석 서버에 신발 입력 처리는 존재하지만 순수 진입은 서버 작업 불필요다. Hub 카드는 여전히 미구현 알림만 표시해 실제 `/ai-analysis` 신발 섹션으로도 연결되지 않는다. [현재 Hub][cur-hub] [현재 체형 화면][cur-body-ui] |
| AIHUB-044 | 신발 | 신발 밑창/뒤꿈치 사진과 필요한 입력만으로 보행·신발 분석을 시작한다. | X | X | 현재 서버와 화면 모두 정면 전신 사진을 필수로 요구하고 신발 사진은 선택값이다. 신발 전용 입력 흐름이 아니다. [현재 체형 스키마][cur-body-schema] [현재 체형 화면][cur-body-ui] |
| AIHUB-045 | 신발 | 좌우·밑창 전체·마모·각도·조명 등 판독 가능성을 확인하고 불충분하면 결과 생성을 막는다. | X | X | 서버는 base64 길이만 검사하고 사진 내용·좌우·마모 판독성을 검증하지 않는다. 화면에도 촬영 품질 확인 단계가 없다. [현재 체형 스키마][cur-body-schema] [현재 체형 화면][cur-body-ui] |
| AIHUB-046 | 신발 | 사진 증거 범위의 마모·보행 특성을 설명하고 측정과 AI 추정을 구분한다. | X | X | 마모·보행 결과는 생성하지만 프롬프트와 UI가 이를 측정값처럼 표시하며 추정 근거·신뢰도 구분이 없다. [현재 체형 AI][cur-body-ai] [현재 체형 결과][cur-body-result] |
| AIHUB-047 | 신발 | 현재 사용자의 실제 운동 목적·최근 활동을 안전하게 반영하고 누락·조회 실패를 근거로 쓰지 않는다. | X | X | 서버 조회는 사용자별이지만 PT 수업·주 사용 목적·러닝 거리·선호·예산이 없고, 화면은 실제 반영 여부를 보여주지 않는다. [현재 운동 컨텍스트][cur-body-repo] [현재 체형 AI][cur-body-ai] |
| AIHUB-048 | 신발 | 기준 물체나 사용자 실측값으로 사이즈·발볼을 계산하고 사진만으로 확정할 수 없으면 측정을 안내한다. | X | X | 현재는 기준 길이 없이 AI가 `estimatedSize`, 발 길이·너비를 반드시 추정하고 UI가 `신발 사이즈 측정`으로 확정적으로 표시한다. [현재 체형 AI][cur-body-ai] [현재 체형 결과][cur-body-result] |
| AIHUB-049 | 신발 | 성별·연령대가 필요하면 사용자에게 받고 사진·사이즈로 민감 속성을 단정하지 않는다. | X | X | 프롬프트가 원본 결함 그대로 성별·연령 추정을 요구하고 화면도 성별 태그와 추정 근거를 표시한다. [현재 체형 AI][cur-body-ai] [현재 체형 결과][cur-body-result] |
| AIHUB-050 | 신발 | 실제 제품명·가격·사이즈·구매 가능성을 검증하고 추정 정보와 구매 정보를 구분한다. | X | X | 상품 카탈로그·가격·재고 검증이나 외부 구매 링크 없이 LLM 생성 텍스트만 표시한다. [현재 체형 AI][cur-body-ai] [현재 체형 결과][cur-body-result] |
| AIHUB-051 | 신발 | 마모·보행·발 정렬·신체 영향·교정과 `현재/교정 후 × 일상/운동` 추천을 구분해 표시하고 불완전 응답을 막는다. | O | O | 서버가 전체 중첩 구조와 범위를 Zod로 검증한다. 화면은 원본의 섹션 순서, 2단 탭, 사이즈·추천 카드 구조를 유지하고 선택 전환을 구현했다. [현재 체형 스키마][cur-body-schema] [현재 체형 결과][cur-body-result] |
| AIHUB-052 | 신발 | 보행 조언을 의료 진단으로 단정하지 않고 통증·이상 시 전문 평가 한계를 명확히 알린다. | X | X | 실제 사진 범위만 쓰라는 일반 문구는 있으나 보행/신발 전용 의료 한계·전문 평가 분기와 안내 UI가 없다. [현재 체형 AI][cur-body-ai] [현재 체형 결과][cur-body-result] |
| AIHUB-053 | 신발 | 사용자별 신발 결과를 저장하고 이력에서 마모·보행·사이즈·추천 전체를 다시 본다. | O | X | 서버는 전체 결과를 사용자별 `body` raw result로 저장한다. 상세에서 전체 결과를 다시 그리지만 원본 이력 정보 구조 대신 별도 기록 정보 카드와 메인 결과 컴포넌트를 그대로 넣은 재설계라 클라이언트는 X다. [현재 체형 서비스][cur-body-service] [원본 이력][src-history] [현재 이력 화면][cur-history-ui] |
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
| AICODE-001 | Hub 코드 대조 | 원본 Hub의 카드 구성은 정확히 6개이고 별도 `나의 몸매 & 스타일` 카드는 없다. | O | X | 현재 Hub는 원본 외 카드를 추가했다. 독립 기능이 원본 앱에 존재한다는 것과 원본 Hub 목록에 있었는지는 별개다. [원본 Hub][src-hub] [현재 Hub][cur-hub] |
| AICODE-002 | 체형 코드 대조 | 측면·후면·스쿼트 사진 결과는 종합 점수뿐 아니라 각 뷰의 세부 정렬·가동성·불균형을 원본 섹션대로 표시한다. | O | X | 서버는 side/back/squat 상세를 모두 검증하지만 현재 UI는 종합 등급과 `priorityCorrections`만 표시하고 각 뷰 상세를 버린다. [원본 체형 결과][src-body-ui] [현재 체형 스키마][cur-body-schema] [현재 체형 결과][cur-body-result] |
| AICODE-003 | 체형 코드 대조 | 의료 결과는 위험 부위·등급·예방 팁, 대체 운동, 재활 주의, 생활 조언, 진료 권고를 원본 카드 구조로 모두 표시한다. | O | X | 서버 계약은 전체 필드를 보존하지만 UI는 일부 텍스트만 축약하고 스스로 `미구현` 배지를 표시하며 근골격 위험·생활 조언·대체/주의 정보를 생략한다. [원본 체형 결과][src-body-ui] [현재 체형 결과][cur-body-result] |
| AICODE-004 | 체형 코드 대조 | 원본이 생성·표시하는 최신 연구 기반 기술·트렌드 운동·영양 팁을 제공한다. | X | X | 현재 프롬프트는 `최신 연구 소개 같은 부가 섹션은 넣지 말라`고 명시하고 스키마·UI에서도 제거했다. 원본 기능을 의도적으로 제외한 상태다. [원본 체형 결과][src-body-ui] [현재 체형 AI][cur-body-ai] |
| AICODE-005 | 비교 코드 대조 | 전·후 비교 결과의 점수, 원본 사진, 부위/자세/체성분 변화, 유지·개선, 다음 목표, 동기 문구를 원본 순서로 표시한다. | O | O | 별도 비교 서버가 전체 계약을 검증하고, 현재 비교 결과 컴포넌트가 원본 섹션과 상호작용을 대부분 그대로 이식했다. 단 동일 인물·촬영 조건 검증 부족은 AIHUB-014에서 별도 X다. [원본 체형 화면][src-body-ui] [현재 비교 UI][cur-comparison-ui] [현재 비교 서버][cur-comparison-server] |

## 핵심 결론

- 현재 실제로 끝까지 연결된 범위는 `AI Hub → 체형 분석`, 정면/추가 사진 분석 요청, 사용자별 저장, 전·후 비교의 핵심 결과, 그리고 체형 분석에 포함된 신발 결과의 렌더링이다.
- 체형 분석도 완료 판정은 아니다. 원본 결과 디자인, PT 컨텍스트, 촬영일, 현재 체성분, 다각도 상세, 의료 상세, 최신 연구, 저장 재시도, 이력 화면 원본 UX가 남아 있다.
- 아테나, 식단 분석, 영상 자세 분석, 통합 피트니스 분석은 카드 문구만 있고 백엔드와 실제 화면은 마이그레이션되지 않았다.
- 신발 추천은 작업 트리에 서버 계약과 결과 UI가 들어와 있지만 전용 진입, 신발만의 입력 흐름, 판독 검증, 실측, 민감 속성 처리, 상품 현재성, 의료 안전 경계가 없어 기능 전체로는 완료가 아니다.
- 현재 Hub의 `나의 몸매 & 스타일` 카드는 원본 앱의 독립 기능을 가져온 것이지만 원본 Hub 카드 목록에는 없던 추가 항목이므로, Hub UX 충실도 관점에서는 제거하거나 원본에서의 진입 위치를 다시 확인해야 한다.

## 확인 범위

- 원본 클라이언트: Hub, 체형/신발/영상 자세/전·후 비교, 이력, 아테나, 식단, 통합 분석, 활성 운동
- 원본 서버: AI 분석·채팅·식단 가이드·상태 벡터·기록 저장/비교 경로
- 현재 클라이언트: 생성 라우트 전체, Hub, 체형 입력/결과, 전·후 비교, 이력, 활성 운동
- 현재 서버: AppModule 전체 등록 모듈, body-analysis, body-comparison, analysis-records, workout-records
- QA 기준: AI Hub 추적 매트릭스의 `AIHUB-001`~`AIHUB-066`과 도메인별 QA 문서
- 검증: 클라이언트 타입체크 및 전체 테스트 25개 suite/73개 test 통과
- 검증: 서버 타입체크 및 body-analysis/body-comparison/analysis-records 테스트 9개 suite/31개 test 통과

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
[cur-save-banner]: ../../../../client/src/features/body-analysis/components/analysis-record-save-banner.tsx
[cur-comparison-ui]: ../../../../client/src/features/body-analysis/components/body-comparison-section.tsx
[cur-body-schema]: ../../../../server/src/modules/body-analysis/body-analysis.schemas.ts
[cur-body-ai]: ../../../../server/src/modules/body-analysis/openai-body-analysis.client.ts
[cur-body-service]: ../../../../server/src/modules/body-analysis/body-analysis.service.ts
[cur-body-repo]: ../../../../server/src/modules/body-analysis/body-analysis.repository.ts
[cur-comparison-server]: ../../../../server/src/modules/body-comparison/body-comparison.service.ts
[cur-history-ui]: ../../../../client/src/features/body-analysis/components/analysis-history-screen.tsx
[cur-history-server]: ../../../../server/src/modules/analysis-records/analysis-records.service.ts
[cur-history-schema]: ../../../../server/src/modules/analysis-records/analysis-records.schemas.ts
[cur-app-module]: ../../../../server/src/app.module.ts
