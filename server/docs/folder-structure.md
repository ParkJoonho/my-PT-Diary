# Folder Structure

현재 `server/src` 구조는 “도메인 모듈 + 공통 유틸 + DB 레이어” 기준으로 나뉜다.

```text
src
├── app.controller.ts
├── app.module.ts
├── main.ts
├── common
│   ├── decorators
│   │   └── user-key.decorator.ts
│   └── pipes
│       └── zod-validation.pipe.ts
├── config
│   └── env.schema.ts
├── database
│   ├── database.constants.ts
│   ├── database.module.ts
│   └── database.service.ts
└── modules
    └── weekly-tracker
        ├── dto
        ├── weekly-tracker.controller.ts
        ├── weekly-tracker.module.ts
        ├── weekly-tracker.repository.port.ts
        ├── weekly-tracker.repository.ts
        ├── weekly-tracker.schemas.ts
        ├── weekly-tracker.service.spec.ts
        └── weekly-tracker.service.ts
```

## 레이어 역할

### `main.ts`

- Nest 앱 부팅
- 전역 `ValidationPipe` 적용
- Swagger 문서 발행

### `common/`

- 도메인 공통 재사용 코드
- 현재는 `x-user-key` 추출 데코레이터와 `zod` 검증 파이프가 있다

### `config/`

- 환경변수 스키마와 런타임 검증
- 현재는 `PORT`, `DATABASE_URL` 검증만 있다

### `database/`

- Postgres 연결 관리
- 앱 시작 시 스키마 준비
- 현재는 `workout_completions` 테이블을 코드에서 보장한다

### `modules/weekly-tracker/`

- 첫 도메인 모듈
- `controller`: HTTP 입출력
- `schemas`: `zod` 요청 스키마
- `dto`: Swagger 응답/문서용 DTO
- `service`: 주간 계산 로직
- `repository`: SQL 접근
- `repository.port`: 테스트 가능한 추상 포트

## 현재 구조 원칙

- 새 기능은 `modules/<domain>` 아래에 추가한다
- 컨트롤러에서 SQL을 직접 다루지 않는다
- 요청 검증 규칙은 `zod` 스키마로 관리한다
- Swagger 문서 타입은 DTO로 유지한다
- 서비스 로직은 가능한 한 DB와 분리해 유닛 테스트 가능하게 유지한다

## 다음 도메인 추가 권장 방식

예: `exercise-guides`를 붙일 때

```text
modules
└── exercise-guides
    ├── dto
    ├── exercise-guides.controller.ts
    ├── exercise-guides.module.ts
    ├── exercise-guides.repository.port.ts
    ├── exercise-guides.repository.ts
    ├── exercise-guides.schemas.ts
    ├── exercise-guides.service.spec.ts
    └── exercise-guides.service.ts
```
