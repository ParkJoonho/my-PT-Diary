const DEVELOPMENT_FALLBACK_USER_KEY = 'dev-preview-user';

type AccountProfile = {
  detailText: string;
  displayName: string;
  helperText: string;
  isDevelopmentPreview: boolean;
  userKeyLabel: string;
};

export function buildAccountProfile(userKey: string): AccountProfile {
  const normalizedUserKey = userKey.trim();
  const isDevelopmentPreview =
    normalizedUserKey.length === 0 ||
    normalizedUserKey === DEVELOPMENT_FALLBACK_USER_KEY;

  return {
    detailText: isDevelopmentPreview
      ? '로컬 미리보기 환경에서 사용하는 기본 사용자입니다.'
      : '현재 사용자 키를 기준으로 운동 기록과 AI 분석 이력이 분리됩니다.',
    displayName: isDevelopmentPreview ? '미리보기 사용자' : '익명 사용자',
    helperText: isDevelopmentPreview
      ? '실기기에서는 Apps in Toss 익명 사용자 키가 자동으로 연결됩니다.'
      : '기록이 섞이지 않도록 같은 앱 환경에서는 동일한 사용자 키를 유지합니다.',
    isDevelopmentPreview,
    userKeyLabel: normalizedUserKey || DEVELOPMENT_FALLBACK_USER_KEY,
  };
}
