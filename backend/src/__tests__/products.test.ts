import request from 'supertest';
import app from '../index';
import { prismaMock } from './setup';

describe('Products Routes', () => {
  it('GET /api/v1/products should return 200', async () => {
    // Mock successful database response
    prismaMock.product.findMany.mockResolvedValue([
      { id: '1', name: 'Test Product', images: [{ url: 'http://test.com/img.jpg' }] } as any
    ]);
    prismaMock.product.count.mockResolvedValue(1);

    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products'); 
    expect(res.body.products).toHaveLength(1);
  });

  it('GET /api/v1/products/featured should return 200', async () => {
     prismaMock.product.findMany.mockResolvedValue([]);
     prismaMock.product.count.mockResolvedValue(0);
    const res = await request(app).get('/api/v1/products/featured');
    expect(res.status).toBe(200);
  });


  it('GET /api/v1/products/trending should return 200 or 404', async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/products/trending');
    expect([200, 404]).toContain(res.status);
  });
  
  it('GET /api/v1/products/lens-prices should return 200', async () => {
    prismaMock.lensPrice.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/products/lens-prices');
    expect(res.status).toBe(200);
  });
});
