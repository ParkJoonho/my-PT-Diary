export type TrainerCatalogItem = {
  approved: boolean;
  avatarColor: string;
  baseMemberCount: number;
  beginnerFriendly: boolean;
  bio: string;
  career: string;
  certifications: string[];
  displayOrder: number;
  experienceYears: number;
  focusBodyParts: string[];
  gymName: string;
  id: string;
  matchTags: string[];
  name: string;
  onlineAvailable: boolean;
  philosophy: string;
  postureFriendly: boolean;
  pricePerSession: string;
  rating: number;
  region: string;
  rehabFriendly: boolean;
  specialties: string[];
};

export const TRAINER_CATALOG: TrainerCatalogItem[] = [
  {
    approved: true,
    avatarColor: '#1B2A4A',
    baseMemberCount: 18,
    beginnerFriendly: false,
    bio: '근력 향상과 체형 교정을 함께 보는 정밀 코칭을 제공합니다.',
    career: '선수 출신, 웨이트 트레이닝 8년 지도',
    certifications: ['NSCA-CPT', '선수 출신'],
    displayOrder: 1,
    experienceYears: 8,
    focusBodyParts: ['등', '가슴', '어깨', '팔'],
    gymName: '강남 피트니스 클럽',
    id: 'trainer-seed-kim-minjun',
    matchTags: ['strength', 'posture', 'hypertrophy'],
    name: '김민준',
    onlineAvailable: true,
    philosophy: '기록과 자세를 같이 보면서 오래 갈 수 있는 강한 몸을 만듭니다.',
    postureFriendly: true,
    pricePerSession: '70,000원',
    rating: 4.9,
    region: '강남',
    rehabFriendly: false,
    specialties: ['근력 향상', '체형 교정'],
  },
  {
    approved: true,
    avatarColor: '#FF6B35',
    baseMemberCount: 22,
    beginnerFriendly: true,
    bio: '체중 감량과 식습관 루틴을 함께 설계하는 다이어트 중심 트레이너입니다.',
    career: '생활체육 지도 5년, 영양 상담 병행',
    certifications: ['여성 전문', '영양 상담'],
    displayOrder: 2,
    experienceYears: 5,
    focusBodyParts: ['전신', '앞다리', '힙'],
    gymName: '서초 웰니스 센터',
    id: 'trainer-seed-lee-seoyeon',
    matchTags: ['diet', 'beginner', 'conditioning'],
    name: '이서연',
    onlineAvailable: true,
    philosophy: '무리한 감량보다 지속 가능한 운동 습관과 체력 회복을 우선합니다.',
    postureFriendly: false,
    pricePerSession: '60,000원',
    rating: 4.8,
    region: '서초',
    rehabFriendly: false,
    specialties: ['다이어트', '유산소'],
  },
  {
    approved: true,
    avatarColor: '#34C759',
    baseMemberCount: 14,
    beginnerFriendly: true,
    bio: '통증 관리와 재활 운동, 코어 안정화에 강한 회복 중심 코칭을 제공합니다.',
    career: '재활 운동 지도 12년, 물리치료 기반 코칭',
    certifications: ['물리치료사', '부상 전문'],
    displayOrder: 3,
    experienceYears: 12,
    focusBodyParts: ['코어', '복근', '등', '힙'],
    gymName: '용산 스포츠 센터',
    id: 'trainer-seed-park-jihun',
    matchTags: ['rehab', 'posture', 'core'],
    name: '박지훈',
    onlineAvailable: false,
    philosophy: '통증을 억지로 참기보다 움직임 패턴을 바꿔서 회복하는 접근을 선호합니다.',
    postureFriendly: true,
    pricePerSession: '80,000원',
    rating: 5,
    region: '용산',
    rehabFriendly: true,
    specialties: ['재활 운동', '코어 강화'],
  },
  {
    approved: true,
    avatarColor: '#AF52DE',
    baseMemberCount: 11,
    beginnerFriendly: true,
    bio: '기능성 움직임과 밸런스 회복을 중심으로 생활 체력을 만드는 코치입니다.',
    career: '기능성 트레이닝 6년 지도',
    certifications: ['FMS 레벨2', '임산부 전문'],
    displayOrder: 4,
    experienceYears: 6,
    focusBodyParts: ['코어', '전신', '힙'],
    gymName: '마포 짐',
    id: 'trainer-seed-choi-yuna',
    matchTags: ['balance', 'posture', 'beginner'],
    name: '최유나',
    onlineAvailable: true,
    philosophy: '일상에서 흔들리지 않는 균형과 움직임의 질을 먼저 세웁니다.',
    postureFriendly: true,
    pricePerSession: '55,000원',
    rating: 4.7,
    region: '마포',
    rehabFriendly: false,
    specialties: ['기능성 운동', '밸런스'],
  },
  {
    approved: true,
    avatarColor: '#007AFF',
    baseMemberCount: 16,
    beginnerFriendly: false,
    bio: '스포츠 퍼포먼스와 근비대 루틴 설계에 강한 고강도 코칭을 제공합니다.',
    career: '퍼포먼스 트레이닝 10년 지도',
    certifications: ['ACSM-CPT', '스포츠심리'],
    displayOrder: 5,
    experienceYears: 10,
    focusBodyParts: ['앞다리', '뒷다리', '힙', '등'],
    gymName: '송파 파워짐',
    id: 'trainer-seed-jung-hyunwoo',
    matchTags: ['performance', 'strength', 'hypertrophy'],
    name: '정현우',
    onlineAvailable: false,
    philosophy: '퍼포먼스 향상은 강도만이 아니라 회복과 심리 전략까지 같이 가야 완성됩니다.',
    postureFriendly: false,
    pricePerSession: '75,000원',
    rating: 4.9,
    region: '송파',
    rehabFriendly: false,
    specialties: ['스포츠 퍼포먼스', '근비대'],
  },
];
