import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/createOffer.dto';
import { WishesService } from '../wishes/wishes.service';
import { EmailSenderService } from '../emailSender/emailSender.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
    private readonly emailSenderService: EmailSenderService,
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

      await this.wishesService.addRaise(createOfferDto.itemId, sum);
      const offerDto = { ...createOfferDto, user: user, item: wish };
      const offer = await this.offerRepository.save(offerDto);

      if (sum === wish.price) {
        const usersEmail = wish.offers.map(({ user }) => user.email);
        const message = 'Подарок собран!';
        await this.emailSenderService.sendEmail(usersEmail, message);
      }

      return offer;
    } catch (error) {
      throw new InternalServerErrorException(
        `ошибка при создании записи: ${error.message}`,
      );
    }
  }
}
