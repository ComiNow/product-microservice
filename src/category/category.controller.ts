import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern({ cmd: 'create_category' })
  create(@Payload() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @MessagePattern({ cmd: 'find_all_categories' })
  findAll() {
    return this.categoryService.findAll();
  }

  @MessagePattern({ cmd: 'find_one_category' })
  findOne(@Payload('id') id: number) {
    return this.categoryService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_category' })
  update(@Payload() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(updateCategoryDto.id, updateCategoryDto);
  }

  @MessagePattern({ cmd: 'remove_category' })
  remove(@Payload('id') id: number) {
    return this.categoryService.remove(id);
  }
}
