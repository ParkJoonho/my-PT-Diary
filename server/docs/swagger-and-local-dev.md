# Swagger And Local Dev

## 로컬 실행 순서

프로젝트 루트인 `at-pt`에서 먼저 Postgres를 띄운다.

```bash
docker compose up -d postgres
docker compose ps
```

현재 Compose 이미지는 `postgres:18-alpine`이다.

DB 연결값 기본 예시는 `server/.env.example`에 있다.

```env
PORT=3000
DATABASE_URL=postgresql://a2t:a2t@localhost:5432/at_pt
```

서버 실행:

```bash
cd server
npm run start:dev
```

## Swagger 경로

- UI: `http://127.0.0.1:3000/docs`
- JSON: `http://127.0.0.1:3000/docs-json`

Swagger 설정 파일:

- `src/main.ts`

## 현재 문서화 방식

- Swagger UI는 `@nestjs/swagger`로 생성
- 요청 검증은 `zod`를 쓰지만, 문서 타입은 DTO 클래스 기준으로 노출
- 따라서 요청 스키마를 바꾸면 `schemas.ts`와 `dto/*.ts`를 같이 봐야 한다

## 현재 확인된 검증 명령

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

## 현재 서버 기동 관련 메모

- DB가 켜져 있으면 `Database schema is ready.` 로그가 찍힌다
- DB가 아직 안 떠도 앱 자체는 부팅되도록 되어 있다
- 다만 DB-backed 엔드포인트는 연결 시점에 실패한다

## 다음 도메인 문서화 규칙

새 도메인을 추가할 때는 최소한 아래를 Swagger에 반영한다.

- 태그명
- 요청 헤더 요구사항
- 요청 본문 DTO
- 성공 응답 DTO
- 대표 에러 응답

그리고 `server/docs`에도 아래 중 하나를 추가한다.

- 기존 문서 갱신
- 도메인별 문서 신설
