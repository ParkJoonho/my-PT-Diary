import { describe, expect, it } from '@jest/globals';
import { MUSCLE_INFO_MAP } from '../condition-muscle-info';

describe('근육 안내 원격 에셋', () => {
  it('모든 근육 이미지를 MinIO 공개 URI source로 제공한다', () => {
    const sources = Object.values(MUSCLE_INFO_MAP).map((info) => info.image);

    expect(sources).toHaveLength(15);
    expect(sources).toContainEqual({
      uri: 'http://127.0.0.1:9000/pt-diary-assets/v1/muscles/chest.png',
    });
    expect(
      sources.every(
        (source) =>
          typeof source === 'object' &&
          !Array.isArray(source) &&
          source !== null &&
          'uri' in source,
      ),
    ).toBe(true);
  });
});
