import { z } from 'zod';
import { isoDateStringSchema } from '../weekly-tracker/weekly-tracker.schemas';
import { textField } from '../workout-records/workout-records.schemas';
import {
  CONDITION_LABELS,
  MUSCLE_SORENESS_LABELS,
} from './condition-records.constants';

const conditionScoreSchema = z.number().int().min(0).max(5);
const sorenessScoreSchema = z.number().int().min(0).max(4);

const legacyConditionScoresSchema = z.object({
  energy: conditionScoreSchema,
  motivation: conditionScoreSchema,
  sleep: conditionScoreSchema,
  stress: conditionScoreSchema,
});

const legacyMuscleSorenessSchema = z.object({
  arms: sorenessScoreSchema,
  back: sorenessScoreSchema,
  chest: sorenessScoreSchema,
  core: sorenessScoreSchema,
  legs: sorenessScoreSchema,
  shoulders: sorenessScoreSchema,
});

const conditionItemSchema = z.object({
  label: z.string().trim().min(1).max(100),
  score: conditionScoreSchema,
});

const sorenessItemSchema = z.object({
  label: z.string().trim().min(1).max(100),
  score: sorenessScoreSchema,
});

function validateOrderedLabels(
  items: { label: string }[],
  expectedLabels: readonly string[],
  path: string,
  ctx: z.RefinementCtx,
) {
  items.forEach((item, index) => {
    if (item.label !== expectedLabels[index]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${path}[${index}] label must be ${expectedLabels[index]}.`,
        path: [index, 'label'],
      });
    }
  });
}

export const conditionsSchema = z
  .array(conditionItemSchema)
  .length(CONDITION_LABELS.length)
  .superRefine((items, ctx) => {
    validateOrderedLabels(items, CONDITION_LABELS, 'conditions', ctx);
  });

export const muscleSorenessSchema = z
  .array(sorenessItemSchema)
  .length(MUSCLE_SORENESS_LABELS.length)
  .superRefine((items, ctx) => {
    validateOrderedLabels(
      items,
      MUSCLE_SORENESS_LABELS,
      'muscleSoreness',
      ctx,
    );
  });

export const conditionRecordSchema = z.object({
  date: isoDateStringSchema,
  weekNumber: z.number().int().min(0).max(999),
  conditions: conditionsSchema,
  muscleSoreness: muscleSorenessSchema,
  timeZone: textField('timeZone', 100).optional(),
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

export type ConditionItemInput = z.infer<typeof conditionItemSchema>;
export type LegacyConditionScoresInput = z.infer<
  typeof legacyConditionScoresSchema
>;
export type LegacyMuscleSorenessInput = z.infer<
  typeof legacyMuscleSorenessSchema
>;
export type ConditionsInput = z.infer<typeof conditionsSchema>;
export type MuscleSorenessInput = z.infer<typeof muscleSorenessSchema>;
export type ConditionRecordInput = z.infer<typeof conditionRecordSchema>;
export type ListConditionRecordsQueryInput = z.infer<
  typeof listConditionRecordsQuerySchema
>;
