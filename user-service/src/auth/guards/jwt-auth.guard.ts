import { Injectable }        from '@nestjs/common';
import { AuthGuard }         from '@nestjs/passport';

/**
 * Validates the Bearer JWT on every protected route.
 * Delegates entirely to JwtStrategy — no manual jwtService.verify() needed.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}