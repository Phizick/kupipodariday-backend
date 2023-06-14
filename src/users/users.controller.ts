import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { JwtGuard } from '../guards/jwt.guard';
import { User } from './entities/user.entity';

interface UserRequest extends Request {
  user: User;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  me(@Req() req: UserRequest) {
    return this.usersService.findOne(req.user.id);
  }

  @UseGuards(JwtGuard)
  @Get(':username')
  async getUserByAllCredentials(@Param() params: { username: string }) {
    const user = await this.usersService.findUserByAllCredentials(
      params.username,
    );
    if (!user) {
      throw new NotFoundException('пользователь не найден');
    }
    return user;
  }

  @UseGuards(JwtGuard)
  @Get('me/wishes')
  async getMyWishes(@Req() req: UserRequest) {
    const { id } = req.user;
    return await this.usersService.findMyWishes(id);
  }

  @UseGuards(JwtGuard)
  @Get('me/:username')
  async getUserByName(@Param() params: { username: string }) {
    const user = await this.usersService.findUserByName(params.username);
    if (!user) {
      throw new NotFoundException('пользователь не найден');
    }
    return user;
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  async updateUser(
    @Req() req: UserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = this.usersService.findOne(req.user.id);
    if (!user) {
      throw new UnauthorizedException(
        'вы можете редактировать только свой профиль',
      );
    }
    const { id } = req.user;
    await this.usersService.updateOne(id, updateUserDto);
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Post('find')
  async findAllUsers(@Body() body: { query: string }) {
    return await this.usersService.findAllUsers(body.query);
  }

  @UseGuards(JwtGuard)
  @Get(':username/wishes')
  async getUsersWishes(@Param() params: { username: string }) {
    const user = await this.usersService.findUserByAllCredentials(
      params.username,
    );
    if (!user) {
      throw new NotFoundException('пользователь не найден');
    }
    return await this.usersService.findMyWishes(user.id);
  }
}
