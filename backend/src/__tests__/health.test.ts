import request from 'supertest';
import app from '../index';

describe('Health Check', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'ok' });
  });
});
