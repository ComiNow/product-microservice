import { Test, TestingModule } from '@nestjs/testing';
import { TablesController } from './tables.controller';
import { ClientProxy } from '@nestjs/microservices';
import { envs } from '../config/envs';
import { of } from 'rxjs';

const mockClientProxy = {
  send: jest.fn(),
};

describe('TablesController', () => {
  let controller: TablesController;
  let client: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TablesController],
      providers: [
        {
          provide: envs.natsServiceName,
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    controller = module.get<TablesController>(TablesController);
    client = module.get<ClientProxy>(envs.natsServiceName);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should find table by id', async () => {
      const tableId = '550e8400-e29b-41d4-a716-446655440000';
      const result = { id: tableId, number: 1 };

      (client.send as jest.Mock).mockReturnValue(of(result));

      const response = await controller.findOne(tableId);

      expect(client.send).toHaveBeenCalledWith('findTableById', {
        id: tableId,
      });
      expect(response).toBe(result);
    });
  });
});
