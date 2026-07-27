import { ExerciseGuideCatalogType } from './dto/exercise-guide-response.dto';

export type ExerciseGuideCatalogItem = {
  id: string;
  catalogType: ExerciseGuideCatalogType;
  title: string;
  bodyPart: string;
  equipment: string;
  equipmentTypes: string[];
  duration: string;
  initialLikeCount: number;
  videoUrl: string;
  description: string;
  targetMuscles: string | null;
  displayOrder: number;
};

// Seed source for the exercise_guides table. Keep these values aligned with the
// original app so first-boot seeding can reproduce the source catalog exactly.
export const BODY_PART_EXERCISE_GUIDES: ExerciseGuideCatalogItem[] = [
  {
    bodyPart: '가슴',
    catalogType: ExerciseGuideCatalogType.BodyPart,
    description:
      '인클라인 벤치프레스와 케이블 플라이를 활용한 가슴 상부 강화 루틴입니다.',
    displayOrder: 1,
    duration: '12:30',
    equipment: '벤치, 케이블',
    equipmentTypes: ['케이블', '바벨'],
    id: 'r1',
    initialLikeCount: 3,
    targetMuscles: '가슴',
    title: '가슴 상부 집중 루틴',
    videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
  },
  {
    bodyPart: '등',
    catalogType: ExerciseGuideCatalogType.BodyPart,
    description: '랫풀다운과 풀업 변형을 통한 등 넓이 확장 프로그램입니다.',
    displayOrder: 2,
    duration: '15:00',
    equipment: '랫풀다운 머신',
    equipmentTypes: ['머신'],
    id: 'r2',
    initialLikeCount: 0,
    targetMuscles: '등',
    title: '등 넓이 만들기',
    videoUrl: 'https://www.youtube.com/embed/CAwf7n6Luuc',
  },
  {
    bodyPart: '어깨',
    catalogType: ExerciseGuideCatalogType.BodyPart,
    description: '전면, 측면, 후면 삼각근을 균형있게 발달시키는 루틴입니다.',
    displayOrder: 3,
    duration: '10:45',
    equipment: '덤벨',
    equipmentTypes: ['덤벨'],
    id: 'r3',
    initialLikeCount: 0,
    targetMuscles: '어깨',
    title: '3D 어깨 만들기',
    videoUrl: 'https://www.youtube.com/embed/qEwKCR5JCog',
  },
  {
    bodyPart: '하체',
    catalogType: ExerciseGuideCatalogType.BodyPart,
    description: '스쿼트, 레그프레스, 레그컬을 활용한 종합 하체 운동입니다.',
    displayOrder: 4,
    duration: '18:20',
    equipment: '레그프레스 머신',
    equipmentTypes: ['머신'],
    id: 'r4',
    initialLikeCount: 6,
    targetMuscles: '하체',
    title: '하체 집중 루틴',
    videoUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ',
  },
  {
    bodyPart: '복근',
    catalogType: ExerciseGuideCatalogType.BodyPart,
    description: '복직근, 복사근, 하복부를 모두 자극하는 코어 루틴입니다.',
    displayOrder: 5,
    duration: '12:30',
    equipment: '맨몸',
    equipmentTypes: ['맨몸'],
    id: 'r5',
    initialLikeCount: 0,
    targetMuscles: '복근',
    title: '코어 강화 프로그램',
    videoUrl: 'https://www.youtube.com/embed/DHD1-2P94DI',
  },
  {
    bodyPart: '팔',
    catalogType: ExerciseGuideCatalogType.BodyPart,
    description: '이두근과 삼두근을 슈퍼세트로 자극하는 팔 운동입니다.',
    displayOrder: 6,
    duration: '11:15',
    equipment: '케이블, 덤벨',
    equipmentTypes: ['케이블', '덤벨'],
    id: 'r6',
    initialLikeCount: 2,
    targetMuscles: '팔',
    title: '팔 펌핑 루틴',
    videoUrl: 'https://www.youtube.com/embed/kwG2ipFRgFo',
  },
  {
    bodyPart: '등',
    catalogType: ExerciseGuideCatalogType.BodyPart,
    description:
      '컨벤셔널과 루마니안 데드리프트의 정확한 자세와 호흡법을 배웁니다.',
    displayOrder: 7,
    duration: '14:00',
    equipment: '바벨',
    equipmentTypes: ['바벨'],
    id: 'r7',
    initialLikeCount: 4,
    targetMuscles: '등',
    title: '데드리프트 완벽 가이드',
    videoUrl: 'https://www.youtube.com/embed/op9kVnSso6Q',
  },
  {
    bodyPart: '어깨',
    catalogType: ExerciseGuideCatalogType.BodyPart,
    description: '전면 삼각근을 타겟으로 한 오버헤드 프레스 루틴입니다.',
    displayOrder: 8,
    duration: '09:00',
    equipment: '바벨',
    equipmentTypes: ['바벨'],
    id: 'r8',
    initialLikeCount: 1,
    targetMuscles: '어깨',
    title: '어깨 전면부 집중',
    videoUrl: 'https://www.youtube.com/embed/B-aVuyhvLHU',
  },
  {
    bodyPart: '하체',
    catalogType: ExerciseGuideCatalogType.BodyPart,
    description: '맨몸 스쿼트와 런지로 구성된 하체 지구력 강화 프로그램입니다.',
    displayOrder: 9,
    duration: '22:00',
    equipment: '맨몸',
    equipmentTypes: ['맨몸'],
    id: 'r9',
    initialLikeCount: 5,
    targetMuscles: '하체',
    title: '하체 근지구력 강화',
    videoUrl: 'https://www.youtube.com/embed/aclHkVaku9U',
  },
  {
    bodyPart: '전체',
    catalogType: ExerciseGuideCatalogType.BodyPart,
    description: '덤벨만으로 전신을 자극하는 서킷 트레이닝입니다.',
    displayOrder: 10,
    duration: '20:00',
    equipment: '덤벨',
    equipmentTypes: ['덤벨'],
    id: 'r10',
    initialLikeCount: 8,
    targetMuscles: '전체',
    title: '전신 덤벨 서킷',
    videoUrl: 'https://www.youtube.com/embed/vc1E5CfRfos',
  },
  {
    bodyPart: '가슴',
    catalogType: ExerciseGuideCatalogType.BodyPart,
    description: '플랫 벤치프레스 위주의 가슴 근력 향상 루틴입니다.',
    displayOrder: 11,
    duration: '16:00',
    equipment: '바벨',
    equipmentTypes: ['바벨'],
    id: 'r11',
    initialLikeCount: 2,
    targetMuscles: '가슴',
    title: '가슴 근력 강화',
    videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
  },
  {
    bodyPart: '복근',
    catalogType: ExerciseGuideCatalogType.BodyPart,
    description: '크런치, 레그레이즈, 플랭크로 완성하는 복근 루틴입니다.',
    displayOrder: 12,
    duration: '08:30',
    equipment: '맨몸',
    equipmentTypes: ['맨몸'],
    id: 'r12',
    initialLikeCount: 7,
    targetMuscles: '복근',
    title: '복근 완성 루틴',
    videoUrl: 'https://www.youtube.com/embed/DHD1-2P94DI',
  },
];

export const EQUIPMENT_EXERCISE_GUIDES: ExerciseGuideCatalogItem[] = [
  {
    bodyPart: '등, 팔',
    catalogType: ExerciseGuideCatalogType.Equipment,
    description: '넓은 등을 만드는 랫풀다운 정확한 자세와 호흡법.',
    displayOrder: 13,
    duration: '12:30',
    equipment: '랫풀다운 머신',
    equipmentTypes: ['머신'],
    id: 'e1',
    initialLikeCount: 0,
    targetMuscles: '등, 팔',
    title: '렛풀다운',
    videoUrl: 'https://www.youtube.com/embed/CAwf7n6Luuc',
  },
  {
    bodyPart: '하체',
    catalogType: ExerciseGuideCatalogType.Equipment,
    description: '레그프레스 머신을 활용한 하체 근력 강화 운동.',
    displayOrder: 14,
    duration: '15:00',
    equipment: '레그프레스 머신',
    equipmentTypes: ['머신'],
    id: 'e2',
    initialLikeCount: 0,
    targetMuscles: '하체',
    title: '레그프레스',
    videoUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ',
  },
  {
    bodyPart: '가슴, 팔',
    catalogType: ExerciseGuideCatalogType.Equipment,
    description: '플랫 벤치프레스로 가슴과 삼두근을 효과적으로 강화합니다.',
    displayOrder: 15,
    duration: '10:45',
    equipment: '바벨, 벤치',
    equipmentTypes: ['바벨'],
    id: 'e3',
    initialLikeCount: 2,
    targetMuscles: '가슴, 팔',
    title: '벤치프레스',
    videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
  },
  {
    bodyPart: '하체',
    catalogType: ExerciseGuideCatalogType.Equipment,
    description: '트레드밀을 활용한 유산소 인터벌 트레이닝.',
    displayOrder: 16,
    duration: '18:20',
    equipment: '트레드밀',
    equipmentTypes: ['머신'],
    id: 'e4',
    initialLikeCount: 0,
    targetMuscles: '하체',
    title: '러닝머신(트레드밀)',
    videoUrl: 'https://www.youtube.com/embed/aclHkVaku9U',
  },
  {
    bodyPart: '가슴',
    catalogType: ExerciseGuideCatalogType.Equipment,
    description: '케이블 크로스오버로 가슴 안쪽을 집중 자극합니다.',
    displayOrder: 17,
    duration: '12:30',
    equipment: '케이블 머신',
    equipmentTypes: ['케이블'],
    id: 'e5',
    initialLikeCount: 0,
    targetMuscles: '가슴',
    title: '케이블 크로스오버',
    videoUrl: 'https://www.youtube.com/embed/kwG2ipFRgFo',
  },
  {
    bodyPart: '전신',
    catalogType: ExerciseGuideCatalogType.Equipment,
    description: '스미스 머신을 활용한 다양한 복합 운동 루틴.',
    displayOrder: 18,
    duration: '12:30',
    equipment: '스미스 머신',
    equipmentTypes: ['머신'],
    id: 'e6',
    initialLikeCount: 0,
    targetMuscles: '전신',
    title: '스미스 머신',
    videoUrl: 'https://www.youtube.com/embed/op9kVnSso6Q',
  },
  {
    bodyPart: '어깨',
    catalogType: ExerciseGuideCatalogType.Equipment,
    description: '덤벨로 삼각근 전체를 균형 있게 발달시킵니다.',
    displayOrder: 19,
    duration: '09:00',
    equipment: '덤벨',
    equipmentTypes: ['덤벨'],
    id: 'e7',
    initialLikeCount: 1,
    targetMuscles: '어깨',
    title: '덤벨 숄더프레스',
    videoUrl: 'https://www.youtube.com/embed/qEwKCR5JCog',
  },
  {
    bodyPart: '하체',
    catalogType: ExerciseGuideCatalogType.Equipment,
    description: '바벨 백스쿼트의 정확한 자세와 안전한 호흡법.',
    displayOrder: 20,
    duration: '14:00',
    equipment: '바벨',
    equipmentTypes: ['바벨'],
    id: 'e8',
    initialLikeCount: 4,
    targetMuscles: '하체',
    title: '바벨 스쿼트',
    videoUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ',
  },
];

const EXPECTED_BODY_PART_GUIDE_COUNT = 12;
const EXPECTED_EQUIPMENT_GUIDE_COUNT = 8;

function validateCatalog() {
  if (BODY_PART_EXERCISE_GUIDES.length !== EXPECTED_BODY_PART_GUIDE_COUNT) {
    throw new Error(
      `Exercise guide body-part catalog must contain ${EXPECTED_BODY_PART_GUIDE_COUNT} items.`,
    );
  }

  if (EQUIPMENT_EXERCISE_GUIDES.length !== EXPECTED_EQUIPMENT_GUIDE_COUNT) {
    throw new Error(
      `Exercise guide equipment catalog must contain ${EXPECTED_EQUIPMENT_GUIDE_COUNT} items.`,
    );
  }

  const ids = [...BODY_PART_EXERCISE_GUIDES, ...EQUIPMENT_EXERCISE_GUIDES].map(
    (guide) => guide.id,
  );
  const uniqueIds = new Set(ids);

  if (uniqueIds.size !== ids.length) {
    throw new Error('Exercise guide catalog IDs must be unique.');
  }
}

validateCatalog();

export const EXERCISE_GUIDE_CATALOG: ExerciseGuideCatalogItem[] = [
  ...BODY_PART_EXERCISE_GUIDES,
  ...EQUIPMENT_EXERCISE_GUIDES,
].sort((left, right) => left.displayOrder - right.displayOrder);

export const EXERCISE_GUIDE_CATALOG_BY_ID = new Map(
  EXERCISE_GUIDE_CATALOG.map((guide) => [guide.id, guide] as const),
);
