
import { Request, Response } from 'express';
import { verifyOrder } from '../src/controllers/order/verifyOrder';
import prisma from '../src/utils/prisma';
import crypto from 'crypto';

// Mock environment variables
process.env.RAZORPAY_KEY_SECRET = 'test_secret';

const cleanUp = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        await prisma.payment.deleteMany({ where: { order: { userId: user.id } } });
        await prisma.order.deleteMany({ where: { userId: user.id } });
        await prisma.cart.deleteMany({ where: { userId: user.id } });
        await prisma.product.deleteMany({ where: { slug: 'test-product-slug' } });
        await prisma.user.delete({ where: { id: user.id } });
    }
};

const runTest = async () => {
    const testEmail = 'test_checkout_verify@example.com';
    console.log("Cleaning up previous test data...");
    await cleanUp(testEmail);

    console.log("Seeding test data...");
    // 1. Create User
    const user = await prisma.user.create({
        data: {
            name: 'Test Verify User',
            email: testEmail,
            passwordHash: 'hash',
        }
    });

    // 2. Create Product
    const product = await prisma.product.create({
        data: {
            name: 'Test Product',
            slug: 'test-product-slug',
            description: 'Desc',
            brand: 'Brand',
            price: 100,
            stock: 10,
            sku: 'TEST-SKU-123',
            frameShape: 'ROUND',
            frameMaterial: 'Metal',
            frameColor: 'Black',
            lensType: 'Polarized',
            lensColor: 'Green',
            gender: 'UNISEX',
            specifications: {},
            images: {
                create: { url: 'http://img.com/1.jpg' }
            }
        }
    });

    // 3. Create Cart (to test clearing)
    await prisma.cart.create({
        data: {
            userId: user.id,
            items: {
                create: {
                    productId: product.id,
                    quantity: 1
                }
            }
        }
    });

    // 4. Create Order (simulating createOrder success)
    const order = await prisma.order.create({
        data: {
            userId: user.id,
            items: [{ productId: product.id, quantity: 2, price: 100 }] as any,
            totalAmount: 200,
            finalAmount: 200,
            currency: 'INR',
            status: 'PENDING',
            paymentStatus: 'PENDING',
        }
    });

    console.log(`Order created: ${order.id}`);

    // 5. Prepare Mock Request for verifyOrder
    const razorpay_order_id = 'order_test_123';
    const razorpay_payment_id = 'pay_test_123';
    
    // Generate valid signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const razorpay_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
        .update(body.toString())
        .digest("hex");

    const req = {
        body: {
            orderId: order.id,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        }
    } as Request;

    const res = {
        status: (code: number) => {
            console.log(`Response Status: ${code}`);
            return {
                json: (data: any) => {
                    console.log(`Response JSON:`, data);
                    return data;
                }
            };
        },
        json: (data: any) => {
            console.log(`Response JSON:`, data);
            return data;
        }
    } as unknown as Response;

    console.log("Calling verifyOrder...");
    await verifyOrder(req, res);

    // 6. Assertions
    console.log("Verifying results...");
    
    // Check Order Status
    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    if (updatedOrder?.paymentStatus !== 'PAID') throw new Error(`Order status mismatch: ${updatedOrder?.paymentStatus}`);
    console.log("Assertion Passed: Order is PAID");

    // Check Payment Record
    const payment = await prisma.payment.findUnique({ where: { orderId: order.id } });
    if (!payment) throw new Error("Payment record not created");
    console.log("Assertion Passed: Payment record created");

    // Check Product Stock (Should be 10 - 2 = 8)
    const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
    if (updatedProduct?.stock !== 8) throw new Error(`Product stock mismatch. Expected 8, got ${updatedProduct?.stock}`);
    console.log("Assertion Passed: Stock decremented correctly");

    // Check Cart (Should be empty or deleted)
    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (cart) throw new Error("Cart was not deleted");
    console.log("Assertion Passed: Cart deleted");

    console.log("Cleaning up...");
    await cleanUp(testEmail);
    console.log("Test Completed Successfully!");
};

runTest()
    .catch(e => {
        console.error("Test Failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
