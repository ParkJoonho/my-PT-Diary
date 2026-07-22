# AT PT Server Docs

이 폴더는 `at-pt/server` 인수인계 문서 모음이다.

현재 서버는 `NestJS + PostgreSQL + Swagger` 기반으로 구성되어 있고, 첫 도메인으로 `weekly-tracker`가 구현되어 있다.

## 먼저 읽을 문서

- `folder-structure.md`: 현재 폴더 구조와 레이어 역할
- `user-identification.md`: Apps in Toss 사용자 식별 전략
- `swagger-and-local-dev.md`: 로컬 실행, Docker Compose, Swagger 확인 방법
- `weekly-tracker.md`: 현재 구현된 주간 트래커 API와 검증 범위

## 현재 상태

- 서버 프레임워크: `NestJS 11`
- DB: `PostgreSQL 18-alpine` via Docker Compose
- 문서화: `@nestjs/swagger`
- 요청 검증: Nest `ValidationPipe` + 도메인별 `zod`
- 현재 구현 도메인: `weekly-tracker`

## 현재 확인된 명령

```bash
docker compose up -d postgres
cd server
npm run lint
npm run typecheck
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run start:dev
```

## 현재 노출 엔드포인트

- `GET /`
- `GET /health`
- `GET /docs`
- `GET /docs-json`
- `GET /api/weekly-tracker`
- `GET /api/weekly-tracker/workouts`
- `POST /api/weekly-tracker/workouts`
- `DELETE /api/weekly-tracker/workouts/:workoutId`
