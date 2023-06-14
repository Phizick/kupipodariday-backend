import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { User } from './entities/user.entity';
import { HashProvider } from '../Utils/hashProvider';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private async _hashPassword(password: string) {
    return await HashProvider.generateHash(password);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this._hashPassword(createUserDto.password);
    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      const hashedPassword = await this._hashPassword(updateUserDto.password);
      return await this.usersRepository.update(
        { id },
        {
          ...updateUserDto,
          password: hashedPassword,
        },
      );
    } else {
      return await this.usersRepository.update({ id }, updateUserDto);
    }
  }

  async removeOne(id: number): Promise<void> {
    await this.usersRepository.delete({ id });
  }
}
