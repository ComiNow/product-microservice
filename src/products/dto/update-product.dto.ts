import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['businessId'] as const),
) {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  id: number;
}
