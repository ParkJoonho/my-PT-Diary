import { z } from 'zod';
import { isoDateStringSchema } from '../weekly-tracker/weekly-tracker.schemas';

const textField = (fieldName: string, maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `${fieldName} must be ${maxLength} characters or fewer.`);

export const ptLessonSetSchema = z.object({
  id: z.string().uuid(),
  reps: z.number().int().min(0).max(1000),
  weightKg: z.number().min(0).max(1000),
});

export const ptLessonExerciseSchema = z.object({
  estimatedOneRepMaxKg: z.number().min(0).max(5000),
  lbWeight: z.number().min(0).max(5000),
  maxWeightKg: z.number().min(0).max(1000),
  name: z
    .string()
    .trim()
    .min(1, 'exercise name is required.')
    .max(80, 'exercise name must be 80 characters or fewer.'),
  restTime: textField('restTime', 80).optional().default(''),
  rir: textField('rir', 40).optional().default(''),
  sets: z
    .array(ptLessonSetSchema)
    .min(1, 'At least one set is required.')
    .max(50, 'Sets must be 50 items or fewer.'),
  volumeKg: z.number().min(0).max(5_000_000),
});

export const ptLessonSchema = z.object({
  bodyParts: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(40),
    )
    .max(10),
  comment: textField('comment', 2000).optional().default(''),
  date: isoDateStringSchema,
  equipment: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(40),
    )
    .max(10),
  exercises: z
    .array(ptLessonExerciseSchema)
    .min(1, 'At least one exercise is required.')
    .max(30, 'Exercises must be 30 items or fewer.'),
  sessionNumber: z
    .number()
    .int()
    .min(1, 'sessionNumber must be at least 1.')
    .max(500, 'sessionNumber must be 500 or fewer.'),
  warmUp: textField('warmUp', 1000).optional().default(''),
});

export const listPtLessonsQuerySchema = z
  .object({
    from: isoDateStringSchema.optional(),
    to: isoDateStringSchema.optional(),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'from must be earlier than or equal to to.',
    path: ['from'],
  });

export type PtLessonInput = z.infer<typeof ptLessonSchema>;
export type ListPtLessonsQueryInput = z.infer<typeof listPtLessonsQuerySchema>;
export type PtLessonExerciseInput = z.infer<typeof ptLessonExerciseSchema>;
