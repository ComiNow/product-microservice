import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaClient } from 'generated/prisma';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CategoryService extends PrismaClient {
  private readonly logger = new Logger('CategoryService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.category.create({
        data: createCategoryDto,
      });
    } catch (error) {
      this.logger.error(`Error creating category: ${error.message}`);
      throw new RpcException({
        message: `Error creating category: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findAll(businessId: string | null) {
    try {
      const where: any = { available: true };

      if (businessId) {
        where.businessId = businessId;
      }

      return await this.category.findMany({
        where,
        include: {
          products: {
            where: { available: true },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error finding categories: ${error.message}`);
      throw new RpcException({
        message: `Error finding categories: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findOne(id: number, businessId: string | null) {
    try {
      const where: any = { id };

      if (businessId) {
        where.businessId = businessId;
      }

      const category = await this.category.findFirst({
        where,
        include: {
          products: {
            where: { available: true },
          },
        },
      });

      if (!category) {
        throw new RpcException({
          message: `Category with id #${id} not found`,
          status: HttpStatus.NOT_FOUND,
        });
      }

      return category;
    } catch (error) {
      if (error instanceof RpcException) throw error;

      this.logger.error(`Error finding category: ${error.message}`);
      throw new RpcException({
        message: `Error finding category: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    businessId: string,
  ) {
    try {
      const { id: __, businessId: ___, ...data } = updateCategoryDto as any;
      await this.findOne(id, businessId);

      return await this.category.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;

      this.logger.error(`Error updating category: ${error.message}`);
      throw new RpcException({
        message: `Error updating category: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async remove(id: number, businessId: string) {
    try {
      await this.findOne(id, businessId);

      const availableProductsCount = await this.product.count({
        where: {
          categoryId: id,
          businessId,
          available: true,
        },
      });

      if (availableProductsCount > 0) {
        throw new RpcException({
          message: `Cannot delete category with ${availableProductsCount} available products. Please delete or change category of products first.`,
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const deletedCategory = await this.category.update({
        where: { id },
        data: { available: false },
      });

      this.logger.log(
        `Category with id ${id} marked as unavailable (logical delete) for business ${businessId}`,
      );

      return deletedCategory;
    } catch (error) {
      if (error instanceof RpcException) throw error;

      this.logger.error(`Error removing category: ${error.message}`);
      throw new RpcException({
        message: `Error removing category: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findAllIncludingDeleted(businessId: string) {
    try {
      return await this.category.findMany({
        where: { businessId },
        include: {
          products: {
            where: { businessId },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error finding all categories: ${error.message}`);
      throw new RpcException({
        message: `Error finding all categories: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async restore(id: number, businessId: string) {
    try {
      const category = await this.category.findFirst({
        where: {
          id,
          businessId,
        },
      });

      if (!category) {
        throw new RpcException({
          message: `Category with id #${id} not found`,
          status: HttpStatus.NOT_FOUND,
        });
      }

      if (category.available) {
        throw new RpcException({
          message: `Category with id #${id} is already available`,
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const restoredCategory = await this.category.update({
        where: { id },
        data: { available: true },
      });

      this.logger.log(
        `Category with id ${id} restored for business ${businessId}`,
      );

      return restoredCategory;
    } catch (error) {
      if (error instanceof RpcException) throw error;

      this.logger.error(`Error restoring category: ${error.message}`);
      throw new RpcException({
        message: `Error restoring category: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
