import { z } from 'zod';
import { isoDateStringSchema } from '../weekly-tracker/weekly-tracker.schemas';
import {
  WorkoutRecordSource,
  WorkoutStepType,
} from './dto/workout-record-response.dto';

export const isoUtcDateTimeSchema = z
  .string()
  .datetime({ offset: true, message: 'completedAt must be an ISO date-time.' })
  .refine((value) => value.endsWith('Z'), {
    message: 'completedAt must be normalized to UTC and end with Z.',
  });

export const textField = (fieldName: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required.`)
    .max(maxLength, `${fieldName} must be ${maxLength} characters or fewer.`);

export const routineWorkoutStepSchema = z.object({
  completed: z.boolean(),
  detail: textField('detail', 100),
  name: textField('name', 80),
  restAfter: z.string().trim().max(80).optional(),
  sets: z.number().int().positive().max(100).optional(),
  tag: z.string().trim().max(80).optional(),
  type: z.nativeEnum(WorkoutStepType),
});

export const createRoutineWorkoutCompletionSchema = z.object({
  completedAt: isoUtcDateTimeSchema,
  completedOn: isoDateStringSchema,
  durationSeconds: z
    .number()
    .int()
    .min(0)
    .max(24 * 60 * 60),
  routineId: textField('routineId', 100),
  routineLabel: textField('routineLabel', 100),
  routineSource: textField('routineSource', 40),
  steps: z
    .array(routineWorkoutStepSchema)
    .min(1, 'At least one routine step is required.')
    .max(100, 'Routine steps must be 100 items or fewer.'),
  timeZone: textField('timeZone', 100),
});

const manualWorkoutSetSchema = z.object({
  reps: z.number().int().min(0).max(1000).optional(),
  restSeconds: z
    .number()
    .int()
    .min(0)
    .max(60 * 60)
    .optional(),
  rir: z.number().int().min(0).max(10).optional(),
  weightKg: z.number().min(0).max(1000).optional(),
});

const manualStrengthExerciseSchema = z.object({
  estimated1RM: z.number().min(0).max(5000).optional(),
  lbWeight: z.number().min(0).max(5000).optional(),
  maxWeight: z.number().min(0).max(1000).optional(),
  name: textField('exercise name', 80),
  restTime: z.string().trim().max(80).optional(),
  rir: z.string().trim().max(40).optional(),
  sets: z
    .array(manualWorkoutSetSchema)
    .min(1, 'At least one set is required.')
    .max(50, 'Sets must be 50 items or fewer.'),
  volume: z.number().min(0).max(5_000_000).optional(),
});

const manualCardioSchema = z.object({
  cycleMinutes: z.number().int().min(0).max(24 * 60).optional(),
  distanceMeters: z.number().int().min(0).max(1_000_000).optional(),
  durationSeconds: z
    .number()
    .int()
    .min(0)
    .max(24 * 60 * 60)
    .optional(),
  stairClimberMinutes: z.number().int().min(0).max(24 * 60).optional(),
  steps: z.number().int().min(0).max(200_000).optional(),
  treadmillMinutes: z.number().int().min(0).max(24 * 60).optional(),
});

const bodyCompositionSchema = z.object({
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  bodyFatKg: z.number().min(0).max(300).optional(),
  eveningWeightKg: z.number().min(0).max(500).optional(),
  morningWeightKg: z.number().min(0).max(500).optional(),
  skeletalMuscleMassKg: z.number().min(0).max(300).optional(),
  weightKg: z.number().min(0).max(500).optional(),
});

export const manualWorkoutRecordSchema = z
  .object({
    activityLevel: z.string().trim().max(100).optional(),
    bodyComposition: bodyCompositionSchema.optional(),
    cardio: manualCardioSchema.optional(),
    condition: z.string().trim().max(100).optional(),
    dailyReport: z.string().trim().max(2000).optional(),
    durationSeconds: z
      .number()
      .int()
      .min(0)
      .max(24 * 60 * 60),
    exerciseTime: z.string().trim().max(40).optional(),
    location: z.enum(['gym', 'home', 'outdoor', 'unknown']).optional(),
    meals: z.array(z.string().trim().max(300)).max(8).optional(),
    memo: z.string().trim().max(1000).optional(),
    performedAt: isoUtcDateTimeSchema,
    performedOn: isoDateStringSchema,
    sleep: z.string().trim().max(100).optional(),
    strengthExercises: z
      .array(manualStrengthExerciseSchema)
      .max(50, 'Strength exercises must be 50 items or fewer.')
      .optional(),
    timeZone: textField('timeZone', 100),
    title: z.string().trim().max(100).optional(),
  })
  .refine(
    (value) =>
      Boolean(value.cardio) ||
      Boolean(value.strengthExercises?.length) ||
      Boolean(value.memo) ||
      Boolean(value.dailyReport) ||
      Boolean(value.bodyComposition) ||
      Boolean(value.meals?.some((meal) => meal.length > 0)) ||
      Boolean(value.sleep) ||
      Boolean(value.condition) ||
      Boolean(value.activityLevel),
    {
      message:
        'At least one workout detail, memo, or body composition value is required.',
      path: ['strengthExercises'],
    },
  );

export const listWorkoutRecordsQuerySchema = z
  .object({
    from: isoDateStringSchema.optional(),
    source: z.nativeEnum(WorkoutRecordSource).optional(),
    to: isoDateStringSchema.optional(),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'from must be earlier than or equal to to.',
    path: ['from'],
  });

export type CreateRoutineWorkoutCompletionInput = z.infer<
  typeof createRoutineWorkoutCompletionSchema
>;
export type ManualWorkoutRecordInput = z.infer<
  typeof manualWorkoutRecordSchema
>;
export type RoutineWorkoutStepInput = z.infer<typeof routineWorkoutStepSchema>;
export type ListWorkoutRecordsQueryInput = z.infer<
  typeof listWorkoutRecordsQuerySchema
>;
