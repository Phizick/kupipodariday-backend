import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { CacheModule } from '@nestjs/common';
import cacheConfig from '../config/cache.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CacheModule.register(cacheConfig),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
