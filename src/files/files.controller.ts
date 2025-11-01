import { Controller, Logger } from '@nestjs/common';
import { FilesService } from './files.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('files')
export class FilesController {
  private readonly logger = new Logger('FilesController');

  constructor(private readonly filesService: FilesService) {}

  @MessagePattern({ cmd: 'upload_product_image' })
  async uploadProductImage(
    @Payload() fileData: any,
  ): Promise<{ fileName: string }> {
    try {
      const file = this.deserializeFile(fileData);
      const fileUrl = await this.filesService.uploadFile(
        file,
        'coffee-now/products',
      );
      return { fileName: fileUrl };
    } catch (error) {
      this.logger.error(`Error en uploadProductImage: ${error.message}`);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'upload_category_image' })
  async uploadCategoryImage(
    @Payload() data: { file: any; type: string },
  ): Promise<{ fileName: string }> {
    try {
      const file = this.deserializeFile(data.file);
      const folderPath = `coffee-now/categories/${data.type === 'first' ? 'first' : 'second'}`;

      const fileUrl = await this.filesService.uploadFile(file, folderPath);
      return { fileName: fileUrl };
    } catch (error) {
      this.logger.error(`Error en uploadCategoryImage: ${error.message}`);
      throw error;
    }
  }

  private deserializeFile(fileData: any) {
    return {
      originalname: fileData.originalname,
      mimetype: fileData.mimetype,
      size: fileData.size,
      buffer: Buffer.from(fileData.buffer, 'base64'),
    };
  }
}
