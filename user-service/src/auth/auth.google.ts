import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { supabase } from 'src/supabase/supabase.client';

@Injectable()
export class AuthGoogleService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Get Google OAuth URL
  getGoogleAuthUrl() {
    const redirectUrl = this.configService.get<string>('GOOGLE_CALLBACK_URL');
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    
    if (!redirectUrl || !supabaseUrl) {
      throw new Error('Missing environment variables: GOOGLE_CALLBACK_URL or SUPABASE_URL');
    }
    
    // TypeScript now knows these are strings (not undefined)
    const encodedRedirectUrl = encodeURIComponent(redirectUrl);
    
    return {
      url: `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodedRedirectUrl}`,
    };
  }

  // Handle Google OAuth callback
  async handleGoogleCallback(code: string) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw new UnauthorizedException('Google authentication failed: ' + error.message);
      }

      const { user: supabaseUser } = data;
      const user = await this.saveOrUpdateUser(supabaseUser);
      const accessToken = this.generateJwtToken(user);

      return {
        message: 'Google Sign-in successful',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          profile_picture_url: user.profile_picture_url,
        },
        accessToken,
      };
    } catch (error: any) {
      throw new UnauthorizedException('Failed to authenticate: ' + error.message);
    }
  }

  private async saveOrUpdateUser(supabaseUser: any) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    const fullName = supabaseUser.user_metadata?.full_name || 
                     supabaseUser.user_metadata?.name || 
                     supabaseUser.email.split('@')[0];
    
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    const userData = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      first_name: firstName,
      last_name: lastName,
      profile_picture_url: supabaseUser.user_metadata?.avatar_url || 
                          supabaseUser.user_metadata?.picture || null,
      last_login: new Date().toISOString(),
    };

    if (existingUser) {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          ...userData,
          email_verified: true,
        })
        .eq('id', supabaseUser.id)
        .select()
        .single();

      if (error) throw error;
      return updatedUser;
    } else {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          role: 'user',
          balance: 0,
          email_verified: true,
          email_verification_token: null,
          email_verification_expiry: null,
          password_hash: '',
          signup_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return newUser;
    }
  }

  private generateJwtToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    };
    return this.jwtService.sign(payload);
  }
}