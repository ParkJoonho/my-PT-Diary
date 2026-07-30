import { getAssetSource } from 'shared/lib/asset-url';
import type { BodyPartFilterItem } from '../types/exercise-guide';

export const BODY_PART_FILTERS: BodyPartFilterItem[] = [
  { image: null, key: '전체', label: '전체' },
  {
    image: getAssetSource('icons/body_chest.png'),
    key: '가슴',
    label: '가슴',
  },
  {
    image: getAssetSource('icons/body_back.png'),
    key: '등',
    label: '등',
  },
  {
    image: getAssetSource('icons/body_shoulder.png'),
    key: '어깨',
    label: '어깨',
  },
  {
    image: getAssetSource('icons/body_arm.png'),
    key: '팔',
    label: '팔',
  },
  {
    image: getAssetSource('icons/body_legs.png'),
    key: '하체',
    label: '하체',
  },
  {
    image: getAssetSource('icons/body_core.png'),
    key: '복근',
    label: '복근',
  },
];
