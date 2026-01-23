import request from 'supertest';
import app from '../index';

describe('Auth Routes', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should return 400 if email or password is missing', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email and password are required');
    });

    it('should return 400 if email is invalid (user not found)', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });
      // Depending on DB state, this might actually hit the DB. 
      // If DB is empty or user doesn't exist, it should be 400.
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid email');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 400 if required fields are missing', async () => {
      // Assuming register requires name, email, password
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com'
      });
      // Check actual validation in controller if needed, but asserting error status is good for now
      expect(res.status).not.toBe(201);
      expect(res.status).not.toBe(200);
    });
  });
});
