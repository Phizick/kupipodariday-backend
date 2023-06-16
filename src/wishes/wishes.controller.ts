import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/createWish.dto';
import { UpdateWishDto } from './dto/updateWish.dto';
import { Wish } from './entities/wish.entity';
import { JwtGuard } from '../guards/jwt.guard';

@Controller('wishes')
export class WishesController {
  constructor(private wishesService: WishesService) {}

  @Get('top')
  async getTopWishes(): Promise<Wish[]> {
    try {
      return await this.wishesService.findTopWishes();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'не удаётся получить лучшие карточки',
      );
    }
  }

  @Get('last')
  async getLastWishes(): Promise<Wish[]> {
    try {
      return await this.wishesService.findLastWishes();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'не удаётся получить последние карточки',
      );
    }
  }

  @Get(':id')
  async getOneWish(@Param('id') id: number): Promise<Wish> {
    try {
      return await this.wishesService.findOne(id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        `не удается получить карточку с указанным id: ${id}`,
      );
    }
  }

  @UseGuards(JwtGuard)
  @Post()
  async createWish(
    @Req() req,
    @Body() createWishDto: CreateWishDto,
  ): Promise<Wish> {
    try {
      const owner = req.user;
      return await this.wishesService.create(owner, createWishDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'при созданиии карточки произошла ошибка',
      );
    }
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  async copyWish(
    @Param('id') id: number,
    @Req() req,
  ): Promise<NonNullable<unknown>> {
    try {
      const owner = req.user;
      return await this.wishesService.copyWish(id, owner);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('не удаётся скопировать карточку');
    }
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async updateOne(
    @Req() req,
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
  ): Promise<NonNullable<unknown>> {
    try {
      const userId = req.user.id;
      return await this.wishesService.updateOne(id, updateWishDto, userId);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('не удаётся обновить карточку');
    }
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(
    @Req() req,
    @Param('id') id: number,
  ): Promise<{ message: string }> {
    try {
      const userId = req.user.id;
      await this.wishesService.remove(id, userId);
      return { message: `карточка с id: ${id} успешно удалена` };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('не удаётся удалить карточку');
    }
  }
}
