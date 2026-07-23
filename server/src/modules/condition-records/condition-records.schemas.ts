import { z } from 'zod';
import { isoDateStringSchema } from '../weekly-tracker/weekly-tracker.schemas';
import { textField } from '../workout-records/workout-records.schemas';

const conditionScoreSchema = z.number().int().min(0).max(5);
const sorenessScoreSchema = z.number().int().min(0).max(4);

export const conditionScoresSchema = z.object({
  energy: conditionScoreSchema,
  motivation: conditionScoreSchema,
  sleep: conditionScoreSchema,
  stress: conditionScoreSchema,
});

export const muscleSorenessSchema = z.object({
  arms: sorenessScoreSchema,
  back: sorenessScoreSchema,
  chest: sorenessScoreSchema,
  core: sorenessScoreSchema,
  legs: sorenessScoreSchema,
  shoulders: sorenessScoreSchema,
});

export const conditionRecordSchema = z.object({
  checkedOn: isoDateStringSchema,
  conditionScores: conditionScoresSchema,
  memo: z.string().trim().max(1000).optional(),
  muscleSoreness: muscleSorenessSchema,
  timeZone: textField('timeZone', 100),
});

export const listConditionRecordsQuerySchema = z
  .object({
    from: isoDateStringSchema.optional(),
    to: isoDateStringSchema.optional(),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'from must be earlier than or equal to to.',
    path: ['from'],
  });

export type ConditionScoresInput = z.infer<typeof conditionScoresSchema>;
export type MuscleSorenessInput = z.infer<typeof muscleSorenessSchema>;
export type ConditionRecordInput = z.infer<typeof conditionRecordSchema>;
export type ListConditionRecordsQueryInput = z.infer<
  typeof listConditionRecordsQuerySchema
>;
