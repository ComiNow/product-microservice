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
      // Solo devolver categorías disponibles
      return await this.category.findMany({
        where: { available: true },
        include: {
          products: {
            where: { available: true }, // Solo productos disponibles
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

  async findOne(id: number) {
    try {
      const category = await this.category.findUnique({
        where: {
          id,
          available: true, // Solo categorías disponibles
        },
        include: {
          products: {
            where: { available: true }, // Solo productos disponibles
          },
        },
      });

      if (!category) {
        throw new RpcException({
          message: `Category with id #${id} not found or is not available`,
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
      // Verificar que la categoría existe y está disponible
      await this.findOne(id);

      // Contar productos disponibles que usan esta categoría
      const availableProductsCount = await this.product.count({
        where: {
          categoryId: id,
          available: true,
        },
      });

      if (availableProductsCount > 0) {
        throw new RpcException({
          message: `Cannot delete category with ${availableProductsCount} available products. Please delete or change category of products first.`,
          status: HttpStatus.BAD_REQUEST,
        });
      }

      // Borrado lógico: marcar como no disponible
      const deletedCategory = await this.category.update({
        where: { id },
        data: { available: false },
      });

      this.logger.log(
        `Category with id ${id} marked as unavailable (logical delete)`,
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

  // Método adicional para obtener todas las categorías (incluyendo no disponibles) - para uso administrativo
  async findAllIncludingDeleted() {
    try {
      return await this.category.findMany({
        include: {
          products: true,
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

  // Método para restaurar una categoría eliminada lógicamente
  async restore(id: number) {
    try {
      const category = await this.category.findUnique({
        where: { id },
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

      this.logger.log(`Category with id ${id} restored`);

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
