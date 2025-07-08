import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

const mockPrismaService = {
  product: {
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product with a single image', async () => {
      const createProductDto = {
        name: 'Test Product',
        price: 10.5,
        stock: 100,
        categoryId: 1,
        image: ['test-image.jpg'],
      };
      const expectedProduct = {
        id: 1,
        ...createProductDto,
        image: 'test-image.jpg',
        available: true,
      };

      mockPrismaService.product.create.mockResolvedValue(expectedProduct);

      const result = await service.create(createProductDto);

      expect(result).toEqual(expectedProduct);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          ...createProductDto,
          image: 'test-image.jpg',
        },
      });
    });

    it('should create a product with no image', async () => {
      const createProductDto = {
        name: 'Test Product',
        price: 10.5,
        stock: 100,
        categoryId: 1,
        image: [],
      };
      const expectedProduct = {
        id: 1,
        ...createProductDto,
        image: null,
        available: true,
      };

      mockPrismaService.product.create.mockResolvedValue(expectedProduct);

      const result = await service.create(createProductDto);

      expect(result).toEqual(expectedProduct);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          ...createProductDto,
          image: null,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const mockProducts = [
        {
          id: 1,
          name: 'Test Product',
          image: 'test-image.jpg',
          available: true,
        },
      ];

      mockPrismaService.product.count.mockResolvedValue(1);
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll(paginationDto);

      expect(result.data[0].image).toEqual(['test-image.jpg']);
      expect(result.meta.totalPages).toBe(1);
      expect(prisma.product.count).toHaveBeenCalledWith({
        where: { available: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProductData = {
        id: 1,
        name: 'Test Product',
        image: 'test-image.jpg',
        available: true,
      };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProductData);

      const result = await service.findOne(1);

      expect(result.image).toEqual(['test-image.jpg']);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.any(Object),
      });
    });

    it('should throw RpcException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(RpcException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = { id: 1, name: 'Updated Product' };
      const existingProduct = {
        id: 1,
        name: 'Old',
        available: true,
        image: 'img.jpg',
      };
      const updatedProduct = { ...existingProduct, ...updateDto };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedProduct);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.any(Object),
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      const existingProduct = {
        id: 1,
        name: 'Test',
        available: true,
        image: 'img.jpg',
      };
      const deletedProduct = { ...existingProduct, available: false };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(deletedProduct);

      const result = await service.remove(1);

      expect(result).toEqual(deletedProduct);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { available: false },
      });
    });
  });

  describe('validateProducts', () => {
    it('should validate products and return them', async () => {
      const ids = [1, 2];
      const products = [
        { id: 1, name: 'Product 1', available: true },
        { id: 2, name: 'Product 2', available: true },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      const result = await service.validateProducts(ids);

      expect(result).toEqual(products);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: ids }, available: true },
      });
    });

    it('should throw RpcException if some products not found', async () => {
      const ids = [1, 2];
      const products = [{ id: 1, name: 'Product 1', available: true }];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      await expect(service.validateProducts(ids)).rejects.toThrow(RpcException);
    });
  });

  describe('getAvailableProductsByIds', () => {
    it('should return empty array for null input', async () => {
      const result = await service.getAvailableProductsByIds(null as any);
      expect(result).toEqual([]);
    });
  });

  describe('getProductsByIds', () => {
    it('should return empty array for invalid input', async () => {
      const result = await service.getProductsByIds([]);
      expect(result).toEqual([]);
    });
  });
});
