<<<<<<< HEAD
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
=======
import {Controller,Get,Patch,Post,Body,Param,UseGuards,ParseUUIDPipe,} from '@nestjs/common';
import { UserService }       from './user.service';
import { UpdateProfileDto }  from './dto/update-profile.dto';
import { JwtAuthGuard }      from '../auth/guards/jwt-auth.guard';
import { RolesGuard }        from '../auth/guards/roles.guard';
import { Roles }             from '../auth/decorators/roles.decorator';
import { CurrentUser }       from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/jwt.types';
import { Role }              from '../common/enums/role.enum';
>>>>>>> origin/feature/user-service-amina

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)   // All routes in this controller require auth
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ─── Any authenticated user ───────────────────────────────────────────────────

  /** GET /user/me — returns the logged-in user's profile */
  @Get('me')
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getProfile(user.userId);
  }

  /** PATCH /user/me — update own profile */
  @Patch('me')
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user.userId, dto, user);
  }

  // ─── Buyer routes ─────────────────────────────────────────────────────────────

  /** POST /user/request-seller — buyer requests seller upgrade */
  @Post('request-seller')
  @Roles(Role.BUYER)
  requestSeller(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.requestSellerUpgrade(user.userId);
  }

  // ─── Admin routes ─────────────────────────────────────────────────────────────

  /** GET /user/:id — admin can view any user's profile */
  @Get(':id')
  @Roles(Role.ADMIN)
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getProfile(id);
  }

<<<<<<< HEAD
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




=======
  /** PATCH /user/:id — admin can update any user's profile */
  @Patch(':id')
  @Roles(Role.ADMIN)
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.userService.updateProfile(id, dto, admin);
  }

  /** POST /user/seller-requests/:id/approve — admin approves a seller request */
  @Post('seller-requests/:id/approve')
  @Roles(Role.ADMIN)
  approveSeller(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.approveSeller(id);
  }

  /** POST /user/seller-requests/:id/reject — admin rejects a seller request */
  @Post('seller-requests/:id/reject')
  @Roles(Role.ADMIN)
  rejectSeller(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.rejectSeller(id);
  }
>>>>>>> origin/feature/user-service-amina
}