import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  ForbiddenException,
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
    try {
      return this.usersService.findOne(req.user.id);
    } catch (error) {
      console.error(error);
      throw new NotFoundException('пользователь не найден');
    }
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  async updateUser(
    @Req() req: UserRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = this.usersService.findOne(req.user.id);
    if (!user) {
      throw new ForbiddenException(
        'вы можете редактировать только свой профиль',
      );
    }
    const { id } = req.user;
    await this.usersService.updateOne(id, updateUserDto);
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Get('me/wishes')
  async getMyWishes(@Req() req: UserRequest) {
    const { id } = req.user;
    try {
      return await this.usersService.findMyWishes(id);
    } catch (error) {
      console.error(error);
      throw new NotFoundException('карточки пользователя не найдены');
    }
  }

  @UseGuards(JwtGuard)
  @Get(':username')
  async getUserByAllCredentials(@Param() params: { username: string }) {
    try {
      return await this.usersService.findUserByAllCredentials(params.username);
    } catch (error) {
      console.error(error);
      throw new NotFoundException('пользователь не найден');
    }
  }

  @UseGuards(JwtGuard)
  @Get(':username/wishes')
  async getUsersWishes(@Param() params: { username: string }) {
    try {
      const user = await this.usersService.findUserByAllCredentials(
        params.username,
      );
      return await this.usersService.findMyWishes(user.id);
    } catch (error) {
      console.error(error);
      throw new NotFoundException('карточки пользователя не найдены');
    }
  }

  @UseGuards(JwtGuard)
  @Post('find')
  async findMany(@Body() body: { query: string }) {
    try {
      return await this.usersService.findAllUsers(body.query);
    } catch (error) {
      console.error(error);
      throw new NotFoundException('пользователи не найдены');
    }
  }
}
