import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService }       from './auth.service';
import { AuthGoogleService } from './auth.google';
import { RegisterDto }       from '../user/dto/register.dto';
import { LoginDto }          from '../user/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService:       AuthService,
    private readonly authGoogleService: AuthGoogleService,
  ) {}

  // ─── Credentials ─────────────────────────────────────────────────────────────

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────────

  @Get('google')
  getGoogleUrl() {
    return this.authGoogleService.getGoogleAuthUrl();
  }

  @Get('google/callback')
  googleCallback(@Query('code') code: string) {
    return this.authGoogleService.handleGoogleCallback(code);
  }
}