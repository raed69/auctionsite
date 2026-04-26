/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Get,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ConnectWalletDto } from './dto/connect-wallet.dto'; // ← add this
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.userService.register(dto);
  }

  @Patch('update-profile/:id')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(id, dto);
  }

  @Post('request-become-seller/:id')
  @UseGuards(JwtAuthGuard)
  upgradeToSeller(@Param('id') id: string) {
    return this.userService.requestSellerUpgrade(id);
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Patch(':id/wallet')
  @UseGuards(JwtAuthGuard) // ← protect wallet connection
  connectWallet(@Param('id') userId: string, @Body() dto: ConnectWalletDto) {
    return this.userService.connectWallet(userId, dto);
  }

  @Get(':id/sol-balance')
  @UseGuards(JwtAuthGuard) // ← protect balance check
  getSolBalance(@Param('id') userId: string) {
    return this.userService.getSolBalance(userId);
  }

// ──────────── ADMIN — USER MANAGEMENT ────────────

@Get('admin/all-users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
getAllUsers() {
  return this.userService.getAllUsers();
}

@Delete('admin/users/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
deleteUser(@Param('id') id: string) {
  return this.userService.deleteUser(id);
}

@Patch('admin/users/:id/ban')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
toggleBanUser(@Param('id') id: string) {
  return this.userService.toggleBanUser(id);
}

// ──────────── ADMIN — SELLER REQUESTS ────────────

@Get('admin/seller-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
getAllSellerRequests() {
  return this.userService.getAllSellerRequests();
}

@Patch('admin/seller-requests/:id/approve')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
approveSellerRequest(@Param('id') id: string) {
  return this.userService.approveSellerRequest(id);
}

@Patch('admin/seller-requests/:id/reject')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
rejectSellerRequest(@Param('id') id: string) {
  return this.userService.rejectSellerRequest(id);
}




}