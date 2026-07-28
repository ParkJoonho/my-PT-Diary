import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mealAnalysisControllerAnalyzeMeal,
  type mealAnalysisControllerAnalyzeMealResponse,
  mealAnalysisControllerCreateMealRecord,
  type mealAnalysisControllerCreateMealRecordResponse,
  mealAnalysisControllerGenerateDietGuide,
  type mealAnalysisControllerGenerateDietGuideResponse,
  type mealAnalysisControllerGetDailySummaryResponse,
  type mealAnalysisControllerListMealRecordsResponse,
  useMealAnalysisControllerGetDailySummarySuspense,
  useMealAnalysisControllerListMealRecordsSuspense,
} from 'shared/api/generated/endpoints/meal-analysis/meal-analysis';
import type {
  CreateMealAnalysisDto,
  CreateMealRecordDto,
  DailyMealSummaryDto,
  DietGuideResponseDto,
  GenerateDietGuideDto,
  MealAnalysisResponseDto,
  MealRecordDto,
} from 'shared/api/generated/models';
import { useTrackerUserKey } from 'shared/api/user-key';

export const MEAL_ANALYSIS_QUERY_KEY = ['meal-analysis'] as const;

export function getMealRecordsQueryKey(userKey: string, date: string) {
  return [...MEAL_ANALYSIS_QUERY_KEY, userKey, 'records', date] as const;
}

export function getDailyMealSummaryQueryKey(userKey: string, date: string) {
  return [...MEAL_ANALYSIS_QUERY_KEY, userKey, 'daily-summary', date] as const;
}

export function selectMealAnalysisResponse(
  response: mealAnalysisControllerAnalyzeMealResponse,
): MealAnalysisResponseDto {
  if (response.status === 503) {
    throw new Error('식단 분석 AI 기능이 아직 설정되지 않았어요.');
  }

  if (response.status === 502) {
    throw new Error('식단 분석 응답을 처리하지 못했어요.');
  }

  if (response.status !== 200 || !response.data) {
    throw new Error('식단 분석 요청에 실패했어요.');
  }

  return response.data;
}

export function selectCreatedMealRecord(
  response: mealAnalysisControllerCreateMealRecordResponse,
): MealRecordDto {
  if (response.status !== 201 || !response.data) {
    throw new Error('식단 기록 저장에 실패했어요.');
  }

  return response.data;
}

export function selectMealRecords(
  response: mealAnalysisControllerListMealRecordsResponse,
): MealRecordDto[] {
  if (response.status !== 200 || !response.data) {
    throw new Error('식단 기록을 불러오지 못했어요.');
  }

  return response.data;
}

export function selectDailyMealSummary(
  response: mealAnalysisControllerGetDailySummaryResponse,
): DailyMealSummaryDto {
  if (response.status !== 200 || !response.data) {
    throw new Error('오늘의 영양 섭취를 불러오지 못했어요.');
  }

  return response.data;
}

export function selectDietGuideResponse(
  response: mealAnalysisControllerGenerateDietGuideResponse,
): DietGuideResponseDto {
  if (response.status === 503) {
    throw new Error('AI 식단 가이드 기능이 아직 설정되지 않았어요.');
  }

  if (response.status === 502) {
    throw new Error('AI 식단 가이드 응답을 처리하지 못했어요.');
  }

  if (response.status !== 200 || !response.data) {
    throw new Error('AI 식단 가이드 생성에 실패했어요.');
  }

  return response.data;
}

export function useMealRecords(date: string) {
  const userKey = useTrackerUserKey();

  return useMealAnalysisControllerListMealRecordsSuspense(
    { date },
    {
      fetch: {
        headers: {
          'x-user-key': userKey,
        },
      },
      query: {
        queryKey: getMealRecordsQueryKey(userKey, date),
        select: selectMealRecords,
      },
    },
  );
}

export function useDailyMealSummary(date: string) {
  const userKey = useTrackerUserKey();

  return useMealAnalysisControllerGetDailySummarySuspense(
    { date },
    {
      fetch: {
        headers: {
          'x-user-key': userKey,
        },
      },
      query: {
        queryKey: getDailyMealSummaryQueryKey(userKey, date),
        select: selectDailyMealSummary,
      },
    },
  );
}

export function useAnalyzeMeal() {
  const userKey = useTrackerUserKey();

  return useMutation({
    mutationFn: async (dto: CreateMealAnalysisDto) =>
      selectMealAnalysisResponse(
        await mealAnalysisControllerAnalyzeMeal(dto, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
  });
}

export function useCreateMealRecord(date: string) {
  const queryClient = useQueryClient();
  const userKey = useTrackerUserKey();

  return useMutation({
    mutationFn: async (dto: CreateMealRecordDto) =>
      selectCreatedMealRecord(
        await mealAnalysisControllerCreateMealRecord(dto, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getMealRecordsQueryKey(userKey, date),
        }),
        queryClient.invalidateQueries({
          queryKey: getDailyMealSummaryQueryKey(userKey, date),
        }),
      ]);
    },
  });
}

export function useGenerateDietGuide() {
  const userKey = useTrackerUserKey();

  return useMutation({
    mutationFn: async (dto: GenerateDietGuideDto) =>
      selectDietGuideResponse(
        await mealAnalysisControllerGenerateDietGuide(dto, {
          headers: {
            'x-user-key': userKey,
          },
        }),
      ),
  });
}
