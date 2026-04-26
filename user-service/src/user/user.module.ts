import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [AuthModule, HttpModule, ConfigModule],
})
export class UserModule {}
