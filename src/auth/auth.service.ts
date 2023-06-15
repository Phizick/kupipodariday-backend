import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { HashProvider } from '../utils/hashProvider'

@Injectable()
export class AuthService {
  constructor(
      private jwtService: JwtService,
      private usersService: UsersService,
      private readonly configService: ConfigService,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id };
    const secret = this.configService.get('JWT_KEY');
    return { access_token: this.jwtService.sign(payload, { secret }) };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findUserByName(username);
    const isPasswordMatching = await HashProvider.validateHash(
        password,
        user.password,
    );
    if (user && isPasswordMatching) {
      return user;
    }
    return null;
  }
}
