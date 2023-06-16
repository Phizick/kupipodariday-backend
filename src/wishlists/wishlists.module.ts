import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { Wishlist } from './entities/wishlist.entity';
import { wishlistsDependencies } from '../dependencies/wishlistsDependencies';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist]), ...wishlistsDependencies],
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [WishlistsService],
})
export class WishlistsModule {}
