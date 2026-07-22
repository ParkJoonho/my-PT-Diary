import { useQuery } from '@tanstack/react-query';
import {
  weeklyTrackerControllerGetWeeklyTrackerSummary,
} from './generated/endpoints/weekly-tracker/weekly-tracker';
import type { WeeklyTrackerSummaryDto } from './generated/models';
import { getTrackerUserKey } from './user-key';

const WEEKLY_TRACKER_QUERY_KEY = ['weekly-tracker'] as const;

export async function fetchWeeklyTrackerSummary(): Promise<WeeklyTrackerSummaryDto> {
  const userKey = await getTrackerUserKey();
  const response = await weeklyTrackerControllerGetWeeklyTrackerSummary(
    undefined,
    {
      headers: {
        'x-user-key': userKey,
      },
    },
  );

  if (response.status !== 200 || !response.data) {
    throw new Error('Weekly tracker summary request failed.');
  }

  return response.data;
}

export function useWeeklyTrackerSummary() {
  return useQuery({
    queryFn: fetchWeeklyTrackerSummary,
    queryKey: WEEKLY_TRACKER_QUERY_KEY,
  });
}
