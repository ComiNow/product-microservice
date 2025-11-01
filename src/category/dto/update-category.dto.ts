import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCategoryDto extends PartialType(
  OmitType(CreateCategoryDto, ['businessId'] as const),
) {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  id: number;
}
