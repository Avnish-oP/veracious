import { createRequest, createResponse } from 'node-mocks-http';
import loginUser from '../login';
import registerUser from '../registeration';
import { prismaMock } from '../../../__tests__/setup';
import bcrypt from 'bcryptjs';
import * as authUtils from '../../../utils/authentication';
import * as emailUtils from '../../../email/sendmail';

// Mock other dependencies if needed
jest.mock('bcryptjs');
jest.mock('../../../utils/authentication');
jest.mock('../../../email/sendmail');

describe('Auth Controllers', () => {
    describe('registerUser', () => {
        it('should create a user and return 201', async () => {
             // Setup mock data
             const req = createRequest({
                 method: 'POST',
                 body: {
                     name: 'Test User',
                     email: 'test@example.com',
                     password: 'password123',
                     phoneNumber: '1234567890'
                 }
             });
             const res = createResponse();

             // Mock Prisma behavior
             prismaMock.user.findFirst.mockResolvedValue(null); // No existing user
             (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
             prismaMock.user.create.mockResolvedValue({
                 id: 'user-id',
                 name: 'Test User',
                 email: 'test@example.com',
                 passwordHash: 'hashedPassword',
                 role: 'CUSTOMER',
                 isVerified: false,
             } as any);

             (authUtils.generateVerificationCode as jest.Mock).mockReturnValue('123456');
             (authUtils.generateTokens as jest.Mock).mockReturnValue({ accessToken: 'access', refreshToken: 'refresh' });
             (authUtils.storeRefreshToken as jest.Mock).mockResolvedValue(true);

             await registerUser(req, res);

             expect(res.statusCode).toBe(201);
             expect(res._getJSONData().success).toBe(true);
             expect(prismaMock.user.create).toHaveBeenCalled();
        });

        it('should return 400 if user already exists', async () => {
            const req = createRequest({
                body: { name: 'Test', email: 'exist@example.com', password: 'pass', phoneNumber: '0000000000' }
            });
            const res = createResponse();

            prismaMock.user.findFirst.mockResolvedValue({ id: 'existing', isVerified: true } as any);

            await registerUser(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData().message).toMatch(/exists/);
        });
    });

    describe('loginUser', () => {
        it('should login successfully and return 200', async () => {
            const req = createRequest({
                body: { email: 'test@example.com', password: 'password123' }
            });
            const res = createResponse();

            const mockUser = {
                id: 'user-id',
                email: 'test@example.com',
                passwordHash: 'hashedPassword',
                isVerified: true,
                role: 'CUSTOMER',
                name: 'Test User'
            };

            prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (authUtils.generateTokens as jest.Mock).mockReturnValue({ accessToken: 'access', refreshToken: 'refresh' });

            await loginUser(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().success).toBe(true);
        });

        it('should return 400 for invalid credentials', async () => {
            const req = createRequest({
                body: { email: 'test@example.com', password: 'wrong' }
            });
            const res = createResponse();

            prismaMock.user.findUnique.mockResolvedValue({ passwordHash: 'hash' } as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await loginUser(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData().message).toMatch(/Invalid password/);
        });
    });
});
