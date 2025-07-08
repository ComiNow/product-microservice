import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrismaService = {
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

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createCategoryDto = {
        name: 'Test Category',
        firstImage: 'first-image.jpg',
      };
      const expectedCategory = {
        id: 1,
        ...createCategoryDto,
        secondImage: null,
        available: true,
      };

      mockPrismaService.category.create.mockResolvedValue(expectedCategory);

      const result = await service.create(createCategoryDto);

      expect(result).toEqual(expectedCategory);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: createCategoryDto,
      });
    });

    it('should throw RpcException on error', async () => {
      const createCategoryDto = {
        name: 'Test Category',
        firstImage: 'first-image.jpg',
      };
      mockPrismaService.category.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('findAll', () => {
    it('should return available categories with products', async () => {
      const categories = [
        {
          id: 1,
          name: 'Test Category',
          firstImage: 'first-image.jpg',
          secondImage: 'second-image.jpg',
          available: true,
          products: [{ id: 1, name: 'Product 1', available: true }],
        },
      ];
      mockPrismaService.category.findMany.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(result).toEqual(categories);
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { available: true },
        include: {
          products: {
            where: { available: true },
          },
        },
      });
    });

    it('should throw RpcException on error', async () => {
      mockPrismaService.category.findMany.mockRejectedValue(
        new Error('Database error'),
      );
      await expect(service.findAll()).rejects.toThrow(RpcException);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const categoryWithProducts = {
        id: 1,
        name: 'Test Category',
        firstImage: 'first-image.jpg',
        secondImage: 'second-image.jpg',
        available: true,
        products: [],
      };
      mockPrismaService.category.findUnique.mockResolvedValue(
        categoryWithProducts,
      );

      const result = await service.findOne(1);

      expect(result).toEqual(categoryWithProducts);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
          available: true,
        },
        include: {
          products: {
            where: { available: true },
          },
        },
      });
    });

    it('should throw RpcException if category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(RpcException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto = { id: 1, name: 'Updated Category' };
      const findOneResult = { id: 1, name: 'Old Category', available: true };
      const updatedCategory = { ...findOneResult, name: 'Updated Category' };

      mockPrismaService.category.findUnique.mockResolvedValue(findOneResult);
      mockPrismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedCategory);
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Category' },
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a category when no products exist', async () => {
      const mockCategoryData = {
        id: 1,
        name: 'Test Category',
        available: true,
      };
      const deletedCategory = { ...mockCategoryData, available: false };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategoryData);
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.category.update.mockResolvedValue(deletedCategory);

      const result = await service.remove(1);

      expect(result).toEqual(deletedCategory);
      expect(prisma.product.count).toHaveBeenCalledWith({
        where: { categoryId: 1, available: true },
      });
    });

    it('should throw RpcException if category has available products', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Category',
        available: true,
      });
      mockPrismaService.product.count.mockResolvedValue(3);

      await expect(service.remove(1)).rejects.toThrow(RpcException);
    });
  });

  describe('findAllIncludingDeleted', () => {
    it('should return all categories including deleted ones', async () => {
      const categories = [{ id: 1, name: 'Category 1', available: false }];
      mockPrismaService.category.findMany.mockResolvedValue(categories);

      const result = await service.findAllIncludingDeleted();

      expect(result).toEqual(categories);
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        include: { products: true },
      });
    });
  });

  describe('restore', () => {
    it('should restore a deleted category', async () => {
      const deletedCategory = { id: 1, name: 'Test', available: false };
      const restoredCategory = { ...deletedCategory, available: true };

      mockPrismaService.category.findUnique.mockResolvedValue(deletedCategory);
      mockPrismaService.category.update.mockResolvedValue(restoredCategory);

      const result = await service.restore(1);

      expect(result).toEqual(restoredCategory);
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { available: true },
      });
    });

    it('should throw RpcException if category is already available', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test',
        available: true,
      });
      await expect(service.restore(1)).rejects.toThrow(RpcException);
    });
  });
});
