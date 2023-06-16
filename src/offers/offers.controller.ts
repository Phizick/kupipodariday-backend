import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/createOffer.dto';
import { JwtGuard } from '../guards/jwt.guard';
import { UsersService } from 'src/users/users.service';
import { User } from '../users/entities/user.entity';

interface UserRequest extends Request {
  user: User;
}

@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtGuard)
  @Post()
  async createOffer(
    @Body() createOfferDto: CreateOfferDto,
    @Req() req: UserRequest,
  ) {
    const { id } = req.user;
    try {
      const user = await this.usersService.findOne(id);
      return await this.offersService.create(createOfferDto, user);
    } catch (error) {
      console.error(error);
      throw new NotFoundException('пользователь не найден');
    }
  }

  @UseGuards(JwtGuard)
  @Get()
  async getOffers() {
    const offers = await this.offersService.findAll();
    if (!offers) {
      throw new NotFoundException('активные зайвки не найдены');
    }
    return offers;
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async getOfferById(@Param('id') id: string) {
    const offer = await this.offersService.findOne(+id);
    if (!offer) {
      throw new NotFoundException('заявка не найдена');
    }
    return offer;
  }
}
