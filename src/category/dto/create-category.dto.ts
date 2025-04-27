import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  public name: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  public firstImage?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  public secondImage?: string;
}
