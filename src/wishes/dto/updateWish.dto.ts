import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsUrl } from 'class-validator';
import { CreateWishDto } from './createWish.dto';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
