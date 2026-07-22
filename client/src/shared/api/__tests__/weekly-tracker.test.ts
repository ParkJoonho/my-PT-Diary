import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  weeklyTrackerControllerGetWeeklyTrackerSummary,
} from '../generated/endpoints/weekly-tracker/weekly-tracker';
import { getTrackerUserKey } from '../user-key';
import { fetchWeeklyTrackerSummary } from '../weekly-tracker';

jest.mock('../generated/endpoints/weekly-tracker/weekly-tracker', () => ({
  weeklyTrackerControllerGetWeeklyTrackerSummary: jest.fn(),
}));

jest.mock('../user-key', () => ({
  getTrackerUserKey: jest.fn(),
}));

describe('주간 트래커 API 래퍼', () => {
  const mockedGetTrackerUserKey = jest.mocked(getTrackerUserKey);
  const mockedGetWeeklyTrackerSummary = jest.mocked(
    weeklyTrackerControllerGetWeeklyTrackerSummary,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('사용자 키 헤더를 붙여 주간 요약을 요청한다', async () => {
    mockedGetTrackerUserKey.mockResolvedValue('테스트-사용자');
    mockedGetWeeklyTrackerSummary.mockResolvedValue({
      data: {
        days: [],
        referenceDate: '2026-07-22',
        streakCount: 0,
        totalCompletedDays: 0,
        weekEndDate: '2026-07-26',
        weekStartDate: '2026-07-20',
      },
      headers: new Headers(),
      status: 200,
    });

    const result = await fetchWeeklyTrackerSummary();

    expect(mockedGetWeeklyTrackerSummary).toHaveBeenCalledWith(undefined, {
      headers: {
        'x-user-key': '테스트-사용자',
      },
    });
    expect(result.referenceDate).toBe('2026-07-22');
  });

  it('성공 응답이 아니면 오류를 던진다', async () => {
    mockedGetTrackerUserKey.mockResolvedValue('테스트-사용자');
    mockedGetWeeklyTrackerSummary.mockResolvedValue({
      data: undefined,
      headers: new Headers(),
      status: 400,
    });

    await expect(fetchWeeklyTrackerSummary()).rejects.toThrow(
      'Weekly tracker summary request failed.',
    );
  });
});
