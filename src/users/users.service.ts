import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { User } from './entities/user.entity';
import { HashProvider } from '../utils/hashProvider';

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
    try {
      const hashedPassword = await this._hashPassword(createUserDto.password);
      const user = await this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return await this.usersRepository.save(user);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('не удалось создать пользователя');
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(
          `пользователь с идентификатором ${id} не найден`,
        );
      }
      return user;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'не удалось получить пользователя',
      );
    }
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto) {
    try {
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
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `нее удалось обновить пользователя с идентификатором ${id}`,
      );
    }
  }

  async removeOne(id: number): Promise<void> {
    await this.usersRepository.delete({ id });
  }

  async findUserByName(username: string) {
    try {
      const user = await this.usersRepository.findOne({
        select: {
          id: true,
          username: true,
          password: true,
        },
        where: {
          username,
        },
      });
      if (!user) {
        throw new NotFoundException(`пользователь ${username} не найден`);
      }
      return user;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `не удалось получить пользователя ${username}`,
      );
    }
  }

  async findUserByAllCredentials(username: string) {
    try {
      const user = await this.usersRepository.findOne({
        select: ['id', 'username', 'about', 'avatar', 'createdAt', 'updatedAt'],
        where: { username },
      });
      if (!user) {
        throw new NotFoundException(`пользователь ${username} не найден`);
      }
      return user;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `не удалось получить пользователя ${username}`,
      );
    }
  }

  async validateJwt(id: number) {
    return await this.usersRepository.find({
      select: {
        id: true,
        username: true,
      },
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async findAllUsers(query: string) {
    try {
      return await this.usersRepository.find({
        where: [{ username: query }, { email: query }],
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `не удалось получить список пользователей.`,
      );
    }
  }

  async findMyWishes(id: number) {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(
          `пользователь с идентификатором ${id} не найден`,
        );
      }

      const wishes = await this.usersRepository.find({
        select: ['wishes'],
        relations: {
          wishes: {
            owner: true,
            offers: {
              user: {
                wishes: true,
                offers: true,
                wishlists: {
                  owner: true,
                  items: true,
                },
              },
            },
          },
        },
        where: {
          id: id,
        },
      });

      const wishesArr = wishes.map((item) => item.wishes);
      return wishesArr[0];
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `не удалось получить список желаний пользователя с идентификатором ${id}`,
      );
    }
  }
}
