import {
  Controller,
  Post,
  UseGuards,
  Req,
  Body,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LocalGuard } from '../guards/local.guard';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { User } from '../users/entities/user.entity';

interface UserRequest extends Request {
  user: User;
}

@Controller()
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @HttpCode(200)
  @UseGuards(LocalGuard)
  @Post('signin')
  async signin(@Req() req: UserRequest) {
    const { user } = req;
    return this.authService.auth(user);
  }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }
}
