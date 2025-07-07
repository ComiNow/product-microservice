import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';
import { of } from 'rxjs';

// Mock envs antes de importar
jest.mock('../config/envs', () => ({
  envs: {
    natsServiceName: 'NATS_SERVICE',
    natsServers: ['nats://localhost:4222'],
  },
}));

import { AuthController } from './auth.controller';

const mockClientProxy = {
  send: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let client: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: 'NATS_SERVICE',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    client = module.get<ClientProxy>('NATS_SERVICE');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a user', () => {
      const registerDto: RegisterUserDto = {
        fullName: 'John Doe',
        identificationNumber: '12345678',
        positionId: 'pos1',
        password: 'StrongPass123!',
      };
      const result = { id: '1', ...registerDto };

      (client.send as jest.Mock).mockReturnValue(of(result));

      const response = controller.registerUser(registerDto);

      expect(client.send).toHaveBeenCalledWith(
        'auth.register.user',
        registerDto,
      );
      expect(response).toBeDefined();
    });
  });

  describe('loginUser', () => {
    it('should login a user', () => {
      const loginDto: LoginUserDto = {
        identificationNumber: '12345678',
        password: 'StrongPass123!',
      };
      const result = { token: 'jwt-token', user: { id: '1' } };

      (client.send as jest.Mock).mockReturnValue(of(result));

      const response = controller.loginUser(loginDto);

      expect(client.send).toHaveBeenCalledWith('auth.login.user', loginDto);
      expect(response).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify token and return user and token', async () => {
      const mockUser = {
        id: '1',
        fullName: 'John Doe',
        identificationNumber: '12345678',
        positionId: 'pos1',
      };
      const mockToken = 'new-token';

      const result = await controller.verifyToken(mockUser, mockToken);

      expect(result).toEqual({ user: mockUser, token: mockToken });
    });
  });

  describe('getAllModules', () => {
    it('should get all modules', () => {
      const modules = [{ id: '1', name: 'Products' }];

      (client.send as jest.Mock).mockReturnValue(of(modules));

      const response = controller.getAllModules();

      expect(client.send).toHaveBeenCalledWith('auth.get.modules', {});
      expect(response).toBeDefined();
    });
  });
});
