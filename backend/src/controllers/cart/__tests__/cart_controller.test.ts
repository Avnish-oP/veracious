import { createRequest, createResponse } from 'node-mocks-http';
import { addToCart, getCart } from '../addCart';
import { prismaMock } from '../../../__tests__/setup';
import redisClient from '../../../lib/redis';

jest.mock('../../../utils/prisma');
// Redis is already mocked in setup.ts, but we might need to spy on it here if we want to check calls

describe('Cart Controllers', () => {
    describe('addToCart', () => {
        it('should add item to redis cart and database', async () => {
            const req = createRequest({
                method: 'POST',
                user: { id: 'user-1' },
                body: { productId: 'prod-1', quantity: 1 }
            });
            const res = createResponse();

            // Mock Redis get to return empty or existing cart
            (redisClient.get as jest.Mock).mockResolvedValue(null);
            
            // Mock Product check
            prismaMock.product.findUnique.mockResolvedValue({ id: 'prod-1', name: 'Product', price: 100 } as any);
            
            // Mock Lens Price if needed (not needed for this simple test)
            
            // Mock DB Upsert
            prismaMock.cart.upsert.mockResolvedValue({
                id: 'cart-1',
                userId: 'user-1',
                items: [{ 
                    id: 'item-1', 
                    productId: 'prod-1', 
                    quantity: 1, 
                    product: { images: [], price: 100 } 
                }] 
            } as any);

            await addToCart(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().success).toBe(true);
            expect(redisClient.set).toHaveBeenCalled();
            expect(prismaMock.cart.upsert).toHaveBeenCalled();
        });

        it('should return 400 for invalid input', async () => {
            const req = createRequest({
                method: 'POST',
                user: { id: 'user-1' },
                body: { productId: '', quantity: 0 }
            });
            const res = createResponse();

            await addToCart(req, res);

            expect(res.statusCode).toBe(400);
        });
    });

    describe('getCart', () => {
        it('should fetch cart from redis if available', async () => {
             const req = createRequest({
                method: 'GET',
                user: { id: 'user-1' }
            });
            const res = createResponse();

            const mockRedisCart = JSON.stringify({ items: [{ productId: 'prod-1', quantity: 1 }] });
            (redisClient.get as jest.Mock).mockResolvedValue(mockRedisCart);

            prismaMock.product.findMany.mockResolvedValue([
                { id: 'prod-1', name: 'P1', price: 100, images: [] } as any
            ]);

            await getCart(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().cart.items).toHaveLength(1);
        });
    });
});
