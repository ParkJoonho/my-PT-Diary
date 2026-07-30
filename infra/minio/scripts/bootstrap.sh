#!/bin/sh

set -eu

: "${MINIO_ENDPOINT:?MINIO_ENDPOINT is required}"
: "${MINIO_ROOT_USER:?MINIO_ROOT_USER is required}"
: "${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required}"
: "${MINIO_PUBLIC_BUCKET:?MINIO_PUBLIC_BUCKET is required}"

mc alias set local "${MINIO_ENDPOINT}" "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"
mc mb --ignore-existing "local/${MINIO_PUBLIC_BUCKET}"
mc anonymous set download "local/${MINIO_PUBLIC_BUCKET}"
mc mirror --overwrite \
  "/seed/${MINIO_PUBLIC_BUCKET}" \
  "local/${MINIO_PUBLIC_BUCKET}"
