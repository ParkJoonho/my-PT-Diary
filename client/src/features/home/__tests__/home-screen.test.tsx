import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import type { WeeklyTrackerSummaryDto } from 'shared/api/generated/models';
import { useWeeklyTrackerSummary } from 'shared/api/weekly-tracker';
import { HomeScreen } from '../components/home-screen';

const mockNavigation = {
  navigate: jest.fn(),
};

jest.mock('@granite-js/react-native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('shared/components/tab-page-layout', () => ({
  TabPageLayout: ({
    children,
  }: {
    children: (metrics: {
      contentBottomInset: number;
      floatingActionBottomInset: number;
      tabBarHeight: number;
    }) => ReactNode;
  }) => {
    return children({
      contentBottomInset: 120,
      floatingActionBottomInset: 76,
      tabBarHeight: 60,
    });
  },
}));

jest.mock('../components/quick-action-card', () => ({
  QuickActionCard: ({
    onPress,
    title,
  }: {
    onPress?: () => void;
    title: string;
  }) => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');

    return React.createElement(
      Pressable,
      { onPress },
      React.createElement(Text, null, title),
    );
  },
}));

jest.mock('features/workout-routines/components/routine-card', () => ({
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
};

describe('홈 화면 주간 트래커 연동', () => {
  const mockedUseWeeklyTrackerSummary = jest.mocked(useWeeklyTrackerSummary);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('서버 요약 데이터를 받아 스트릭과 요일 상태를 표시한다', () => {
    mockedUseWeeklyTrackerSummary.mockReturnValue({
      data: 기본주간요약,
    } as ReturnType<typeof useWeeklyTrackerSummary>);

    render(<HomeScreen />);

    expect(screen.getByText('주간 트래커')).toBeTruthy();
    expect(screen.getByText('2일 연속')).toBeTruthy();
    expect(screen.queryByText('미구현')).toBeNull();
  });

  it('조회 실패 시 오류 문구를 표시한다', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockedUseWeeklyTrackerSummary.mockImplementation(() => {
      throw new Error('요청 실패');
    });

    render(<HomeScreen />);

    expect(screen.getByText('주간 데이터를 불러오지 못했어요.')).toBeTruthy();
  });

  it('조회 중에는 Suspense fallback을 보여준다', () => {
    mockedUseWeeklyTrackerSummary.mockImplementation(() => {
      throw new Promise<never>(() => undefined);
    });

    render(<HomeScreen />);

    expect(screen.queryByText('주간 트래커')).toBeNull();
    expect(screen.getByText('루틴 선택')).toBeTruthy();
  });

  it('운동배우기 카드를 누르면 운동 배우기 화면으로 이동한다', () => {
    mockedUseWeeklyTrackerSummary.mockReturnValue({
      data: 기본주간요약,
    } as ReturnType<typeof useWeeklyTrackerSummary>);

    render(<HomeScreen />);

    fireEvent.press(screen.getByText('운동배우기'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith({
      name: '/exercise-guide',
      params: {},
    });
  });

  it('야외운동 카드를 누르면 야외운동 화면으로 이동한다', () => {
    mockedUseWeeklyTrackerSummary.mockReturnValue({
      data: 기본주간요약,
    } as ReturnType<typeof useWeeklyTrackerSummary>);

    render(<HomeScreen />);

    fireEvent.press(screen.getByText('야외운동'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith({
      name: '/outdoor-workout',
      params: {},
    });
  });
});
