import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import {
  useWeeklyTrackerControllerGetWeeklyTrackerSummarySuspense,
} from '../generated/endpoints/weekly-tracker/weekly-tracker';
import type { WeeklyTrackerSummaryDto } from '../generated/models';
import { getClientTodayDate } from '../../lib/date';
import { useTrackerUserKey } from '../user-key';
import {
  selectWeeklyTrackerSummary,
  useWeeklyTrackerSummary,
} from '../weekly-tracker';

jest.mock('../generated/endpoints/weekly-tracker/weekly-tracker', () => ({
  useWeeklyTrackerControllerGetWeeklyTrackerSummarySuspense: jest.fn(),
}));

jest.mock('../user-key', () => ({
  useTrackerUserKey: jest.fn(),
}));

jest.mock('../../lib/date', () => ({
  getClientTodayDate: jest.fn(),
}));

const 주간요약: WeeklyTrackerSummaryDto = {
  days: [],
  referenceDate: '2026-07-22',
  streakCount: 0,
  totalCompletedDays: 0,
  weekEndDate: '2026-07-26',
  weekStartDate: '2026-07-20',
};

describe('주간 트래커 API 래퍼', () => {
  const mockedUseTrackerUserKey = jest.mocked(useTrackerUserKey);
  const mockedUseWeeklyTrackerSummarySuspense = jest.mocked(
    useWeeklyTrackerControllerGetWeeklyTrackerSummarySuspense,
  );
  const mockedGetClientTodayDate = jest.mocked(getClientTodayDate);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetClientTodayDate.mockReturnValue('2026-07-23');
  });

  it('사용자 키 헤더와 클라이언트 기준일로 Orval Suspense Query 훅을 호출한다', () => {
    mockedUseTrackerUserKey.mockReturnValue('테스트-사용자');
    mockedUseWeeklyTrackerSummarySuspense.mockReturnValue({
      data: 주간요약,
    } as ReturnType<
      typeof useWeeklyTrackerControllerGetWeeklyTrackerSummarySuspense<
        WeeklyTrackerSummaryDto,
        Error
      >
    >);

    const { result } = renderHook(() => useWeeklyTrackerSummary());

    expect(result.current.data).toEqual(주간요약);
    expect(mockedUseWeeklyTrackerSummarySuspense).toHaveBeenCalledWith(
      { referenceDate: '2026-07-23' },
      {
        fetch: {
          headers: {
            'x-user-key': '테스트-사용자',
          },
        },
        query: {
          queryKey: ['weekly-tracker', '테스트-사용자', '2026-07-23'],
          select: selectWeeklyTrackerSummary,
        },
      },
    );
  });

  it('성공 응답에서 주간 요약 데이터를 선택한다', () => {
    expect(
      selectWeeklyTrackerSummary({
        data: 주간요약,
        headers: new Headers(),
        status: 200,
      }),
    ).toEqual(주간요약);
  });

  it('성공 응답이 아니면 오류를 던진다', () => {
    expect(() =>
      selectWeeklyTrackerSummary({
        data: undefined,
        headers: new Headers(),
        status: 400,
      }),
    ).toThrow('Weekly tracker summary request failed.');
  });
});
