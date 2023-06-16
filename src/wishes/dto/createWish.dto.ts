import { IsNumber, Length, IsUrl } from 'class-validator';

export class CreateWishDto {
  @Length(1, 250, {
    message: 'максимальная длина названия составляет 250 символов',
  })
  name: string;

  @IsUrl(undefined, { message: 'ссылка должна быть URL-адресом' })
  link: string;

  @IsUrl(undefined, { message: 'изображение должно быть URL-адресом' })
  image: string;

  @IsNumber({}, { message: 'цена должна быть числом' })
  price: number;

  @Length(1, 1024, {
    message: 'максимальная длина описания составляет 1024 символа',
  })
  description: string;
}
