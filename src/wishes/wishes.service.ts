import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository, Any } from 'typeorm';
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

  async create(createWishDto: CreateWishDto, user: User) {
    try {
      const wish = await this.wishesRepository.create({
        ...createWishDto,
        owner: user,
      });
      const savedWish = await this.wishesRepository.save(wish);
      if (!savedWish) {
        throw new BadRequestException('неверные данные при создании подарка');
      }
      return savedWish;
    } catch (error) {
      throw new InternalServerErrorException(`не удалось создать подарок`);
    }
  }

  async findMany(): Promise<Wish[]> {
    try {
      const wishes = await this.wishesRepository.find({
        relations: ['owner'],
        order: { createdAt: 'DESC' },
        take: 40,
      });
      if (!wishes || wishes.length === 0) {
        throw new NotFoundException('подарки не найдены');
      }
      return wishes;
    } catch (error) {
      throw new InternalServerErrorException(
        `не удалось получить список подарков`,
      );
    }
  }

  async findTop(): Promise<Wish[]> {
    try {
      const wishes = await this.wishesRepository.find({
        relations: ['owner'],
        order: { copied: 'DESC' },
        take: 10,
      });
      if (!wishes || wishes.length === 0) {
        throw new NotFoundException('топ подарков не найден');
      }
      return wishes;
    } catch (error) {
      throw new InternalServerErrorException(
        `не удалось получить топ подарков`,
      );
    }
  }

  // async findWishes(wishes: number[]): Promise<Wish[]> {
  //   try {
  //     const foundWishes = await this.wishesRepository.find({
  //       where: { id: Any(wishes) },
  //     });
  //     if (!foundWishes || foundWishes.length === 0) {
  //       throw new NotFoundException('подарки не найдены');
  //     }
  //     return foundWishes;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       `не удалось получить список подарков`,
  //     );
  //   }
  // }

  async findOne(id: number): Promise<Wish> {
    try {
      const wish = await this.wishesRepository.findOne({
        relations: {
          owner: { wishlists: true },
          offers: {
            user: {
              wishes: true,
              offers: true,
              wishlists: { owner: true, items: true },
            },
          },
          wishlists: { items: true },
        },
        where: { id: id },
      });
      if (!wish) {
        throw new NotFoundException(
          `подарок с идентификатором ${id} не найден`,
        );
      }
      return wish;
    } catch (error) {
      throw new InternalServerErrorException(
        `не удалось получить подарок с идентификатором ${id}`,
      );
    }
  }

  async update(id: number, updateWishDto: UpdateWishDto, user: User) {
    const updatedWish = await this.wishesRepository.update(id, {
      ...updateWishDto,
      owner: user,
    });
    if (!updatedWish) {
      throw new ForbiddenException('вы не можете редактировать чужие подарки');
    }
    return updatedWish;
  }

  async remove(id: number) {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: ['wishlists'],
    });
    if (!wish || wish.wishlists.length !== 0) {
      throw new ForbiddenException(
        'нельзя удалить подарок, который находится в коллекции',
      );
    }
    return await this.wishesRepository.delete(id);
  }

  async copy(id: number, user: User): Promise<Wish> {
    try {
      const wish = await this.wishesRepository.findOneBy({ id });
      if (!wish) {
        throw new NotFoundException(`подарок с указанным id ${id} не найден`);
      }

      const existingCopy = await this.wishesRepository.findOneBy({
        name: wish.name,
        owner: user,
      });
      if (existingCopy) {
        throw new ForbiddenException('у вас уже есть копия данного подарка');
      }

      await this.wishesRepository.update(id, { copied: wish.copied + 1 });

      const copyWish = await this.wishesRepository.create({
        ...wish,
        owner: user,
      });

      const savedCopyWish = await this.wishesRepository.save(copyWish);

      if (!savedCopyWish) {
        throw new BadRequestException('не удалось создать копию подарка');
      }

      return savedCopyWish;
    } catch (error) {
      throw new Error(
        `не удалось скопировать подарок  ${id}. причина: ${error.message}`,
      );
    }
  }

  async addRaise(id: number, sum: number) {
    try {
      const updatedWish = await this.wishesRepository.findOneBy({ id });
      if (!updatedWish) {
        throw new NotFoundException(`подарок с указанным ${id} не найден`);
      }
      const { raised } = updatedWish;
      return await this.wishesRepository.update(id, {
        raised: raised + sum,
      });
    } catch (error) {
      throw new Error(`не удалось обновить ${id}. причина: ${error.message}`);
    }
  }
}
