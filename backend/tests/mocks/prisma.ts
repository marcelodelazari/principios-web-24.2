const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    // Adicione outros modelos conforme necessário
  };
  
  export const prisma = prismaMock;