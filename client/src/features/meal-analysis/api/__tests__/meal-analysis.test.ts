import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import {
  mealAnalysisControllerAnalyzeMeal,
  useMealAnalysisControllerGetDailySummarySuspense,
  useMealAnalysisControllerListMealRecordsSuspense,
} from 'shared/api/generated/endpoints/meal-analysis/meal-analysis';
import { useTrackerUserKey } from 'shared/api/user-key';
import {
  selectDietGuideResponse,
  selectMealAnalysisResponse,
  useAnalyzeMeal,
  useDailyMealSummary,
  useMealRecords,
} from '../meal-analysis';

jest.mock('shared/api/generated/endpoints/meal-analysis/meal-analysis', () => ({
  mealAnalysisControllerAnalyzeMeal: jest.fn(),
  mealAnalysisControllerCreateMealRecord: jest.fn(),
  mealAnalysisControllerGenerateDietGuide: jest.fn(),
  mealAnalysisControllerGetDailySummary: jest.fn(),
  mealAnalysisControllerListMealRecords: jest.fn(),
  useMealAnalysisControllerGetDailySummarySuspense: jest.fn(),
  useMealAnalysisControllerListMealRecordsSuspense: jest.fn(),
}));

jest.mock('shared/api/user-key', () => ({
  useTrackerUserKey: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query') as Record<
    string,
    unknown
  >;

  return {
    ...actual,
    useMutation: jest.fn(
      (options: { mutationFn: (variables: unknown) => unknown }) => ({
        mutateAsync: options.mutationFn,
      }),
    ),
    useQueryClient: jest.fn(() => ({
      invalidateQueries: jest.fn(),
    })),
  };
});

describe('식단 분석 API 래퍼', () => {
  const mockedAnalyzeMeal = jest.mocked(mealAnalysisControllerAnalyzeMeal);
  const mockedDailySummary = jest.mocked(
    useMealAnalysisControllerGetDailySummarySuspense,
  );
  const mockedMealRecords = jest.mocked(
    useMealAnalysisControllerListMealRecordsSuspense,
  );
  const mockedUserKey = jest.mocked(useTrackerUserKey);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUserKey.mockReturnValue('식단-사용자');
  });

  it('사용자 키 헤더로 식단 분석 요청을 보낸다', async () => {
    mockedAnalyzeMeal.mockResolvedValue({
      data: {
        analysis: {
          dietaryAdvice: ['채소를 추가해요.'],
          exerciseToOffset: {
            cycling: 20,
            running: 15,
            walking: 40,
          },
          foods: [],
          mealBalance: {
            carbRatio: 50,
            fatRatio: 20,
            feedback: '균형이 좋아요.',
            grade: 'A',
            proteinRatio: 30,
            score: 88,
          },
          summary: '균형 잡힌 식사예요.',
          totalCalories: 500,
          totalCarbs: 60,
          totalFat: 15,
          totalFiber: 8,
          totalProtein: 30,
          totalSodium: 700,
        },
        analyzedAt: '2026-07-28T01:23:45.000Z',
      },
      headers: new Headers(),
      status: 200,
    });

    const { result } = renderHook(() => useAnalyzeMeal());
    const response = await result.current.mutateAsync({
      imageBase64: 'a'.repeat(200),
      mealType: 'lunch',
    });

    expect(mockedAnalyzeMeal).toHaveBeenCalledWith(
      {
        imageBase64: 'a'.repeat(200),
        mealType: 'lunch',
      },
      {
        headers: {
          'x-user-key': '식단-사용자',
        },
      },
    );
    expect(response.analysis.totalCalories).toBe(500);
  });

  it('날짜별 기록과 합계는 Orval suspense query와 사용자별 키를 쓴다', () => {
    mockedMealRecords.mockReturnValue({
      data: [],
    } as ReturnType<typeof useMealAnalysisControllerListMealRecordsSuspense>);
    mockedDailySummary.mockReturnValue({
      data: {
        date: '2026-07-28',
        mealCount: 0,
        totalCalories: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        totalProtein: 0,
        totalSodium: 0,
      },
    } as ReturnType<typeof useMealAnalysisControllerGetDailySummarySuspense>);

    renderHook(() => useMealRecords('2026-07-28'));
    renderHook(() => useDailyMealSummary('2026-07-28'));

    expect(mockedMealRecords).toHaveBeenCalledWith(
      { date: '2026-07-28' },
      expect.objectContaining({
        fetch: {
          headers: {
            'x-user-key': '식단-사용자',
          },
        },
        query: expect.objectContaining({
          queryKey: ['meal-analysis', '식단-사용자', 'records', '2026-07-28'],
        }),
      }),
    );
    expect(mockedDailySummary).toHaveBeenCalledWith(
      { date: '2026-07-28' },
      expect.objectContaining({
        fetch: {
          headers: {
            'x-user-key': '식단-사용자',
          },
        },
      }),
    );
  });

  it('AI 미설정 응답을 사용자 메시지로 바꾼다', () => {
    expect(() =>
      selectMealAnalysisResponse({
        data: undefined,
        headers: new Headers(),
        status: 503,
      }),
    ).toThrow('식단 분석 AI 기능이 아직 설정되지 않았어요.');
    expect(() =>
      selectDietGuideResponse({
        data: undefined,
        headers: new Headers(),
        status: 503,
      }),
    ).toThrow('AI 식단 가이드 기능이 아직 설정되지 않았어요.');
  });
});
