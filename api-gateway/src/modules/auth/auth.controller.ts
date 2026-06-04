import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { proxyRequest } from '../../common/proxy.util';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  private readonly userServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.userServiceUrl = this.configService.get<string>('USER_SERVICE_URL') ?? '';
  }

  /** POST /auth/register — public */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: '/auth/register',
      method: 'POST',
      req,
      body,
    });
  }

  /** POST /auth/login — public */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: '/auth/login',
      method: 'POST',
      req,
      body,
    });
  }

  /** GET /auth/google — public, redirects to Google OAuth */
  @Get('google')
  googleAuth(@Res() res: Response) {
    const url = `${this.userServiceUrl}/auth/google`;
    res.redirect(url);
  }

  /** GET /auth/google/callback — public, OAuth callback */
  @Get('google/callback')
  googleCallback(@Req() req: Request, @Res() res: Response) {
    const url = `${this.userServiceUrl}/auth/google/callback`;
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    res.redirect(`${url}?${query}`);
  }

  /** GET /auth/me — protected */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: '/user/me',
      method: 'GET',
      req,
    });
  }
}
