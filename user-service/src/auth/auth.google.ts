import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService }                      from '@nestjs/config';
import { AuthService }                        from './auth.service';
import { supabase }                           from '../supabase/supabase.client';
import { Role }                               from '../common/enums/role.enum';

@Injectable()
export class AuthGoogleService {
  constructor(
    private readonly authService: AuthService,
    private readonly config:      ConfigService,
  ) {}

  // ─── STEP 1: Redirect URL ────────────────────────────────────────────────────

  getGoogleAuthUrl(): { url: string } {
    const redirectUrl   = this.config.getOrThrow<string>('GOOGLE_CALLBACK_URL');
    const supabaseUrl   = this.config.getOrThrow<string>('SUPABASE_URL');
    const encodedRedirect = encodeURIComponent(redirectUrl);

    return {
      url: `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodedRedirect}`,
    };
  }

  // ─── STEP 2: Handle callback ─────────────────────────────────────────────────

  async handleGoogleCallback(code: string) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw new UnauthorizedException('Google authentication failed: ' + error.message);
    }

    const supabaseUser = data.user;
    const user         = await this.upsertGoogleUser(supabaseUser);
    const accessToken  = this.authService.signToken(user);

    return {
      message:     'Google sign-in successful',
      user:        {
        id:                  user.id,
        email:               user.email,
        first_name:          user.first_name,
        last_name:           user.last_name,
        role:                user.role,
        profile_picture_url: user.profile_picture_url,
      },
      accessToken,
    };
  }

  // ─── UPSERT ──────────────────────────────────────────────────────────────────

  private async upsertGoogleUser(supabaseUser: any) {
    const fullName  = supabaseUser.user_metadata?.full_name
                   ?? supabaseUser.user_metadata?.name
                   ?? supabaseUser.email.split('@')[0];

    const [firstName, ...rest] = fullName.split(' ');

    const commonFields = {
      id:                  supabaseUser.id,
      email:               supabaseUser.email,
      first_name:          firstName || 'User',
      last_name:           rest.join(' ') || '',
      profile_picture_url: supabaseUser.user_metadata?.avatar_url
                        ?? supabaseUser.user_metadata?.picture
                        ?? null,
      email_verified:      true,
      last_login:          new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('users')
        .update(commonFields)
        .eq('id', supabaseUser.id)
        .select()
        .single();

      if (error) throw new UnauthorizedException(error.message);
      return data;
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        ...commonFields,
        role:                      Role.BUYER,
        balance:                   0,
        password:             '',
        email_verification_token:  null,
        email_verification_expiry: null,
        signup_date:               new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new UnauthorizedException(error.message);
    return data;
  }
}