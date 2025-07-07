// Mock de createParamDecorator para decoradores
jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    createParamDecorator: (factory: any) => {
      return () => factory;
    },
  };
});
