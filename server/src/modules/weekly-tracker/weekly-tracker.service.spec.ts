import { NotFoundException } from '@nestjs/common';
import { WeeklyWorkoutSource } from './dto/create-weekly-workout.dto';
import { WeeklyTrackerRepositoryPort } from './weekly-tracker.repository.port';
import { WeeklyTrackerService } from './weekly-tracker.service';

describe('WeeklyTrackerService', () => {
  let repository: jest.Mocked<WeeklyTrackerRepositoryPort>;
  let service: WeeklyTrackerService;

  beforeEach(() => {
    repository = {
      createWorkoutCompletion: jest.fn(),
      deleteWorkoutCompletion: jest.fn(),
      getCompletionCountsForWeek: jest.fn(),
      listDistinctCompletedDatesUntil: jest.fn(),
      listWorkoutCompletionsForWeek: jest.fn(),
    };

    service = new WeeklyTrackerService(repository);
  });

  it('creates a workout completion and normalizes null notes', async () => {
    repository.createWorkoutCompletion.mockResolvedValue({
      completed_on: '2026-07-22',
      created_at: '2026-07-22T10:00:00.000Z',
      id: 'workout-1',
      note: null,
      source: WeeklyWorkoutSource.PersonalExercise,
    });

    const result = await service.createWorkoutCompletion('user-a', {
      completedOn: '2026-07-22',
      source: WeeklyWorkoutSource.PersonalExercise,
    });

    const createArgs = repository.createWorkoutCompletion.mock.calls[0]?.[0];

    expect(createArgs?.completedOn).toBe('2026-07-22');
    expect(createArgs?.note).toBeNull();
    expect(createArgs?.source).toBe(WeeklyWorkoutSource.PersonalExercise);
    expect(createArgs?.userKey).toBe('user-a');
    expect(typeof createArgs?.id).toBe('string');
    expect(result).toEqual({
      completedOn: '2026-07-22',
      createdAt: '2026-07-22T10:00:00.000Z',
      id: 'workout-1',
      note: null,
      source: WeeklyWorkoutSource.PersonalExercise,
    });
  });

  it('builds a monday-sunday weekly summary with streak', async () => {
    repository.getCompletionCountsForWeek.mockResolvedValue([
      { completedOn: '2026-07-21', completionCount: 1 },
      { completedOn: '2026-07-22', completionCount: 2 },
    ]);
    repository.listDistinctCompletedDatesUntil.mockResolvedValue([
      '2026-07-22',
      '2026-07-21',
      '2026-07-20',
    ]);

    const result = await service.getWeeklySummary('user-a', '2026-07-22');

    expect(repository.getCompletionCountsForWeek.mock.calls[0]?.[0]).toEqual({
      userKey: 'user-a',
      weekEndDate: '2026-07-26',
      weekStartDate: '2026-07-20',
    });
    expect(result.weekStartDate).toBe('2026-07-20');
    expect(result.weekEndDate).toBe('2026-07-26');
    expect(result.streakCount).toBe(3);
    expect(result.totalCompletedDays).toBe(2);
    expect(result.days).toEqual([
      { completed: false, completionCount: 0, date: '2026-07-20', label: '월' },
      { completed: true, completionCount: 1, date: '2026-07-21', label: '화' },
      { completed: true, completionCount: 2, date: '2026-07-22', label: '수' },
      { completed: false, completionCount: 0, date: '2026-07-23', label: '목' },
      { completed: false, completionCount: 0, date: '2026-07-24', label: '금' },
      { completed: false, completionCount: 0, date: '2026-07-25', label: '토' },
      { completed: false, completionCount: 0, date: '2026-07-26', label: '일' },
    ]);
  });

  it('counts streak from yesterday when today is empty', async () => {
    repository.getCompletionCountsForWeek.mockResolvedValue([
      { completedOn: '2026-07-21', completionCount: 1 },
    ]);
    repository.listDistinctCompletedDatesUntil.mockResolvedValue([
      '2026-07-21',
      '2026-07-20',
    ]);

    const result = await service.getWeeklySummary('user-a', '2026-07-22');

    expect(result.streakCount).toBe(2);
  });

  it('returns zero streak when neither today nor yesterday has workouts', async () => {
    repository.getCompletionCountsForWeek.mockResolvedValue([]);
    repository.listDistinctCompletedDatesUntil.mockResolvedValue([
      '2026-07-19',
    ]);

    const result = await service.getWeeklySummary('user-a', '2026-07-22');

    expect(result.streakCount).toBe(0);
    expect(result.totalCompletedDays).toBe(0);
  });

  it('maps weekly completion rows for list responses', async () => {
    repository.listWorkoutCompletionsForWeek.mockResolvedValue([
      {
        completed_on: '2026-07-21',
        created_at: '2026-07-21T12:00:00.000Z',
        id: 'workout-1',
        note: '저녁 운동',
        source: WeeklyWorkoutSource.Routine,
      },
    ]);

    const result = await service.listWeeklyWorkoutCompletions(
      'user-a',
      '2026-07-22',
    );

    expect(result).toEqual([
      {
        completedOn: '2026-07-21',
        createdAt: '2026-07-21T12:00:00.000Z',
        id: 'workout-1',
        note: '저녁 운동',
        source: WeeklyWorkoutSource.Routine,
      },
    ]);
  });

  it('delegates delete to the repository', async () => {
    repository.deleteWorkoutCompletion.mockResolvedValue(undefined);

    const result = await service.deleteWorkoutCompletion('user-a', 'workout-1');

    expect(repository.deleteWorkoutCompletion.mock.calls[0]?.[0]).toEqual({
      id: 'workout-1',
      userKey: 'user-a',
    });
    expect(result).toEqual({ deleted: true });
  });

  it('propagates repository delete errors', async () => {
    repository.deleteWorkoutCompletion.mockRejectedValue(
      new NotFoundException('Workout completion not found.'),
    );

    await expect(
      service.deleteWorkoutCompletion('user-a', 'missing-workout'),
    ).rejects.toThrow(NotFoundException);
  });
});
