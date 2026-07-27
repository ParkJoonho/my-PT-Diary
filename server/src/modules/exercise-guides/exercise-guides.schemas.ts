import { z } from 'zod';
import { ExerciseGuideCatalogType } from './dto/exercise-guide-response.dto';

export const listExerciseGuidesQuerySchema = z.object({
  catalogType: z.nativeEnum(ExerciseGuideCatalogType).optional(),
});

export const setExerciseGuideLikeSchema = z.object({
  liked: z.boolean(),
});

const exerciseGuideWriteModelSchema = z.object({
  bodyPart: z.string().trim().min(1).max(100),
  catalogType: z.nativeEnum(ExerciseGuideCatalogType),
  description: z.string().trim().min(1).max(2000),
  displayOrder: z.number().int().min(1).max(9999),
  duration: z.string().trim().min(1).max(50),
  equipment: z.string().trim().min(1).max(200),
  equipmentTypes: z.array(z.string().trim().min(1).max(50)).min(1).max(10),
  initialLikeCount: z.number().int().min(0).max(999999),
  targetMuscles: z.string().trim().min(1).max(200).nullable(),
  title: z.string().trim().min(1).max(200),
  videoUrl: z.string().trim().url(),
});

export const createAdminExerciseGuideSchema = exerciseGuideWriteModelSchema;
export const updateAdminExerciseGuideSchema = exerciseGuideWriteModelSchema;

export type ListExerciseGuidesQueryInput = z.infer<
  typeof listExerciseGuidesQuerySchema
>;
export type SetExerciseGuideLikeInput = z.infer<
  typeof setExerciseGuideLikeSchema
>;
export type CreateAdminExerciseGuideInput = z.infer<
  typeof createAdminExerciseGuideSchema
>;
export type UpdateAdminExerciseGuideInput = z.infer<
  typeof updateAdminExerciseGuideSchema
>;
