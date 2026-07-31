import { z } from 'zod';
import { DEFAULT_DATABASE_URL } from '../database/database.constants';

const optionalNonEmptyString = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.string().min(1).optional(),
);

const envSchema = z.object({
  AI_INTEGRATIONS_OPENAI_API_KEY: optionalNonEmptyString,
  AI_INTEGRATIONS_OPENAI_BASE_URL: z
    .string()
    .url()
    .default('https://api.openai.com/v1'),
  DATABASE_URL: z.string().url().default(DEFAULT_DATABASE_URL),
  PORT: z.coerce.number().int().positive().default(3000),
  SERVICE_ROLE_KEY: optionalNonEmptyString,
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.parse(config);
}
