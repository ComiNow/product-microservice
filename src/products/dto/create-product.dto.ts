import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Min,
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
  @IsArray()
  @IsUrl({}, { each: true })
  public image?: string[];

  @IsString()
  public businessId: string;
}
