import { Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

const logger = new Logger('CloudinaryConfig');

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    logger.log(`Configurando Cloudinary con: ${cloudName}`);

    return cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  },
};
