import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  ParseUUIDPipe,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateOrderDto, OrderPaginationDto, StatusDto } from './dto';
import { envs } from 'src/config/envs';
import { PaginationDto } from 'src/common';
import { firstValueFrom } from 'rxjs';

@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized Bearer Auth',
})
@ApiTags('tables')
@Controller('tables')
export class TablesController {
  constructor(
    @Inject(envs.natsServiceName) private readonly client: ClientProxy,
  ) {}

  @Get('id/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const table = await firstValueFrom(
        this.client.send('findTableById', { id }),
      );
      return table;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
