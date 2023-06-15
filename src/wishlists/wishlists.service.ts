import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/createWishlist.dto';
import { UpdateWishlistDto } from './dto/updateWishlist.dto';
import { WishesService } from '../wishes/wishes.service';

// @Injectable()
// export class WishlistsService {
//   constructor(
//     @InjectRepository(Wishlist)
//     private readonly wishListsRepository: Repository<Wishlist>,
//   ) {}
//   async create(
//     createWishlistDto: CreateWishlistDto,
//     user: User,
//     wishes: Wish[],
//   ) {
//     try {
//       const wishList = await this.wishListsRepository.create({
//         ...createWishlistDto,
//         owner: user,
//         items: wishes,
//       });
//       return await this.wishListsRepository.save(wishList);
//     } catch (error) {
//       console.error(error);
//       throw new InternalServerErrorException(
//         'не удалось создать список подарков',
//       );
//     }
//   }
//
//   async findMany() {
//     try {
//       return await this.wishListsRepository.find({
//         relations: {
//           owner: true,
//           items: true,
//         },
//       });
//     } catch (error) {
//       console.error(error);
//       throw new InternalServerErrorException(
//         'не удалось получить списки подарков',
//       );
//     }
//   }
//
//   async findOne(id: number) {
//     try {
//       return await this.wishListsRepository.findOne({
//         relations: {
//           owner: true,
//           items: true,
//         },
//         where: {
//           id,
//         },
//       });
//     } catch (error) {
//       console.error(error);
//       throw new InternalServerErrorException(
//         `не удалось получить список подарков с id=${id}`,
//       );
//     }
//   }
//
//   async updateList(
//     id: number,
//     updateWishlistDto: UpdateWishlistDto,
//     user: User,
//   ) {
//     try {
//       return await this.wishListsRepository.update(id, {
//         ...updateWishlistDto,
//         owner: user,
//       });
//     } catch (error) {
//       console.error(error);
//       throw new InternalServerErrorException(
//         'не удалось обновить список подарков',
//       );
//     }
//   }
//
//   async remove(id: number) {
//     try {
//       const result = await this.wishListsRepository.delete(id);
//       if (result.affected === 0) {
//         throw new NotFoundException(
//           `не удалось найти список подарков с id=${id}`,
//         );
//       }
//     } catch (error) {
//       console.error(error);
//       throw new InternalServerErrorException(
//         'не удалось удалить список подарков',
//       );
//     }
//   }
// }
@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishListsRepository: Repository<Wishlist>,
    private wishesService: WishesService,
  ) {}

  async create(createWishListDto: CreateWishlistDto, user: User) {
    const items = await this.wishesService.findMany(createWishListDto.itemsId);

    const wishList = this.wishListsRepository.create({
      ...createWishListDto,
      items,
      owner: user,
    });

    return await this.wishListsRepository.save(wishList);
  }

  async findMany() {
    return await this.wishListsRepository.find({
      relations: {
        items: true,
        owner: true,
      },
    });
  }

  async findOne(id: number) {
    const wishlist = await this.wishListsRepository.findOne({
      where: { id },
      relations: { items: true, owner: true },
    });
    delete wishlist.owner.password;
    delete wishlist.owner.email;
    return wishlist;
  }

  async updateOne(
    user: User,
    updateWishlistDto: UpdateWishlistDto,
    wishlistId: number,
  ) {
    const wishlist = await this.findOne(wishlistId);
    if (user.id !== wishlist.owner.id) {
      throw new ForbiddenException(
        'Вы не можете изменить список желаний другого пользователя',
      );
    }
    const wishes = await this.wishesService.findMany(updateWishlistDto.itemsId);

    return await this.wishListsRepository.save({
      ...wishlist,
      name: updateWishlistDto.name,
      image: updateWishlistDto.image,
      items: wishes,
    });
  }

  async remove(wishlistId: number, userId: number) {
    const wishlist = await this.findOne(wishlistId);
    if (userId !== wishlist.owner.id) {
      throw new ForbiddenException(
        'Вы не можете удалить список желаний другого пользователя',
      );
    }
    await this.wishListsRepository.delete(wishlistId);
    return wishlist;
  }
}
