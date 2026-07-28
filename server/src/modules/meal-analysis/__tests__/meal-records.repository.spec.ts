import { DatabaseService } from '../../../database/database.service';
import { MealRecordsRepository } from '../meal-records.repository';
import { 식단분석예시 } from './meal-analysis.fixtures';

describe('식단 기록 저장소', () => {
  let databaseService: jest.Mocked<DatabaseService>;
  let repository: MealRecordsRepository;

  beforeEach(() => {
    databaseService = {
      query: jest.fn(),
    } as unknown as jest.Mocked<DatabaseService>;
    repository = new MealRecordsRepository(databaseService);
  });

  it('AI가 반환한 총 영양 값을 반올림해 사용자 기록으로 저장한다', async () => {
    databaseService.query.mockResolvedValue({
      rows: [
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
      ],
    } as never);

    await repository.createMealRecord({
      analysisResult: {
        ...식단분석예시,
        totalCalories: 550.4,
        totalProtein: 30.6,
      },
      id: 'meal-a',
      mealDate: '2026-07-28',
      mealType: 'lunch',
      userKey: 'user-a',
    });

    const [, values] = databaseService.query.mock.calls[0];

    expect(values).toEqual([
      'meal-a',
      'user-a',
      'lunch',
      expect.any(String),
      550,
      31,
      80,
      13,
      1,
      655,
      '2026-07-28',
    ]);
  });

  it('날짜 필터와 사용자 키를 함께 적용한다', async () => {
    databaseService.query.mockResolvedValue({ rows: [] } as never);

    await repository.listMealRecords({
      date: '2026-07-28',
      userKey: 'user-a',
    });

    const [query, values] = databaseService.query.mock.calls[0];

    expect(query).toContain('WHERE user_key = $1');
    expect(query).toContain('AND meal_date = $2::date');
    expect(values).toEqual(['user-a', '2026-07-28']);
  });

  it('당일 합계도 사용자 키와 날짜로 제한한다', async () => {
    databaseService.query.mockResolvedValue({
      rows: [
        {
          meal_count: 1,
          total_calories: 550,
          total_carbs: 80,
          total_fat: 13,
          total_fiber: 1,
          total_protein: 31,
          total_sodium: 655,
        },
      ],
    } as never);

    const result = await repository.getDailySummary({
      date: '2026-07-28',
      userKey: 'user-a',
    });

    expect(databaseService.query.mock.calls[0]).toEqual([
      expect.stringContaining('WHERE user_key = $1'),
      ['user-a', '2026-07-28'],
    ]);
    expect(result.meal_count).toBe(1);
  });
});
