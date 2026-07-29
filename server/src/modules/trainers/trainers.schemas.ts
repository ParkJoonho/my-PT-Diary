import { z } from 'zod';

export const createTrainerConnectRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .max(500, 'message must be 500 characters or fewer.')
    .optional(),
});

export const setTrainerLikeSchema = z.object({
  liked: z.boolean(),
});

export type CreateTrainerConnectRequestInput = z.infer<
  typeof createTrainerConnectRequestSchema
>;
export type SetTrainerLikeInput = z.infer<typeof setTrainerLikeSchema>;
