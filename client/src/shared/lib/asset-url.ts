import type { ImageSourcePropType } from 'react-native';

const ASSET_BASE_URL = import.meta.env.ASSET_BASE_URL.replace(/\/+$/, '');

export type PublicAssetPath =
  | `icons/${string}`
  | `images/${string}`
  | `muscles/${string}`;

export function getAssetUrl(path: PublicAssetPath) {
  return `${ASSET_BASE_URL}/${path}`;
}

export function getAssetSource(path: PublicAssetPath): ImageSourcePropType {
  return { uri: getAssetUrl(path) };
}
