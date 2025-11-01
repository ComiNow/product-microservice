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

  async findAll(paginationDto: PaginationDto & { businessId: string | null }) {
    const { page = 1, limit = 10, categoryId, businessId } = paginationDto;

    const where: any = { available: true };

    if (businessId) {
      where.businessId = businessId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    try {
      const totalProducts = await this.product.count({ where });
      const lastPage = Math.ceil(totalProducts / limit);

      const products = await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        data: products.map((product) => ({
          ...product,
          image: product.image ? [product.image] : [],
        })),
        meta: {
          total: totalProducts,
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

  async findOne(id: number, businessId: string | null) {
    try {
      const where: any = { id, available: true };

      if (businessId) {
        where.businessId = businessId;
      }

      const product = await this.product.findFirst({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!product) {
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

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    businessId: string,
  ) {
    try {
      // Verificar que el producto existe y pertenece al negocio
      await this.findOne(id, businessId);

      // Remover campos que no deben actualizarse
      const { id: __, businessId: ___, ...data } = updateProductDto as any;

      // Manejar imagen
      let imageUrl;
      if (data.image !== undefined) {
        imageUrl =
          Array.isArray(data.image) && data.image.length > 0
            ? data.image[0]
            : null;
      }

      // Actualizar solo los campos permitidos
      const updateData: any = {
        ...data,
      };

      if (imageUrl !== undefined) {
        updateData.image = imageUrl;
      }

      return this.product.update({
        where: { id },
        data: updateData,
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

  async remove(id: number, businessId: string) {
    try {
      await this.findOne(id, businessId);

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

  async validateProducts(ids: number[], businessId: string) {
    try {
      const uniqueIds = Array.from(new Set(ids));

      const products = await this.product.findMany({
        where: {
          id: { in: uniqueIds },
          businessId,
          available: true,
        },
      });

      if (products.length !== uniqueIds.length) {
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

  async getAvailableProductsByIds(ids: number[], businessId: string) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        this.logger.warn('Invalid or empty product IDs array received');
        return [];
      }

      this.logger.log(
        `Getting available products with IDs: [${ids.join(', ')}] for business: ${businessId}`,
      );

      const uniqueIds = Array.from(new Set(ids)).map((id) => Number(id));

      const products = await this.product.findMany({
        where: {
          id: { in: uniqueIds },
          businessId,
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

  async getProductsByIds(ids: number[], businessId: string) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        this.logger.warn('Invalid or empty product IDs array received');
        return [];
      }

      this.logger.log(
        `Getting products with IDs: [${ids.join(', ')}] for business: ${businessId}`,
      );

      const uniqueIds = Array.from(new Set(ids)).map((id) => Number(id));

      const products = await this.product.findMany({
        where: {
          id: { in: uniqueIds },
          businessId,
          available: true,
        },
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          available: true,
          categoryId: true,
          businessId: true,
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
