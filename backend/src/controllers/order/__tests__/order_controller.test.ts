import { createRequest, createResponse } from 'node-mocks-http';
import { createOrder } from '../createOrder';
import { prismaMock } from '../../../__tests__/setup';
import * as razorpayService from '../../../services/razorPayService';

jest.mock('../../../utils/prisma');
jest.mock('../../../services/razorPayService');
jest.mock('../../../lib/razorpay', () => ({
  __esModule: true,
  default: {
      orders: { create: jest.fn() }
  }
}));

describe('Order Controllers', () => {
    describe('createOrder', () => {
        it('should create order successfully', async () => {
            const req = createRequest({
                method: 'POST',
                user: { id: 'user-1' },
                body: {
                    items: [{ productId: 'prod-1', quantity: 1 }],
                    addressId: 'addr-1'
                }
            });
            const res = createResponse();

            // Mock product check
            prismaMock.product.findMany.mockResolvedValue([
                { id: 'prod-1', price: 100, discountPrice: 90, stock: 10 } as any
            ]);

            // Mock address check
            prismaMock.address.findFirst.mockResolvedValue({ id: 'addr-1', userId: 'user-1' } as any);

            // Mock Order create
            prismaMock.order.create.mockResolvedValue({ 
                id: 'order-1', 
                totalAmount: 90 
            } as any);

            // Mock Razorpay
            (razorpayService.createRazorpayOrder as jest.Mock).mockResolvedValue({
                id: 'rzp_order_1',
                amount: 9000,
                currency: 'INR'
            });

            // Mock Order update
            prismaMock.order.update.mockResolvedValue({ id: 'order-1' } as any);

            await createOrder(req, res);

            expect(res.statusCode).toBe(201);
            expect(res._getJSONData().success).toBe(true);
            expect(prismaMock.order.create).toHaveBeenCalled();
        });

        it('should return 400 if stock is insufficient', async () => {
             const req = createRequest({
                user: { id: 'user-1' },
                body: {
                    items: [{ productId: 'prod-1', quantity: 100 }],
                }
            });
            const res = createResponse();

            prismaMock.product.findMany.mockResolvedValue([
                { id: 'prod-1', price: 100, stock: 5 } as any
            ]);

            await createOrder(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData().message).toMatch(/Insufficient stock/);
        });
    });
});
