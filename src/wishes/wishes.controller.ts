import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../guards/jwt.guard';
import { WishesService } from './wishes.service';
import { UsersService } from '../users/users.service';
import { CreateWishDto } from './dto/createWish.dto';
import { UpdateWishDto } from './dto/updateWish.dto';
import { User } from '../users/entities/user.entity';

interface UserRequest extends Request {
  user: User;
}

@Controller('wishes')
export class WishesController {
  constructor(
    private readonly wishesService: WishesService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(@Req() req: UserRequest, @Body() createWishDto: CreateWishDto) {
    const user = await this.usersService.findOne(req.user.id);
    return await this.wishesService.create(createWishDto, user);
  }

  @Get('last')
  async findLast() {
    return await this.wishesService.findMany();
  }

  @Get('top')
  async findTop() {
    return await this.wishesService.findTop();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.wishesService.findOne(+id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Req() req: UserRequest,
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    const user = await this.usersService.findOne(req.user.id);
    const wish = await this.wishesService.findOne(+id);

    if (wish.offers.length !== 0) {
      throw new BadRequestException(
        'нельзя изменять стоимость подарка, когда есть желающие скинуться',
      );
    }
    return this.wishesService.update(+id, updateWishDto, user);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const wish = await this.wishesService.findOne(+id);
    await this.wishesService.remove(+id);
    return wish;
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  async copy(@Param('id') id: string, @Req() req: UserRequest) {
    const user = await this.usersService.findOne(req.user.id);
    await this.wishesService.findOne(+id);
    return this.wishesService.copy(+id, user);
  }
}
