import { Controller, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @Post()
  @MessagePattern('create_product')
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  //@Get()
  @MessagePattern('find_all')
  findAll(@Payload() PaginationDto: PaginationDto) {
    return this.productsService.findAll(PaginationDto);
  }

  //@Get(':id')
  @MessagePattern('find_one_product')
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  //@Patch(':id')
  @MessagePattern('update_product')
  update(
    // @Param('id', ParseIntPipe) id: number,
    // @Body() updateProductDto: UpdateProductDto,
    @Payload() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  //@Delete(':id')
  @MessagePattern('delete_product')
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
