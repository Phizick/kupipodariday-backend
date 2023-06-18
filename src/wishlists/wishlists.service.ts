import { ForbiddenException, Injectable } from '@nestjs/common';
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
        'вы не можете изменить коллекцию подарков другого пользователя',
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
        'вы не можете удалить коллекцию подарков другого пользователя',
      );
    }
    await this.wishListsRepository.delete(wishlistId);

    return wishlist;
  }
}
