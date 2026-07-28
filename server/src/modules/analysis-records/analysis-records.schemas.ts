import { z } from 'zod';

export const analysisTypeSchema = z.enum([
  'body',
  'body-comparison',
  'posture',
  'state-vector',
]);

export const jsonObjectSchema = z.record(z.string(), z.unknown());

export const listAnalysisRecordsQuerySchema = z.object({
  type: analysisTypeSchema.optional(),
});

export const createAnalysisRecordSchema = z.object({
  analysisType: analysisTypeSchema,
  analyzedAt: z.string().datetime(),
  qualitativeData: jsonObjectSchema.optional(),
  quantitativeData: jsonObjectSchema.optional(),
  rawResult: jsonObjectSchema,
});

export const compareAnalysisRecordsSchema = z.object({
  recordId1: z
    .string()
    .trim()
    .min(1, 'recordId1 is required.')
    .max(255, 'recordId1 must be 255 characters or fewer.'),
  recordId2: z
    .string()
    .trim()
    .min(1, 'recordId2 is required.')
    .max(255, 'recordId2 must be 255 characters or fewer.'),
});

const comparisonBodyTypeChangeSchema = z.object({
  from: z.string().trim().min(1).max(100),
  note: z.string().trim().min(1).max(2000),
  to: z.string().trim().min(1).max(100),
});

const comparisonPostureChangeSchema = z.object({
  after: z.number().min(0).max(100),
  area: z.string().trim().min(1).max(100),
  before: z.number().min(0).max(100),
  change: z.enum(['개선', '유지', '악화']),
  note: z.string().trim().min(1).max(1000),
});

const comparisonQuantitativeChangeSchema = z.object({
  after: z.string().trim().min(1).max(100),
  before: z.string().trim().min(1).max(100),
  changePercent: z.string().trim().min(1).max(100),
  metric: z.string().trim().min(1).max(100),
});

export const analysisRecordComparisonSchema = z.object({
  bodyTypeChange: comparisonBodyTypeChangeSchema,
  declines: z.array(z.string().trim().min(1).max(500)).max(10),
  improvements: z.array(z.string().trim().min(1).max(500)).max(10),
  motivationalNote: z.string().trim().min(1).max(2000),
  overallChange: z.string().trim().min(1).max(3000),
  postureChanges: z.array(comparisonPostureChangeSchema).max(20),
  quantitativeChanges: z.array(comparisonQuantitativeChangeSchema).max(20),
  recommendations: z.array(z.string().trim().min(1).max(500)).min(1).max(10),
});

export type AnalysisTypeInput = z.infer<typeof analysisTypeSchema>;
export type CreateAnalysisRecordInput = z.infer<typeof createAnalysisRecordSchema>;
export type AnalysisRecordComparisonInput = z.infer<
  typeof compareAnalysisRecordsSchema
>;
export type AnalysisRecordComparisonOutput = z.infer<
  typeof analysisRecordComparisonSchema
>;
export type ListAnalysisRecordsQueryInput = z.infer<
  typeof listAnalysisRecordsQuerySchema
>;
