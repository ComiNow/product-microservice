import { Injectable, Logger } from '@nestjs/common';
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

  create(createCategoryDto: CreateCategoryDto) {
    return this.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return await this.category.findMany();
  }

  async findOne(id: number) {
    const category = await this.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new RpcException({
        message: `Category with id #${id} not found`,
        status: 404,
      });
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { id: __, ...data } = updateCategoryDto;
    const existingCategory = await this.findOne(id);

    return this.category.update({
      where: { id },
      data: { ...data },
    });
  }
  async remove(id: number) {
    const category = await this.findOne(id);

    return this.category.delete({
      where: { id },
    });
  }
}
