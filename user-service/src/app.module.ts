import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // 👈 Make sure this file exists in user-service
    }),
    UserModule,
    AuthModule 
  ]
 
})
export class AppModule {}
