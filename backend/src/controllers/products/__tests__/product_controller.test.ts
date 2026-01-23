import { createRequest, createResponse } from 'node-mocks-http';
import { getAllProducts, getProductById } from '../getProduct';
import { prismaMock } from '../../../__tests__/setup';

jest.mock('../../../utils/prisma');

describe('Product Controllers', () => {
    describe('getAllProducts', () => {
        it('should return 200 and a list of products', async () => {
            const req = createRequest({
                method: 'GET',
                query: { page: '1', limit: '10' }
            });
            const res = createResponse();

            const mockProducts = [
                { id: '1', name: 'Product 1', images: [{ url: 'img1.jpg' }] },
                { id: '2', name: 'Product 2', images: [{ url: 'img2.jpg' }] }
            ];

            prismaMock.product.findMany.mockResolvedValue(mockProducts as any);
            prismaMock.product.count.mockResolvedValue(2);

            await getAllProducts(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().products).toHaveLength(2);
            expect(res._getJSONData().total).toBe(2);
        });

        it('should handle errors gracefully', async () => {
            const req = createRequest({ method: 'GET' });
            const res = createResponse();

            prismaMock.product.findMany.mockRejectedValue(new Error('DB Error'));

            await getAllProducts(req, res);

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData().success).toBe(false);
        });
    });

    describe('getProductById', () => {
        it('should return 200 and product details', async () => {
            const req = createRequest({
                params: { productId: 'prod-1' }
            });
            const res = createResponse();

            const mockProduct = { id: 'prod-1', name: 'Product 1' };

            prismaMock.product.findUnique.mockResolvedValue(mockProduct as any);

            await getProductById(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().product.id).toBe('prod-1');
        });

        it('should return 404 if product not found', async () => {
            const req = createRequest({
                params: { productId: 'non-existent' }
            });
            const res = createResponse();

            prismaMock.product.findUnique.mockResolvedValue(null);

            await getProductById(req, res);

            expect(res.statusCode).toBe(404);
        });
    });
});
