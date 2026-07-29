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

const apiBaseUrl = process.env.API_BASE_URL?.trim();

if (!apiBaseUrl) {
  throw new Error('client/.env에 API_BASE_URL 값이 필요합니다.');
}

const parsedApiBaseUrl = new URL(apiBaseUrl);

if (
  parsedApiBaseUrl.protocol !== 'http:' &&
  parsedApiBaseUrl.protocol !== 'https:'
) {
  throw new Error('API_BASE_URL은 http 또는 https URL이어야 합니다.');
}

export default defineConfig({
  scheme: 'intoss',
  appName: 'a2t-ptdiary',
  plugins: [
    appsInToss({
      brand: {
        displayName: 'a2t-ptdiary', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
        primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
        icon: '', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
      },
      permissions: [],
    }),
    env({ API_BASE_URL: apiBaseUrl.replace(/\/+$/, '') }),
  ],
});
