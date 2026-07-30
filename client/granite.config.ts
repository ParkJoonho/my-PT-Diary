import { appsInToss } from '@apps-in-toss/framework/plugins';
import { env } from '@granite-js/plugin-env';
import { defineConfig } from '@granite-js/react-native/config';
import { config } from 'dotenv';

const result = config({
  path: '.env',
  quiet: true,
});

if (result.error) {
  throw new Error('client/.env 파일을 읽을 수 없습니다.', {
    cause: result.error,
  });
}

function readHttpUrl(name: 'API_BASE_URL' | 'ASSET_BASE_URL') {
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

const apiBaseUrl = readHttpUrl('API_BASE_URL');
const assetBaseUrl = readHttpUrl('ASSET_BASE_URL');

export default defineConfig({
  scheme: 'intoss',
  appName: 'a2t-ptdiary',
  plugins: [
    appsInToss({
      brand: {
        displayName: 'a2t-ptdiary', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
        primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
        icon: `${assetBaseUrl}/images/icon.png`,
      },
      permissions: [],
    }),
    env({
      API_BASE_URL: apiBaseUrl,
      ASSET_BASE_URL: assetBaseUrl,
    }),
  ],
});
