import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserInternalController } from './user-internal.controller';
@Module({
  controllers: [UserController, UserInternalController],
  providers: [UserService],
  exports: [UserService],
  imports: [AuthModule, HttpModule, ConfigModule],
})
export class UserModule {}
