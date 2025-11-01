import { Controller, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'create_product' })
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern({ cmd: 'find_all_products' })
  findAll(@Payload() paginationDto: PaginationDto & { businessId: string }) {
    return this.productsService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'find_one_product' })
  findOne(@Payload() payload: { id: number; businessId: string }) {
    return this.productsService.findOne(payload.id, payload.businessId);
  }

  @MessagePattern({ cmd: 'update_product' })
  update(
    @Payload()
    payload: {
      id: number;
      updateProductDto: UpdateProductDto;
      businessId: string;
    },
  ) {
    return this.productsService.update(
      payload.id,
      payload.updateProductDto,
      payload.businessId,
    );
  }

  @MessagePattern({ cmd: 'delete_product' })
  remove(@Payload() payload: { id: number; businessId: string }) {
    return this.productsService.remove(payload.id, payload.businessId);
  }

  @MessagePattern({ cmd: 'validate_products' })
  validateProduct(@Payload() payload: { ids: number[]; businessId: string }) {
    return this.productsService.validateProducts(
      payload.ids,
      payload.businessId,
    );
  }

  @MessagePattern({ cmd: 'get_available_products_by_ids' })
  getAvailableProductsByIds(
    @Payload() payload: { productIds: number[]; businessId: string },
  ) {
    return this.productsService.getAvailableProductsByIds(
      payload.productIds,
      payload.businessId,
    );
  }

  @MessagePattern({ cmd: 'get_products_by_ids' })
  getProductsByIds(
    @Payload() payload: { productIds: number[]; businessId: string },
  ) {
    return this.productsService.getProductsByIds(
      payload.productIds,
      payload.businessId,
    );
  }
}
