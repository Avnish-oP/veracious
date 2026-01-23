import { createRequest, createResponse } from 'node-mocks-http';
import { createProduct, deleteProduct, getAdminProducts } from '../productManagement';
import { prismaMock } from '../../../__tests__/setup';

jest.mock('../../../utils/prisma');
jest.mock('../../../utils/upstash', () => ({
    searchIndex: {
        upsert: jest.fn(),
        delete: jest.fn(),
    }
}));

describe('Admin Controllers', () => {
    describe('createProduct', () => {
        it('should create product successfully', async () => {
            const req = createRequest({
                method: 'POST',
                body: {
                    name: 'New Product',
                    stock: '10',
                    price: 100,
                    images: []
                }
            });
            const res = createResponse();

            prismaMock.product.create.mockResolvedValue({
                id: 'prod-1',
                name: 'New Product',
                images: [],
                categories: []
            } as any);

            await createProduct(req, res);

            expect(res.statusCode).toBe(201);
            expect(res._getJSONData().success).toBe(true);
        });
    });

    describe('deleteProduct', () => {
        it('should delete product successfully', async () => {
            const req = createRequest({
                params: { id: 'prod-1' }
            });
            const res = createResponse();

            prismaMock.product.delete.mockResolvedValue({ id: 'prod-1' } as any);

            await deleteProduct(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().success).toBe(true);
        });
    });

    describe('getAdminProducts', () => {
        it('should return list of products', async () => {
             const req = createRequest({
                method: 'GET',
                query: { page: '1' }
            });
            const res = createResponse();

            prismaMock.product.findMany.mockResolvedValue([
                { id: '1', name: 'P1', images: [] } as any
            ]);
            prismaMock.product.count.mockResolvedValue(1);

            await getAdminProducts(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().products).toHaveLength(1);
        });
    });
});
