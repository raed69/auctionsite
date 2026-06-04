import {
  Controller,
  Get,
  Param,
  Headers,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserInternalController {
  constructor(private readonly userService: UserService) {}

  @Get('internal/:id')
  getInternalUser(
    @Param('id') id: string,
    @Headers('x-internal-secret') secret: string,
  ) {
    console.log('=== INTERNAL ROUTE HIT ===');
    console.log('ID:', id);
    console.log('Secret received:', secret);
    console.log('Expected secret:', process.env.INTERNAL_SECRET);

    if (secret !== process.env.INTERNAL_SECRET) {
      throw new ForbiddenException('Unauthorized internal request');
    }
    return this.userService.getUserById(id);
  }
}
