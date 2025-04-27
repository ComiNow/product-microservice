import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterProductDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;
}
