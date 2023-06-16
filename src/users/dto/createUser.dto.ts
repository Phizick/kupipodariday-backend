import {
  Length,
  IsNotEmpty,
  IsEmail,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @Length(2, 30)
  @Transform(({ value }) => value?.trim())
  username: string;

  @IsOptional()
  @Length(2, 200)
  @Transform(({ value }) => value?.trim())
  about: string;

  @IsOptional()
  @IsUrl()
  avatar: string;

  @IsEmail()
  @Transform(({ value }) => value?.trim())
  email: string;

  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  password: string;
}
