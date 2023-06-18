import { Injectable, ForbiddenException } from '@nestjs/common';
import { Repository, UpdateResult, MoreThan, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/createWish.dto';
import { UpdateWishDto } from './dto/updateWish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
  ) {}

  async create(owner: User, createWishDto: CreateWishDto) {
    return await this.wishesRepository.save({
      ...createWishDto,
      owner: owner,
    });
  }
  async findLastWishes(): Promise<Wish[]> {
    return await this.wishesRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 40,
    });
  }

  async findTopWishes(): Promise<Wish[]> {
    return await this.wishesRepository.find({
      order: {
        copied: 'DESC',
      },
      where: {
        copied: MoreThan(0),
      },
      take: 10,
    });
  }

  async findOne(wishId: number): Promise<Wish> {
    return await this.wishesRepository.findOne({
      where: {
        id: wishId,
      },
      relations: {
        owner: {
          wishes: true,
          wishlists: true,
        },
        offers: {
          user: true,
          item: true,
        },
      },
    });
  }

  async updateOne(wishId: number, updatedWish: UpdateWishDto, userId: number) {
    const wish = await this.findOne(wishId);

    if (userId !== wish.owner.id) {
      throw new ForbiddenException(
        'вы не можете менять карточки других пользователей',
      );
    }
    if (wish.raised > 0 && wish.price !== undefined) {
      throw new ForbiddenException(
        'вы не можете менять карточки, на которые уже собирают деньги',
      );
    }
    return await this.wishesRepository.update(wishId, updatedWish);
  }

  async updateByRise(id: number, newRise: number): Promise<UpdateResult> {
    return await this.wishesRepository.update({ id: id }, { raised: newRise });
  }

  async remove(wishId: number, userId: number) {
    const wish = await this.findOne(wishId);
    if (userId !== wish.owner.id) {
      throw new ForbiddenException(
        'вы не можете удалить карточку другого пользователя',
      );
    }
    if (wish.raised > 0 && wish.price !== undefined) {
      throw new ForbiddenException(
        'вы не можете удалять карточки, на которые уже собирают деньги',
      );
    }
    await this.wishesRepository.delete(wishId);
    return wish;
  }

  async findMany(items: number[]): Promise<Wish[]> {
    return this.wishesRepository.findBy({ id: In(items) });
  }

  async copyWish(wishId: number, user: User) {
    const wish = await this.findOne(wishId);
    if (user.id === wish.owner.id) {
      throw new ForbiddenException('у вас уже есть эта карточка');
    }
    await this.wishesRepository.update(wishId, {
      copied: (wish.copied += 1),
    });
    const wishCopy = {
      ...wish,
      raised: 0,
      owner: user.id,
      offers: [],
    };
    await this.create(user, wishCopy);
    return {};
  }
}
