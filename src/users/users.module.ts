import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
export class UsersModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const entities = this.configService.get<string[]>('database.entities');
    if (!Array.isArray(entities) || !entities.includes(User.name)) {
      console.error(
        'ошибка при импорте: не найдено в опциях модуля, отредактируйте .env добавив DATABASE_ENTITIES',
      );
    }
  }
}
