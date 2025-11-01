import { IsNotEmpty } from 'class-validator';

export class FileUploadDto {
  @IsNotEmpty()
  file: Express.Multer.File;
}

export class FileResponseDto {
  fileName: string;
}
