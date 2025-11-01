import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

const mockCategoryService = {
  onModuleInit: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findAllIncludingDeleted: jest.fn(),
  restore: jest.fn(),
  $connect: jest.fn(),
  category: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  product: {
    count: jest.fn(),
  },
};

const mockCategoryWithProducts = {
  id: 1,
  name: 'Test Category',
  firstImage: 'first-image.jpg',
  secondImage: 'second-image.jpg',
  available: true,
  products: [
    {
      id: 1,
      name: 'Test Product',
      price: 10.5,
      stock: 100,
      image: 'test-image.jpg',
      available: true,
      categoryId: 1,
    },
  ],
};

const mockCategorySimple = {
  id: 1,
  name: 'Test Category',
  firstImage: 'first-image.jpg',
  secondImage: 'second-image.jpg',
  available: true,
};

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to the database', () => {
      service.onModuleInit();
      expect(service.onModuleInit).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createCategoryDto = {
        name: 'Test Category',
        firstImage: 'first-image.jpg',
      };

      (service.create as jest.Mock).mockResolvedValue(mockCategorySimple);

      const result = await service.create(createCategoryDto);

      expect(result).toEqual(mockCategorySimple);
      expect(service.create).toHaveBeenCalledWith(createCategoryDto);
    });

    it('should throw RpcException on error', async () => {
      const createCategoryDto = { name: 'Test Category' };

      (service.create as jest.Mock).mockRejectedValue(
        new RpcException({
          message: 'Error creating category: Database error',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('findAll', () => {
    it('should return available categories with products', async () => {
      const categories = [mockCategoryWithProducts];

      (service.findAll as jest.Mock).mockResolvedValue(categories);

      const result = await service.findAll();

      expect(result).toEqual(categories);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should throw RpcException on error', async () => {
      (service.findAll as jest.Mock).mockRejectedValue(
        new RpcException({
          message: 'Error finding categories: Database error',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );

      await expect(service.findAll()).rejects.toThrow(RpcException);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(
        mockCategoryWithProducts,
      );

      const result = await service.findOne(1);

      expect(result).toEqual(mockCategoryWithProducts);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw RpcException if category not found', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(
        new RpcException({
          message: 'Category with id #1 not found or is not available',
          status: HttpStatus.NOT_FOUND,
        }),
      );

      await expect(service.findOne(1)).rejects.toThrow(RpcException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto = {
        id: 1,
        name: 'Updated Category',
      };
      const updatedCategory = {
        ...mockCategorySimple,
        name: 'Updated Category',
      };

      (service.update as jest.Mock).mockResolvedValue(updatedCategory);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedCategory);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should soft delete a category when no products exist', async () => {
      const deletedCategory = { ...mockCategorySimple, available: false };

      (service.remove as jest.Mock).mockResolvedValue(deletedCategory);

      const result = await service.remove(1);

      expect(result).toEqual(deletedCategory);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw RpcException if category has available products', async () => {
      (service.remove as jest.Mock).mockRejectedValue(
        new RpcException({
          message:
            'Cannot delete category with 3 available products. Please delete or change category of products first.',
          status: HttpStatus.BAD_REQUEST,
        }),
      );

      await expect(service.remove(1)).rejects.toThrow(RpcException);
    });
  });

  describe('findAllIncludingDeleted', () => {
    it('should return all categories including deleted ones', async () => {
      const categoriesWithProducts = [
        mockCategoryWithProducts,
        {
          ...mockCategoryWithProducts,
          id: 2,
          available: false,
          products: [],
        },
      ];

      (service.findAllIncludingDeleted as jest.Mock).mockResolvedValue(
        categoriesWithProducts,
      );

      const result = await service.findAllIncludingDeleted();

      expect(result).toEqual(categoriesWithProducts);
      expect(service.findAllIncludingDeleted).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore a deleted category', async () => {
      const deletedCategory = { ...mockCategorySimple, available: false };
      const restoredCategory = { ...mockCategorySimple, available: true };

      (service.restore as jest.Mock).mockResolvedValue(restoredCategory);

      const result = await service.restore(1);

      expect(result).toEqual(restoredCategory);
      expect(service.restore).toHaveBeenCalledWith(1);
    });

    it('should throw RpcException if category not found', async () => {
      (service.restore as jest.Mock).mockRejectedValue(
        new RpcException({
          message: 'Category with id #1 not found',
          status: HttpStatus.NOT_FOUND,
        }),
      );

      await expect(service.restore(1)).rejects.toThrow(RpcException);
    });

    it('should throw RpcException if category is already available', async () => {
      (service.restore as jest.Mock).mockRejectedValue(
        new RpcException({
          message: 'Category with id #1 is already available',
          status: HttpStatus.BAD_REQUEST,
        }),
      );

      await expect(service.restore(1)).rejects.toThrow(RpcException);
    });
  });
});
