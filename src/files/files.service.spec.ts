import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn(),
    },
  },
}));

describe('FilesService', () => {
  let service: FilesService;
  let mockCloudinaryConfig: any;

  beforeEach(async () => {
    mockCloudinaryConfig = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: 'CLOUDINARY', useValue: mockCloudinaryConfig },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1000,
      };

      const mockUploadResult = {
        secure_url: 'https://cloudinary.com/test.jpg',
        public_id: 'test_id',
      };

      (cloudinary.uploader.upload as jest.Mock).mockImplementation(
        (data, options, callback) => {
          callback(null, mockUploadResult);
        },
      );

      const result = await service.uploadFile(mockFile, 'test-folder');

      expect(result).toBe(mockUploadResult.secure_url);
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        expect.stringContaining('data:image/jpeg;base64,'),
        { folder: 'test-folder' },
        expect.any(Function),
      );
    });

    it('should use default folder when none provided', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1000,
      };

      const mockUploadResult = {
        secure_url: 'https://cloudinary.com/test.jpg',
        public_id: 'test_id',
      };

      (cloudinary.uploader.upload as jest.Mock).mockImplementation(
        (data, options, callback) => {
          callback(null, mockUploadResult);
        },
      );

      await service.uploadFile(mockFile);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        expect.any(String),
        { folder: 'coffee-now' },
        expect.any(Function),
      );
    });

    it('should throw RpcException if no file provided', async () => {
      await expect(service.uploadFile(null)).rejects.toThrow(RpcException);
    });

    it('should throw RpcException on cloudinary error', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1000,
      };

      (cloudinary.uploader.upload as jest.Mock).mockImplementation(
        (data, options, callback) => {
          callback(new Error('Upload failed'), null);
        },
      );

      await expect(service.uploadFile(mockFile)).rejects.toThrow(RpcException);
    });

    it('should throw RpcException if cloudinary result is undefined', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1000,
      };

      (cloudinary.uploader.upload as jest.Mock).mockImplementation(
        (data, options, callback) => {
          callback(null, undefined);
        },
      );

      await expect(service.uploadFile(mockFile)).rejects.toThrow(RpcException);
    });

    it('should throw RpcException on general error', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1000,
      };

      // Simulate an error in base64 conversion or other error
      const invalidFile = {
        ...mockFile,
        buffer: null,
      };

      await expect(service.uploadFile(invalidFile)).rejects.toThrow(
        RpcException,
      );
    });
  });
});
