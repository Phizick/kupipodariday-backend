import {
  IsArray,
  IsUrl,
  Length,
  IsNumber,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateWishlistDto {
  @Length(1, 250, {
    message:
      'максимальная длина названия составляет 250 символов, минимальная - 1',
  })
  name: string;

  @IsUrl(undefined, { message: 'изображение должно быть URL-адресом' })
  image: string;

  @IsArray({ message: 'список идентификаторов должен быть массивом' })
  @ArrayNotEmpty({ message: 'список идентификаторов не должен быть пустым' })
  @IsNumber(undefined, {
    each: true,
    message: 'список идентификаторов должен содержать только числа',
  })
  itemsId: number[];

  @IsOptional()
  @Length(10, 500, {
    message:
      'максимальная длина описания составляет 500 символов, минимальная - 10',
  })
  description: string;
}
