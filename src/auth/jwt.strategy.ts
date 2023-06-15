import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_KEY,
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.hasOwnProperty('sub')) {
      throw new UnauthorizedException();
    }
    const user = await this.usersService.validateJwt(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
