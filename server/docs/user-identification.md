# User Identification

현재 서버는 `회원가입/로그인`을 아직 구현하지 않았다. 대신 Apps in Toss 미니앱 환경에서 제공하는 사용자 식별 키를 기준으로 데이터 소유권을 분리한다.

## 현재 기준

- 서버는 `Authorization` 헤더를 사용하지 않는다
- 서버는 `x-user-key` 헤더를 필수로 요구한다
- 이 값은 클라이언트가 Apps in Toss 브리지의 `getAnonymousKey()`로 받아서 보낸다는 전제다

## 왜 이렇게 했는가

현재 주간 트래커는 “계정별 데이터 분리”가 가장 중요하고, 개인 프로필/토큰/OAuth까지는 아직 범위 밖이었다.

그래서 첫 단계에서는 다음 목표만 만족하도록 설계했다.

- 사용자 A와 사용자 B의 기록이 섞이지 않을 것
- 로그인 시스템 없이도 인앱 사용자 단위 저장이 가능할 것
- 나중에 `appLogin()` 기반 인증을 붙여도 교체 가능할 것

## 현재 서버 동작

`UserKey` 데코레이터가 `x-user-key` 헤더를 읽고, 비어 있거나 없으면 `400`을 반환한다.

관련 파일:

- `src/common/decorators/user-key.decorator.ts`
- `src/modules/weekly-tracker/weekly-tracker.schemas.ts`

## 클라이언트 전제

Apps in Toss 쪽 공식 브리지로는 보통 아래 두 가지가 있다.

- `getAnonymousKey()`
- `appLogin()`

현재 주간 트래커는 `getAnonymousKey()`와 더 잘 맞는다. 이유는 “고유 사용자 분리”만 있으면 되기 때문이다.

## 나중에 로그인 체계로 확장할 때

향후 회원 프로필, 트레이너 연결, 개인화 AI, 식단 기록, 분석 이력처럼 계정 개념이 필요한 도메인을 붙일 때는 아래 둘 중 하나로 확장할 가능성이 높다.

### 옵션 1. `x-user-key` 유지 + 서버 내부 계정 매핑

- 미니앱 사용자 키를 기본 식별자로 유지
- 별도 `users` 테이블에서 앱 내부 계정과 연결
- 초기에 가장 덜 깨지는 방식

### 옵션 2. `appLogin()` 기반 인증으로 전환

- 토스 로그인 인가코드 기반 서버 인증 도입
- Access Token / Refresh Token 또는 서버 세션으로 확장
- 개인정보/회원 프로필이 필요할 때 적합

## 현재 주의사항

- `x-user-key`는 인증 토큰이 아니라 식별 키다
- 따라서 현재는 “사용자 분리”는 되지만 “사용자 신원 보장”까지는 아니다
- 민감 데이터 도메인에 바로 재사용하면 안 된다

## 다음 사람이 이어갈 때 권장 기준

- `weekly-tracker` 같은 저위험 개인 기록은 현재 방식 유지 가능
- `trainer`, `meal-records`, `analysis-records`, `payments` 같은 도메인은 로그인 체계 먼저 결정
