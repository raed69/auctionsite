import { Injectable }          from '@nestjs/common';
import { ConfigService }       from '@nestjs/config';
import { PassportStrategy }    from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, AuthenticatedUser } from '../../common/types/jwt.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest:   ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:      config.get<string>('JWT_SECRET') ?? 'supersecretkey',
    });
  }

  /**
   * Called automatically by Passport after signature verification.
   * Whatever is returned here is attached to request.user.
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      userId:     payload.sub,
      email:      payload.email,
      role:       payload.role,
      first_name: payload.first_name,
      last_name:  payload.last_name,
    };
  }
}