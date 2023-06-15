import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { Public } from '../decorators/public';
import { User } from '../users/entities/user.entity';
import { LocalGuard } from '../guards/local.guard';

interface UserRequest extends Request {
  user: User;
}

@Controller()
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @HttpCode(200)
  @UseGuards(LocalGuard)
  @Post('/signin')
  @Public()
  async signin(@Req() req: UserRequest): Promise<{ access_token: string }> {
    const { user } = req;
    return this.authService.auth(user);
  }

  @Post('/signup')
  @Public()
  async signup(@Body() createUserDto: CreateUserDto): Promise<any | undefined> {
    return await this.usersService.create(createUserDto);
  }
}
