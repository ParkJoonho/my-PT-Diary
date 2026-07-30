import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockToggleLike = jest.fn(async () => ({ liked: true }));
const mockCreateConnectRequest = jest.fn();

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
}));

jest.mock('@granite-js/native/react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('shared/components/icons/pt-diary-icons', () => {
  const { Text } = require('react-native');

  return {
    AIInfoIcon: () => <Text>icon:aiInfo</Text>,
    OriginalAppIcon: ({ name }: { name: string }) => (
      <Text>{`icon:${name}`}</Text>
    ),
    SemanticIcon: ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text>,
  };
});

jest.mock('shared/components/tab-page-layout', () => ({
  TabPageLayout: ({
    children,
  }: {
    children: (metrics: {
      contentBottomInset: number;
      floatingActionBottomInset: number;
      tabBarHeight: number;
    }) => ReactNode;
  }) =>
    children({
      contentBottomInset: 84,
      floatingActionBottomInset: 76,
      tabBarHeight: 60,
    }),
}));

jest.mock('../../api/trainers', () => ({
  useCreateTrainerConnectRequest: () => ({
    isPending: false,
    mutateAsync: mockCreateConnectRequest,
  }),
  useRecommendedTrainers: () => ({
    data: [
      {
        avatarColor: '#1B2A4A',
        bio: '근력 향상과 체형 교정을 함께 보는 정밀 코칭을 제공합니다.',
        career: '선수 출신, 웨이트 트레이닝 8년 지도',
        certifications: ['NSCA-CPT'],
        connectRequestStatus: null,
        experienceYears: 8,
        focusBodyParts: ['등', '어깨'],
        gymName: '강남 피트니스 클럽',
        highlightTag: '체형 교정 적합',
        id: 'trainer-1',
        liked: false,
        matchReason: '현재 기록과 잘 맞아요.',
        matchScore: 91,
        memberCount: 20,
        name: '김민준',
        onlineAvailable: true,
        philosophy: '기록과 자세를 같이 봐요.',
        pricePerSession: '70,000원',
        rating: 4.9,
        region: '강남',
        specialties: ['근력 향상', '체형 교정'],
      },
    ],
  }),
  useSetTrainerLike: () => ({
    mutateAsync: mockToggleLike,
  }),
  useTrainers: () => ({
    data: [
      {
        avatarColor: '#1B2A4A',
        bio: '근력 향상과 체형 교정을 함께 보는 정밀 코칭을 제공합니다.',
        career: '선수 출신, 웨이트 트레이닝 8년 지도',
        certifications: ['NSCA-CPT'],
        connectRequestStatus: null,
        experienceYears: 8,
        focusBodyParts: ['등', '어깨'],
        gymName: '강남 피트니스 클럽',
        id: 'trainer-1',
        liked: false,
        memberCount: 20,
        name: '김민준',
        onlineAvailable: true,
        philosophy: '기록과 자세를 같이 봐요.',
        pricePerSession: '70,000원',
        rating: 4.9,
        region: '강남',
        specialties: ['근력 향상', '체형 교정'],
      },
      {
        avatarColor: '#34C759',
        bio: '회복 중심 코칭을 제공합니다.',
        career: '재활 운동 지도 12년',
        certifications: ['물리치료사'],
        connectRequestStatus: null,
        experienceYears: 12,
        focusBodyParts: ['코어'],
        gymName: '용산 스포츠 센터',
        id: 'trainer-2',
        liked: true,
        memberCount: 16,
        name: '박지훈',
        onlineAvailable: false,
        philosophy: '움직임 패턴을 바꿔 회복합니다.',
        pricePerSession: '80,000원',
        rating: 5,
        region: '용산',
        specialties: ['재활 운동'],
      },
      {
        avatarColor: '#AF52DE',
        bio: '기능성 움직임과 밸런스 회복을 돕습니다.',
        career: '기능성 트레이닝 6년 지도',
        certifications: ['FMS 레벨2', '임산부 전문'],
        connectRequestStatus: null,
        experienceYears: 6,
        focusBodyParts: ['코어', '전신', '힙'],
        gymName: '마포 짐',
        id: 'trainer-3',
        liked: false,
        memberCount: 11,
        name: '최유나',
        onlineAvailable: true,
        philosophy: '움직임의 질을 먼저 세웁니다.',
        pricePerSession: '55,000원',
        rating: 4.7,
        region: '마포',
        specialties: ['기능성 운동', '밸런스'],
      },
    ],
  }),
}));

const { TrainerMatchScreen } = require('../trainer-match-screen');

describe('트레이너 추천 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('스크롤 가능한 화면 안에 트레이너 목록을 렌더링한다', () => {
    const rendered = render(<TrainerMatchScreen />);

    expect(screen.getByText('AI 트레이너 추천')).toBeTruthy();
    expect(screen.queryByText('AI 추천 트레이너')).toBeNull();
    expect(screen.getByText('김민준')).toBeTruthy();
    expect(screen.getByText('박지훈')).toBeTruthy();
    expect(rendered.UNSAFE_getAllByType(ScrollView).length).toBeGreaterThan(0);
  });

  it('원본 카드처럼 경력과 자격 뱃지를 목록에 표시한다', () => {
    render(<TrainerMatchScreen />);

    expect(screen.getByText('경력 6년')).toBeTruthy();
    expect(screen.getByText('FMS 레벨2')).toBeTruthy();
    expect(screen.getByText('임산부 전문')).toBeTruthy();
    expect(screen.getAllByText('icon:star')).toHaveLength(3);
    expect(screen.getAllByText('icon:timeOutline')).toHaveLength(3);
    expect(screen.getAllByText('icon:heartOutline')).toHaveLength(2);
    expect(screen.getByText('icon:heart')).toBeTruthy();
  });

  it('찜 버튼을 누르면 서버 토글 mutation을 호출한다', async () => {
    render(<TrainerMatchScreen />);

    fireEvent.press(screen.getByLabelText('김민준 찜'));

    await waitFor(() => {
      expect(mockToggleLike).toHaveBeenCalledWith({
        payload: { liked: true },
        trainerId: 'trainer-1',
      });
    });
  });

  it('정렬 메뉴와 AI 추천 카드에 원본 icon affordance를 표시한다', () => {
    render(<TrainerMatchScreen />);

    fireEvent.press(screen.getByText('기본순'));
    expect(screen.getByText('icon:chevronUp')).toBeTruthy();
    expect(screen.getByText('icon:checkmark')).toBeTruthy();

    fireEvent.press(screen.getByText('AI 추천순'));
    expect(screen.getByText('icon:lightningBolt')).toBeTruthy();
    expect(screen.getByText('91점')).toBeTruthy();
  });

  it('카드를 누르면 원본 결함을 보완한 상세 bottom sheet를 연다', () => {
    render(<TrainerMatchScreen />);

    fireEvent.press(screen.getByText('김민준'));

    expect(screen.getByText('PT 비용')).toBeTruthy();
    expect(screen.getByText('PT 신청하기')).toBeTruthy();
    expect(screen.getByLabelText('트레이너 상세 닫기')).toBeTruthy();
  });
});
