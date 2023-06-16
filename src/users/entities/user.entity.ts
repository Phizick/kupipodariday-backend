import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import {
  IsInt,
  IsString,
  IsDate,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Wish } from '../../wishes/entities/wish.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @IsInt()
  id: number;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @Column({
    type: 'varchar',
    unique: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'имя пользователя не может содержать меньше 2 символов',
  })
  @MaxLength(30, {
    message: 'имя пользователя не может содержать больше 30 символов',
  })
  username: string;

  @Column({
    type: 'text',
    default: 'Пока ничего не рассказал о себе',
  })
  @IsString()
  @MinLength(2, {
    message: 'в информации о себе не может быть меньше 2 символов',
  })
  @MaxLength(200, {
    message: 'в информации о себе не может быть больше 200 символов',
  })
  about: string;

  @Column({
    type: 'varchar',
    default: 'https://i.pravatar.cc/300',
  })
  @IsString()
  @IsUrl()
  avatar: string;

  @Column({
    type: 'varchar',
    unique: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  @MinLength(6, {
    message: 'пароль не может быть меньше 6 символов',
  })
  password: string;

  @OneToMany(() => Wish, (wish) => wish.owner)
  wishes: Wish[];

  @OneToMany(() => Offer, (offer) => offer.user)
  offers: Offer[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.owner)
  wishlists: Wishlist[];
}
