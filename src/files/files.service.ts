import { Inject, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class FilesService {
  private readonly logger = new Logger('FilesService');

  constructor(@Inject('CLOUDINARY') private readonly cloudinaryConfig: any) {}

  async uploadFile(file: any, folder: string = 'coffee-now'): Promise<string> {
    if (!file) {
      throw new RpcException({
        message: 'File is required',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    try {
      const base64Data = file.buffer.toString('base64');
      const fileBase64 = `data:${file.mimetype};base64,${base64Data}`;

      return new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload(fileBase64, { folder }, (error, result) => {
          if (error) {
            this.logger.error(`Error de Cloudinary: ${error.message}`);
            reject(
              new RpcException({
                message: `Error uploading file: ${error.message}`,
                status: HttpStatus.INTERNAL_SERVER_ERROR,
              }),
            );
            return;
          }

          if (!result) {
            this.logger.error('Resultado de Cloudinary es undefined');
            reject(
              new RpcException({
                message: 'Cloudinary result is undefined',
                status: HttpStatus.INTERNAL_SERVER_ERROR,
              }),
            );
            return;
          }

          resolve(result.secure_url);
        });
      });
    } catch (error) {
      this.logger.error(`Error al subir archivo: ${error.message}`);
      throw new RpcException({
        message: `Error uploading file: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
