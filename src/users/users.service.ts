import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const username = await this.findUserByName(createUserDto.username);
    const email = await this.findByEmail(createUserDto.email);
    if (username !== null) {
      throw new ForbiddenException(
        'пользователь с таким именем уже существует, придумайте другое',
      );
    }
    if (email) {
      throw new ForbiddenException(
        'пользователь с таким e-mail уже существует, используйте другой',
      );
    }
    const user = this.usersRepository.create(createUserDto);
    user.password = await HashProvider.generateHash(user.password);
    return await this.usersRepository.save(user);
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
        updateUserDto.password = await HashProvider.generateHash(
          updateUserDto.password,
        );
      }
      if (updateUserDto.username) {
        const username = await this.findUserByName(updateUserDto.username);
        if (username !== null && username.id !== id) {
          throw new ForbiddenException(
            'пользователь с таким логином уже существует',
          );
        }
      }
      if (updateUserDto.email) {
        const email = await this.findByEmail(updateUserDto.email);
        if (email !== null && email.id !== id) {
          throw new ForbiddenException(
            'пользователь с таким email уже сушествует',
          );
        }
      }
      await this.usersRepository.update({ id }, updateUserDto);
      const updatedUser = await this.findOne(id);
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'не удалось обновить пользователя.',
      );
    }
  }

  async findUserByName(username: string) {
    return await this.usersRepository.findOne({
      where: {
        username: username,
      },
    });
  }

  async findUserByAllCredentials(username: string) {
    const user = await this.usersRepository.findOne({
      select: ['id', 'username', 'about', 'avatar', 'createdAt', 'updatedAt'],
      where: { username },
    });
    if (!user) {
      throw new NotFoundException(`пользователь ${username} не найден`);
    }
    return user;
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
    return await this.usersRepository.find({
      where: [{ username: query }, { email: query }],
    });
  }

  async findMyWishes(id: number) {
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
  }
}
