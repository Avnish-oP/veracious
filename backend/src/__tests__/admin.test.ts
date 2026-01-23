import request from 'supertest';
import app from '../index';

// Mock auth middleware for admin test
jest.mock('../middlewares/authmiddleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 'admin-user-id', role: 'ADMIN' }; 
    next();
  },
  adminMiddleware: (req: any, res: any, next: any) => {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  }
}));

describe('Admin Routes', () => {
  it('GET /api/v1/admin/dashboard should return 200', async () => {
    const res = await request(app).get('/api/v1/admin/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
