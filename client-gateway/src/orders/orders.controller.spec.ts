import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { ClientProxy } from '@nestjs/microservices';
import { envs } from '../config/envs';
import { CreateOrderDto, OrderPaginationDto, StatusDto } from './dto';
import { PaginationDto } from '../common';
import { of } from 'rxjs';

const mockClientProxy = {
  send: jest.fn(),
};

describe('OrdersController', () => {
  let controller: OrdersController;
  let client: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: envs.natsServiceName,
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    client = module.get<ClientProxy>(envs.natsServiceName);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', () => {
      const createDto: CreateOrderDto = {
        table: 1,
        items: [{ productId: 1, quantity: 2, price: 10 }],
      };

      (client.send as jest.Mock).mockReturnValue(of({ id: 1, ...createDto }));

      controller.create(createDto);

      expect(client.send).toHaveBeenCalledWith('createOrder', createDto);
    });
  });

  describe('createOrderFromPos', () => {
    it('should create an order from POS', () => {
      const createDto: CreateOrderDto = {
        table: 1,
        status: 'PAID',
        items: [{ productId: 1, quantity: 2, price: 10 }],
      };

      (client.send as jest.Mock).mockReturnValue(of({ id: 1, ...createDto }));

      controller.createOrderFromPos(createDto);

      expect(client.send).toHaveBeenCalledWith(
        'createOrderWithStatus',
        createDto,
      );
    });
  });

  describe('findAll', () => {
    it('should find all orders', async () => {
      const orderPaginationDto: OrderPaginationDto = {
        page: 1,
        limit: 10,
        status: 'PENDING' as any,
      };
      const result = { data: [], meta: {} };

      (client.send as jest.Mock).mockReturnValue(of(result));

      const response = await controller.findAll(orderPaginationDto);

      expect(client.send).toHaveBeenCalledWith(
        'findAllOrders',
        orderPaginationDto,
      );
      expect(response).toBe(result);
    });
  });

  describe('getKitchenOrders', () => {
    it('should get kitchen orders', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const result = { data: [], meta: {} };

      (client.send as jest.Mock).mockReturnValue(of(result));

      const response = await controller.getKitchenOrders(paginationDto);

      expect(client.send).toHaveBeenCalledWith(
        'findKitchenOrders',
        paginationDto,
      );
      expect(response).toBe(result);
    });
  });

  describe('markOrderAsDelivered', () => {
    it('should mark order as delivered', async () => {
      const orderId = 1;
      const result = { id: orderId, status: 'DELIVERED' };

      (client.send as jest.Mock).mockReturnValue(of(result));

      const response = await controller.markOrderAsDelivered(orderId);

      expect(client.send).toHaveBeenCalledWith('markOrderAsDelivered', {
        id: orderId,
      });
      expect(response).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should find one order', async () => {
      const orderId = 'uuid-123';
      const result = { id: orderId };

      (client.send as jest.Mock).mockReturnValue(of(result));

      const response = await controller.findOne(orderId);

      expect(client.send).toHaveBeenCalledWith('findOneOrder', { id: orderId });
      expect(response).toBe(result);
    });
  });

  describe('findPaidOrderByTableId', () => {
    it('should find paid order by table id', async () => {
      const tableId = 'table-uuid';
      const result = { id: 1, tableId };

      (client.send as jest.Mock).mockReturnValue(of(result));

      const response = await controller.findPaidOrderByTableId(tableId);

      expect(client.send).toHaveBeenCalledWith('findPaidOrderByTableId', {
        tableId,
      });
      expect(response).toBe(result);
    });
  });

  describe('findOrderPositionByTableId', () => {
    it('should find order position by table id', async () => {
      const tableId = 'table-uuid';
      const orderPosition = 3;

      (client.send as jest.Mock).mockReturnValue(of(orderPosition));

      const response = await controller.findOrderPositionByTableId(tableId);

      expect(client.send).toHaveBeenCalledWith('getOrderPositionByTableId', {
        tableId,
      });
      expect(response).toEqual({ orderPosition });
    });
  });

  describe('findAllByStatus', () => {
    it('should find all orders by status', () => {
      const statusDto: StatusDto = { status: 'PAID' as any };
      const paginationDto: PaginationDto = { page: 1, limit: 10 };

      (client.send as jest.Mock).mockReturnValue(of({ data: [], meta: {} }));

      controller.findAllByStatus(statusDto, paginationDto);

      expect(client.send).toHaveBeenCalledWith('findAllOrders', {
        ...paginationDto,
        status: statusDto.status,
      });
    });
  });

  describe('changeOrderStatus', () => {
    it('should change order status', () => {
      const orderId = 1;
      const statusDto: StatusDto = { status: 'PAID' as any };
      const result = { id: orderId, status: 'PAID' };

      (client.send as jest.Mock).mockReturnValue(of(result));

      controller.changeOrderStatus(orderId, statusDto);

      expect(client.send).toHaveBeenCalledWith('changeOrderStatus', {
        id: orderId,
        status: statusDto.status,
      });
    });
  });
});
