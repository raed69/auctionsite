import {Controller,Get,Patch,Post,Body,Param,UseGuards,ParseUUIDPipe,} from '@nestjs/common';
import { UserService }       from './user.service';
import { UpdateProfileDto }  from './dto/update-profile.dto';
import { JwtAuthGuard }      from '../auth/guards/jwt-auth.guard';
import { RolesGuard }        from '../auth/guards/roles.guard';
import { Roles }             from '../auth/decorators/roles.decorator';
import { CurrentUser }       from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/jwt.types';
import { Role }              from '../common/enums/role.enum';

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
}