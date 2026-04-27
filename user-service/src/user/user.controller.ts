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
  Headers,

} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/jwt.types';
import { Role } from '../common/enums/role.enum';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}


  // ─── Any authenticated user ───────────────────────────────────────────────

  @Get('me')
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getProfile(user.userId);
  }

  @Patch('me')
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user.userId, dto, user);
  }

  // ─── Wallet routes ────────────────────────────────────────────────────────

  @Patch('me/wallet')
  connectWallet(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConnectWalletDto,
  ) {
    return this.userService.connectWallet(user.userId, dto);
  }

  @Get('me/sol-balance')
  getSolBalance(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getSolBalance(user.userId);
  }

  // ─── Buyer routes ─────────────────────────────────────────────────────────

  @Post('request-seller')
  @Roles(Role.BUYER)
  requestSeller(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.requestSellerUpgrade(user.userId);
  }

  // ─── Admin — User Management ──────────────────────────────────────────────

  @Get('admin/all-users')
  @Roles(Role.ADMIN)
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  getUser(@Param('id') id: string) {
    return this.userService.getProfile(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.userService.updateProfile(id, dto, admin);
  }

  @Delete('admin/users/:id')
  @Roles(Role.ADMIN)
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Patch('admin/users/:id/ban')
  @Roles(Role.ADMIN)
  toggleBanUser(@Param('id') id: string) {
    return this.userService.toggleBanUser(id);
  }

  // ─── Admin — Seller Requests ──────────────────────────────────────────────

  @Get('admin/seller-requests')
  @Roles(Role.ADMIN)
  getAllSellerRequests() {
    return this.userService.getAllSellerRequests();
  }

  @Post('admin/seller-requests/:id/approve')
  @Roles(Role.ADMIN)
  approveSeller(@Param('id') id: string) {
    return this.userService.approveSeller(id);
  }

  @Post('admin/seller-requests/:id/reject')
  @Roles(Role.ADMIN)
  rejectSeller(@Param('id') id: string) {
    return this.userService.rejectSeller(id);
  }

  

}
