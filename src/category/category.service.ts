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

  async findAll() {
    try {
      return await this.category.findMany();
    } catch (error) {
      this.logger.error(`Error finding categories: ${error.message}`);
      throw new RpcException({
        message: `Error finding categories: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.category.findUnique({
        where: { id },
        include: {
          products: true,
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

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const { id: __, ...data } = updateCategoryDto;
      await this.findOne(id);

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

  async remove(id: number) {
    try {
      await this.findOne(id);

      const productsCount = await this.product.count({
        where: { categoryId: id },
      });

      if (productsCount > 0) {
        throw new RpcException({
          message: `Cannot delete category with associated products`,
          status: HttpStatus.BAD_REQUEST,
        });
      }

      return await this.category.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;

      this.logger.error(`Error removing category: ${error.message}`);
      throw new RpcException({
        message: `Error removing category: ${error.message}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
