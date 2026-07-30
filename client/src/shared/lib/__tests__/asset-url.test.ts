import { describe, expect, it } from '@jest/globals';
import { getAssetSource, getAssetUrl } from '../asset-url';

describe('공개 에셋 URL', () => {
  it('MinIO 공개 base URL과 객체 경로를 연결한다', () => {
    expect(getAssetUrl('muscles/chest.png')).toBe(
      'http://127.0.0.1:9000/pt-diary-assets/v1/muscles/chest.png',
    );
  });

  it('React Native Image가 사용할 URI source를 만든다', () => {
    expect(getAssetSource('icons/play.png')).toEqual({
      uri: 'http://127.0.0.1:9000/pt-diary-assets/v1/icons/play.png',
    });
  });
});
