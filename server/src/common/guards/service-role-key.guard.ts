import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config/env.schema';

@Injectable()
export class ServiceRoleKeyGuard implements CanActivate {
  private readonly logger = new Logger(ServiceRoleKeyGuard.name);

  constructor(
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const expectedKey = this.configService.get('SERVICE_ROLE_KEY');

    if (!expectedKey) {
      this.logger.error(
        'Admin exercise guide request was blocked because SERVICE_ROLE_KEY is not configured.',
      );
      throw new ServiceUnavailableException(
        '서비스 롤 키가 아직 설정되지 않았어요.',
      );
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const headerValue = request.headers['x-service-role-key'];
    const providedKey = Array.isArray(headerValue)
      ? headerValue[0]
      : headerValue;

    if (!providedKey || providedKey !== expectedKey) {
      throw new ForbiddenException('유효한 서비스 롤 키가 필요해요.');
    }

    return true;
  }
}
