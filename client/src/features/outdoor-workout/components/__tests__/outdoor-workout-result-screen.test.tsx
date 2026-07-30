import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { useCreateManualWorkoutRecord } from 'features/workout-records/api/workout-records';
import { useOutdoorWorkoutStore } from '../../stores/use-outdoor-workout-store';
import { OutdoorWorkoutResultScreen } from '../outdoor-workout-result-screen';

const mockGoBack = jest.fn();

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: jest.fn(),
  }),
}));

jest.mock('features/workout-records/api/workout-records', () => ({
  useCreateManualWorkoutRecord: jest.fn(),
}));

const PLAN_RESULT = {
  elevationPoints: [
    { elevation: 10, lat: 37.5, lng: 126.9, point: 0 },
    { elevation: 25, lat: 37.51, lng: 126.91, point: 1 },
  ],
  locationName: '서초동',
  plan: {
    difficulty: '보통',
    elevationGain: '24m',
    estimatedCalories: '110kcal',
    estimatedTime: '22분',
    generalTips: ['물을 충분히 마셔요.'],
    routeType: '걷기/러닝 코스',
    segments: [
      {
        breathingTip: '천천히 호흡해요.',
        difficulty: '쉬움',
        distance: '0.4',
        elevationChange: '+5m',
        name: '워밍업 구간',
        restRecommendation: '필요하면 잠깐 쉬어요.',
        terrainType: '평지',
      },
    ],
    summary: '완만한 산책 코스예요.',
    totalDistance: '1.4',
  },
  workoutMode: 'walking' as const,
};

describe('야외운동 결과 화면', () => {
  const mockedUseCreateManualWorkoutRecord = jest.mocked(
    useCreateManualWorkoutRecord,
  );
  const mutateAsync = jest.fn(async () => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    useOutdoorWorkoutStore.setState({ planResult: PLAN_RESULT });
    mockedUseCreateManualWorkoutRecord.mockReturnValue({
      isPending: false,
      mutateAsync,
    } as never);
  });

  it('원본 compact 결과 카드와 4칸 통계를 표시한다', () => {
    render(
      <OutdoorWorkoutResultScreen contentBottomInset={184} tabBarHeight={84} />,
    );

    expect(screen.getByText('야외운동')).toHaveStyle({
      fontFamily: 'Pretendard-Medium',
      fontSize: 18,
    });
    expect(screen.getByText('코스 요약')).toBeTruthy();
    expect(screen.getByText('거리')).toBeTruthy();
    expect(screen.getByText('소요시간')).toBeTruthy();
    expect(screen.getByText('칼로리')).toBeTruthy();
    expect(screen.getByText('고도차')).toBeTruthy();
    expect(screen.getByText('코스 고도 그래프')).toBeTruthy();
    expect(screen.getByText('워밍업 구간')).toBeTruthy();
  });

  it('운동 시작을 누르면 원본 dark overlay 카운트다운을 표시한다', () => {
    render(
      <OutdoorWorkoutResultScreen contentBottomInset={184} tabBarHeight={84} />,
    );

    fireEvent.press(screen.getByText('운동시작'));

    expect(screen.getByText('3')).toHaveStyle({
      color: '#FFFFFF',
      fontFamily: 'Pretendard-Medium',
      fontSize: 42,
    });
    expect(screen.queryByText('기록 저장')).toBeNull();
  });

  it('기록 저장 완료 상태를 원본 green CTA로 전환한다', async () => {
    render(
      <OutdoorWorkoutResultScreen contentBottomInset={184} tabBarHeight={84} />,
    );

    fireEvent.press(screen.getByText('기록 저장'));

    await waitFor(() => {
      expect(screen.getByText('기록 저장 완료')).toBeTruthy();
    });
    expect(mutateAsync).toHaveBeenCalledTimes(1);
  });
});
