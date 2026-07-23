import { useSuspenseQuery } from '@tanstack/react-query';
import {
  workoutReportsControllerGetSummary,
  type workoutReportsControllerGetSummaryResponse,
} from 'shared/api/generated/endpoints/workout-reports/workout-reports';
import type {
  WorkoutReportSummaryDto,
  WorkoutReportsControllerGetSummaryParams,
} from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';
import { getClientTodayDate } from 'shared/lib/date';

export const WORKOUT_REPORT_SUMMARY_QUERY_KEY = [
  'workout-report-summary',
] as const;

export function getWorkoutReportSummaryQueryKey(
  userKey: string,
  referenceDate: string,
) {
  return [...WORKOUT_REPORT_SUMMARY_QUERY_KEY, userKey, referenceDate] as const;
}

export function getWorkoutReportSummaryQueryKeyPrefix(userKey: string) {
  return [...WORKOUT_REPORT_SUMMARY_QUERY_KEY, userKey] as const;
}

export function selectWorkoutReportSummary(
  response: workoutReportsControllerGetSummaryResponse,
): WorkoutReportSummaryDto {
  if (response.status !== 200 || !response.data) {
    throw new Error('운동 리포트 요약 조회에 실패했어요.');
  }

  return response.data;
}

export function useWorkoutReportSummary(
  params: WorkoutReportsControllerGetSummaryParams = {},
) {
  const userKey = useTrackerUserKey();
  const referenceDate = params.referenceDate ?? getClientTodayDate();

  return useSuspenseQuery({
    queryFn: async () =>
      selectWorkoutReportSummary(
        await workoutReportsControllerGetSummary(
          { referenceDate },
          {
            headers: {
              'x-user-key': userKey,
            },
          },
        ),
      ),
    queryKey: getWorkoutReportSummaryQueryKey(userKey, referenceDate),
  });
}
