import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';
import { FilterProductDto } from 'src/common/dto/filter-product.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  async create(createProductDto: CreateProductDto) {
    try {
      return await this.product.create({
        data: createProductDto,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      throw new RpcException('Failed to create product');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const totalPages = await this.product.count({
      where: { available: true },
    });

    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        totalPages: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        image: true,
        available: true,
        categoryId: true,
      },
    });

    if (!product || !product.available) {
      throw new RpcException({
        message: `Product with id #${id} not found or is no longer available`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;

    const existingProduct = await this.findOne(id);

    return this.product.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    return this.product.update({
      where: { id },
      data: {
        available: false,
      },
    });
  }

  // Validación de productos (si es necesario)
  // async validateProducts(ids: number[]) {
  //   ids = Array.from(new Set(ids));

  //   const products = await this.product.findMany({
  //     where: {
  //       id: {
  //         in: ids,
  //       },
  //       available: true, // Solo productos disponibles
  //     },
  //   });

  //   if (products.length !== ids.length) {
  //     throw new RpcException({
  //       message: 'Some products were not found or are no longer available',
  //       status: HttpStatus.BAD_REQUEST,
  //     });
  //   }

  //   return products;
  // }

  async findByCategory(
    paginationDto: PaginationDto,
    filterProductDto: FilterProductDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const { categoryId } = filterProductDto;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const totalPages = await this.product.count({
      where,
    });

    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        totalPages,
        page,
        lastPage,
      },
    };
  }
}
