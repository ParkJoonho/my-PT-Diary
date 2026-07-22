import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const parsed = this.schema.safeParse(value);

    if (!parsed.success) {
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
