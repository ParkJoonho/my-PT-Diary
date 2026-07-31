import { BadGatewayException } from '@nestjs/common';
import { MealAnalysisAiClientPort } from '../meal-analysis-ai-client.port';
import { MealAnalysisService } from '../meal-analysis.service';
import { MealRecordsRepositoryPort } from '../meal-records.repository.port';
import { 식단가이드예시, 식단분석예시 } from './meal-analysis.fixtures';

describe('식단 분석 서비스', () => {
  let aiClient: jest.Mocked<MealAnalysisAiClientPort>;
  let repository: jest.Mocked<MealRecordsRepositoryPort>;
  let service: MealAnalysisService;

  beforeEach(() => {
    aiClient = {
      analyzeMeal: jest.fn(),
      generateDietGuide: jest.fn(),
    };
    repository = {
      createMealRecord: jest.fn(),
      getDailySummary: jest.fn(),
      listMealRecords: jest.fn(),
    };
    service = new MealAnalysisService(aiClient, repository);
  });

  it('원본의 전후 사진과 식사 시간 입력을 AI 분석에 전달한다', async () => {
    aiClient.analyzeMeal.mockResolvedValue(JSON.stringify(식단분석예시));

    const result = await service.analyzeMeal('user-a', {
      afterImageBase64: 'b'.repeat(200),
      eatingDurationMinutes: 20,
      imageBase64: 'a'.repeat(200),
      mealType: 'lunch',
    });

    expect(aiClient.analyzeMeal.mock.calls[0]).toEqual([
      {
        afterImageBase64: 'b'.repeat(200),
        eatingDurationMinutes: 20,
        imageBase64: 'a'.repeat(200),
        mealType: 'lunch',
      },
    ]);
    expect(result.analysis.totalCalories).toBe(550);
    expect(result.analysis.foods).toHaveLength(2);
  });

  it('AI 분석 계약이 불완전하면 502를 던진다', async () => {
    aiClient.analyzeMeal.mockResolvedValue(
      JSON.stringify({
        foods: [],
        totalCalories: 100,
      }),
    );

    await expect(
      service.analyzeMeal('user-a', {
        imageBase64: 'a'.repeat(200),
        mealType: 'breakfast',
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
    expect(aiClient.analyzeMeal).toHaveBeenCalledTimes(2);
  });

  it('AI 응답 검증 오류를 전달해 한 번 다시 분석한다', async () => {
    aiClient.analyzeMeal
      .mockResolvedValueOnce(
        JSON.stringify({
          ...식단분석예시,
          eatingSpeedAnalysis: {
            ...식단분석예시.eatingSpeedAnalysis,
            durationMinutes: 0,
          },
        }),
      )
      .mockResolvedValueOnce(JSON.stringify(식단분석예시));

    await expect(
      service.analyzeMeal('user-a', {
        imageBase64: 'a'.repeat(200),
        mealType: 'snack',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        analysis: 식단분석예시,
      }),
    );

    expect(aiClient.analyzeMeal).toHaveBeenCalledTimes(2);
    expect(aiClient.analyzeMeal.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({
        previousResponse: expect.stringContaining('"durationMinutes":0'),
        retryFeedback: expect.stringContaining(
          'eatingSpeedAnalysis.durationMinutes',
        ),
      }),
    );
  });

  it('JSON 파싱 오류 메시지를 전달해 한 번 다시 분석한다', async () => {
    aiClient.analyzeMeal
      .mockResolvedValueOnce('JSON이 아닌 응답')
      .mockResolvedValueOnce(JSON.stringify(식단분석예시));

    await service.analyzeMeal('user-a', {
      imageBase64: 'a'.repeat(200),
      mealType: 'breakfast',
    });

    expect(aiClient.analyzeMeal.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({
        previousResponse: 'JSON이 아닌 응답',
        retryFeedback: '식단 분석 응답에서 JSON을 찾지 못했어요.',
      }),
    );
  });

  it('분석 결과 총합을 사용자 식단 기록으로 저장한다', async () => {
    repository.createMealRecord.mockImplementation((params) =>
      Promise.resolve({
        analysis_result: params.analysisResult,
        carbs: 80,
        created_at: '2026-07-28T02:00:00.000Z',
        fat: 13,
        fiber: 1,
        id: params.id,
        meal_date: params.mealDate,
        meal_type: params.mealType,
        protein: 31,
        sodium: 655,
        total_calories: 550,
        user_key: params.userKey,
      }),
    );

    const result = await service.createMealRecord('user-a', {
      analysisResult: 식단분석예시,
      mealDate: '2026-07-28',
      mealType: 'lunch',
    });

    expect(repository.createMealRecord.mock.calls[0]).toEqual([
      expect.objectContaining({
        analysisResult: 식단분석예시,
        mealDate: '2026-07-28',
        mealType: 'lunch',
        userKey: 'user-a',
      }),
    ]);
    expect(result.totalCalories).toBe(550);
    expect(result.userKey).toBe('user-a');
  });

  it('당일 기록만 이용해 화면 계약과 일치하는 식단 가이드를 만든다', async () => {
    repository.listMealRecords.mockResolvedValue([
      {
        analysis_result: 식단분석예시,
        carbs: 80,
        created_at: '2026-07-28T02:00:00.000Z',
        fat: 13,
        fiber: 1,
        id: 'meal-a',
        meal_date: '2026-07-28',
        meal_type: 'lunch',
        protein: 31,
        sodium: 655,
        total_calories: 550,
        user_key: 'user-a',
      },
    ]);
    aiClient.generateDietGuide.mockResolvedValue(
      JSON.stringify(식단가이드예시),
    );

    const result = await service.generateDietGuide('user-a', {
      date: '2026-07-28',
    });

    expect(repository.listMealRecords.mock.calls[0]).toEqual([
      {
        date: '2026-07-28',
        userKey: 'user-a',
      },
    ]);
    expect(aiClient.generateDietGuide.mock.calls[0]).toEqual([
      {
        date: '2026-07-28',
        meals: [
          {
            carbs: 80,
            fat: 13,
            mealType: 'lunch',
            protein: 31,
            totalCalories: 550,
          },
        ],
      },
    ]);
    expect(result.guide.overallAssessment).toBe(
      식단가이드예시.overallAssessment,
    );
    expect(result.guide.mealPlan).toHaveLength(4);
    expect(result.sourceMealCount).toBe(1);
  });

  it('일일 영양 합계를 원본 필드명으로 반환한다', async () => {
    repository.getDailySummary.mockResolvedValue({
      meal_count: 2,
      total_calories: 1200,
      total_carbs: 140,
      total_fat: 35,
      total_fiber: 12,
      total_protein: 80,
      total_sodium: 1300,
    });

    await expect(
      service.getDailySummary('user-a', '2026-07-28'),
    ).resolves.toEqual({
      date: '2026-07-28',
      mealCount: 2,
      totalCalories: 1200,
      totalCarbs: 140,
      totalFat: 35,
      totalFiber: 12,
      totalProtein: 80,
      totalSodium: 1300,
    });
  });
});
