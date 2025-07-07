import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

const mockProductsService = {
  onModuleInit: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  validateProducts: jest.fn(),
  getAvailableProductsByIds: jest.fn(),
  getProductsByIds: jest.fn(),
  $connect: jest.fn(),
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 10.5,
  stock: 100,
  image: ['test-image.jpg'],
  available: true,
  categoryId: 1,
};

const mockDbProduct = {
  id: 1,
  name: 'Test Product',
  price: 10.5,
  stock: 100,
  image: 'test-image.jpg',
  available: true,
  categoryId: 1,
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
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
    it('should create a product with single image', () => {
      const createProductDto = {
        name: 'Test Product',
        price: 10.5,
        stock: 100,
        categoryId: 1,
        image: ['test-image.jpg'],
      };

      (service.create as jest.Mock).mockReturnValue(mockDbProduct);

      const result = service.create(createProductDto);

      expect(result).toEqual(mockDbProduct);
      expect(service.create).toHaveBeenCalledWith(createProductDto);
    });

    it('should create a product with no image', () => {
      const createProductDto = {
        name: 'Test Product',
        price: 10.5,
        stock: 100,
        categoryId: 1,
        image: [],
      };

      (service.create as jest.Mock).mockReturnValue(mockDbProduct);

      service.create(createProductDto);

      expect(service.create).toHaveBeenCalledWith(createProductDto);
    });

    it('should throw RpcException on error', () => {
      const createProductDto = {
        name: 'Test Product',
        price: 10.5,
        stock: 100,
        categoryId: 1,
      };

      (service.create as jest.Mock).mockImplementation(() => {
        throw new RpcException({
          message: 'Error creating product: Database error',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      });

      expect(() => service.create(createProductDto)).toThrow(RpcException);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const paginationDto = { page: 1, limit: 10 };
      const result = {
        data: [mockProduct],
        meta: {
          totalPages: 1,
          page: 1,
          lastPage: 1,
        },
      };

      (service.findAll as jest.Mock).mockResolvedValue(result);

      const response = await service.findAll(paginationDto);

      expect(response).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
    });

    it('should filter by categoryId when provided', async () => {
      const paginationDto = { page: 1, limit: 10, categoryId: 1 };
      const result = {
        data: [],
        meta: {
          totalPages: 0,
          page: 1,
          lastPage: 1,
        },
      };

      (service.findAll as jest.Mock).mockResolvedValue(result);

      await service.findAll(paginationDto);

      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
    });

    it('should throw RpcException on error', async () => {
      const paginationDto = { page: 1, limit: 10 };

      (service.findAll as jest.Mock).mockRejectedValue(
        new RpcException({
          message: 'Error finding products: Database error',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );

      await expect(service.findAll(paginationDto)).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw RpcException if product not found', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(
        new RpcException({
          message: 'Product with id 1 not found or is not available',
          status: HttpStatus.NOT_FOUND,
        }),
      );

      await expect(service.findOne(1)).rejects.toThrow(RpcException);
    });

    it('should throw RpcException if product not available', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(
        new RpcException({
          message: 'Product with id 1 not found or is not available',
          status: HttpStatus.NOT_FOUND,
        }),
      );

      await expect(service.findOne(1)).rejects.toThrow(RpcException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = {
        id: 1,
        name: 'Updated Product',
      };
      const updatedProduct = { ...mockDbProduct, name: 'Updated Product' };

      (service.update as jest.Mock).mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedProduct);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should handle image update', async () => {
      const updateDto = {
        id: 1,
        image: ['new-image.jpg'],
      };

      (service.update as jest.Mock).mockResolvedValue(mockDbProduct);

      await service.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should handle empty image array', async () => {
      const updateDto = {
        id: 1,
        image: [],
      };

      (service.update as jest.Mock).mockResolvedValue(mockDbProduct);

      await service.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      const deletedProduct = { ...mockDbProduct, available: false };

      (service.remove as jest.Mock).mockResolvedValue(deletedProduct);

      const result = await service.remove(1);

      expect(result).toEqual(deletedProduct);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('validateProducts', () => {
    it('should validate products and return them', async () => {
      const ids = [1, 2];
      const products = [mockDbProduct, { ...mockDbProduct, id: 2 }];

      (service.validateProducts as jest.Mock).mockResolvedValue(products);

      const result = await service.validateProducts(ids);

      expect(result).toEqual(products);
      expect(service.validateProducts).toHaveBeenCalledWith(ids);
    });

    it('should throw RpcException if some products not found', async () => {
      const ids = [1, 2];

      (service.validateProducts as jest.Mock).mockRejectedValue(
        new RpcException({
          message: 'Some products were not found or are no longer available',
          status: HttpStatus.BAD_REQUEST,
        }),
      );

      await expect(service.validateProducts(ids)).rejects.toThrow(RpcException);
    });
  });

  describe('getAvailableProductsByIds', () => {
    it('should return available products by ids', async () => {
      const ids = [1, 2];
      const availableProducts = [
        {
          ...mockProduct,
          category: { id: 1, name: 'Test Category' },
        },
      ];

      (service.getAvailableProductsByIds as jest.Mock).mockResolvedValue(
        availableProducts,
      );

      const result = await service.getAvailableProductsByIds(ids);

      expect(result).toEqual(availableProducts);
      expect(service.getAvailableProductsByIds).toHaveBeenCalledWith(ids);
    });

    it('should return empty array for invalid input', async () => {
      (service.getAvailableProductsByIds as jest.Mock).mockResolvedValue([]);

      const result = await service.getAvailableProductsByIds([]);
      expect(result).toEqual([]);
    });
  });

  describe('getProductsByIds', () => {
    it('should return products by ids', async () => {
      const ids = [1, 2];
      const products = [mockProduct];

      (service.getProductsByIds as jest.Mock).mockResolvedValue(products);

      const result = await service.getProductsByIds(ids);

      expect(result).toEqual(products);
      expect(service.getProductsByIds).toHaveBeenCalledWith(ids);
    });

    it('should return empty array for invalid input', async () => {
      (service.getProductsByIds as jest.Mock).mockResolvedValue([]);

      const result = await service.getProductsByIds([]);
      expect(result).toEqual([]);
    });
  });
});
