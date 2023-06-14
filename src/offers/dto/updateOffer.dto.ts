import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { CreateOfferDto } from './createOffer.dto';

export class UpdateOfferDto extends PartialType(CreateOfferDto) {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @IsOptional()
  @IsNumber()
  itemId?: number;
}
