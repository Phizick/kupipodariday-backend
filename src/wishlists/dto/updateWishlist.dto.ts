import { PartialType } from '@nestjs/swagger';
import { IsString, IsUrl, IsArray, IsOptional } from 'class-validator';
import { CreateWishlistDto } from './createWishlist.dto';

export class UpdateWishlistDto extends PartialType(CreateWishlistDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsArray()
  itemsId?: number[];
}
