import { z } from 'zod';
import { DEFAULT_DATABASE_URL } from '../database/database.constants';

const envSchema = z.object({
  AI_INTEGRATIONS_OPENAI_API_KEY: z.string().min(1).optional(),
  AI_INTEGRATIONS_OPENAI_BASE_URL: z
    .string()
    .url()
    .default('https://api.openai.com/v1'),
  DATABASE_URL: z.string().url().default(DEFAULT_DATABASE_URL),
  PORT: z.coerce.number().int().positive().default(3000),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.parse(config);
}
