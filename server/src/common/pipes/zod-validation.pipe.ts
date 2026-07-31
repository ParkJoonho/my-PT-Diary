import {
  BadRequestException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';
import type { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  private readonly logger = new Logger(ZodValidationPipe.name);

  constructor(
    private readonly schema: ZodSchema<T>,
    private readonly logContext?: string,
  ) {}

  transform(value: unknown): T {
    const parsed = this.schema.safeParse(value);

    if (!parsed.success) {
      if (this.logContext) {
        this.logger.error(
          `${this.logContext} validation failed: ${JSON.stringify({
            issues: parsed.error.issues.map((issue) => ({
              code: issue.code,
              message: issue.message,
              path: issue.path.join('.'),
            })),
          })}`,
        );
      }

      throw new BadRequestException({
        issues: parsed.error.issues.map((issue) => ({
          code: issue.code,
          message: issue.message,
          path: issue.path.join('.'),
        })),
        message: 'Request validation failed.',
      });
    }

    return parsed.data;
  }
}
