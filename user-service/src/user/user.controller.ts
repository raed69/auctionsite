import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ServiceSecretGuard } from '../auth/guards/service-secret.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/jwt.types';
import { Role } from '../common/enums/role.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ─── Any authenticated user ───────────────────────────────────────────────

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getProfile(user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user.userId, dto, user);
  }

  // ─── Wallet routes ────────────────────────────────────────────────────────

  @Patch('me/wallet')
  @UseGuards(JwtAuthGuard, RolesGuard)
  connectWallet(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConnectWalletDto,
  ) {
    return this.userService.connectWallet(user.userId, dto);
  }

  @Get('me/sol-balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getSolBalance(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getSolBalance(user.userId);
  }

  @Get('me/balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getTndBalance(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getTndBalance(user.userId);
  }

  // ─── Buyer routes ─────────────────────────────────────────────────────────

  @Post('request-seller')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUYER)
  requestSeller(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.requestSellerUpgrade(user.userId);
  }

  // ─── Internal endpoints (service-to-service only) ────────────────────────

  @Patch('internal/balance/deduct/:userId')
  @UseGuards(ServiceSecretGuard)
  deductBalance(
    @Param('userId') userId: string,
    @Body() body: { amount: number },
  ) {
    return this.userService.deductBalance(userId, body.amount);
  }

  @Patch('internal/balance/refund/:userId')
  @UseGuards(ServiceSecretGuard)
  refundBalance(
    @Param('userId') userId: string,
    @Body() body: { amount: number },
  ) {
    return this.userService.refundBalance(userId, body.amount);
  }

  // ─── Admin — User Management ──────────────────────────────────────────────

  @Get('admin/all-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getUser(@Param('id') id: string) {
    return this.userService.getProfile(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.userService.updateProfile(id, dto, admin);
  }

  @Delete('admin/users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Patch('admin/users/:id/ban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  toggleBanUser(@Param('id') id: string) {
    return this.userService.toggleBanUser(id);
  }

  // ─── Admin — Seller Requests ──────────────────────────────────────────────

  @Get('admin/seller-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllSellerRequests() {
    return this.userService.getAllSellerRequests();
  }

  @Post('admin/seller-requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  approveSeller(@Param('id') id: string) {
    return this.userService.approveSeller(id);
  }

  @Post('admin/seller-requests/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  rejectSeller(@Param('id') id: string) {
    return this.userService.rejectSeller(id);
  }
  @Get('internal/:userId')
  @UseGuards(ServiceSecretGuard)
  getInternalUser(@Param('userId') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Patch('internal/balance/credit/:userId')
  @UseGuards(ServiceSecretGuard)
  creditBalance(
    @Param('userId') userId: string,
    @Body() body: { amount: number },
  ) {
    return this.userService.creditBalance(userId, body.amount);
  }

}