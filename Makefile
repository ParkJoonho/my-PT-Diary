SHELL := /bin/sh

COMPOSE := docker compose --env-file .env --env-file server/.env --project-name ai-pt-deploy --file docker-compose.deploy.yml
AI_PT_PUBLIC_PORT ?= 18443
SERVICE ?=

ifneq (,$(wildcard .env))
include .env
export
endif

.PHONY: help validate config build deploy status health logs restart seed stop down

help:
	@echo "make validate  배포 환경 파일과 Compose 구성을 검증합니다."
	@echo "make config    비밀값을 출력하지 않고 Compose 구성을 검증합니다."
	@echo "make build     백엔드 이미지를 빌드합니다."
	@echo "make deploy    전체 서비스를 빌드하고 백그라운드로 실행합니다."
	@echo "make status    컨테이너와 일회성 초기화 작업 상태를 확인합니다."
	@echo "make health    18443 포트에서 API와 정적 에셋 응답을 확인합니다."
	@echo "make logs      전체 로그를 확인합니다. SERVICE=backend 등을 지정할 수 있습니다."
	@echo "make restart   실행 중인 서비스를 재시작합니다."
	@echo "make seed      MinIO bucket 정책과 정적 에셋 seed를 다시 적용합니다."
	@echo "make stop      컨테이너를 중지합니다."
	@echo "make down      컨테이너와 네트워크를 제거하되 데이터 volume은 보존합니다."

validate:
	@test -f .env || { echo ".env 파일이 없습니다. .env.example을 복사한 뒤 값을 설정하세요."; exit 1; }
	@test -f server/.env || { echo "server/.env 파일이 없습니다. server/.env.example을 복사한 뒤 값을 설정하세요."; exit 1; }
	@set -eu; \
	for key in \
		AI_PT_POSTGRES_DB \
		AI_PT_POSTGRES_USER \
		AI_PT_POSTGRES_PASSWORD \
		AI_PT_MINIO_ROOT_USER \
		AI_PT_MINIO_ROOT_PASSWORD \
		AI_PT_MINIO_PUBLIC_BUCKET; do \
		value=$$(sed -n "s/^$${key}=//p" .env | tail -n 1); \
		case "$${value}" in \
			""|replace-with-*) echo ".env의 $${key} 값을 실제 배포 값으로 설정하세요."; exit 1 ;; \
		esac; \
	done
	@set -eu; \
	for key in AI_INTEGRATIONS_OPENAI_API_KEY SERVICE_ROLE_KEY; do \
		value=$$(sed -n "s/^$${key}=//p" server/.env | tail -n 1); \
		case "$${value}" in \
			""|replace-with-*) echo "server/.env의 $${key} 값을 실제 배포 값으로 설정하세요."; exit 1 ;; \
		esac; \
	done
	@$(COMPOSE) config --quiet

config: validate
	@echo "Compose 구성이 유효합니다."

build: validate
	@$(COMPOSE) build backend

deploy: validate
	@$(COMPOSE) up -d --build --remove-orphans
	@$(COMPOSE) run --rm minio-init
	@$(COMPOSE) restart nginx
	@$(COMPOSE) ps --all

status:
	@$(COMPOSE) ps --all

health:
	@curl --fail --silent --show-error \
		--header 'Host: api.a2t.jongchoi.com' \
		"http://127.0.0.1:$(AI_PT_PUBLIC_PORT)/health"
	@echo
	@curl --fail --silent --show-error \
		--output /dev/null \
		--header 'Host: s3.a2t.jongchoi.com' \
		"http://127.0.0.1:$(AI_PT_PUBLIC_PORT)/pt-diary-assets/v1/muscles/chest.png"
	@echo "API와 정적 에셋 응답이 정상입니다."

logs:
	@$(COMPOSE) logs --follow --tail=200 $(SERVICE)

restart: validate
	@$(COMPOSE) restart
	@$(COMPOSE) ps --all

seed: validate
	@$(COMPOSE) run --rm minio-init

stop:
	@$(COMPOSE) stop

down:
	@$(COMPOSE) down --remove-orphans
