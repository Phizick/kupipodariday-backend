import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOfferDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsBoolean()
  hidden: boolean;

  @IsNotEmpty()
  @IsNumber()
  itemId: number;
}
