import { PartialType } from '@nestjs/swagger';
import {
  Length,
  IsEmail,
  IsUrl,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { CreateUserDto } from './createUser.dto';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @Length(2, 30)
  @Transform(({ value }) => value?.trim())
  username: string;

  @IsOptional()
  @Length(2, 200)
  @Transform(({ value }) => value?.trim())
  about: string;

  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => value?.trim())
  avatar: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  email: string;

  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  password: string;
}
