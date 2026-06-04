import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { proxyRequest } from '../../common/proxy.util';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('user')
export class UsersController {
  private readonly userServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.userServiceUrl = this.configService.get<string>('USER_SERVICE_URL') ?? '';
  }

  // ─── Any authenticated user ───────────────────────────────────────────────

  /** GET /user/me */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: '/user/me',
      method: 'GET',
      req,
    });
  }

  /** PATCH /user/me */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(@Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: '/user/me',
      method: 'PATCH',
      req,
      body,
    });
  }

  // ─── Wallet ───────────────────────────────────────────────────────────────

  /** PATCH /user/me/wallet */
  @Patch('me/wallet')
  @UseGuards(JwtAuthGuard)
  connectWallet(@Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: '/user/me/wallet',
      method: 'PATCH',
      req,
      body,
    });
  }

  /** GET /user/me/sol-balance */
  @Get('me/sol-balance')
  @UseGuards(JwtAuthGuard)
  getSolBalance(@Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: '/user/me/sol-balance',
      method: 'GET',
      req,
    });
  }

  /** GET /user/me/balance */
  @Get('me/balance')
  @UseGuards(JwtAuthGuard)
  getTndBalance(@Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: '/user/me/balance',
      method: 'GET',
      req,
    });
  }

  // ─── Buyer ────────────────────────────────────────────────────────────────

  /** POST /user/request-seller */
  @Post('request-seller')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  requestSeller(@Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: '/user/request-seller',
      method: 'POST',
      req,
    });
  }

  // ─── Internal (service-to-service) ───────────────────────────────────────

  /** PATCH /user/internal/balance/deduct/:userId */
  @Patch('internal/balance/deduct/:userId')
  deductBalance(
    @Param('userId') userId: string,
    @Body() body: any,
    @Req() req: Request,
    @Headers('x-internal-secret') secret: string,
  ) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: `/user/internal/balance/deduct/${userId}`,
      method: 'PATCH',
      req,
      body,
    });
  }

  /** PATCH /user/internal/balance/refund/:userId */
  @Patch('internal/balance/refund/:userId')
  refundBalance(
    @Param('userId') userId: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: `/user/internal/balance/refund/${userId}`,
      method: 'PATCH',
      req,
      body,
    });
  }

  /** PATCH /user/internal/balance/credit/:userId */
  @Patch('internal/balance/credit/:userId')
  creditBalance(
    @Param('userId') userId: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: `/user/internal/balance/credit/${userId}`,
      method: 'PATCH',
      req,
      body,
    });
  }

  /** GET /user/internal/:userId */
  @Get('internal/:userId')
  getInternalUser(
    @Param('userId') userId: string,
    @Req() req: Request,
  ) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: `/user/internal/${userId}`,
      method: 'GET',
      req,
    });
  }

  // ─── Admin — User Management ──────────────────────────────────────────────

  /** GET /user/admin/all-users */
  @Get('admin/all-users')
  @UseGuards(JwtAuthGuard)
  getAllUsers(@Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: '/user/admin/all-users',
      method: 'GET',
      req,
    });
  }

  /** DELETE /user/admin/users/:id */
  @Delete('admin/users/:id')
  @UseGuards(JwtAuthGuard)
  deleteUser(@Param('id') id: string, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: `/user/admin/users/${id}`,
      method: 'DELETE',
      req,
    });
  }

  /** PATCH /user/admin/users/:id/ban */
  @Patch('admin/users/:id/ban')
  @UseGuards(JwtAuthGuard)
  toggleBanUser(@Param('id') id: string, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: `/user/admin/users/${id}/ban`,
      method: 'PATCH',
      req,
    });
  }

  // ─── Admin — Seller Requests ──────────────────────────────────────────────

  /** GET /user/admin/seller-requests */
  @Get('admin/seller-requests')
  @UseGuards(JwtAuthGuard)
  getAllSellerRequests(@Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: '/user/admin/seller-requests',
      method: 'GET',
      req,
    });
  }

  /** POST /user/admin/seller-requests/:id/approve */
  @Post('admin/seller-requests/:id/approve')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  approveSeller(@Param('id') id: string, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: `/user/admin/seller-requests/${id}/approve`,
      method: 'POST',
      req,
    });
  }

  /** POST /user/admin/seller-requests/:id/reject */
  @Post('admin/seller-requests/:id/reject')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  rejectSeller(@Param('id') id: string, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: `/user/admin/seller-requests/${id}/reject`,
      method: 'POST',
      req,
    });
  }

  // ─── Generic user lookup (admin) ─────────────────────────────────────────

  /** GET /user/:id — admin only */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getUser(@Param('id') id: string, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: `/user/${id}`,
      method: 'GET',
      req,
    });
  }

  /** PATCH /user/:id — admin only */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateUser(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.userServiceUrl,
      path: `/user/${id}`,
      method: 'PATCH',
      req,
      body,
    });
  }
}
