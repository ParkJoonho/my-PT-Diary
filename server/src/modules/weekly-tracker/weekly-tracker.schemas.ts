import { z } from 'zod';
import { WeeklyWorkoutSource } from './dto/create-weekly-workout.dto';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

function isRealDateString(value: string) {
  if (!isoDateRegex.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export const userKeySchema = z
  .string()
  .trim()
  .min(1, 'x-user-key header is required.')
  .max(255, 'x-user-key must be 255 characters or fewer.');

export const isoDateStringSchema = z
  .string()
  .regex(isoDateRegex, 'Date must use YYYY-MM-DD format.')
  .refine(isRealDateString, 'Date must be a real calendar date.');

export const createWeeklyWorkoutSchema = z.object({
  completedOn: isoDateStringSchema,
  note: z.string().trim().max(200).optional(),
  source: z.nativeEnum(WeeklyWorkoutSource),
});

export const weeklyTrackerQuerySchema = z.object({
  referenceDate: isoDateStringSchema.optional(),
});

export type CreateWeeklyWorkoutInput = z.infer<
  typeof createWeeklyWorkoutSchema
>;
export type WeeklyTrackerQueryInput = z.infer<typeof weeklyTrackerQuerySchema>;
