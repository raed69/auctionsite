import { Injectable, UnauthorizedException } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // ──────────── REGISTER ────────────
  async register(dto: any) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const emailToken = crypto.randomUUID();
    const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const { data, error } = await supabase
      .from('users')
      .insert({
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
        password: hashed, // ← fixed column name
        email_verified: false,
        email_verification_token: emailToken,
        email_verification_expiry: expiry,
        role: 'buyer', // ← default role
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const token = this.jwtService.sign({
      sub: data.id,
      email: data.email,
      role: data.role, // ← include role
    });

    return {
      message: 'Registered successfully',
      user: {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
      },
      token,
    };
  }

  // ──────────── LOGIN ────────────
  async login(dto: any) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', dto.email)
      .single();

    if (error || !data) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(dto.password, data.password); // ← fixed
    if (!valid) throw new UnauthorizedException('Incorrect password');

    const token = this.jwtService.sign({
      sub: data.id,
      email: data.email,
      role: data.role, // ← include role in token
    });

    return {
      message: 'Login successful',
      user: {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
      },
      token,
    };
  }
}