import { z } from 'zod';
import { isoDateStringSchema } from '../weekly-tracker/weekly-tracker.schemas';

export const workoutReportSummaryQuerySchema = z.object({
  referenceDate: isoDateStringSchema.optional(),
});

export type WorkoutReportSummaryQueryInput = z.infer<
  typeof workoutReportSummaryQuerySchema
>;
