import { PartialType } from '@nestjs/swagger';
import {
  IsNumber,
  IsUrl,
  IsArray,
  IsOptional,
  Length,
  ArrayNotEmpty,
} from 'class-validator';
import { CreateWishlistDto } from './createWishlist.dto';

export class UpdateWishlistDto extends PartialType(CreateWishlistDto) {
  @IsOptional()
  @Length(1, 250, {
    message:
      'максимальная длина названия составляет 250 символов, минимальная - 1',
  })
  name: string;

  @IsOptional()
  @IsUrl(undefined, { message: 'изображение должно быть URL-адресом' })
  image: string;

  @IsOptional()
  @IsArray({ message: 'список идентификаторов должен быть массивом' })
  @ArrayNotEmpty({ message: 'список идентификаторов не должен быть пустым' })
  @IsNumber(undefined, {
    each: true,
    message: 'список идентификаторов должен содержать только числа',
  })
  itemsId: number[];

  @IsOptional()
  @Length(10, 1500, {
    message:
      'максимальная длина описания составляет 1500 символов, минимальная - 10',
  })
  description: string;
}
