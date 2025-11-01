import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

const mockFilesService = {
  uploadFile: jest.fn(),
};

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [{ provide: FilesService, useValue: mockFilesService }],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadProductImage', () => {
    it('should upload a product image', async () => {
      const fileData = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1000,
        buffer: Buffer.from('test').toString('base64'),
      };

      const fileUrl = 'https://cloudinary.com/test.jpg';

      (service.uploadFile as jest.Mock).mockResolvedValue(fileUrl);

      const result = await controller.uploadProductImage(fileData);

      expect(result).toEqual({ fileName: fileUrl });
      expect(service.uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          size: 1000,
          buffer: Buffer.from('test'),
        }),
        'coffee-now/products',
      );
    });
  });

  describe('uploadCategoryImage', () => {
    it('should upload a category image for first type', async () => {
      const data = {
        file: {
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          size: 1000,
          buffer: Buffer.from('test').toString('base64'),
        },
        type: 'first',
      };

      const fileUrl = 'https://cloudinary.com/test.jpg';

      (service.uploadFile as jest.Mock).mockResolvedValue(fileUrl);

      const result = await controller.uploadCategoryImage(data);

      expect(result).toEqual({ fileName: fileUrl });
      expect(service.uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          size: 1000,
          buffer: Buffer.from('test'),
        }),
        'coffee-now/categories/first',
      );
    });

    it('should upload a category image for second type', async () => {
      const data = {
        file: {
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          size: 1000,
          buffer: Buffer.from('test').toString('base64'),
        },
        type: 'second',
      };

      const fileUrl = 'https://cloudinary.com/test.jpg';

      (service.uploadFile as jest.Mock).mockResolvedValue(fileUrl);

      await controller.uploadCategoryImage(data);

      expect(service.uploadFile).toHaveBeenCalledWith(
        expect.any(Object),
        'coffee-now/categories/second',
      );
    });

    it('should handle other type as second', async () => {
      const data = {
        file: {
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          size: 1000,
          buffer: Buffer.from('test').toString('base64'),
        },
        type: 'other',
      };

      const fileUrl = 'https://cloudinary.com/test.jpg';

      (service.uploadFile as jest.Mock).mockResolvedValue(fileUrl);

      await controller.uploadCategoryImage(data);

      expect(service.uploadFile).toHaveBeenCalledWith(
        expect.any(Object),
        'coffee-now/categories/second',
      );
    });
  });

  describe('deserializeFile', () => {
    it('should deserialize file data correctly', () => {
      const fileData = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1000,
        buffer: Buffer.from('test').toString('base64'),
      };

      // Access private method for testing
      const deserializedFile = (controller as any).deserializeFile(fileData);

      expect(deserializedFile).toEqual({
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1000,
        buffer: Buffer.from('test'),
      });
    });
  });
});
