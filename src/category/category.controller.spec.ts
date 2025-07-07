import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const mockCategoryService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findAllIncludingDeleted: jest.fn(),
  restore: jest.fn(),
};

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockCategoryService }],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const dto: CreateCategoryDto = {
        name: 'Test Category',
        firstImage: 'first-image.jpg',
        secondImage: 'second-image.jpg',
      };
      const result = { id: 1, ...dto };

      (service.create as jest.Mock).mockReturnValue(result);

      const response = controller.create(dto);

      expect(response).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all available categories', () => {
      const result = [{ id: 1, name: 'Category 1' }];

      (service.findAll as jest.Mock).mockReturnValue(result);

      expect(controller.findAll()).toEqual(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a category by id', () => {
      const id = 1;
      const result = { id, name: 'Test Category' };

      (service.findOne as jest.Mock).mockReturnValue(result);

      expect(controller.findOne(id)).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a category', () => {
      const updateDto: UpdateCategoryDto = {
        id: 1,
        name: 'Updated Category',
      };
      const result = { id: 1, name: 'Updated Category' };

      (service.update as jest.Mock).mockReturnValue(result);

      expect(controller.update(updateDto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(updateDto.id, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a category', () => {
      const id = 1;
      const result = { id, available: false };

      (service.remove as jest.Mock).mockReturnValue(result);

      expect(controller.remove(id)).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('findAllIncludingDeleted', () => {
    it('should return all categories including deleted ones', () => {
      const result = [
        { id: 1, name: 'Category 1', available: true },
        { id: 2, name: 'Category 2', available: false },
      ];

      (service.findAllIncludingDeleted as jest.Mock).mockReturnValue(result);

      expect(controller.findAllIncludingDeleted()).toEqual(result);
      expect(service.findAllIncludingDeleted).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore a deleted category', () => {
      const id = 1;
      const result = { id, available: true };

      (service.restore as jest.Mock).mockReturnValue(result);

      expect(controller.restore(id)).toEqual(result);
      expect(service.restore).toHaveBeenCalledWith(id);
    });
  });
});
