import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
  JoinTable,
} from 'typeorm';
import {
  MinLength,
  MaxLength,
  IsInt,
  IsString,
  IsDate,
  IsUrl,
} from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity()
export class Wishlist {
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
  @IsString()
  @MinLength(1, {
    message: 'название списка не может быть короче 1 символа',
  })
  @MaxLength(250, {
    message: 'название списка не может быть длиннее 250 символов',
  })
  name: string;

  @Column({
    type: 'varchar',
    default: '',
  })
  @IsString()
  @MinLength(1, {
    message: 'описание списка не может быть короче 1 символа',
  })
  @MaxLength(1500, {
    message: 'описание списка не может быть длиннее 1500 символов',
  })
  description: string;

  @Column()
  @IsUrl()
  image: string;

  @ManyToMany(() => Wish, (wish) => wish.wishlists)
  @JoinTable()
  items: Wish[];

  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;
}
