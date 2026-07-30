# MinIO 로컬 에셋 저장소

구성은 [`docker-compose.yml`](../../docker-compose.yml)에서 관리한다.

## 디렉터리 역할

- `seed/pt-diary-assets`: Git으로 관리하는 공개 정적 에셋 원본
- `scripts/bootstrap.sh`: 공개 bucket 생성, 읽기 정책 적용, seed 업로드
- Docker named volume `at_pt_minio_data`: MinIO가 관리하는 런타임 객체 데이터

seed 파일을 MinIO의 `/data`에 직접 복사하지 않는다. `minio-init` 서비스가 MinIO Client의
S3 API를 사용해 bucket으로 업로드한다.

## Docker volume

| 데이터 | named volume | 컨테이너 경로 | 저장소에서 관리하는 원본 |
|---|---|---|---|
| PostgreSQL 18 | `at_pt_postgres_data` | `/var/lib/postgresql` | 없음 |
| MinIO object | `at_pt_minio_data` | `/data` | `seed/pt-diary-assets` |

PostgreSQL은 `postgres:18-alpine`을 사용하므로 volume target을
`/var/lib/postgresql/data`로 바꾸지 않고 `/var/lib/postgresql`로 유지한다. named
volume의 실제 호스트 경로는 Docker가 관리하며 다음 명령으로 확인할 수 있다.

```bash
docker volume ls --filter name=at_pt
docker volume inspect <위 목록에 표시된 volume 이름>
```

## 로컬 실행

```bash
docker compose up -d postgres minio minio-init
docker compose ps
```

MinIO API는 `http://127.0.0.1:9000`, 관리 콘솔은 `http://127.0.0.1:9001`에서 열린다.
실기기에서 실행하는 Apps in Toss 클라이언트는 `127.0.0.1` 대신 개발 PC의 LAN IP를
사용해야 한다.

공개 에셋 예시는 다음과 같다.

```text
http://127.0.0.1:9000/pt-diary-assets/v1/muscles/chest.png
```

seed를 변경한 뒤에는 초기화 서비스를 다시 실행한다.

```bash
docker compose run --rm minio-init
```

`.env.example`의 MinIO 계정은 로컬 개발 기본값이다. 외부 환경에서는 자격증명을
교체하고, 클라이언트의 `ASSET_BASE_URL`에는 공개 HTTPS 주소를 설정한다.
