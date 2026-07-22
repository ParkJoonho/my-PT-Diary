import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateWeeklyWorkoutDto } from './dto/create-weekly-workout.dto';
import {
  WorkoutCompletionRow,
  WeeklyTrackerRepositoryPort,
} from './weekly-tracker.repository.port';

const KOREAN_DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function resolveReferenceDate(referenceDate?: string) {
  if (referenceDate) {
    return parseDate(referenceDate);
  }

  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function resolveWeekStart(referenceDate: Date) {
  const dayIndex = referenceDate.getDay();
  const diffToMonday = dayIndex === 0 ? -6 : 1 - dayIndex;
  return addDays(referenceDate, diffToMonday);
}

@Injectable()
export class WeeklyTrackerService {
  constructor(
    private readonly weeklyTrackerRepository: WeeklyTrackerRepositoryPort,
  ) {}

  async createWorkoutCompletion(userKey: string, dto: CreateWeeklyWorkoutDto) {
    const completion =
      await this.weeklyTrackerRepository.createWorkoutCompletion({
        id: randomUUID(),
        userKey,
        completedOn: dto.completedOn,
        source: dto.source,
        note: dto.note ?? null,
      });

    return this.mapCompletion(completion);
  }

  async getWeeklySummary(userKey: string, referenceDate?: string) {
    const normalizedReferenceDate = resolveReferenceDate(referenceDate);
    const weekStart = resolveWeekStart(normalizedReferenceDate);
    const weekEnd = addDays(weekStart, 6);
    const weekStartDate = formatDate(weekStart);
    const weekEndDate = formatDate(weekEnd);
    const referenceDateString = formatDate(normalizedReferenceDate);

    const completionCounts =
      await this.weeklyTrackerRepository.getCompletionCountsForWeek({
        userKey,
        weekStartDate,
        weekEndDate,
      });
    const completedDates = new Map<string, number>(
      completionCounts.map((item) => [item.completedOn, item.completionCount]),
    );
    const distinctCompletedDates =
      await this.weeklyTrackerRepository.listDistinctCompletedDatesUntil({
        userKey,
        referenceDate: referenceDateString,
      });
    const distinctCompletedDateSet = new Set<string>(distinctCompletedDates);

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const dateString = formatDate(date);
      const completionCount = completedDates.get(dateString) ?? 0;

      return {
        date: dateString,
        label: KOREAN_DAY_LABELS[date.getDay()],
        completed: completionCount > 0,
        completionCount,
      };
    });

    return {
      weekStartDate,
      weekEndDate,
      referenceDate: referenceDateString,
      streakCount: this.calculateStreak(
        distinctCompletedDateSet,
        normalizedReferenceDate,
      ),
      totalCompletedDays: days.filter((day) => day.completed).length,
      days,
    };
  }

  async listWeeklyWorkoutCompletions(userKey: string, referenceDate?: string) {
    const normalizedReferenceDate = resolveReferenceDate(referenceDate);
    const weekStart = resolveWeekStart(normalizedReferenceDate);
    const weekEnd = addDays(weekStart, 6);

    const completions =
      await this.weeklyTrackerRepository.listWorkoutCompletionsForWeek({
        userKey,
        weekStartDate: formatDate(weekStart),
        weekEndDate: formatDate(weekEnd),
      });

    return completions.map((completion) => this.mapCompletion(completion));
  }

  async deleteWorkoutCompletion(userKey: string, workoutId: string) {
    await this.weeklyTrackerRepository.deleteWorkoutCompletion({
      userKey,
      id: workoutId,
    });

    return {
      deleted: true,
    };
  }

  private calculateStreak(
    distinctCompletedDateSet: Set<string>,
    referenceDate: Date,
  ) {
    const todayString = formatDate(referenceDate);
    const yesterdayString = formatDate(addDays(referenceDate, -1));

    if (
      !distinctCompletedDateSet.has(todayString) &&
      !distinctCompletedDateSet.has(yesterdayString)
    ) {
      return 0;
    }

    let streakDate = distinctCompletedDateSet.has(todayString)
      ? referenceDate
      : addDays(referenceDate, -1);
    let streakCount = 0;

    while (distinctCompletedDateSet.has(formatDate(streakDate))) {
      streakCount += 1;
      streakDate = addDays(streakDate, -1);
    }

    return streakCount;
  }

  private mapCompletion(completion: WorkoutCompletionRow) {
    return {
      id: completion.id,
      completedOn: completion.completed_on,
      source: completion.source,
      note: completion.note,
      createdAt: completion.created_at,
    };
  }
}
