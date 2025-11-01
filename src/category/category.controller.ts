import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern({ cmd: 'create_category' })
  create(@Payload() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @MessagePattern({ cmd: 'find_all_categories' })
  findAll(@Payload() payload: { businessId: string }) {
    return this.categoryService.findAll(payload.businessId);
  }

  @MessagePattern({ cmd: 'find_one_category' })
  findOne(@Payload() payload: { id: number; businessId: string }) {
    return this.categoryService.findOne(payload.id, payload.businessId);
  }

  @MessagePattern({ cmd: 'update_category' })
  update(
    @Payload()
    payload: {
      id: number;
      updateCategoryDto: UpdateCategoryDto;
      businessId: string;
    },
  ) {
    return this.categoryService.update(
      payload.id,
      payload.updateCategoryDto,
      payload.businessId,
    );
  }

  @MessagePattern({ cmd: 'delete_category' })
  remove(@Payload() payload: { id: number; businessId: string }) {
    return this.categoryService.remove(payload.id, payload.businessId);
  }

  @MessagePattern({ cmd: 'find_all_categories_including_deleted' })
  findAllIncludingDeleted(@Payload() payload: { businessId: string }) {
    return this.categoryService.findAllIncludingDeleted(payload.businessId);
  }

  @MessagePattern({ cmd: 'restore_category' })
  restore(@Payload() payload: { id: number; businessId: string }) {
    return this.categoryService.restore(payload.id, payload.businessId);
  }
}
