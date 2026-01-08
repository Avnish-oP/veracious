
import prisma from '../utils/prisma';

async function main() {
  const sunglassesCount = await prisma.product.count({
    where: {
      categories: {
        some: {
          slug: 'sunglasses'
        }
      }
    }
  });
  console.log('Total products in "sunglasses":', sunglassesCount);

  const featuredSunglassesCount = await prisma.product.count({
    where: {
      isFeatured: true,
      categories: {
        some: {
          slug: 'sunglasses'
        }
      }
    }
  });
  console.log('Featured sunglasses:', featuredSunglassesCount);
  
  // Trending is roughly implied by existing reviews?
  // Let's just check if any products in sunglasses have reviews
  const trendingSunglassesCount = await prisma.product.count({
      where: {
          categories: { some: { slug: 'sunglasses' } },
          reviews: { some: {} }
      }
  })
    console.log('Trending (reviewed) sunglasses:', trendingSunglassesCount);

}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
