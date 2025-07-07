import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { User } from './user.decorator';

describe('User Decorator', () => {
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as any;
    jest.clearAllMocks();
  });

  it('should return user from request', () => {
    const mockUser = { id: '1', fullName: 'John Doe' };
    const mockRequest = { user: mockUser };

    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue(mockRequest);

    // Obtener la función factory del decorador y ejecutarla directamente
    const decoratorFactory = User();
    const result = (decoratorFactory as any)(null, mockExecutionContext);

    expect(result).toBe(mockUser);
  });

  it('should throw InternalServerErrorException if user not found', () => {
    const mockRequest = {};

    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue(mockRequest);

    const decoratorFactory = User();

    // Verificar que lance la excepción
    expect(() => (decoratorFactory as any)(null, mockExecutionContext)).toThrow(
      InternalServerErrorException,
    );
    expect(() => (decoratorFactory as any)(null, mockExecutionContext)).toThrow(
      'User not found in request',
    );
  });

  it('should log user information', () => {
    const mockUser = { id: '1', fullName: 'John Doe' };
    const mockRequest = { user: mockUser };

    // Spy en console.log para verificar que se llama
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue(mockRequest);

    const decoratorFactory = User();
    const result = (decoratorFactory as any)(null, mockExecutionContext);

    expect(result).toBe(mockUser);
    expect(consoleSpy).toHaveBeenCalledWith('User Decorator', mockUser);

    // Limpiar el spy
    consoleSpy.mockRestore();
  });
});
