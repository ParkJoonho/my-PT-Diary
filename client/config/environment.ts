import { config } from 'dotenv';

const result = config({
  path: new URL('../.env', import.meta.url),
  quiet: true,
});

if (result.error) {
  throw new Error('client/.env 파일을 읽을 수 없습니다.', {
    cause: result.error,
  });
}

function readHttpUrl(name: 'API_BASE_URL' | 'OPENAPI_SCHEMA_URL') {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`client/.env에 ${name} 값이 필요합니다.`);
  }

  const url = new URL(value);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${name}은 http 또는 https URL이어야 합니다.`);
  }

  return value.replace(/\/+$/, '');
}

export const API_BASE_URL = readHttpUrl('API_BASE_URL');
export const OPENAPI_SCHEMA_URL = readHttpUrl('OPENAPI_SCHEMA_URL');
