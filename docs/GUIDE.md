# 개발자 가이드
앱을 실행하는 방법에 대한 가이드

## 목차

- [클라이언트 개발 실행법](#클라이언트-개발-실행법)
- [서버 실행 방법](#서버-실행-방법)
- [서버 배포 방법](#서버-배포-방법)
  - [Linux 서버에서 Makefile로 배포](#linux-서버에서-makefile로-배포)
  - [GitHub Actions로 배포](#github-actions로-배포)
    - [Linux 셀프 호스티드 러너 준비](#1-linux-셀프-호스티드-러너-준비)
    - [production Environment 설정](#2-production-environment-설정)
    - [워크플로 실행](#3-워크플로-실행)
- [클라이언트 배포](#클라이언트-배포)
  - [콘솔에서 직접 업로드](#콘솔에서-직접-업로드)
  - [CLI로 업로드](#cli로-업로드)

## 클라이언트 개발 실행법

1. [앱인토스 테스트앱(샌드박스) 공식 가이드](https://developers-apps-in-toss.toss.im/development/test/sandbox)에서 준비 과정과 최신 설치 파일을 확인합니다.

2. 샌드박스 앱을 설치합니다.
   - 모바일 실기기: 공식 가이드에서 운영체제에 맞는 샌드박스 앱을 내려받아 설치합니다.
   - iOS 시뮬레이터: Xcode의 **Open Developer Tool → Simulator**를 열고, 공식 가이드에서 받은 파일의 압축을 풉니다. `AppsInTossSandbox.app`을 실행 중인 시뮬레이터 화면에 드래그해 설치한 뒤 앱을 엽니다.

3. 프로젝트를 처음 실행한다면 서버와 클라이언트 의존성을 설치합니다.

   ```bash
   cd server
   npm install
   cd ../client
   npm install
   cd ..
   ```

4. 프로젝트 루트에서 Docker Compose로 개발용 PostgreSQL, MinIO와 MinIO 초기화 작업을 실행합니다.

   ```bash
   docker compose up -d postgres minio minio-init
   docker compose ps --all
   ```

   - PostgreSQL은 `127.0.0.1:5437`, MinIO API는 `127.0.0.1:9000`, MinIO 관리 콘솔은 `127.0.0.1:9001`에서 열립니다.
   - `docker compose ps --all`에서 `postgres`와 `minio`가 `healthy`인지 확인합니다. 에셋 업로드를 마친 `minio-init`이 종료 코드 `0`으로 끝난 것은 정상입니다.
   - MinIO의 seed 파일을 변경한 경우 `docker compose run --rm minio-init`을 다시 실행합니다.

5. `server/.env`가 없다면 `server/.env.example`을 복사하고, 로컬 PostgreSQL 주소를 설정합니다.

   ```bash
   test -f server/.env || cp server/.env.example server/.env
   ```

   ```dotenv
   DATABASE_URL=postgresql://a2t:a2t@127.0.0.1:5437/at_pt
   ```

6. `client/.env`가 없다면 `client/.env.example`을 복사하고 실행 환경에 맞는 주소를 설정합니다.

   ```bash
   test -f client/.env || cp client/.env.example client/.env
   ```

   iOS 시뮬레이터에서는 개발 서버를 실행 중인 컴퓨터의 서버와 MinIO에 `127.0.0.1`로 접근합니다.

   ```dotenv
   API_BASE_URL=http://127.0.0.1:3000
   ASSET_BASE_URL=http://127.0.0.1:9000/pt-diary-assets/v1
   OPENAPI_SCHEMA_URL=http://127.0.0.1:3000/docs-json
   ```

   모바일 실기기와 개발 서버를 실행 중인 컴퓨터를 같은 Wi-Fi에 연결합니다. `API_BASE_URL`과 `ASSET_BASE_URL`의 `127.0.0.1`은 해당 컴퓨터의 LAN IP로 바꾸고, Orval은 그 컴퓨터에서 실행하므로 `OPENAPI_SCHEMA_URL`은 `127.0.0.1`을 유지합니다.

   예를 들어 개발 서버를 실행 중인 컴퓨터의 LAN IP가 `192.168.21.38`이라면 다음과 같이 설정합니다.

   ```dotenv
   API_BASE_URL=http://192.168.21.38:3000
   ASSET_BASE_URL=http://192.168.21.38:9000/pt-diary-assets/v1
   OPENAPI_SCHEMA_URL=http://127.0.0.1:3000/docs-json
   ```

   개발 서버를 실행 중인 컴퓨터의 LAN IP는 다음 명령으로 확인합니다.

   - macOS: 터미널에서 `ipconfig getifaddr en0`을 실행합니다.
   - Windows: 명령 프롬프트 또는 PowerShell에서 `ipconfig`를 실행하고, **무선 LAN 어댑터 Wi-Fi**의 **IPv4 주소**를 확인합니다.

   모바일 실기기에서 Granite 개발 서버에 연결하려면 운영체제별 설정도 필요합니다.

   - iOS 실기기: 샌드박스 앱의 **로컬 네트워크** 권한을 허용하고, 서버 주소 입력 화면에 개발 서버를 실행 중인 컴퓨터의 LAN IP를 저장합니다.
   - Android 에뮬레이터·실기기: USB 디버깅을 켜고 컴퓨터에 연결한 뒤 `adb reverse tcp:8081 tcp:8081`과 `adb reverse tcp:5173 tcp:5173`을 실행합니다.

7. 터미널 1에서 서버를 실행하고 OpenAPI 문서가 제공되는지 확인합니다.

   ```bash
   cd server
   npm run start:dev
   ```

   서버가 `3000` 포트에서 실행되면 브라우저에서 `http://127.0.0.1:3000/docs-json`을 엽니다.

8. 터미널 2에서 실행 중인 서버의 최신 스펙을 기준으로 Orval API 코드를 생성합니다.

   ```bash
   cd client
   npm run api:generate
   ```

9. Orval 생성이 끝나면 같은 터미널에서 Granite 개발 서버를 실행합니다.

   ```bash
   npm run dev
   ```

   Granite 개발 서버가 `8081` 포트에서 대기하면 샌드박스 앱을 엽니다. PC 브라우저에서 `8081`에 접속했을 때 `Not Found`가 표시되는 것은 정상입니다.

10. 샌드박스 앱에서 앱인토스 콘솔에 사용하는 **개인 계정**으로 개발자 로그인합니다.

11. 소속 워크스페이스의 앱 목록에서 `a2t-ptdiary`를 선택하고, 콘솔에 등록한 토스 계정으로 본인 인증을 진행합니다. 해당 계정의 토스 앱으로 전달된 요청을 승인해야 인증이 완료됩니다.

12. 샌드박스의 스킴 입력란에 `intoss://a2t-ptdiary`를 입력하고 **스키마 열기**를 눌러 앱을 실행합니다.

## 서버 실행 방법

로컬 서버는 PostgreSQL에 데이터를 저장합니다. MinIO는 서버가 직접 사용하는 저장소가 아니라 클라이언트가 이미지·아이콘 등의 공개 정적 에셋을 읽기 위한 로컬 저장소입니다.

1. Docker Desktop을 실행하고 프로젝트 루트로 이동합니다.

   ```bash
   cd <저장소를-내려받은-경로>/ai-pt
   ```

2. 프로젝트 루트의 `.env`는 Docker Compose가 MinIO 관리자 계정과 공개 버킷 이름을 설정할 때 사용합니다. 로컬 Compose에는 기본값이 있으므로 생략할 수 있으며, 직접 설정하려면 다음 값을 작성합니다.

   ```dotenv
   MINIO_ROOT_USER=a2t-minio
   MINIO_ROOT_PASSWORD=a2t-minio-local-secret
   MINIO_PUBLIC_BUCKET=pt-diary-assets
   ```

   MinIO 관리자 계정은 `client/.env`나 앱 번들에 넣지 않습니다. 운영 환경에서는 반드시 별도의 안전한 값으로 교체합니다.

3. PostgreSQL, MinIO와 MinIO 초기화 서비스를 실행합니다.

   ```bash
   docker compose up -d postgres minio minio-init
   docker compose ps --all
   ```

   - PostgreSQL: `127.0.0.1:5437`
   - MinIO API: `http://127.0.0.1:9000`
   - MinIO 관리 콘솔: `http://127.0.0.1:9001`
   - 공개 에셋 기준 주소: `http://127.0.0.1:9000/pt-diary-assets/v1`
   - `postgres`와 `minio`가 `healthy`이면 정상입니다. 에셋과 공개 읽기 정책을 등록한 `minio-init`은 작업 완료 후 종료됩니다.

4. PostgreSQL과 MinIO의 상태를 직접 확인할 수 있습니다.

   ```bash
   docker compose exec postgres pg_isready -U a2t -d at_pt
   curl -f http://127.0.0.1:9000/minio/health/live
   curl -I http://127.0.0.1:9000/pt-diary-assets/v1/images/icon.png
   ```

   MinIO의 seed 파일을 수정했다면 다음 명령으로 버킷 정책과 에셋 업로드를 다시 적용합니다.

   ```bash
   docker compose run --rm minio-init
   ```

5. `server/.env`가 없다면 예시 파일을 복사합니다.

   ```bash
   test -f server/.env || cp server/.env.example server/.env
   ```

   로컬 개발용 `server/.env`는 다음 형식으로 작성합니다.

   ```dotenv
   PORT=3000
   DATABASE_URL=postgresql://a2t:a2t@127.0.0.1:5437/at_pt
   AI_INTEGRATIONS_OPENAI_API_KEY=
   AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
   SERVICE_ROLE_KEY=로컬에서-사용할-임의의-안전한-키
   ```

   - `PORT`는 Nest 서버가 사용할 포트입니다.
   - `DATABASE_URL`은 Docker Compose로 실행한 로컬 PostgreSQL의 접속 주소입니다.
   - `AI_INTEGRATIONS_OPENAI_API_KEY`가 비어 있으면 일반 API는 실행되지만 신체·식단 분석 등 AI 기능은 비활성화됩니다.
   - `AI_INTEGRATIONS_OPENAI_BASE_URL`은 OpenAI 호환 API의 기본 주소입니다.
   - `SERVICE_ROLE_KEY`가 없으면 관리자용 운동 가이드 API가 차단됩니다.
   - 실제 API 키와 서비스 역할 키는 Git에 커밋하지 않습니다.

6. 서버를 처음 실행한다면 의존성을 설치합니다.

   ```bash
   cd server
   npm install
   ```

7. 개발 서버를 watch 모드로 실행합니다.

   ```bash
   npm run start:dev
   ```

   로그에 `Database schema is ready.`가 출력되면 데이터베이스 연결과 스키마 준비가 완료된 것입니다.

8. 서버가 정상적으로 실행되었는지 확인합니다.

   - Swagger UI: `http://127.0.0.1:3000/docs`
   - OpenAPI JSON: `http://127.0.0.1:3000/docs-json`
   - 현재 `server` 디렉터리에 있다면 클라이언트 Orval 생성: `cd ../client && npm run api:generate`

9. 서버를 종료할 때는 실행 중인 터미널에서 `Ctrl+C`를 누릅니다. PostgreSQL과 MinIO까지 종료하려면 프로젝트 루트에서 다음 명령을 실행합니다.

   ```bash
   docker compose down
   ```

   `docker compose down`은 로컬 데이터를 담은 named volume을 보존합니다. `docker compose down -v`는 PostgreSQL과 MinIO 데이터를 삭제하므로 데이터를 초기화하려는 경우에만 사용합니다.

## 서버 배포 방법

서버 배포 구성과 운영 명령의 상세 기준은 [서버 배포 문서](../deploy.md)를 확인합니다. 실제 배포에는 [배포용 Docker Compose](../docker-compose.deploy.yml), [Makefile](../Makefile), [GitHub Actions 워크플로](../.github/workflows/deploy-production.yml)를 사용합니다.

배포용 Compose는 다음 컨테이너를 하나의 `ai-pt-deploy` 프로젝트로 실행합니다.

- `nginx`: 기본적으로 호스트의 `127.0.0.1:18443`에서 요청을 받고 `Host`에 따라 API와 MinIO로 전달합니다.
- `backend`: Docker 내부 `3000` 포트에서 실행되는 NestJS API입니다.
- `postgres`: Docker 내부 `5432` 포트만 사용하는 운영 데이터베이스입니다.
- `minio`: Docker 내부 `9000` 포트만 사용하는 공개 에셋 저장소입니다.
- `minio-init`: 공개 버킷 생성, 읽기 정책 적용, seed 에셋 업로드를 담당하는 일회성 작업입니다.

PostgreSQL, backend, MinIO API와 MinIO 관리 콘솔은 호스트에 직접 공개되지 않습니다. 외부에는 TLS가 적용된 `https://api.example.com`, `https://minio.example.com`만 노출하고 다음 흐름으로 전달합니다.

```text
사용자 → HTTPS 프록시/CDN:443 → 배포 서버 127.0.0.1:18443 → 컨테이너 Nginx
                                            ├─ api.example.com   → backend:3000
                                            └─ minio.example.com → minio:9000
```

### Linux 서버에서 Makefile로 배포

1. 배포 서버에 Git, GNU Make, curl, Docker Engine과 Docker Compose 플러그인을 설치합니다.

   - [Docker Engine Linux 설치 공식 문서](https://docs.docker.com/engine/install/)
   - [Ubuntu용 Docker Engine 설치 공식 문서](https://docs.docker.com/engine/install/ubuntu/)
   - [Docker Linux 설치 후 설정 공식 문서](https://docs.docker.com/engine/install/linux-postinstall)

   Ubuntu에서는 Git, Make와 curl을 다음과 같이 설치하고 Docker는 위 공식 문서의 저장소 설치 절차를 따릅니다.

   ```bash
   sudo apt update
   sudo apt install -y git make curl
   docker version
   docker compose version
   make --version
   curl --version
   ```

2. 배포 전용 Linux 사용자로 저장소를 내려받고 프로젝트 루트로 이동합니다.

   ```bash
   git clone <저장소-URL> ai-pt
   cd ai-pt
   ```

3. DNS에서 `api.example.com`과 `minio.example.com`의 A 또는 AAAA 레코드가 HTTPS 프록시/CDN을 가리키도록 설정합니다.

   - HTTPS 프록시/CDN은 유효한 TLS 인증서를 제공해야 합니다.
   - 같은 서버에서 TLS를 종료하는 프록시는 두 도메인의 요청을 `127.0.0.1:18443`으로 전달합니다.
   - 내부 Nginx가 도메인으로 목적지를 구분하므로 원래 `Host` 헤더를 반드시 유지해야 합니다.
   - 별도 서버의 프록시나 CDN이 `18443`에 직접 접근해야 한다면 `AI_PT_BIND_ADDRESS`를 전용 사설 주소 또는 `0.0.0.0`으로 바꾸고, Docker의 `DOCKER-USER` 체인에서 실제 호출 주체만 허용합니다.

   같은 서버의 외부 Nginx에서 TLS를 종료하는 경우의 개념적인 예시는 다음과 같습니다. 인증서 경로는 실제 발급 위치로 변경합니다.

   ```nginx
   server {
     listen 443 ssl;
     server_name api.example.com;
     ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

     location / {
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto https;
       proxy_pass http://127.0.0.1:18443;
     }
   }

   server {
     listen 443 ssl;
     server_name minio.example.com;
     ssl_certificate /etc/letsencrypt/live/minio.example.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/minio.example.com/privkey.pem;

     location / {
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto https;
       proxy_pass http://127.0.0.1:18443;
     }
   }
   ```

4. 예시 도메인을 실제로 사용하려면 내부 Host 분기와 헬스체크에 사용되는 도메인도 함께 변경합니다.

   - [Nginx 설정](../infra/nginx/default.conf)의 API `server_name`을 `api.example.com`으로 변경합니다.
   - 같은 파일의 MinIO `server_name`을 `minio.example.com`으로 변경합니다.
   - [Makefile](../Makefile)의 `make health`가 보내는 두 `Host` 헤더를 같은 도메인으로 변경합니다.
   - [GitHub Actions 워크플로](../.github/workflows/deploy-production.yml)의 배포 상태 확인용 두 `Host` 헤더도 같은 도메인으로 변경합니다.

   현재 배포 구성에서 도메인은 환경변수가 아니라 위 세 파일에 명시되어 있습니다. 실제 도메인을 이미 사용 중이라면 예시 도메인으로 변경하지 말고 기존 값을 유지합니다.

5. 프로젝트 루트에 운영 인프라용 `.env`를 작성합니다.

   ```bash
   test -f .env || cp .env.example .env
   ```

   ```dotenv
   AI_PT_BIND_ADDRESS=127.0.0.1
   AI_PT_PUBLIC_PORT=18443
   AI_PT_POSTGRES_DB=at_pt
   AI_PT_POSTGRES_USER=a2t
   AI_PT_POSTGRES_PASSWORD=<URL에-안전한-강한-DB-비밀번호>
   AI_PT_MINIO_ROOT_USER=<MinIO-관리자-사용자>
   AI_PT_MINIO_ROOT_PASSWORD=<강한-MinIO-관리자-비밀번호>
   AI_PT_MINIO_PUBLIC_BUCKET=pt-diary-assets
   ```

   `AI_PT_POSTGRES_PASSWORD`는 `DATABASE_URL`에 그대로 들어가므로 URL 구문을 깨뜨리지 않는 문자로 구성합니다. MinIO 관리자 계정은 클라이언트 환경변수나 앱 번들에 절대 넣지 않습니다.

6. `server/.env`에 서버 애플리케이션용 운영 값을 작성합니다.

   ```bash
   test -f server/.env || cp server/.env.example server/.env
   ```

   ```dotenv
   PORT=3000
   DATABASE_URL=postgresql://a2t:a2t@localhost:5437/at_pt
   AI_INTEGRATIONS_OPENAI_API_KEY=<운영-OpenAI-API-키>
   AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
   SERVICE_ROLE_KEY=<충분히-긴-운영-서비스-역할-키>
   ```

   운영 컨테이너의 `PORT`와 `DATABASE_URL`은 Compose가 Docker 내부 주소로 덮어쓰므로 예시 파일의 로컬 값을 유지해도 됩니다. Makefile 배포에는 `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`, `SERVICE_ROLE_KEY`가 사용됩니다.

   ```bash
   chmod 600 .env server/.env
   ```

7. 환경변수와 Compose 문법을 검증합니다. `replace-with-*` 또는 빈 필수 값이 남아 있으면 검증이 실패합니다.

   ```bash
   make validate
   ```

8. backend 이미지를 빌드하고 PostgreSQL, MinIO, backend, Nginx를 실행합니다.

   ```bash
   make deploy
   ```

   `make deploy`는 다음 작업을 수행합니다.

   - `docker-compose.deploy.yml`로 컨테이너 빌드 및 실행
   - 기존 `ai-pt-deploy` 컨테이너와 named volume 재사용
   - `minio-init`을 다시 실행해 버킷 정책과 seed 에셋 적용
   - Nginx 재시작

9. 컨테이너 상태와 내부 라우팅을 확인합니다.

   ```bash
   make status
   make health
   ```

   `postgres`, `minio`, `backend`, `nginx`는 실행 중이며 `healthy`여야 합니다. `minio-init`이 종료 코드 `0`으로 끝난 것은 정상입니다.

10. 외부 HTTPS 주소에서도 API와 공개 에셋을 확인합니다.

   ```bash
   curl --fail https://api.example.com/health
   curl --fail --output /dev/null \
     https://minio.example.com/pt-diary-assets/v1/images/icon.png
   ```

11. 배포된 주소를 사용하는 클라이언트 `client/.env`는 다음과 같이 설정합니다.

   ```dotenv
   API_BASE_URL=https://api.example.com
   ASSET_BASE_URL=https://minio.example.com/pt-diary-assets/v1
   OPENAPI_SCHEMA_URL=https://api.example.com/docs-json
   ```

12. 운영 중에는 다음 Make 명령을 사용합니다.

   ```bash
   make logs                    # 전체 로그
   make logs SERVICE=backend    # backend 로그
   make logs SERVICE=nginx      # Nginx 로그
   make restart                 # 전체 서비스 재시작
   make seed                    # MinIO 정책과 seed 에셋 재적용
   make stop                    # 컨테이너 중지
   make down                    # 컨테이너와 네트워크 제거, 데이터 volume 보존
   ```

   `make down`은 PostgreSQL과 MinIO named volume을 보존합니다. 운영 데이터 삭제가 필요한 경우에도 먼저 백업·복구 계획을 마련하고 volume을 별도로 관리합니다.

### GitHub Actions로 배포

이 저장소의 [배포 워크플로](../.github/workflows/deploy-production.yml)는 GitHub 호스팅 러너가 아니라 실제 배포 서버에 설치한 Linux 셀프 호스티드 러너에서 실행됩니다. `workflow_dispatch`만 사용하므로 코드가 push될 때 자동 배포되지 않고, Actions 화면에서 선택한 브랜치나 태그를 수동 배포합니다.

#### 1. Linux 셀프 호스티드 러너 준비

셀프 호스티드 러너를 설정하기 전에 다음 GitHub 공식 문서를 확인합니다.

- [셀프 호스티드 러너 추가](https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/add-runners)
- [Linux 러너를 systemd 서비스로 실행](https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/configure-the-application?platform=linux)
- [셀프 호스티드 러너 요구사항과 보안 참고](https://docs.github.com/en/actions/reference/runners/self-hosted-runners)
- [워크플로에서 셀프 호스티드 러너 사용](https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/use-in-a-workflow)

GitHub은 공개 저장소의 Pull Request가 셀프 호스티드 러너에서 위험한 코드를 실행할 수 있으므로 셀프 호스티드 러너를 **비공개 저장소에서만 사용하는 것을 권장**합니다. 이 러너는 운영 Docker에 접근하므로 일반 CI 러너와 분리하고 배포 전용으로 사용합니다.

1. Linux 배포 서버에 Docker Engine, Docker Compose 플러그인과 curl을 설치합니다.
2. GitHub 저장소의 **Settings → Actions → Runners → New self-hosted runner**로 이동합니다.
3. **Linux**, 서버와 일치하는 아키텍처를 선택하고 GitHub 화면에 표시되는 다운로드·압축 해제 명령을 그대로 실행합니다. 등록 토큰은 한 시간 후 만료되므로 문서에 복사해 보관하지 않습니다.
4. GitHub가 안내하는 `config.sh` 실행 시 배포 전용 커스텀 라벨 `ai-pt-prod`를 추가합니다.

   ```bash
   ./config.sh \
     --url https://github.com/<소유자>/<저장소> \
     --token <GitHub가-발급한-일회성-등록-토큰> \
     --labels ai-pt-prod
   ```

5. 러너 서비스 사용자가 암호 입력 없이 Docker를 실행할 수 있게 설정합니다.

   ```bash
   sudo usermod -aG docker <러너-서비스-사용자>
   ```

   그룹 변경 후 로그아웃·로그인하거나 서버를 재시작한 뒤 해당 사용자로 `docker version`과 `docker compose version`을 확인합니다. Docker의 `docker` 그룹은 사실상 root 수준 권한을 부여하므로 러너 계정과 저장소 권한을 엄격히 제한합니다.

6. 러너 설치 디렉터리에서 systemd 서비스로 등록하고 상태를 확인합니다.

   ```bash
   sudo ./svc.sh install
   sudo ./svc.sh start
   sudo ./svc.sh status
   ```

7. GitHub의 Runners 화면에서 러너가 `Idle`이며 `self-hosted`, `linux`, `x64`, `ai-pt-prod` 라벨을 모두 갖는지 확인합니다. ARM64 서버라면 워크플로의 `x64` 라벨을 실제 아키텍처에 맞게 변경합니다.

현재 워크플로는 `actions/checkout@v6`을 사용하므로 셀프 호스티드 Actions Runner `v2.329.0` 이상이 필요합니다.

#### 2. production Environment 설정

[GitHub Environments 공식 문서](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)를 참고해 저장소의 **Settings → Environments → New environment**에서 `production`을 생성합니다.

운영 배포를 특정 브랜치로 제한하려면 Deployment branches를 설정합니다. 배포 전 승인이 필요하면 Required reviewers와 self-review 방지를 설정합니다. Environment 승인을 사용하는 경우 승인 전에는 Environment Secrets가 Job에 전달되지 않습니다.

`production`의 **Environment variables**에는 로그에 노출되어도 되는 다음 값을 등록합니다.

| Variable | 예시 |
| --- | --- |
| `AI_PT_BIND_ADDRESS` | `127.0.0.1` |
| `AI_PT_PUBLIC_PORT` | `18443` |
| `AI_PT_POSTGRES_DB` | `at_pt` |
| `AI_PT_POSTGRES_USER` | `a2t` |
| `AI_PT_MINIO_ROOT_USER` | `ai-pt-minio` |
| `AI_PT_MINIO_PUBLIC_BUCKET` | `pt-diary-assets` |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | `https://api.openai.com/v1` |

`production`의 **Environment secrets**에는 다음 비밀값을 등록합니다.

| Secret | 설명 |
| --- | --- |
| `AI_PT_POSTGRES_PASSWORD` | URL에 사용할 수 있는 문자로 구성한 강한 DB 비밀번호 |
| `AI_PT_MINIO_ROOT_PASSWORD` | 강한 MinIO 관리자 비밀번호 |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | 운영 OpenAI API 키 |
| `SERVICE_ROLE_KEY` | 관리자 API용으로 충분히 긴 임의 문자열 |

도메인 이름은 현재 GitHub Variables가 아닙니다. `api.example.com`, `minio.example.com`을 사용한다면 앞에서 설명한 Nginx 설정과 워크플로 헬스체크의 `Host` 헤더를 함께 변경해야 합니다.

#### 3. 워크플로 실행

1. [배포 워크플로](../.github/workflows/deploy-production.yml)가 기본 브랜치에 반영되어 있는지 확인합니다.
2. GitHub 저장소의 **Actions** 탭에서 **ai-pt production deploy**를 선택합니다.
3. **Run workflow**를 누르고 배포할 브랜치 또는 태그를 선택합니다.
4. `production` Environment에 승인을 설정했다면 승인자가 배포를 승인합니다.
5. 워크플로에서 다음 단계가 모두 성공했는지 확인합니다.
   - 배포 소스 checkout
   - Docker, Compose, curl 실행 환경 확인
   - Variables와 Secrets 필수값 검증
   - Compose 문법 검증
   - 컨테이너 빌드 및 배포
   - MinIO seed 재적용
   - API와 공개 에셋 헬스체크

워크플로는 서버에 남아 있을 수 있는 `.env`를 읽지 않도록 `--env-file /dev/null`을 사용하고, `production` Environment의 Variables와 Secrets만 Compose 프로세스에 전달합니다. 같은 서버에서 수동 Make 배포와 Actions 배포를 섞어도 두 방식 모두 `ai-pt-deploy` 프로젝트 이름을 사용하므로 동일한 컨테이너와 named volume을 이어받습니다.

배포가 실패하면 Actions 로그를 확인하고, 러너 서버에서 다음 명령으로 해당 Compose 프로젝트의 컨테이너 상태를 추가 확인합니다.

```bash
docker ps --all \
  --filter label=com.docker.compose.project=ai-pt-deploy
```

## 클라이언트 배포

배포 전 [앱인토스 React Native 시작하기](https://developers-apps-in-toss.toss.im/ai-vibe-coding/tutorials/react-native), [Granite Build Your App](https://www.granite.run/guides/quick-start/create-your-app.html#_7-build-your-app), [미니앱 테스트하기](https://developers-apps-in-toss.toss.im/guide/operation/toss), [미니앱 출시](https://developers-apps-in-toss.toss.im/guide/operation/deploy) 공식 문서를 확인합니다.

1. 운영 백엔드와 공개 에셋 저장소를 먼저 배포하고, `client/.env`가 로컬 주소나 LAN IP가 아닌 실제 HTTPS 주소를 가리키도록 설정합니다.

   ```dotenv
   API_BASE_URL=https://<운영-API-도메인>
   ASSET_BASE_URL=https://<운영-에셋-도메인>/pt-diary-assets/v1
   OPENAPI_SCHEMA_URL=https://<운영-API-도메인>/docs-json
   ```

   라이브 앱에서는 HTTP 통신이 허용되지 않으므로 `API_BASE_URL`과 `ASSET_BASE_URL`에 `127.0.0.1`, `localhost`, 사설 IP 또는 HTTP 주소를 넣고 빌드하면 안 됩니다.

2. 운영 OpenAPI 스펙을 기준으로 Orval API 코드를 다시 생성합니다.

   ```bash
   cd client
   npm run api:generate
   ```

3. 배포 전에 정적 검사와 테스트를 실행합니다.

   ```bash
   npx biome check .
   npm run typecheck
   npm test -- --runInBand
   ```

   `npm run lint`는 `biome check --write`를 실행해 파일을 수정하므로 배포 전 읽기 전용 검사에는 사용하지 않습니다.

4. 앱인토스 배포용 `.ait` 번들을 빌드합니다. 이 프로젝트의 `npm run build`는 내부적으로 `ait build`를 실행합니다.

   ```bash
   npm run build
   ```

   빌드가 끝나면 `client` 루트에 `a2t-ptdiary.ait`와 같은 `<서비스명>.ait` 파일이 생성됩니다. `ls -lh *.ait`로 파일명과 크기를 확인합니다. 공식 정책상 앱 번들은 **압축 해제 기준 100MB 이하**여야 합니다.

### 콘솔에서 직접 업로드

1. [앱인토스 콘솔](https://apps-in-toss.toss.im/)에 로그인하고 워크스페이스에서 `a2t-ptdiary`를 선택합니다.
2. 왼쪽 메뉴의 **앱 출시**로 이동해 방금 생성한 `.ait` 파일을 업로드합니다.
3. 업로드가 완료되면 **테스트하기**를 누르고 생성된 QR 코드를 토스 앱으로 스캔합니다.
4. QR 테스트는 토스 앱 로그인, 워크스페이스 멤버 권한, 만 19세 이상 조건을 모두 충족해야 합니다.
5. 출시 전에는 `intoss://a2t-ptdiary`가 아니라 업로드 시 생성된 `intoss-private://...` 테스트 스킴을 사용합니다.
6. 주요 화면과 API·에셋 로딩을 실제 토스 앱에서 확인합니다. 최소 한 번 이상 테스트해야 **검토 요청하기** 버튼이 활성화됩니다.
7. 테스트가 끝나면 **검토 요청하기**를 누르고, 승인 안내를 받은 뒤 콘솔에서 **출시하기**를 눌러 공개합니다.

### CLI로 업로드

CLI 업로드를 사용하려면 콘솔에서 **워크스페이스 선택 → 키**로 이동해 API 키를 먼저 발급합니다. API 키는 저장소나 `.env`에 커밋하지 않습니다.

1. 처음 한 번만 API 키를 로컬 AIT 프로필에 등록합니다.

   ```bash
   cd client
   npx ait token add
   ```

2. `.ait`를 빌드한 뒤 출시 메모와 함께 업로드합니다. 이 프로젝트의 `npm run deploy`는 내부적으로 `ait deploy`를 실행합니다.

   ```bash
   npm run build
   npm run deploy -- -m "배포 내용 요약"
   ```

   특정 파일을 올려야 한다면 `npx ait deploy --location ./a2t-ptdiary.ait -m "배포 내용 요약"`처럼 경로를 지정합니다.

3. 업로드가 성공하면 CLI에 출력된 `intoss-private://...` 테스트 스킴으로 기능을 확인합니다. CLI 업로드는 즉시 정식 출시하는 명령이 아니며, 이후 콘솔에서 테스트 완료 → 검토 요청 → 승인 → 출시 절차를 진행해야 합니다.
