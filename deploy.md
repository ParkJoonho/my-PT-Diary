# ai-pt 서버 배포

이 배포 구성은 다음 컨테이너를 실행한다.

- `nginx`: 기본적으로 호스트 loopback의 TCP `18443`에서 요청을 받고 도메인에 따라 전달한다.
- `backend`: NestJS API이며 Docker 내부 `3000` 포트만 사용한다.
- `minio`: 공개 정적 에셋 저장소이며 Docker 내부 `9000` 포트만 사용한다.
- `minio-init`: 공개 bucket을 만들고 `infra/minio/seed`의 에셋을 동기화한다.
- `postgres`: 애플리케이션 DB이며 Docker 내부 `5432` 포트만 사용한다.

호스트에 게시되는 포트는 기본적으로 `127.0.0.1:18443` 하나뿐이다. PostgreSQL,
백엔드, MinIO API 및 MinIO 관리 콘솔 포트는 호스트에 게시하지 않는다.

## 환경변수 공급 방식

[`docker-compose.deploy.yml`](docker-compose.deploy.yml)은 특정 환경파일을 직접
읽지 않는다. Compose 실행 프로세스에 전달된 환경변수만 사용한다.

배포 진입점에 따라 환경변수 공급 방식만 다음과 같이 나뉜다.

| 배포 방식           | 환경변수 공급                                        | 실행 명령                             |
| ------------------- | ---------------------------------------------------- | ------------------------------------- |
| 서버에서 수동 배포  | 로컬 `.env`, `server/.env`                           | Makefile                              |
| GitHub Actions 배포 | GitHub `production` Environment의 Variables, Secrets | 워크플로에서 Docker Compose 직접 실행 |

두 방식은 동일한 Compose 파일과 동일한 `ai-pt-deploy` 프로젝트 이름을 사용한다.
따라서 같은 서버에서 어느 방식으로 배포해도 기존 컨테이너와 named volume을
이어받는다.

## 공통 사전 준비

배포 서버에 다음 프로그램이 필요하다.

- Docker Engine
- Docker Compose 플러그인
- `curl`

수동 배포에는 GNU Make도 필요하다. GitHub Actions 배포에는 등록되고 실행 중인
Linux 셀프호스티드 러너가 필요하다.

## Makefile을 사용한 수동 배포

### 로컬 환경파일 준비

저장소 루트에서 환경 파일을 준비한다.

```bash
test -f .env || cp .env.example .env
test -f server/.env || cp server/.env.example server/.env
```

이미 파일이 있다면 덮어쓰지 말고 필요한 값만 반영한다.

루트 `.env`에서 다음 값을 설정한다.

| 변수                        | 설명                                               |
| --------------------------- | -------------------------------------------------- |
| `AI_PT_BIND_ADDRESS`        | Nginx 게시 주소. 기본값은 `127.0.0.1`              |
| `AI_PT_PUBLIC_PORT`         | ai-pt Nginx를 게시할 호스트 포트. 기본값은 `18443` |
| `AI_PT_POSTGRES_DB`         | PostgreSQL 데이터베이스 이름                       |
| `AI_PT_POSTGRES_USER`       | PostgreSQL 사용자                                  |
| `AI_PT_POSTGRES_PASSWORD`   | URL에 사용할 수 있는 문자로 구성한 강한 비밀번호   |
| `AI_PT_MINIO_ROOT_USER`     | MinIO 관리자 사용자                                |
| `AI_PT_MINIO_ROOT_PASSWORD` | MinIO 관리자 비밀번호                              |
| `AI_PT_MINIO_PUBLIC_BUCKET` | 공개 정적 에셋 bucket. 기본값은 `pt-diary-assets`  |

`server/.env`에서는 다음 애플리케이션 값을 설정한다.

| 변수                              | 설명                                           |
| --------------------------------- | ---------------------------------------------- |
| `AI_INTEGRATIONS_OPENAI_API_KEY`  | OpenAI API 키                                  |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI 호환 API 기본 주소                      |
| `SERVICE_ROLE_KEY`                | 관리자 API 호출에 사용할 충분히 긴 임의 문자열 |

`server/.env`의 `PORT`와 `DATABASE_URL`은 운영 컨테이너에서 안전한 내부 값으로
덮어쓰므로 로컬 개발 값을 유지해도 된다.

Makefile은 두 파일을 다음 순서로 Compose에 전달한다.

```text
--env-file .env --env-file server/.env
```

Compose 파일에는 `env_file` 서비스 설정이 없으므로 이 로컬 파일 경로가
컨테이너 구성에 고정되지 않는다.

### 18443 포트 연결

같은 서버의 Nginx나 Caddy가 TLS를 종료한다면 `AI_PT_BIND_ADDRESS=127.0.0.1`을
유지한다. 이 경우 TCP `18443`은 서버 외부에 공개되지 않고 로컬 프록시만 접근한다.

별도 서버의 프록시나 CDN이 TCP `18443`으로 직접 접근해야 한다면
`AI_PT_BIND_ADDRESS=0.0.0.0` 또는 전용 사설 인터페이스 주소를 설정하고, 실제 호출
주체의 주소만 허용하도록 Docker의 `DOCKER-USER` 체인을 포함한 방화벽 정책을
구성한다. Docker가 게시한 포트는 UFW 규칙을 우회할 수 있으므로 UFW 설정만으로
외부 접근이 차단된다고 가정하지 않는다.

ai-pt Nginx는 `18443`에서 HTTP 요청을 받고 요청의 `Host` 헤더로 목적지를 구분한다.

| 요청 Host              | 내부 목적지    |
| ---------------------- | -------------- |
| `api.a2t.jongchoi.com` | `backend:3000` |
| `s3.a2t.jongchoi.com`  | `minio:9000`   |

도메인 요청을 이 서버의 `18443` 포트로 전달할 때 원래 `Host` 헤더를 반드시
유지해야 한다. `Host`가 IP 주소이거나 다른 값이면 Nginx는 요청을 거부한다.
TLS 인증서 적용과 HTTPS 종료 위치는 서버를 운영하는 환경에 맞게 결정하되,
클라이언트가 사용하는 최종 주소는 다음과 같이 포트 번호가 없는 HTTPS 주소다.

```text
https://api.a2t.jongchoi.com
https://s3.a2t.jongchoi.com
```

Nginx의 도메인 분기 설정은
[`infra/nginx/default.conf`](infra/nginx/default.conf)에 있다.

### 수동 배포

환경 파일과 Compose 문법을 먼저 검증한다.

```bash
make validate
```

전체 서비스를 빌드하고 실행한다.

```bash
make deploy
```

컨테이너 상태와 일회성 MinIO 초기화 작업의 종료 상태를 확인한다.

```bash
make status
```

`minio-init`이 종료 코드 `0`으로 끝나는 것은 정상이다. PostgreSQL, MinIO,
백엔드와 Nginx는 실행 중이면서 `healthy` 상태여야 한다.

서버 내부에서 `18443` 포트와 Host 기반 분기를 함께 확인한다.

```bash
make health
```

직접 확인하려면 다음 명령을 사용한다.

```bash
curl --fail --header 'Host: api.a2t.jongchoi.com' \
  http://127.0.0.1:18443/health

curl --fail --output /dev/null \
  --header 'Host: s3.a2t.jongchoi.com' \
  http://127.0.0.1:18443/pt-diary-assets/v1/muscles/chest.png
```

### 운영 명령

```bash
# 전체 로그
make logs

# 특정 서비스 로그
make logs SERVICE=backend
make logs SERVICE=nginx

# 서비스 재시작
make restart

# 정적 에셋 seed 재적용
make seed

# 컨테이너 중지
make stop

# 컨테이너와 네트워크 제거, 데이터 volume 보존
make down
```

`make deploy`는 정적 에셋 seed도 다시 적용한다. 전체 서비스를 재배포하지 않고
seed만 다시 적용할 때 `make seed`를 사용한다.

`make down`은 PostgreSQL과 MinIO의 named volume을 제거하지 않는다. 데이터를
삭제하려면 별도 백업과 복구 계획을 세운 뒤 해당 volume을 명시적으로 관리한다.

## GitHub Actions를 사용한 배포

워크플로는
[`deploy-production.yml`](.github/workflows/deploy-production.yml)에 있다.
자동 배포는 하지 않으며 GitHub Actions 화면에서 수동으로 실행한 브랜치 또는
태그만 배포한다. 워크플로가 GitHub Actions 화면에 나타나려면 이 파일이 기본
브랜치에 먼저 반영되어 있어야 한다.

GitHub Actions 배포는 Makefile과 서버의 로컬 환경파일을 사용하지 않는다.
`production` Environment의 Variables와 Secrets를 Job 환경변수로 주입한 뒤
다음 형태로 Compose를 직접 실행한다.

```bash
docker compose \
  --env-file /dev/null \
  --project-name ai-pt-deploy \
  --file docker-compose.deploy.yml \
  up -d --build --remove-orphans
```

`--env-file /dev/null`은 셀프호스티드 러너 작업 디렉터리에 남은 `.env`를 우연히
읽지 않게 한다. 필요한 값은 GitHub가 주입한 프로세스 환경변수에서만 가져온다.

### 셀프호스티드 러너

워크플로의 기본 러너 라벨은 다음과 같다.

```yaml
runs-on: [self-hosted, linux, x64, ai-pt-prod]
```

러너에는 Docker, Docker Compose와 `curl`이 설치되어 있어야 하며 러너 서비스
사용자가 Docker를 실행할 권한이 있어야 한다. 다른 서버나 CPU 아키텍처를
사용한다면 워크플로의 커스텀 라벨과 `x64` 라벨을 실제 러너 라벨에 맞게
변경한다.

워크플로는 `actions/checkout@v6`을 사용한다. 따라서 셀프호스티드 Actions Runner는
`v2.329.0` 이상이어야 한다.

### production Environment

GitHub 저장소의 `Settings → Environments`에서 `production` Environment를 만든다.
운영 배포를 `main`으로 제한하거나 실행 전 승인이 필요하다면 이 Environment에
Deployment branches와 Required reviewers를 설정한다.

`production`의 Variables에는 다음 값을 등록한다. Variables는 로그에서 자동으로
가려지지 않으므로 비밀값을 넣지 않는다.

| Variable                          | 예시 또는 설명              |
| --------------------------------- | --------------------------- |
| `AI_PT_BIND_ADDRESS`              | `127.0.0.1`                 |
| `AI_PT_PUBLIC_PORT`               | `18443`                     |
| `AI_PT_POSTGRES_DB`               | `at_pt`                     |
| `AI_PT_POSTGRES_USER`             | `a2t`                       |
| `AI_PT_MINIO_ROOT_USER`           | MinIO 관리자 사용자         |
| `AI_PT_MINIO_PUBLIC_BUCKET`       | `pt-diary-assets`           |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | `https://api.openai.com/v1` |

`production`의 Secrets에는 다음 값을 등록한다.

| Secret                           | 설명                                                |
| -------------------------------- | --------------------------------------------------- |
| `AI_PT_POSTGRES_PASSWORD`        | URL에 사용할 수 있는 문자로 구성한 강한 DB 비밀번호 |
| `AI_PT_MINIO_ROOT_PASSWORD`      | 강한 MinIO 관리자 비밀번호                          |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI API 키                                       |
| `SERVICE_ROLE_KEY`               | 관리자 API 호출에 사용할 충분히 긴 임의 문자열      |

워크플로는 값의 존재 여부와 placeholder 여부를 검사하지만 값을 로그로 출력하지
않는다. Compose 구성 검사도 `config --quiet`으로 실행해 컨테이너 환경변수를
노출하지 않는다.

### 워크플로 실행

1. GitHub 저장소의 `Actions` 탭으로 이동한다.
2. `ai-pt production deploy` 워크플로를 선택한다.
3. `Run workflow`에서 배포할 브랜치 또는 태그를 선택한다.
4. 실행 후 `production` Job의 환경변수 검증, Compose 검증, 컨테이너 배포와
   상태 확인이 모두 성공했는지 확인한다.

같은 서버에서 배포가 겹치지 않도록 `ai-pt-production` concurrency 그룹을
사용하며, 실행 중인 배포를 새 배포가 강제로 취소하지 않는다.

배포 단계는 정적 에셋 seed를 다시 적용하고 Nginx를 재시작한다. 마지막 상태
확인에서는 최대 60초 동안 API를 기다린 뒤 API와 공개 정적 에셋을 모두 검사한다.

## 클라이언트 빌드 주소

클라이언트는 서버 배포와 별도로 다음 값을 사용해 빌드한다.

```dotenv
API_BASE_URL=https://api.a2t.jongchoi.com
ASSET_BASE_URL=https://s3.a2t.jongchoi.com/pt-diary-assets/v1
```
