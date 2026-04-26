import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub:        string;   // user UUID
  email:      string;
  role:       Role;
  first_name: string;
  last_name:  string;
}

/** Shape attached to request.user after guard validation */
export interface AuthenticatedUser {
  userId:     string;
  email:      string;
  role:       Role;
  first_name: string;
  last_name:  string;
}