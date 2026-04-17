import { Controller, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.userService.register(dto);
  }

  @Patch('update-profile/:id')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(id, dto);
  }
  @Post('request-become-seller/:id')
@UseGuards(JwtAuthGuard)
upgradeToSeller(@Param('id') id: string) {
  return this.userService.requestSellerUpgrade(id);
}

}
