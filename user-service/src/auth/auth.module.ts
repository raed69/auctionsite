import { Module }         from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule }      from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

<<<<<<< HEAD
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
=======
import { AuthController }    from './auth.controller';
import { AuthService }       from './auth.service';
import { AuthGoogleService } from './auth.google';
import { JwtStrategy }       from './strategies/jwt.strategy';
import { JwtAuthGuard }      from './guards/jwt-auth.guard';
import { RolesGuard }        from './guards/roles.guard';
import { MailModule }        from '../mail/mail.module';
>>>>>>> origin/feature/user-service-amina

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

<<<<<<< HEAD
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
=======
  providers: [
    AuthService,
    AuthGoogleService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
>>>>>>> origin/feature/user-service-amina

  exports: [
    AuthService,
    JwtAuthGuard,
<<<<<<< HEAD
    JwtModule,
    RolesGuard, // 🔥 VERY IMPORTANT → FIXES THE ERROR
=======
    RolesGuard,
    JwtModule,
>>>>>>> origin/feature/user-service-amina
  ],
})
export class AuthModule {}