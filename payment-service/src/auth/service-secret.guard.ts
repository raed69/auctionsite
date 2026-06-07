import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Guards service-to-service endpoints by validating the `x-service-secret`
 * header against `INTERNAL_SECRET`. Mirrors the guard in user-service so the
 * same shared secret protects internal calls across services.
 */
@Injectable()
export class ServiceSecretGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const secret = request.headers['x-service-secret'];
    const expected = this.configService.get<string>('INTERNAL_SECRET');

    if (!secret || secret !== expected) {
      throw new ForbiddenException('Invalid service secret');
    }
    return true;
  }
}
