import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import prisma from '../utils/prisma';

// Mock Redis
jest.mock('../lib/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
    disconnect: jest.fn(),
  },
}));

// Mock Cache Middleware
jest.mock('../middlewares/cache', () => ({
  cacheMiddleware: () => (req: any, res: any, next: any) => next(),
}));

// Mock Prisma
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  jest.clearAllMocks();
});

// Dummy env vars for tests
process.env.RAZORPAY_KEY_ID = 'rzp_test_123';
process.env.RAZORPAY_KEY_SECRET = 'rzp_secret_123';
process.env.ACCESS_TOKEN_SECRET = 'access_secret';
process.env.REFRESH_TOKEN_SECRET = 'refresh_secret';

