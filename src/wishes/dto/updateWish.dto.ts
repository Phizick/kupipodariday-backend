import { PartialType } from '@nestjs/swagger';
import { IsOptional, Length, IsNumber, IsInt, IsUrl } from 'class-validator';
import { CreateWishDto } from './createWish.dto';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @IsOptional()
  @Length(1, 250)
  name: string;

  @IsOptional()
  @IsUrl()
  link: string;

  @IsOptional()
  @IsUrl()
  image: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @Length(1, 1024)
  description: string;

  @IsOptional()
  @IsInt()
  raised: number;
}
