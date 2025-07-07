jest.mock('generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $connect: jest.fn(),
  })),
}));

// Mock de cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn(),
    },
    config: jest.fn(),
  },
}));
