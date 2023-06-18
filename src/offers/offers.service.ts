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
    const wishes = await this.wishesService.findOne(createOfferDto.itemId);
    const wish = await this.wishesService.findOne(wishes.id);
    const sum = wish.price - wish.raised;
    const newRise = Number(wish.raised) + Number(createOfferDto.amount);

    if (wish.owner.id === user.id) {
      throw new ForbiddenException(
        'вы не можете вносить деньги на свои подарки',
      );
    }
    if (createOfferDto.amount > wish.price) {
      throw new ForbiddenException('сумма взноса больше стоимости подарка');
    }

    if (createOfferDto.amount > sum) {
      throw new ForbiddenException(
        'сумма взноса больше оставшейся для сбора суммы на подарок',
      );
    }

    if (wish.raised === wish.price) {
      throw new ForbiddenException('нужная сумма уже собрана');
    }

    await this.wishesService.updateByRise(createOfferDto.itemId, newRise);
    const offerDto = { ...createOfferDto, user: user, item: wish };
    return await this.offerRepository.save(offerDto);
  }

  async findOne(id: number): Promise<Offer> {
    const offer = await this.offerRepository.findOneBy({ id });
    if (!offer) {
      throw new NotFoundException(`не удалось найти заявку с id: ${id}`);
    }
    return offer;
  }

  async findAll(): Promise<Offer[]> {
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
      throw new InternalServerErrorException('не удалось получить все заявки');
    }
  }
}
