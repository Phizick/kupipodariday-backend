import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/createOffer.dto';
import { WishesService } from '../wishes/wishes.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User) {
    try {
      const wish = await this.wishesService.findOne(createOfferDto.itemId);

      if (wish.owner.id === user.id) {
        throw new ForbiddenException(
          'вы не можете вносить деньги на свои подарки',
        );
      }

      const sum = wish.raised + createOfferDto.amount;

      if (sum > wish.price) {
        throw new ForbiddenException('сумма взноса больше стоимости подарка');
      }

      if (wish.raised === wish.price) {
        throw new ForbiddenException('нужная сумма уже собрана');
      }

      await this.wishesService.updateByRise(createOfferDto.itemId, sum);
      const offerDto = { ...createOfferDto, user: user, item: wish };
      const offer = await this.offerRepository.save(offerDto);

      return offer;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `ошибка при создании заявки: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<Offer> {
    const offer = await this.offerRepository.findOneBy({ id });
    if (!offer) {
      throw new NotFoundException(`не удалось найти заявку с id: ${id}`);
    }
    return offer;
  }

  async findOffers(): Promise<Offer[]> {
    try {
      return this.offerRepository.find({
        relations: {
          item: {
            owner: true,
            offers: true,
          },
          user: {
            wishes: true,
            wishlists: true,
            offers: true,
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('не удалось получить все офферы');
    }
  }
}
