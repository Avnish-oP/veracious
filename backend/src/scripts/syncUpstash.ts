import dotenv from "dotenv";
dotenv.config();

import prisma from "../utils/prisma";
import { searchIndex } from "../utils/upstash";

const syncProducts = async () => {
  console.log("Starting product sync to Upstash...");

  try {
    const products = await prisma.product.findMany({
      include: {
        images: {
          where: { isMain: true },
          take: 1
        },
        categories: true
      }
    });

    console.log(`Found ${products.length} products to sync.`);

    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      const upsertPromises = batch.map(product => {
        return searchIndex.upsert([{
          id: product.id,
          content: {
            name: product.name,
            description: product.description,
            brand: product.brand,
            category: product.categories.map((c: any) => c.name).join(", "),
            specifications: product.specifications ? JSON.stringify(product.specifications) : "",
          },
          metadata: {
            name: product.name,
            slug: product.slug,
            price: product.price,
            discountPrice: product.discountPrice,
            stock: product.stock,
            image: product.images[0]?.url || "",
            // Visual/Spec fields required by ProductCard
            isFeatured: product.isFeatured || false,
            frameShape: product.frameShape,
            frameMaterial: product.frameMaterial,
            frameColor: product.frameColor,
            lensType: product.lensType,
            gender: product.gender,
            createdAt: product.createdAt,
          }
        }]);
      });

      await Promise.all(upsertPromises);
      console.log(`Synced products ${i + 1} to ${Math.min(i + batchSize, products.length)}`);
    }

    console.log("Product sync completed successfully.");
  } catch (error) {
    console.error("Error syncing products:", error);
  } finally {
    await prisma.$disconnect();
  }
};

syncProducts();
