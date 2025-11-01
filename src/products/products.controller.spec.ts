import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

const mockProductsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  validateProducts: jest.fn(),
  getAvailableProductsByIds: jest.fn(),
  getProductsByIds: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto: CreateProductDto = {
        name: 'Test Product',
        price: 10.5,
        stock: 100,
        categoryId: 1,
        image: ['test-image.jpg'],
      };
      const result = { id: 1, ...dto };

      (service.create as jest.Mock).mockReturnValue(result);

      const response = controller.create(dto);

      expect(response).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const result = {
        data: [],
        meta: { totalPages: 0, page: 1, lastPage: 1 },
      };

      (service.findAll as jest.Mock).mockReturnValue(result);

      expect(controller.findAll(paginationDto)).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', () => {
      const id = 1;
      const result = {
        id,
        name: 'Test Product',
        price: 10.5,
        image: ['test-image.jpg'],
      };

      (service.findOne as jest.Mock).mockReturnValue(result);

      expect(controller.findOne(id)).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a product', () => {
      const updateDto: UpdateProductDto = {
        id: 1,
        name: 'Updated Product',
      };
      const result = { id: 1, name: 'Updated Product' };

      (service.update as jest.Mock).mockReturnValue(result);

      expect(controller.update(updateDto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(updateDto.id, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a product', () => {
      const id = 1;
      const result = { id, available: false };

      (service.remove as jest.Mock).mockReturnValue(result);

      expect(controller.remove(id)).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('validateProduct', () => {
    it('should validate products', () => {
      const ids = [1, 2, 3];
      const result = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
        { id: 3, name: 'Product 3' },
      ];

      (service.validateProducts as jest.Mock).mockReturnValue(result);

      expect(controller.validateProduct(ids)).toEqual(result);
      expect(service.validateProducts).toHaveBeenCalledWith(ids);
    });
  });

  describe('getAvailableProductsByIds', () => {
    it('should get available products by ids', () => {
      const ids = [1, 2];
      const result = [{ id: 1, available: true }];

      (service.getAvailableProductsByIds as jest.Mock).mockReturnValue(result);

      expect(controller.getAvailableProductsByIds(ids)).toEqual(result);
      expect(service.getAvailableProductsByIds).toHaveBeenCalledWith(ids);
    });
  });

  describe('getProductsByIds', () => {
    it('should get products by ids', () => {
      const ids = [1, 2];
      const result = [{ id: 1 }, { id: 2 }];

      (service.getProductsByIds as jest.Mock).mockReturnValue(result);

      expect(controller.getProductsByIds(ids)).toEqual(result);
      expect(service.getProductsByIds).toHaveBeenCalledWith(ids);
    });
  });
});
