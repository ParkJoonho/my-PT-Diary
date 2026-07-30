import type { ImageSourcePropType } from 'react-native';
import type { ExerciseGuideDto } from 'shared/api/generated/models';

export type ExerciseGuideTab = '기구별' | '부위별';

export type BodyPartFilter =
  | '가슴'
  | '등'
  | '복근'
  | '어깨'
  | '전체'
  | '팔'
  | '하체';

export type EquipmentFilter =
  | '기구'
  | '던벨'
  | '덤벨'
  | '맨몸'
  | '머신'
  | '바벨'
  | '전체'
  | '케이블';

export type BodyPartFilterItem = {
  key: BodyPartFilter;
  label: string;
  image: ImageSourcePropType | null;
};

export type ExerciseGuide = ExerciseGuideDto;
