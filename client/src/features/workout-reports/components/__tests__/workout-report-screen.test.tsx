import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { WorkoutReportSummaryDto } from 'shared/api/generated/models';
import { useWorkoutReportSummary } from '../../api/workout-report-summary';
import { WorkoutReportScreen } from '../workout-report-screen';

const mockGoBack = jest.fn();

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

jest.mock('../../api/workout-report-summary', () => ({
  useWorkoutReportSummary: jest.fn(),
}));

jest.mock('../workout-report-chart-section', () => {
  const { Text } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    WorkoutReportChartSection: () => <Text>리포트 차트</Text>,
  };
});

jest.mock('shared/components/icons/pt-diary-icons', () => {
  const { Text } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    OriginalAppIcon: ({ name }: { name: string }) => (
      <Text>{`icon:${name}`}</Text>
    ),
    SemanticIcon: ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text>,
  };
});

const 리포트요약: WorkoutReportSummaryDto = {
  bodyCompositionTrend: [],
  condition: {
    averageConditionScore: 4,
    averageSorenessScore: 2,
  },
  conditionTrend: [],
  currentWeek: {
    weekEndDate: '2026-07-25',
    weekStartDate: '2026-07-19',
    workoutDayCount: 2,
    workoutRecordCount: 3,
  },
  manualTotals: {
    totalVolumeKg: 1260,
    workoutRecordCount: 2,
  },
  referenceDate: '2026-07-23',
  totals: {
    cardioDurationSeconds: 900,
    conditionRecordCount: 4,
    durationSeconds: 3600,
    totalVolumeKg: 1260,
    workoutDayCount: 2,
    workoutRecordCount: 12,
  },
  volumeTrend: [],
  weeklyFrequency: [],
  weightTrend: [],
};

describe('운동 리포트 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(useWorkoutReportSummary)
      .mockReturnValue({ data: 리포트요약 } as never);
  });

  it('원본 header와 의미 기반 summary 아이콘을 표시한다', () => {
    render(<WorkoutReportScreen contentBottomInset={80} />);

    expect(screen.getByText('피트니스 프로그레스')).toBeTruthy();
    expect(screen.getByText('icon:chevronLeft')).toBeTruthy();
    expect(screen.getByText('icon:fitness')).toBeTruthy();
    expect(screen.getByText('icon:weightLifter')).toBeTruthy();
    expect(screen.getByText('icon:calendar')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('1.3k')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.queryByText('닫기')).toBeNull();
  });

  it('뒤로가기 아이콘을 누르면 이전 화면으로 이동한다', () => {
    render(<WorkoutReportScreen contentBottomInset={80} />);

    fireEvent.press(screen.getByText('icon:chevronLeft'));

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('데이터 로딩 중에도 고정 header와 원본 로딩 문구를 유지한다', () => {
    jest.mocked(useWorkoutReportSummary).mockImplementation(() => {
      throw new Promise(() => undefined);
    });

    render(<WorkoutReportScreen contentBottomInset={80} />);

    expect(screen.getByText('피트니스 프로그레스')).toBeTruthy();
    expect(screen.getByText('데이터 로딩 중...')).toBeTruthy();
    expect(screen.queryByText('총 운동 횟수')).toBeNull();
  });
});
