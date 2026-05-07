import type { Role } from './role';

export interface AuthUser {
  id:                   string;
  first_name:           string;
  last_name:            string;
  email:                string;
  role:                 Role;
  balance?:             number;
  profile_picture_url?: string;
  email_verified:       boolean;
}

export interface AuthState {
  user:        AuthUser | null;
  accessToken: string   | null;
  isLoading:   boolean;          // true while rehydrating from localStorage
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name:  string;
  email:      string;
  password:   string;
}