import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  ParseUUIDPipe,
  ParseIntPipe,
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
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(envs.natsServiceName) private readonly client: ClientProxy,
  ) {}

  @Post()
  @ApiCreatedResponse({
    description: 'The order has been created successfully.',
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send('createOrder', createOrderDto);
  }

  @Post('pos')
  createOrderFromPos(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send('createOrderWithStatus', createOrderDto);
  }

  @Get()
  async findAll(@Query() orderPaginationDto: OrderPaginationDto) {
    try {
      const orders = await firstValueFrom(
        this.client.send('findAllOrders', orderPaginationDto),
      );
      return orders;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('kitchen')
  async getKitchenOrders(@Query() paginationDto: PaginationDto) {
    try {
      const orders = await firstValueFrom(
        this.client.send('findKitchenOrders', paginationDto),
      );
      return orders;
    } catch (error) {
      throw new RpcException(error);
    }
  }
  @Patch(':id/deliver')
  async markOrderAsDelivered(@Param('id', ParseIntPipe) id: number) {
    try {
      const order = await firstValueFrom(
        this.client.send('markOrderAsDelivered', { id }),
      );
      return order;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('id/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const order = await firstValueFrom(
        this.client.send('findOneOrder', { id }),
      );
      return order;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('paid-order-by-table/:tableId')
  async findPaidOrderByTableId(
    @Param('tableId', ParseUUIDPipe) tableId: string,
  ) {
    try {
      const order = await firstValueFrom(
        this.client.send('findPaidOrderByTableId', { tableId }),
      );
      return order;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('order-position-by-table/:tableId')
  async findOrderPositionByTableId(
    @Param('tableId', ParseUUIDPipe) tableId: string,
  ) {
    try {
      const orderPosition = await firstValueFrom(
        this.client.send('getOrderPositionByTableId', { tableId }),
      );
      return { orderPosition };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(':status')
  findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.client.send('findAllOrders', {
      ...paginationDto,
      status: statusDto.status,
    });
  }

  @Patch(':id')
  changeOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: StatusDto,
  ) {
    try {
      return this.client.send('changeOrderStatus', {
        id,
        status: statusDto.status,
      });
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
