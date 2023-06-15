import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/createWishlist.dto';
import { UpdateWishlistDto } from './dto/updateWishlist.dto';
import { JwtGuard } from '../guards/jwt.guard';
import { WishesService } from '../wishes/wishes.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

interface UserRequest extends Request {
  user: User;
}

@Controller('wishlistlists')
export class WishlistsController {
  constructor(
    private readonly wishlistsService: WishlistsService,
    private readonly wishesService: WishesService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.wishlistsService.findAll();
  }

  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Req() req: UserRequest,
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
    const user = await this.usersService.findOne(req.user.id);
    const wishes = await this.wishesService.findWishes(
      createWishlistDto.itemsId,
    );
    if (!wishes) {
      throw new NotFoundException('список подарков не найден');
    }
    return await this.wishlistsService.create(createWishlistDto, user, wishes);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const wishlist = await this.wishlistsService.findOne(+id);
    if (!wishlist[0]) {
      throw new NotFoundException('список подарков не найден');
    }
    return wishlist[0];
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @Req() req: UserRequest,
  ) {
    const user = await this.usersService.findOne(req.user.id);
    const wishlist = await this.wishlistsService.findOne(+id);
    if (!wishlist[0]) {
      throw new NotFoundException('список подарков не найден');
    }
    return this.wishlistsService.updateList(+id, updateWishlistDto, user);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const wishlist = await this.wishlistsService.findOne(+id);
    if (!wishlist[0]) {
      throw new NotFoundException('список подарков не найден');
    }
    await this.wishlistsService.remove(+id);
    return wishlist[0];
  }
}
