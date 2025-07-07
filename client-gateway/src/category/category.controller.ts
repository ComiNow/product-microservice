import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { catchError, lastValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @ApiBearerAuth()
  @Post()
  @ApiConsumes('application/json', 'multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'firstImage', maxCount: 1 },
      { name: 'secondImage', maxCount: 1 },
    ]),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        firstImage: {
          oneOf: [
            { type: 'string', format: 'uri' },
            { type: 'string', format: 'binary' },
          ],
        },
        secondImage: {
          oneOf: [
            { type: 'string', format: 'uri' },
            { type: 'string', format: 'binary' },
          ],
        },
      },
      required: ['name'],
    },
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFiles()
    files?: {
      firstImage?: Express.Multer.File[];
      secondImage?: Express.Multer.File[];
    },
  ) {
    const category: CreateCategoryDto = {
      ...createCategoryDto,
    };

    if (files) {
      if (files.firstImage && files.firstImage.length > 0) {
        const firstImageResult = await this.uploadCategoryImage(
          files.firstImage[0],
          'first',
        );
        category.firstImage = firstImageResult.fileName;
      }

      if (files.secondImage && files.secondImage.length > 0) {
        const secondImageResult = await this.uploadCategoryImage(
          files.secondImage[0],
          'second',
        );
        category.secondImage = secondImageResult.fileName;
      }
    }

    return this.client.send({ cmd: 'create_category' }, category).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }

  @Get()
  findAll() {
    return this.client.send({ cmd: 'find_all_categories' }, {}).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send({ cmd: 'find_one_category' }, { id: +id }).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized Bearer Auth',
  })
  @Patch(':id')
  @ApiConsumes('application/json', 'multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'firstImage', maxCount: 1 },
      { name: 'secondImage', maxCount: 1 },
    ]),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        firstImage: {
          oneOf: [
            { type: 'string', format: 'uri' },
            { type: 'string', format: 'binary' },
          ],
          description:
            'URL de imagen existente o archivo para cargar nueva imagen',
        },
        secondImage: {
          oneOf: [
            { type: 'string', format: 'uri' },
            { type: 'string', format: 'binary' },
          ],
          description:
            'URL de imagen existente o archivo para cargar nueva imagen',
        },
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFiles()
    files?: {
      firstImage?: Express.Multer.File[];
      secondImage?: Express.Multer.File[];
    },
  ) {
    const category: UpdateCategoryDto = {
      ...updateCategoryDto,
    };
    if (files) {
      if (files.firstImage && files.firstImage.length > 0) {
        const firstImageResult = await this.uploadCategoryImage(
          files.firstImage[0],
          'first',
        );
        category.firstImage = firstImageResult.fileName;
      }

      if (files.secondImage && files.secondImage.length > 0) {
        const secondImageResult = await this.uploadCategoryImage(
          files.secondImage[0],
          'second',
        );
        category.secondImage = secondImageResult.fileName;
      }
    }

    return this.client
      .send({ cmd: 'update_category' }, { id, ...category })
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized Bearer Auth',
  })
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar categoría (borrado lógico)' })
  remove(@Param('id') id: string) {
    return this.client.send({ cmd: 'remove_category' }, { id: +id }).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }

  @ApiBearerAuth()
  @Get('admin/all')
  @ApiOperation({
    summary: 'Obtener todas las categorías incluyendo eliminadas (Admin)',
  })
  findAllIncludingDeleted() {
    return this.client
      .send({ cmd: 'find_all_categories_including_deleted' }, {})
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @ApiBearerAuth()
  @Put(':id/restore')
  @ApiOperation({ summary: 'Restaurar categoría eliminada (Admin)' })
  restore(@Param('id') id: string) {
    return this.client.send({ cmd: 'restore_category' }, { id: +id }).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }

  private async uploadCategoryImage(
    file: Express.Multer.File,
    type: 'first' | 'second',
  ) {
    const serializedFile = {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer.toString('base64'),
    };

    return await lastValueFrom(
      this.client
        .send(
          { cmd: 'upload_category_image' },
          {
            file: serializedFile,
            type,
          },
        )
        .pipe(
          catchError((error) => {
            throw new RpcException({
              message: `Error uploading image: ${error.message}`,
              status: 500,
            });
          }),
        ),
    );
  }
}
