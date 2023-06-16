import { PartialType } from '@nestjs/swagger';
import { IsOptional, Length, IsNumber, IsInt, IsUrl } from 'class-validator';
import { CreateWishDto } from './createWish.dto';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @IsOptional()
  @Length(1, 250, {
    message: 'максимальная длина названия составляет 250 символов',
  })
  name: string;

  @IsOptional()
  @IsUrl(undefined, { message: 'ссылка должна быть URL-адресом' })
  link: string;

  @IsOptional()
  @IsUrl(undefined, { message: 'изображение должно быть URL-адресом' })
  image: string;

  @IsOptional()
  @IsNumber({}, { message: 'цена должна быть числом' })
  price: number;

  @IsOptional()
  @Length(1, 1024, {
    message: 'максимальная длина описания составляет 1024 символа',
  })
  description: string;

  @IsOptional()
  @IsInt({ message: 'количество собранных средств должно быть целым числом' })
  raised: number;
}
