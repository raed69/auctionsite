import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // REGISTER
  async register(dto: any) {
    const hashed = await bcrypt.hash(dto.password, 10);

    const emailToken = crypto.randomUUID();
    const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    const { data, error } = await supabase
      .from('users')
      .insert({
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
        password: hashed,
        email_verified: false,
        email_verification_token: emailToken,
        email_verification_expiry: expiry,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const token = this.jwtService.sign({
      id: data.id,
      email: data.email,
    });

    return {
      message: 'Registered successfully',
      user: data,
      token,
    };
  }

  // LOGIN
  async login(dto: any) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', dto.email)
      .single();

    if (error) throw new Error('User not found');

    const valid = await bcrypt.compare(dto.password, data.password);
    if (!valid) throw new Error('Incorrect password');

    const token = this.jwtService.sign({
      id: data.id,
      email: data.email,
    });

    return {
      message: 'Login successful',
      user: data,
      token,
    };
  }
}
