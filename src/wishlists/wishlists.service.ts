import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/createWishlist.dto';
import { UpdateWishlistDto } from './dto/updateWishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishListsRepository: Repository<Wishlist>,
  ) {}
  async create(
    createWishlistDto: CreateWishlistDto,
    user: User,
    wishes: Wish[],
  ) {
    try {
      const wishList = await this.wishListsRepository.create({
        ...createWishlistDto,
        owner: user,
        items: wishes,
      });
      return await this.wishListsRepository.save(wishList);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'не удалось создать список подарков',
      );
    }
  }

  async findAll() {
    try {
      return await this.wishListsRepository.find({
        relations: {
          owner: true,
          items: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'не удалось получить списки подарков',
      );
    }
  }

  async findOne(id: number) {
    try {
      return await this.wishListsRepository.findOne({
        relations: {
          owner: true,
          items: true,
        },
        where: {
          id,
        },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `не удалось получить список подарков с id=${id}`,
      );
    }
  }

  async updateList(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    user: User,
  ) {
    try {
      return await this.wishListsRepository.update(id, {
        ...updateWishlistDto,
        owner: user,
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'не удалось обновить список подарков',
      );
    }
  }

  async remove(id: number) {
    try {
      const result = await this.wishListsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `не удалось найти список подарков с id=${id}`,
        );
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'не удалось удалить список подарков',
      );
    }
  }
}
