import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
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
import { Wishlist } from './entities/wishlist.entity';

interface Request {
  user?: any;
}

@UseGuards(JwtGuard)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(private wishlistsService: WishlistsService) {}

  @UseGuards(JwtGuard)
  @Get()
  async findAll(): Promise<Wishlist[]> {
    try {
      return await this.wishlistsService.findMany();
    } catch (error) {
      console.log(error);
      throw new NotFoundException('коллекции не найдены');
    }
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Wishlist> {
    try {
      return await this.wishlistsService.findOne(id);
    } catch (error) {
      console.log(error);
      throw new NotFoundException('коллекция не найдена');
    }
  }

  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Req() req: Request,
    @Body() createWishListDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    try {
      return await this.wishlistsService.create(createWishListDto, req.user);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('ошибка при создании коллекции');
    }
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async updateOne(
    @Body() updateWishlistDto: UpdateWishlistDto,
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Wishlist> {
    try {
      return await this.wishlistsService.updateOne(
        req.user.id,
        updateWishlistDto,
        +id,
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('ошибка при обновлении коллекции');
    }
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(
    @Req() req: Request,
    @Param('id') id: number,
  ): Promise<Wishlist> {
    try {
      return await this.wishlistsService.remove(id, req.user.id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('ошибка при удалении коллекции');
    }
  }
}
