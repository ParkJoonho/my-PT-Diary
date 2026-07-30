import type { ImageSourcePropType } from 'react-native';
import { getAssetSource } from 'shared/lib/asset-url';

export type MuscleInfo = {
  description: string;
  exercises: string;
  image: ImageSourcePropType;
  label: string;
  location: string;
};

export const MUSCLE_INFO_MAP: Record<string, MuscleInfo> = {
  가슴: {
    description:
      '양쪽 가슴을 덮고 있는 넓고 두꺼운 부채꼴 모양의 근육입니다. 팔을 앞으로 밀거나 모으는 동작에 사용됩니다.',
    exercises: '벤치프레스, 푸시업, 체스트 플라이, 딥스',
    image: getAssetSource('muscles/chest.png'),
    label: '가슴 (대흉근)',
    location: '상체 앞쪽, 쇄골 아래에서 갈비뼈까지 넓게 펼쳐진 근육',
  },
  승모근: {
    description:
      '목 뒤쪽에서 시작해 양쪽 어깨와 등 중간까지 이어지는 큰 근육입니다. 어깨를 으쓱하거나, 머리를 뒤로 젖히거나, 어깨뼈를 모으는 동작에 사용됩니다.',
    exercises: '슈러그, 바벨 로우, 페이스 풀, 업라이트 로우',
    image: getAssetSource('muscles/trapezius.png'),
    label: '승모근',
    location: '목 뒤에서 어깨, 등 상부까지 마름모꼴로 펼쳐진 근육',
  },
  광배근: {
    description:
      '등에서 가장 넓은 근육으로, 겨드랑이 뒤쪽부터 허리 아래까지 삼각형 모양으로 펼쳐져 있습니다. 팔을 아래로 당기거나 몸을 끌어올리는 동작에 핵심적입니다.',
    exercises: '풀업, 랫풀다운, 바벨 로우, 시티드 로우',
    image: getAssetSource('muscles/lats.png'),
    label: '광배근',
    location: '등 중하부, 겨드랑이 아래에서 허리까지 넓게 펼쳐진 근육',
  },
  전삼각근: {
    description:
      '어깨의 앞부분을 감싸는 근육입니다. 팔을 앞으로 들어올리거나, 가슴 앞으로 미는 동작에 사용됩니다.',
    exercises: '프론트 레이즈, 오버헤드 프레스, 아놀드 프레스',
    image: getAssetSource('muscles/front-deltoid.png'),
    label: '전삼각근 (앞 어깨)',
    location: '어깨 앞쪽, 쇄골 옆에서 팔 상단까지',
  },
  측삼각근: {
    description:
      '어깨의 옆면을 덮고 있는 근육입니다. 팔을 옆으로 들어올리는 동작에 사용되며, 어깨 너비를 결정하는 중요한 근육입니다.',
    exercises: '사이드 레터럴 레이즈, 업라이트 로우, 케이블 레터럴 레이즈',
    image: getAssetSource('muscles/side-deltoid.png'),
    label: '측삼각근 (옆 어깨)',
    location: '어깨 옆쪽, 어깨 관절 바깥 부분',
  },
  후삼각근: {
    description:
      '어깨의 뒷부분을 감싸는 근육입니다. 팔을 뒤로 당기거나, 팔을 벌려 뒤로 보내는 동작에 사용됩니다.',
    exercises: '리버스 플라이, 페이스 풀, 벤트오버 레터럴 레이즈',
    image: getAssetSource('muscles/rear-deltoid.png'),
    label: '후삼각근 (뒤 어깨)',
    location: '어깨 뒤쪽, 등 상단과 연결되는 부분',
  },
  상완이두근: {
    description:
      "흔히 '알통'이라고 부르는 근육입니다. 팔꿈치를 구부리거나 손바닥을 위로 돌리는 동작에 사용됩니다.",
    exercises: '바벨 컬, 덤벨 컬, 해머 컬, 프리처 컬',
    image: getAssetSource('muscles/biceps.png'),
    label: '상완이두근 (이두근)',
    location: '팔 앞쪽 윗부분, 어깨와 팔꿈치 사이',
  },
  상완삼두근: {
    description:
      '팔 뒤쪽에 위치한 근육으로, 이두근의 반대편입니다. 팔꿈치를 펴는 동작에 사용되며, 팔 전체 근육의 약 2/3를 차지합니다.',
    exercises: '트라이셉스 익스텐션, 딥스, 클로즈그립 벤치프레스, 킥백',
    image: getAssetSource('muscles/triceps.png'),
    label: '상완삼두근 (삼두근)',
    location: '팔 뒤쪽 윗부분, 어깨와 팔꿈치 사이',
  },
  대퇴사두근: {
    description:
      '허벅지 앞쪽의 4개 근육 묶음입니다. 무릎을 펴는 동작의 주요 근육이며, 걷기, 달리기, 점프, 계단 오르기 등 일상 동작의 핵심입니다.',
    exercises: '스쿼트, 레그 프레스, 레그 익스텐션, 런지',
    image: getAssetSource('muscles/quads.png'),
    label: '대퇴사두근 (앞 허벅지)',
    location: '허벅지 앞쪽 전체, 골반에서 무릎까지',
  },
  대퇴이두근: {
    description:
      '허벅지 뒤쪽에 위치한 근육 그룹(햄스트링)입니다. 무릎을 구부리고 엉덩이를 펴는 동작에 사용됩니다. 달리기에서 특히 중요합니다.',
    exercises: '루마니안 데드리프트, 레그 컬, 글루트-햄 레이즈',
    image: getAssetSource('muscles/hamstrings.png'),
    label: '대퇴이두근 (뒤 허벅지)',
    location: '허벅지 뒤쪽 전체, 엉덩이 아래에서 무릎 뒤까지',
  },
  둔근: {
    description:
      '인체에서 가장 크고 강한 근육 중 하나입니다. 엉덩이를 펴거나, 다리를 옆/뒤로 움직이는 동작에 사용됩니다. 바른 자세 유지에 매우 중요합니다.',
    exercises: '힙 스러스트, 스쿼트, 불가리안 스플릿 스쿼트, 글루트 브릿지',
    image: getAssetSource('muscles/glutes.png'),
    label: '둔근 (엉덩이)',
    location: '엉덩이 전체, 골반 뒤쪽을 감싸는 부위',
  },
  내전근: {
    description:
      '허벅지 안쪽에 위치한 근육 그룹입니다. 다리를 안쪽으로 모으는 동작에 사용됩니다. 골반 안정성과 균형 유지에 중요합니다.',
    exercises: '어덕션 머신, 코펜하겐 플랭크, 와이드 스쿼트, 사이드 런지',
    image: getAssetSource('muscles/adductors.png'),
    label: '내전근 (허벅지 안쪽)',
    location: '허벅지 안쪽, 사타구니에서 무릎 안쪽까지',
  },
  복근: {
    description:
      "배 앞면을 세로로 길게 덮고 있는 근육입니다. 흔히 '식스팩'이라 불리며, 몸을 앞으로 구부리거나 호흡할 때 사용됩니다. 코어 안정성의 핵심입니다.",
    exercises: '크런치, 레그 레이즈, 플랭크, 행잉 니레이즈',
    image: getAssetSource('muscles/abs.png'),
    label: '복근 (복직근)',
    location: '배 앞쪽 전체, 가슴뼈 아래에서 골반까지',
  },
  허리: {
    description:
      '척추를 따라 길게 이어지는 근육으로, 특히 허리 부분이 중요합니다. 상체를 세우고 바른 자세를 유지하는 데 핵심적인 역할을 합니다.',
    exercises: '백 익스텐션, 데드리프트, 굿모닝, 슈퍼맨',
    image: getAssetSource('muscles/lower-back.png'),
    label: '허리 (척추기립근)',
    location: '등 하부, 척추 양쪽을 따라 길게 이어지는 부위',
  },
  종아리: {
    description:
      '무릎 아래 다리 뒤쪽에 위치한 근육입니다. 발끝으로 서거나 걷고 달릴 때 바닥을 밀어내는 동작에 사용됩니다.',
    exercises: '카프 레이즈, 시티드 카프 레이즈, 점프 로프',
    image: getAssetSource('muscles/calves.png'),
    label: '종아리 (비복근/가자미근)',
    location: '무릎 아래 다리 뒤쪽, 무릎 뒤에서 발꿈치까지',
  },
};
