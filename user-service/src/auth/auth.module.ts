import { Module }         from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule }      from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController }    from './auth.controller';
import { AuthService }       from './auth.service';
import { AuthGoogleService } from './auth.google';
import { JwtStrategy }       from './strategies/jwt.strategy';
import { JwtAuthGuard }      from './guards/jwt-auth.guard';
import { RolesGuard }        from './guards/roles.guard';
import { MailModule }        from '../mail/mail.module';

@Module({
  imports: [
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:      config.get<string>('JWT_SECRET') ?? 'supersecretkey',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGoogleService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class AuthModule {}
