import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { Token } from './token.decorator';

describe('Token Decorator', () => {
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as any;
    jest.clearAllMocks();
  });

  it('should return token from request', () => {
    const mockToken = 'jwt-token';
    const mockRequest = { token: mockToken };

    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue(mockRequest);

    // Obtener la función factory del decorador y ejecutarla directamente
    const decoratorFactory = Token();
    // Como el mock en test-setup.ts hace que createParamDecorator devuelva la función factory directamente
    const result = (decoratorFactory as any)(null, mockExecutionContext);

    expect(result).toBe(mockToken);
  });

  it('should throw InternalServerErrorException if token not found', () => {
    const mockRequest = {};

    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue(mockRequest);

    const decoratorFactory = Token();

    // Verificar que lance la excepción
    expect(() => (decoratorFactory as any)(null, mockExecutionContext)).toThrow(
      InternalServerErrorException,
    );
    expect(() => (decoratorFactory as any)(null, mockExecutionContext)).toThrow(
      'Token not found in request',
    );
  });

  it('should extract token correctly from different request types', () => {
    const mockToken = 'test-token-123';
    const mockRequest = { token: mockToken };

    (
      mockExecutionContext.switchToHttp().getRequest as jest.Mock
    ).mockReturnValue(mockRequest);

    const decoratorFactory = Token();
    const result = (decoratorFactory as any)(null, mockExecutionContext);

    expect(result).toBe(mockToken);
    expect(mockExecutionContext.switchToHttp().getRequest).toHaveBeenCalled();
  });
});
