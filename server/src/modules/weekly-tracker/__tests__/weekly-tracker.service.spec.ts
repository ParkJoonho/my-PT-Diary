import { NotFoundException } from '@nestjs/common';
import { WeeklyWorkoutSource } from '../dto/create-weekly-workout.dto';
import { WeeklyTrackerRepositoryPort } from '../weekly-tracker.repository.port';
import { WeeklyTrackerService } from '../weekly-tracker.service';

describe('주간 트래커 서비스', () => {
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

  it('운동 완료 레코드를 만들고 응답을 정규화한다', async () => {
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

  it('월요일부터 일요일까지 주간 요약과 스트릭을 계산한다', async () => {
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

  it('오늘 기록이 없으면 어제 기준으로 스트릭을 계산한다', async () => {
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

  it('오늘과 어제 모두 비어 있으면 스트릭 0을 반환한다', async () => {
    repository.getCompletionCountsForWeek.mockResolvedValue([]);
    repository.listDistinctCompletedDatesUntil.mockResolvedValue([
      '2026-07-19',
    ]);

    const result = await service.getWeeklySummary('user-a', '2026-07-22');

    expect(result.streakCount).toBe(0);
    expect(result.totalCompletedDays).toBe(0);
  });

  it('주간 완료 목록 응답을 화면용 형태로 변환한다', async () => {
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

  it('삭제 요청을 저장소로 위임한다', async () => {
    repository.deleteWorkoutCompletion.mockResolvedValue(undefined);

    const result = await service.deleteWorkoutCompletion('user-a', 'workout-1');

    expect(repository.deleteWorkoutCompletion.mock.calls[0]?.[0]).toEqual({
      id: 'workout-1',
      userKey: 'user-a',
    });
    expect(result).toEqual({ deleted: true });
  });

  it('삭제 실패는 그대로 상위로 전달한다', async () => {
    repository.deleteWorkoutCompletion.mockRejectedValue(
      new NotFoundException('Workout completion not found.'),
    );

    await expect(
      service.deleteWorkoutCompletion('user-a', 'missing-workout'),
    ).rejects.toThrow(NotFoundException);
  });
});
