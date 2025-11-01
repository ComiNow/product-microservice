import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { CloudinaryProvider } from '../config/cloudinary.config';

@Module({
  controllers: [FilesController],
  providers: [FilesService, CloudinaryProvider],
  exports: [FilesService],
})
export class FilesModule {}
