import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
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
    try {
      return await this.wishesRepository.save({
        ...createWishDto,
        owner: owner,
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('ошибка создания карточки');
    }
  }
  async findLastWishes(): Promise<Wish[]> {
    try {
      return await this.wishesRepository.find({
        order: {
          createdAt: 'DESC',
        },
        take: 40,
      });
    } catch (error) {
      console.error(error);
      throw new NotFoundException('не удаётся получить последние карточки');
    }
  }

  async findTopWishes(): Promise<Wish[]> {
    try {
      return await this.wishesRepository.find({
        order: {
          copied: 'DESC',
        },
        where: {
          copied: MoreThan(0),
        },
        take: 20,
      });
    } catch (error) {
      console.error(error);
      throw new NotFoundException('не удаётся получить лучшие карточки');
    }
  }

  async findOne(wishId: number): Promise<Wish> {
    try {
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
    } catch (error) {
      console.error(error);
      throw new NotFoundException('не удаётся получить карточку');
    }
  }

  findUserWishes(userId: number) {
    return this.wishesRepository.find({
      where: { owner: { id: userId } },
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
    try {
      return await this.wishesRepository.update(
        { id: id },
        { raised: newRise },
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('не удаётся обновить');
    }
  }

  async remove(wishId: number, userId: number) {
    try {
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
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('не удаётся удалить');
    }
  }

  async findMany(items: number[]): Promise<Wish[]> {
    try {
      return this.wishesRepository.findBy({ id: In(items) });
    } catch (error) {
      console.log(error);
      throw new NotFoundException('не удаётся получить карточки');
    }
  }

  async copyWish(wishId: number, user: User) {
    try {
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
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('не удаётся скопировать карточку');
    }
  }
}
