import { z } from 'zod';
import { DEFAULT_DATABASE_URL } from '../database/database.constants';

const envSchema = z.object({
  DATABASE_URL: z.string().url().default(DEFAULT_DATABASE_URL),
  PORT: z.coerce.number().int().positive().default(3000),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.parse(config);
}
