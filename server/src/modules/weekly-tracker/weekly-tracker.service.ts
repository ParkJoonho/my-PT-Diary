import { Injectable } from '@nestjs/common';
import { addDays, format, getDay, parse, startOfWeek, subDays } from 'date-fns';
import { randomUUID } from 'node:crypto';
import { CreateWeeklyWorkoutDto } from './dto/create-weekly-workout.dto';
import {
  WorkoutCompletionRow,
  WeeklyTrackerRepositoryPort,
} from './weekly-tracker.repository.port';

const KOREAN_DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const ISO_DATE_FORMAT = 'yyyy-MM-dd';

function formatDate(date: Date) {
  return format(date, ISO_DATE_FORMAT);
}

function parseDate(dateString: string) {
  return parse(dateString, ISO_DATE_FORMAT, new Date(0));
}

function resolveReferenceDate(referenceDate?: string) {
  if (referenceDate) {
    return parseDate(referenceDate);
  }

  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function resolveWeekStart(referenceDate: Date) {
  return startOfWeek(referenceDate, { weekStartsOn: 1 });
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
        label: KOREAN_DAY_LABELS[getDay(date)],
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
    const yesterdayString = formatDate(subDays(referenceDate, 1));

    if (
      !distinctCompletedDateSet.has(todayString) &&
      !distinctCompletedDateSet.has(yesterdayString)
    ) {
      return 0;
    }

    let streakDate = distinctCompletedDateSet.has(todayString)
      ? referenceDate
      : subDays(referenceDate, 1);
    let streakCount = 0;

    while (distinctCompletedDateSet.has(formatDate(streakDate))) {
      streakCount += 1;
      streakDate = subDays(streakDate, 1);
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
