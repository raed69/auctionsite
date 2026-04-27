import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService }  from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { supabase }    from '../supabase/supabase.client';
import { JwtPayload }  from '../common/types/jwt.types';
import { Role }        from '../common/enums/role.enum';
import { RegisterDto } from '../user/dto/register.dto';
import { LoginDto }    from '../user/dto/login.dto';
import * as bcrypt     from 'bcryptjs';
import * as crypto     from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService:  JwtService,
    private readonly mailService: MailService,
  ) {}

  // ─── REGISTER ────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    // 1. Duplicate email check
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', dto.email)
      .maybeSingle();

    if (existing) throw new BadRequestException('Email already in use');

    // 2. Hash password & generate verification token
    const password                  = await bcrypt.hash(dto.password, 10);
    const email_verification_token  = crypto.randomBytes(32).toString('hex');
    const email_verification_expiry = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    // 3. Insert user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        first_name:                dto.first_name,
        last_name:                 dto.last_name,
        email:                     dto.email,
        password,
        email_verified:            false,
        email_verification_token,
        email_verification_expiry,
        role:                      Role.BUYER,
        balance:                   0,
        signup_date:               new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // 4. Send verification email (non-blocking)
    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        email_verification_token,
        user.first_name,
      );
    } catch (mailError: any) {
      console.error('Verification email failed to send:', mailError.message);
    }

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      user:    this.sanitize(user),
    };
  }

  // ─── LOGIN ───────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', dto.email)
      .maybeSingle();

    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    if (!user.email_verified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    return {
      message:     'Login successful',
      user:        this.sanitize(user),
      accessToken: this.signToken(user),
    };
  }

  // ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────

  async verifyEmail(token: string) {
    const { data: user } = await supabase
      .from('users')
      .select('id, email_verification_expiry')
      .eq('email_verification_token', token)
      .maybeSingle();

    if (!user) throw new BadRequestException('Invalid verification token');

    if (new Date() > new Date(user.email_verification_expiry)) {
      throw new BadRequestException('Verification token has expired');
    }

    const { error } = await supabase
      .from('users')
      .update({
        email_verified:            true,
        email_verification_token:  null,
        email_verification_expiry: null,
      })
      .eq('id', user.id);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Email verified successfully. You can now log in.' };
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  signToken(user: { id: string; email: string; role: string; first_name: string; last_name: string }) {
    const payload: JwtPayload = {
      sub:        user.id,
      email:      user.email,
      role:       user.role as Role,
      first_name: user.first_name,
      last_name:  user.last_name,
    };
    return this.jwtService.sign(payload);
  }

  private sanitize(user: any) {
    const { password, email_verification_token, email_verification_expiry, ...safe } = user;
    return safe;
  }
}