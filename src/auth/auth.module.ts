import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        jwtModuleOptions(configService),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

const jwtModuleOptions = (configService: ConfigService): JwtModuleOptions => {
  const jwtSecret = configService.get<string>('JWT_SECRET') || 'default-secret';
  const jwtExpiresIn = Math.floor(
    configService.get<number>('JWT_EXPIRES_IN') || 3600,
  );

  return {
    secret: jwtSecret,
    signOptions: {
      expiresIn: jwtExpiresIn,
    },
  };
};
