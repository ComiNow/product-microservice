import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
  BadRequestException,
  Inject,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, timeout } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { FileUploadDto } from './dto/file-upload.dto';

@ApiTags('files')
@Controller('files')
export class FilesController {
  private readonly logger = new Logger('FilesController');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const serializedFile = this.serializeFile(file);

      const result = await lastValueFrom(
        this.client.send({ cmd: 'upload_product_image' }, serializedFile).pipe(
          timeout(30000),
          catchError((error) => {
            this.logger.error(`Error en microservicio: ${error.message}`);
            throw new InternalServerErrorException(
              'Error processing file upload',
            );
          }),
        ),
      );

      return result;
    } catch (error) {
      this.logger.error(`Error al subir archivo: ${error.message}`);
      throw new InternalServerErrorException('Error uploading file');
    }
  }

  @Post('category/:type')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiParam({
    name: 'type',
    enum: ['first', 'second'],
    description: 'Image type (first or second)',
  })
  async uploadCategoryImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('type') type: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (type !== 'first' && type !== 'second') {
      throw new BadRequestException('Type must be "first" or "second"');
    }

    try {
      const serializedFile = this.serializeFile(file);

      const result = await lastValueFrom(
        this.client
          .send(
            { cmd: 'upload_category_image' },
            {
              file: serializedFile,
              type,
            },
          )
          .pipe(
            timeout(30000),
            catchError((error) => {
              this.logger.error(`Error en microservicio: ${error.message}`);
              throw new InternalServerErrorException(
                'Error processing file upload',
              );
            }),
          ),
      );

      return result;
    } catch (error) {
      this.logger.error(`Error al subir archivo: ${error.message}`);
      throw new InternalServerErrorException('Error uploading file');
    }
  }

  private serializeFile(file: Express.Multer.File) {
    return {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer.toString('base64'),
    };
  }
}
