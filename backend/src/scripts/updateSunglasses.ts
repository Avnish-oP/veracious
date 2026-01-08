
import prisma from '../utils/prisma';

async function main() {
  const sunglassesCategory = await prisma.category.findUnique({
    where: { slug: 'sunglasses' },
  });

  if (!sunglassesCategory) {
    console.error('Sunglasses category not found!');
    return;
  }

  const lensTypes = [
    'Polarized',
    'UV Protection',
    'Gradient',
    'Mirror',
    'Tinted',
    'Night Vision'
  ];

  const products = await prisma.product.findMany({
    where: {
      lensType: { in: lensTypes }
    }
  });

  console.log(`Found ${products.length} potential sunglasses products.`);

  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        categories: {
          connect: { id: sunglassesCategory.id }
        }
      }
    });
  }

  console.log('Successfully linked products to sunglasses category.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
