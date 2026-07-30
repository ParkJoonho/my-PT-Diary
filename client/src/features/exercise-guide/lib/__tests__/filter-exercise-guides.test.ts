import { describe, expect, it } from '@jest/globals';
import type { ExerciseGuideDto } from 'shared/api/generated/models';
import { BODY_PART_FILTERS } from '../../data/exercise-guide-filters';
import {
  filterBodyPartGuides,
  filterEquipmentGuides,
} from '../filter-exercise-guides';

const 가이드목록: ExerciseGuideDto[] = [
  {
    bodyPart: '가슴',
    catalogType: 'body_part',
    description: '',
    duration: '12:30',
    equipment: '벤치',
    equipmentTypes: ['바벨'],
    id: 'r1',
    likeCount: 0,
    likedByMe: false,
    targetMuscles: '가슴',
    title: '가슴 상부 집중 루틴',
    videoUrl: 'https://www.youtube.com/embed/a',
  },
  {
    bodyPart: '하체',
    catalogType: 'equipment',
    description: '',
    duration: '14:00',
    equipment: '바벨',
    equipmentTypes: ['바벨', '머신'],
    id: 'e8',
    likeCount: 4,
    likedByMe: true,
    targetMuscles: '하체',
    title: '바벨 스쿼트',
    videoUrl: 'https://www.youtube.com/embed/b',
  },
];

describe('운동 가이드 필터', () => {
  it('부위 필터 이미지를 MinIO 공개 URI source로 제공한다', () => {
    expect(BODY_PART_FILTERS[1]?.image).toEqual({
      uri: 'http://127.0.0.1:9000/pt-diary-assets/v1/icons/body_chest.png',
    });
  });

  it('부위별 필터는 원본처럼 bodyPart와 정확히 같은 항목만 남긴다', () => {
    expect(filterBodyPartGuides(가이드목록, '가슴')).toEqual([가이드목록[0]]);
    expect(filterBodyPartGuides(가이드목록, '전체')).toEqual(가이드목록);
  });

  it('기구별 필터는 equipmentTypes 포함 여부로 동작한다', () => {
    expect(filterEquipmentGuides(가이드목록, '바벨')).toEqual([
      가이드목록[0],
      가이드목록[1],
    ]);
    expect(filterEquipmentGuides(가이드목록, '머신')).toEqual([가이드목록[1]]);
    expect(filterEquipmentGuides(가이드목록, '전체')).toEqual(가이드목록);
  });
});
