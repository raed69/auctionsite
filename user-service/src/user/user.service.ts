import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {

  // ---------------- REGISTER ----------------
  async register(dto: RegisterDto) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', dto.email)
      .single();

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    const email_verification_token = randomBytes(32).toString('hex');
    const email_verification_expiry = new Date(Date.now() + 3600 * 1000); // 1h

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          first_name: dto.first_name,
          last_name: dto.last_name,
          email: dto.email,
          password_hash,
          email_verified: false,
          email_verification_token,
          email_verification_expiry,
          role: 'buyer', // default role
          signup_date: new Date(),
        },
      ])
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    return {
      message: 'Registration successful. Please verify your email.',
      user: {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        role: data.role,
      },
    };
  }

  // ---------------- LOGIN ----------------
  async login(dto: LoginDto) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', dto.email)
      .single();

    if (!user) throw new UnauthorizedException('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password');

    if (!user.email_verified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ---------------- VERIFY EMAIL ----------------
  async verifyEmail(token: string) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email_verification_token', token)
      .single();

    if (!user) throw new BadRequestException('Invalid verification token');

    if (new Date() > new Date(user.email_verification_expiry)) {
      throw new BadRequestException('Verification token expired');
    }

    const { error } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_expiry: null,
      })
      .eq('id', user.id);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Email verified successfully' };
  }

  // ---------------- UPDATE PROFILE ----------------
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { error } = await supabase
      .from('users')
      .update({
        first_name: dto.first_name,
        last_name: dto.last_name,
      })
      .eq('id', userId);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Profile updated successfully' };
  }

  // ---------------- CHANGE ROLE (Buyer → Seller) ----------------
  async requestSellerUpgrade(userId: string) {
    // Vérifier si une demande déjà en attente existe
    const { data: existingRequest } = await supabase
      .from('seller_requests')
      .select('*')
      .eq('request_owner', userId)
      .eq('status', 'pending')
      .single();
  
    if (existingRequest) {
      throw new BadRequestException('You already have a pending seller request');
    }
  
    // Insérer une nouvelle demande
    const { error } = await supabase
      .from('seller_requests')
      .insert([
        {
          request_owner: userId,
          requested_at: new Date(),  
          status: 'pending',         
        }
      ]);
  
    if (error) throw new BadRequestException(error.message);
  
    return { message: 'Seller request submitted. Waiting for admin approval.' };
  }
  


  
}
