import axios from "axios";
import { PrismaClient } from "../src/generated/prisma";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const API_URL = "http://localhost:5001/api/v1";

async function testCheckout() {
  try {
    console.log("🚀 Starting Checkout Test...");

    // 1. Find or Create User
    let user = await prisma.user.findFirst({ where: { email: "test@example.com" } });
    if (!user) {
      console.log("Creating test user...");
      user = await prisma.user.create({
        data: {
          name: "Test User",
          email: "test@example.com",
          passwordHash: "password123",
          role: "USER",
        },
      });
    }
    console.log(`✅ User: ${user.email} (${user.id})`);

    // 2. Find or Create Product
    let product = await prisma.product.findFirst();
    if (!product) {
        console.log("Creating test product...");
        product = await prisma.product.create({
            data: {
                name: "Test Product",
                description: "A product for testing",
                price: 100,
                discountPrice: 90,
                stock: 10,
                images: ["http://example.com/image.png"],
                categoryId: "some-category-id" // This might fail if category doesn't exist, but assuming seed data or existing data. 
                // Actually, let's try to find a category first if we need to create a product.
            } as any // bypassing strict type checks for speed if schema differs slightly
        })
    }
    // If we still don't have a product (e.g. creation failed due to relations), we might need to handle that. 
    // But let's assume there's at least one product or we can create one simply.
    // To be safe, let's check if we have a product, if not, we need a category.
    if (!product) {
        const category = await prisma.category.create({
            data: { 
              name: "Test Category",
              slug: "test-category-" + Date.now()
            }
        });
        product = await prisma.product.create({
            data: {
                name: "Test Product",
                description: "Test Desc",
                brand: "Test Brand",
                price: 500,
                stock: 100,
                sku: "TEST-SKU-" + Date.now(),
                slug: "test-product-" + Date.now(),
                frameShape: "ROUND",
                frameMaterial: "PLASTIC",
                frameColor: "BLACK",
                lensType: "REGULAR",
                lensColor: "CLEAR",
                gender: "UNISEX",
                specifications: {},
                categories: {
                  connect: { id: category.id }
                },
                images: {
                  create: [{ url: "http://example.com/image.png" }]
                }
            }
        });
    }

    console.log(`✅ Product: ${product.name} (${product.id})`);

    // 3. Generate Token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "1h",
    });
    
    // 4. Create Order
    console.log("\n🛒 Creating Order...");
    const createPayload = {
      items: [{ productId: product.id, quantity: 1 }],
      shipping: 50,
      gst: 18, // 18%
    };

    // We need to set the cookie or header. The middleware checks `req.cookies?.accessToken`.
    // Axios doesn't automatically send cookies unless we use a jar, but we can send it manually if the middleware supports headers?
    // Checking authMiddleware: `const token = req.cookies?.accessToken;`
    // It ONLY checks cookies. We need to send `Cookie` header.
    
    const headers = {
      Cookie: `accessToken=${token}`,
      "Content-Type": "application/json",
    };

    const createRes = await axios.post(`${API_URL}/checkout/create`, createPayload, { headers });
    
    if (!createRes.data.success) {
      throw new Error("Order creation failed: " + JSON.stringify(createRes.data));
    }

    const { orderId, razorpay } = createRes.data;
    console.log(`✅ Order Created! Order ID: ${orderId}`);
    console.log(`   Razorpay Order ID: ${razorpay.orderId}`);
    console.log(`   Amount: ${razorpay.amount}`);

    // 5. Simulate Payment & Verify
    console.log("\n💳 Verifying Payment...");
    
    const razorpay_payment_id = "pay_test_" + Date.now();
    const razorpay_order_id = razorpay.orderId;
    
    // Generate Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const razorpay_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    const verifyPayload = {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    };

    const verifyRes = await axios.post(`${API_URL}/checkout/verify`, verifyPayload, { headers });

    if (verifyRes.data.success) {
      console.log("✅ Payment Verified Successfully!");
    } else {
      console.error("❌ Payment Verification Failed:", verifyRes.data);
    }

  } catch (error: any) {
    console.error("❌ Test Failed:", error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCheckout();
