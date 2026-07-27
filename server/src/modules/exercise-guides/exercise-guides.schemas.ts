import { z } from 'zod';
import { ExerciseGuideCatalogType } from './dto/exercise-guide-response.dto';

export const listExerciseGuidesQuerySchema = z.object({
  catalogType: z.nativeEnum(ExerciseGuideCatalogType).optional(),
});

export const setExerciseGuideLikeSchema = z.object({
  liked: z.boolean(),
});

export type ListExerciseGuidesQueryInput = z.infer<
  typeof listExerciseGuidesQuerySchema
>;
export type SetExerciseGuideLikeInput = z.infer<
  typeof setExerciseGuideLikeSchema
>;
