import { Role } from '../enums/role.enum';
import { JwtPayload } from '../types/jwt.types';

/**
 * Minimal user shape required to mint a JWT.
 * Decouples token construction from the full database `User` record.
 */
export interface JwtSignableUser {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

/**
 * Builds the JWT payload from a user record.
 *
 * Centralised so every code path (credentials login, Google OAuth) produces an
 * identically-shaped token. Signing itself stays in `AuthService`, which owns
 * the injected `JwtService`.
 *
 * @param user - the user the token is being issued for
 * @returns the payload to be signed
 */
export function toJwtPayload(user: JwtSignableUser): JwtPayload {
  return {
    sub: user.id,
    email: user.email,
    role: user.role as Role,
    first_name: user.first_name,
    last_name: user.last_name,
  };
}
