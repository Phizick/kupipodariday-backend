import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { Offer } from './entities/offer.entity';
import { offerDependencies } from '../dependencies/offerDependencies';

@Module({
  imports: [TypeOrmModule.forFeature([Offer]), ...offerDependencies],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
