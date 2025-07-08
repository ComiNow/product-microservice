// Mock de cloudinary para todos los tests
jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn(),
    },
    config: jest.fn(),
  },
}));

// No mockear PrismaClient aquí, dejemos que cada test lo maneje individualmente
