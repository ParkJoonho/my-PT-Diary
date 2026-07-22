import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import type {
  QueryObserverLoadingErrorResult,
  QueryObserverPendingResult,
  QueryObserverSuccessResult,
} from '@tanstack/react-query';
import type { WeeklyTrackerSummaryDto } from 'shared/api/generated/models';
import { useWeeklyTrackerSummary } from 'shared/api/weekly-tracker';
import { HomeScreen } from '../components/home-screen';

jest.mock('../components/home-tab-bar', () => ({
  HomeTabBar: () => {
    const React = require('react');
    const { Text } = require('react-native');

    return React.createElement(Text, null, '하단 탭바');
  },
}));

jest.mock('../components/quick-action-card', () => ({
  QuickActionCard: ({ title }: { title: string }) => {
    const React = require('react');
    const { Text } = require('react-native');

    return React.createElement(Text, null, title);
  },
}));

jest.mock('../components/routine-card', () => ({
  RoutineCard: () => {
    const React = require('react');
    const { Text } = require('react-native');

    return React.createElement(Text, null, '루틴 선택');
  },
}));

jest.mock('shared/api/weekly-tracker', () => ({
  useWeeklyTrackerSummary: jest.fn(),
}));

const 기본주간요약: WeeklyTrackerSummaryDto = {
  days: [],
  referenceDate: '2026-07-22',
  streakCount: 0,
  totalCompletedDays: 0,
  weekEndDate: '2026-07-26',
  weekStartDate: '2026-07-20',
};

function createSuccessQueryResult(
  data: WeeklyTrackerSummaryDto,
): QueryObserverSuccessResult<WeeklyTrackerSummaryDto, Error> {
  return {
    data,
    error: null,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    fetchStatus: 'idle',
    isError: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isLoading: false,
    isLoadingError: false,
    isPaused: false,
    isPending: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: true,
    promise: Promise.resolve(data),
    refetch: async () => createSuccessQueryResult(data),
    status: 'success',
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    isEnabled: true,
  };
}

function createErrorQueryResult(
  error: Error,
): QueryObserverLoadingErrorResult<WeeklyTrackerSummaryDto, Error> {
  return {
    data: undefined,
    error,
    failureCount: 1,
    failureReason: error,
    errorUpdateCount: 1,
    fetchStatus: 'idle',
    isError: true,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isLoading: false,
    isLoadingError: true,
    isPaused: false,
    isPending: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: true,
    isSuccess: false,
    promise: Promise.resolve(기본주간요약),
    refetch: async () => createErrorQueryResult(error),
    status: 'error',
    dataUpdatedAt: 0,
    errorUpdatedAt: Date.now(),
    isEnabled: true,
  };
}

function createPendingQueryResult(): QueryObserverPendingResult<
  WeeklyTrackerSummaryDto,
  Error
> {
  return {
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    fetchStatus: 'fetching',
    isError: false,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: true,
    isInitialLoading: true,
    isLoading: true,
    isLoadingError: false,
    isPaused: false,
    isPending: true,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: true,
    isSuccess: false,
    promise: Promise.resolve(기본주간요약),
    refetch: async () => createPendingQueryResult(),
    status: 'pending',
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    isEnabled: true,
  };
}

describe('홈 화면 주간 트래커 연동', () => {
  const mockedUseWeeklyTrackerSummary = jest.mocked(
    useWeeklyTrackerSummary,
  ) as jest.MockedFunction<
    typeof useWeeklyTrackerSummary
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('서버 요약 데이터를 받아 스트릭과 요일 상태를 표시한다', () => {
    mockedUseWeeklyTrackerSummary.mockReturnValue(
      createSuccessQueryResult({
        days: [
          { completed: true, completionCount: 1, date: '2026-07-20', label: '월' },
          { completed: true, completionCount: 1, date: '2026-07-21', label: '화' },
          { completed: false, completionCount: 0, date: '2026-07-22', label: '수' },
          { completed: false, completionCount: 0, date: '2026-07-23', label: '목' },
          { completed: false, completionCount: 0, date: '2026-07-24', label: '금' },
          { completed: false, completionCount: 0, date: '2026-07-25', label: '토' },
          { completed: false, completionCount: 0, date: '2026-07-26', label: '일' },
        ],
        referenceDate: '2026-07-22',
        streakCount: 2,
        totalCompletedDays: 2,
        weekEndDate: '2026-07-26',
        weekStartDate: '2026-07-20',
      }),
    );

    render(<HomeScreen />);

    expect(screen.getByText('주간 트래커')).toBeTruthy();
    expect(screen.getByText('2일 연속')).toBeTruthy();
    expect(screen.queryByText('미구현')).toBeNull();
  });

  it('조회 실패 시 오류 문구를 표시한다', () => {
    mockedUseWeeklyTrackerSummary.mockReturnValue(
      createErrorQueryResult(new Error('요청 실패')),
    );

    render(<HomeScreen />);

    expect(screen.getByText('주간 데이터를 불러오지 못했어요.')).toBeTruthy();
  });

  it('조회 중에는 로딩 표시를 보여준다', () => {
    mockedUseWeeklyTrackerSummary.mockReturnValue(createPendingQueryResult());

    render(<HomeScreen />);

    expect(screen.queryByText('주간 트래커')).toBeNull();
    expect(screen.getByText('루틴 선택')).toBeTruthy();
  });
});
