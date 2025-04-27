import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  IsUrl,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  public name: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Type(() => Number)
  public price: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  public stock: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  public categoryId?: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  public image?: string;
}
