import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { useAnalysisRecords } from 'features/body-analysis/api/analysis-records';
import { useCreateOutdoorWorkoutPlan } from '../../api/outdoor-workout';
import { getCurrentLocation } from '../../lib/get-current-location';
import { OutdoorWorkoutScreen } from '../outdoor-workout-screen';

const mockNavigate = jest.fn();

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: mockNavigate,
  }),
}));

jest.mock('features/body-analysis/api/analysis-records', () => ({
  useAnalysisRecords: jest.fn(),
}));

jest.mock('../../api/outdoor-workout', () => ({
  useCreateOutdoorWorkoutPlan: jest.fn(),
}));

jest.mock('../../lib/get-current-location', () => ({
  getCurrentLocation: jest.fn(),
  getLocationDisplayName: (location: { isFallback: boolean }) =>
    location.isFallback ? '서초동' : '내 위치',
}));

jest.mock('../../lib/fetch-elevation-data', () => ({
  fetchElevationData: jest.fn(async () => []),
}));

describe('야외운동 설정 화면', () => {
  const mockedUseAnalysisRecords = jest.mocked(useAnalysisRecords);
  const mockedUseCreateOutdoorWorkoutPlan = jest.mocked(
    useCreateOutdoorWorkoutPlan,
  );
  const mockedGetCurrentLocation = jest.mocked(getCurrentLocation);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetCurrentLocation.mockResolvedValue({
      accuracy: 10,
      isFallback: false,
      latitude: 37.5665,
      longitude: 126.978,
    });
    mockedUseCreateOutdoorWorkoutPlan.mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    } as never);
    mockedUseAnalysisRecords.mockReturnValue({ data: [] } as never);
  });

  it('원본 page title, 위치 row, inset segmented control 문구를 표시한다', async () => {
    render(<OutdoorWorkoutScreen contentBottomInset={100} />);

    await waitFor(() => {
      expect(screen.getByText('내 위치')).toBeTruthy();
    });

    expect(screen.getByText('야외운동')).toBeTruthy();
    expect(screen.queryByText('뒤로')).toBeNull();
    expect(screen.queryByText('닫기')).toBeNull();
    expect(screen.getByText('걷기/러닝')).toBeTruthy();
    expect(screen.getByText('등산')).toBeTruthy();
    expect(screen.getByText('1km')).toBeTruthy();
    expect(screen.getByText('2km')).toBeTruthy();
    expect(screen.getByText('3km')).toBeTruthy();
  });

  it('체형 분석이 없으면 실제 분석 라우트로 이동한다', async () => {
    render(<OutdoorWorkoutScreen contentBottomInset={100} />);

    await waitFor(() => {
      expect(screen.getByText('내 체형 분석하기')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('내 체형 분석하기'));

    expect(mockNavigate).toHaveBeenCalledWith({
      name: '/ai-analysis',
      params: {},
    });
  });

  it('최근 체형 분석이 있으면 원본 개인화 안내를 표시한다', async () => {
    mockedUseAnalysisRecords.mockReturnValue({
      data: [
        {
          analysisType: 'body',
          analyzedAt: '2026-07-30T10:00:00.000Z',
          createdAt: '2026-07-30T10:00:00.000Z',
          id: 'analysis-1',
          qualitativeData: {
            bodyType: 'V',
            bodyTypeDescription: '상체 발달형 체형',
          },
        },
      ],
    } as never);

    render(<OutdoorWorkoutScreen contentBottomInset={100} />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'AI 체형 분석 결과 상체(V) 체형에 가까워요. 코스 설계에 반영할게요.',
        ),
      ).toBeTruthy();
    });
  });

  it('위치 획득 실패 fallback이면 서초동을 표시한다', async () => {
    mockedGetCurrentLocation.mockResolvedValue({
      accuracy: 10,
      isFallback: true,
      latitude: 37.5665,
      longitude: 126.978,
    });

    render(<OutdoorWorkoutScreen contentBottomInset={100} />);

    await waitFor(() => {
      expect(screen.getByText('서초동')).toBeTruthy();
    });
  });
});
