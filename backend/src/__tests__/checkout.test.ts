import request from 'supertest';
import app from '../index';

// Mock auth middleware
jest.mock('../middlewares/authmiddleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-id' }; 
    next();
  },
  adminMiddleware: (req: any, res: any, next: any) => next(), // Add missing export
}));

describe('Checkout Routes', () => {
  it('POST /api/v1/checkout should require items', async () => {
    const res = await request(app).post('/api/v1/checkout').send({});
    // Should fail validation
    expect(res.status).not.toBe(200);
  });
});
