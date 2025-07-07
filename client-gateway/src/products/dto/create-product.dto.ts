import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  IsUrl,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @IsString()
  @ApiProperty({ example: 'Café Americano' })
  public name: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Type(() => Number)
  @ApiProperty({ example: 25.5 })
  public price: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({ example: 100 })
  public stock: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({ example: 1, required: false })
  public categoryId?: number;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @ApiProperty({
    type: [String],
    example: [
      'https://res.cloudinary.com/djqzawwsy/image/upload/v1621234567/coffee-now/products/cafe.jpg',
    ],
    required: false,
  })
  public image?: string[];
}
