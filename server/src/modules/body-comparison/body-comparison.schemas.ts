import { z } from 'zod';

const base64ImageSchema = z
  .string()
  .trim()
  .min(100, 'Image base64 payload must be at least 100 characters long.')
  .max(30_000_000, 'Image base64 payload is too large.');

const bodyChangeDetailSchema = z.object({
  change: z.enum(['개선', '유지', '저하']),
  description: z.string().trim().min(1).max(2000),
  details: z.array(z.string().trim().min(1).max(500)).max(10),
});

export const bodyComparisonResultSchema = z.object({
  bodyChanges: z.object({
    core: bodyChangeDetailSchema,
    lowerBody: bodyChangeDetailSchema,
    upperBody: bodyChangeDetailSchema,
  }),
  bodyComposition: z.object({
    fatChange: z.string().trim().min(1).max(500),
    muscleChange: z.string().trim().min(1).max(500),
    proportionChange: z.string().trim().min(1).max(1000),
  }),
  motivationalMessage: z.string().trim().min(1).max(2000),
  overallChange: z.object({
    grade: z.enum(['S', 'A', 'B', 'C', 'D', 'F']),
    score: z.number().min(0).max(100),
    summary: z.string().trim().min(1).max(3000),
  }),
  postureChanges: z.object({
    improvements: z.array(z.string().trim().min(1).max(500)).max(10),
    overallPosture: z.string().trim().min(1).max(2000),
    remaining: z.array(z.string().trim().min(1).max(500)).max(10),
  }),
  recommendations: z.object({
    improve: z.array(z.string().trim().min(1).max(500)).max(10),
    keepDoing: z.array(z.string().trim().min(1).max(500)).max(10),
    nextGoal: z.string().trim().min(1).max(2000),
  }),
});

export const createBodyComparisonSchema = z.object({
  afterImageBase64: base64ImageSchema,
  beforeImageBase64: base64ImageSchema,
  height: z.coerce
    .number()
    .int()
    .min(50, 'height must be at least 50cm.')
    .max(300, 'height must be 300cm or fewer.')
    .optional(),
  notes: z
    .string()
    .trim()
    .min(1, 'notes cannot be empty.')
    .max(1000, 'notes must be 1000 characters or fewer.')
    .optional(),
});

export type BodyComparisonOutput = z.infer<typeof bodyComparisonResultSchema>;
export type CreateBodyComparisonInput = z.infer<
  typeof createBodyComparisonSchema
>;
