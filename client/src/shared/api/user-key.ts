import { getAnonymousKey } from '@apps-in-toss/framework';

const DEVELOPMENT_FALLBACK_USER_KEY = 'dev-preview-user';

let cachedUserKeyPromise: Promise<string> | null = null;

export async function getTrackerUserKey(): Promise<string> {
  if (cachedUserKeyPromise) {
    return cachedUserKeyPromise;
  }

  cachedUserKeyPromise = (async () => {
    try {
      const result = await getAnonymousKey();

      if (result && result !== 'ERROR' && result.type === 'HASH') {
        return result.hash;
      }
    } catch {
      // Fall back below for local preview and unsupported bridge environments.
    }

    return DEVELOPMENT_FALLBACK_USER_KEY;
  })();

  return cachedUserKeyPromise;
}
