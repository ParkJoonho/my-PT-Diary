import { DEFAULT_DATABASE_URL } from '../database/database.constants';
import { validateEnv } from './env.schema';

describe('validateEnv', () => {
  it('빈 선택 환경변수를 설정되지 않은 값으로 정규화한다', () => {
    const result = validateEnv({
      AI_INTEGRATIONS_OPENAI_API_KEY: '',
      SERVICE_ROLE_KEY: '   ',
    });

    expect(result).toEqual({
      AI_INTEGRATIONS_OPENAI_API_KEY: undefined,
      AI_INTEGRATIONS_OPENAI_BASE_URL: 'https://api.openai.com/v1',
      DATABASE_URL: DEFAULT_DATABASE_URL,
      PORT: 3000,
      SERVICE_ROLE_KEY: undefined,
    });
  });

  it('설정된 선택 환경변수는 유지한다', () => {
    const result = validateEnv({
      AI_INTEGRATIONS_OPENAI_API_KEY: 'openai-key',
      SERVICE_ROLE_KEY: 'service-role-key',
    });

    expect(result.AI_INTEGRATIONS_OPENAI_API_KEY).toBe('openai-key');
    expect(result.SERVICE_ROLE_KEY).toBe('service-role-key');
  });
});
