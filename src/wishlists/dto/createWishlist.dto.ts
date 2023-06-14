import { IsString, IsArray, IsUrl, IsNotEmpty } from 'class-validator';

export class CreateWishlistDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUrl()
  image: string;

  @IsNotEmpty()
  @IsArray()
  itemsId: number[];
}
