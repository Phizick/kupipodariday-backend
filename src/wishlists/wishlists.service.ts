import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/createWishlist.dto';
import { UpdateWishlistDto } from './dto/updateWishlist.dto';
import { WishesService } from '../wishes/wishes.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishListsRepository: Repository<Wishlist>,
    private wishesService: WishesService,
  ) {}

  async create(createWishListDto: CreateWishlistDto, user: User) {
    try {
      const items = await this.wishesService.findMany(
        createWishListDto.itemsId,
      );
      const wishList = this.wishListsRepository.create({
        ...createWishListDto,
        items,
        owner: user,
      });
      return await this.wishListsRepository.save(wishList);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `не удалось создать коллекцию подарков. Ошибка: ${error.message}`,
      );
    }
  }

  async findMany() {
    try {
      return await this.wishListsRepository.find({
        relations: {
          items: true,
          owner: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(
        `не удалось найти коллекции. Ошибка: ${error.message}`,
      );
    }
  }

  async findOne(id: number) {
    try {
      const wishlist = await this.wishListsRepository.findOne({
        where: { id },
        relations: { items: true, owner: true },
      });
      delete wishlist.owner.password;
      delete wishlist.owner.email;
      return wishlist;
    } catch (error) {
      throw new NotFoundException(
        `не удалось найти коллекцию подарков. Ошибка: ${error.message}`,
      );
    }
  }

  async updateOne(
    user: User,
    updateWishlistDto: UpdateWishlistDto,
    wishlistId: number,
  ) {
    try {
      const wishlist = await this.findOne(wishlistId);

      if (user.id !== wishlist.owner.id) {
        throw new ForbiddenException(
          'вы не можете изменить коллекцию подарков другого пользователя',
        );
      }

      const wishes = await this.wishesService.findMany(
        updateWishlistDto.itemsId,
      );

      return await this.wishListsRepository.save({
        ...wishlist,
        name: updateWishlistDto.name,
        image: updateWishlistDto.image,
        items: wishes,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `не удалось обновить коллекцию подарков. Ошибка: ${error.message}`,
      );
    }
  }

  async remove(wishlistId: number, userId: number) {
    try {
      const wishlist = await this.findOne(wishlistId);
      if (userId !== wishlist.owner.id) {
        throw new ForbiddenException(
          'вы не можете удалить коллекцию подарков другого пользователя',
        );
      }
      await this.wishListsRepository.delete(wishlistId);

      return wishlist;
    } catch (error) {
      throw new InternalServerErrorException(
        `не удалось удалить коллекцию подарков. Ошибка: ${error.message}`,
      );
    }
  }
}
