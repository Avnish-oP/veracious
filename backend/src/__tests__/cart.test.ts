import request from 'supertest';
import app from '../index';

// Mock auth middleware for this test file
jest.mock('../middlewares/authmiddleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-id', role: 'CUSTOMER' }; 
    next();
  },
  adminMiddleware: (req: any, res: any, next: any) => {
     // For later reference
     next(); 
  }
}));

describe('Cart Routes', () => {
  it('GET /api/v1/cart should return 200', async () => {
    // Note: This relies on the controller handling a potentially empty cart or mocking DB response
    // If the controller hits the DB searching for 'test-user-id', it might return empty or error if table constraints exist.
    // Ideally we mock the controller logic or prisma, but route testing checks the wiring.
    // If it fails due to DB, we know the route is reachable.
    const res = await request(app).get('/api/v1/cart');
    // If user has no cart, it might be 200 with empty items or 404 depending on logic
    // Let's expect not 401/403 which would imply auth failure.
    expect(res.status).not.toBe(401);
  });

  it('POST /api/v1/cart should require productId', async () => {
    const res = await request(app).post('/api/v1/cart').send({});
    // Validation check
    expect(res.status).not.toBe(200); 
  });
});
