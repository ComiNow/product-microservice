import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient {
  private readonly logger = new Logger('ProductService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    try {
      const imageUrl =
        Array.isArray(createProductDto.image) &&
        createProductDto.image.length > 0
          ? createProductDto.image[0]
          : null;

      return this.product.create({
        data: {
          ...createProductDto,
          image: imageUrl,
        },
      });
    } catch (error) {
      this.logger.error(`Error creating product: ${error.message}`);
      throw new RpcException({
        message: `Error creating product: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, categoryId } = paginationDto;

    const where: any = { available: true };
    if (categoryId) where.categoryId = categoryId;

    try {
      const totalProducts = await this.product.count({ where });
      const lastPage = Math.ceil(totalProducts / limit);

      const products = await this.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      });

      const formattedProducts = products.map((product) => ({
        ...product,
        image: product.image ? [product.image] : [],
      }));

      return {
        data: formattedProducts,
        meta: {
          totalPages: totalProducts,
          page,
          lastPage,
        },
      };
    } catch (error) {
      this.logger.error(`Error finding products: ${error.message}`);
      throw new RpcException({
        message: `Error finding products: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findOne(id: number) {
    try {
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
          message: `Product with id ${id} not found or is not available`,
          status: HttpStatus.NOT_FOUND,
        });
      }

      return {
        ...product,
        image: product.image ? [product.image] : [],
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;

      this.logger.error(`Error finding product: ${error.message}`);
      throw new RpcException({
        message: `Error finding product: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      await this.findOne(id);

      const { id: __, ...data } = updateProductDto;

      let imageUrl;
      if (data.image !== undefined) {
        imageUrl =
          Array.isArray(data.image) && data.image.length > 0
            ? data.image[0]
            : null;
      }

      return this.product.update({
        where: { id },
        data: {
          ...data,
          image: imageUrl !== undefined ? imageUrl : undefined,
        },
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;

      this.logger.error(`Error updating product: ${error.message}`);
      throw new RpcException({
        message: `Error updating product: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      return this.product.update({
        where: { id },
        data: { available: false },
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;

      this.logger.error(`Error removing product: ${error.message}`);
      throw new RpcException({
        message: `Error removing product: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async validateProducts(ids: number[]) {
    try {
      ids = Array.from(new Set(ids));

      const products = await this.product.findMany({
        where: {
          id: { in: ids },
          available: true,
        },
      });

      if (products.length !== ids.length) {
        throw new RpcException({
          message: 'Some products were not found or are no longer available',
          status: HttpStatus.BAD_REQUEST,
        });
      }

      return products;
    } catch (error) {
      if (error instanceof RpcException) throw error;

      this.logger.error(`Error validating products: ${error.message}`);
      throw new RpcException({
        message: `Error validating products: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getAvailableProductsByIds(ids: number[]) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        this.logger.warn('Invalid or empty product IDs array received');
        return [];
      }

      this.logger.log(
        `Getting available products with IDs: [${ids.join(', ')}]`,
      );

      const uniqueIds = Array.from(new Set(ids)).map((id) => Number(id));

      const products = await this.product.findMany({
        where: {
          id: { in: uniqueIds },
          available: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(
        `Found ${products.length} available products out of ${uniqueIds.length} requested`,
      );
      return products.map((product) => ({
        ...product,
        image: product.image ? [product.image] : [],
      }));
    } catch (error) {
      this.logger.error(
        `Error getting available products by IDs: ${error.message}`,
      );
      throw new RpcException({
        message: `Error getting available products by IDs: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getProductsByIds(ids: number[]) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        this.logger.warn('Invalid or empty product IDs array received');
        return [];
      }

      this.logger.log(`Getting products with IDs: [${ids.join(', ')}]`);

      const uniqueIds = Array.from(new Set(ids)).map((id) => Number(id));

      const products = await this.product.findMany({
        where: {
          id: { in: uniqueIds },
          available: true,
        },
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          available: true,
          categoryId: true,
        },
      });

      this.logger.log(
        `Found ${products.length} products out of ${uniqueIds.length} requested`,
      );
      return products.map((product) => ({
        ...product,
        image: product.image ? [product.image] : [],
      }));
    } catch (error) {
      this.logger.error(`Error getting products by IDs: ${error.message}`);
      throw new RpcException({
        message: `Error getting products by IDs: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
