import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { HashProvider } from '../utils/hashProvider';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async auth(user: User) {
    const payload = { sub: user.id };
    const secret = this.configService.get('JWT_KEY');
    const access_token = await this.jwtService.signAsync(payload, { secret });
    return { access_token };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findUserByName(username);
    if (!user) return null;

    const isPasswordMatching = await HashProvider.validatePassword(
      password,
      user.password,
    );

    if (isPasswordMatching) return user;
    return null;
  }
}
