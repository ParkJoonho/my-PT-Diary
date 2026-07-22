import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import { ZodError } from 'zod';
import { userKeySchema } from '../../modules/weekly-tracker/weekly-tracker.schemas';

export const UserKey = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const rawHeader = request.header('x-user-key');

    try {
      return userKeySchema.parse(rawHeader);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          issues: error.issues.map((issue) => ({
            code: issue.code,
            message: issue.message,
            path: issue.path.join('.'),
          })),
          message: 'Request validation failed.',
        });
      }

      throw error;
    }
  },
);
