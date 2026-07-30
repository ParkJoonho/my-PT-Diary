const DEVELOPMENT_FALLBACK_USER_KEY = 'dev-preview-user';

type AccountProfile = {
  displayName: string;
  secondaryText: string;
};

export function buildAccountProfile(userKey: string): AccountProfile {
  const normalizedUserKey = userKey.trim();
  const isDevelopmentPreview =
    normalizedUserKey.length === 0 ||
    normalizedUserKey === DEVELOPMENT_FALLBACK_USER_KEY;

  return {
    displayName: isDevelopmentPreview ? '미리보기 사용자' : '익명 사용자',
    secondaryText: normalizedUserKey || DEVELOPMENT_FALLBACK_USER_KEY,
  };
}
