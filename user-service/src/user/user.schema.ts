import { Role } from '../common/enums/role.enum';

export interface User {
<<<<<<< HEAD
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    email_verified: boolean;
    email_verification_token: string | null;
    email_verification_expiry: string | null;
    password_hash: string;
    role: string;
    balance: number;
    shipping_address?: string;
    profile_picture_url?: string;
    last_login?: string;
    signup_date: string;
    phantom_wallet_address?: string | null;
  }
  
=======
  id:                        string;
  first_name:                string;
  last_name:                 string;
  email:                     string;
  email_verified:            boolean;
  email_verification_token:  string | null;
  email_verification_expiry: string | null;
  password:             string;
  role:                      Role;
  balance:                   number;
  shipping_address?:         string;
  profile_picture_url?:      string;
  last_login?:               string;
  signup_date:               string;
}

/** Safe public shape — never expose password or tokens */
export type PublicUser = Omit<
  User,
  'password' | 'email_verification_token' | 'email_verification_expiry'
>;
>>>>>>> origin/feature/user-service-amina
