import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { useSuspenseQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import {
  workoutReportsControllerGetSummary,
  type workoutReportsControllerGetSummaryResponse,
} from 'shared/api/generated/endpoints/workout-reports/workout-reports';
import type { WorkoutReportSummaryDto } from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';
import { getClientTodayDate } from 'shared/lib/date';
import {
  getWorkoutReportSummaryQueryKey,
  selectWorkoutReportSummary,
  useWorkoutReportSummary,
} from '../workout-report-summary';

jest.mock('@tanstack/react-query', () => ({
  useSuspenseQuery: jest.fn((options) => options),
}));

jest.mock(
  'shared/api/generated/endpoints/workout-reports/workout-reports',
  () => ({
    workoutReportsControllerGetSummary: jest.fn(),
  }),
);

jest.mock('shared/api/user-key', () => ({
  useTrackerUserKey: jest.fn(),
}));

jest.mock('shared/lib/date', () => ({
  getClientTodayDate: jest.fn(),
}));

const 리포트요약: WorkoutReportSummaryDto = {
  condition: {
    averageConditionScore: 4,
    averageSorenessScore: 2,
  },
  currentWeek: {
    weekEndDate: '2026-07-26',
    weekStartDate: '2026-07-20',
    workoutDayCount: 2,
    workoutRecordCount: 3,
  },
  referenceDate: '2026-07-23',
  totals: {
    cardioDurationSeconds: 900,
    conditionRecordCount: 1,
    durationSeconds: 3600,
    totalVolumeKg: 1160,
    workoutDayCount: 2,
    workoutRecordCount: 3,
  },
  weeklyFrequency: [],
};

describe('운동 리포트 API wrapper', () => {
  const mockedUseSuspenseQuery = jest.mocked(useSuspenseQuery);
  const mockedUseTrackerUserKey = jest.mocked(useTrackerUserKey);
  const mockedGetClientTodayDate = jest.mocked(getClientTodayDate);
  const mockedGetSummary = jest.mocked(workoutReportsControllerGetSummary);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTrackerUserKey.mockReturnValue('테스트-사용자');
    mockedGetClientTodayDate.mockReturnValue('2026-07-23');
    mockedGetSummary.mockResolvedValue({
      data: 리포트요약,
      headers: new Headers(),
      status: 200,
    });
  });

  it('클라이언트 기준일과 사용자 키 헤더로 리포트 요약을 조회한다', async () => {
    renderHook(() => useWorkoutReportSummary());

    const options = mockedUseSuspenseQuery.mock.calls[0]?.[0];

    expect(options?.queryKey).toEqual(
      getWorkoutReportSummaryQueryKey('테스트-사용자', '2026-07-23'),
    );

    await options?.queryFn?.({} as never);

    expect(mockedGetSummary).toHaveBeenCalledWith(
      { referenceDate: '2026-07-23' },
      {
        headers: {
          'x-user-key': '테스트-사용자',
        },
      },
    );
  });

  it('성공 응답에서 리포트 DTO를 선택한다', () => {
    expect(
      selectWorkoutReportSummary({
        data: 리포트요약,
        headers: new Headers(),
        status: 200,
      }),
    ).toEqual(리포트요약);
  });

  it('성공 응답이 아니면 오류를 던진다', () => {
    expect(() =>
      selectWorkoutReportSummary({
        data: undefined,
        headers: new Headers(),
        status: 400,
      } satisfies workoutReportsControllerGetSummaryResponse),
    ).toThrow('운동 리포트 요약 조회에 실패했어요.');
  });
});
