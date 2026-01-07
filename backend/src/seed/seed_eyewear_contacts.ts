
import { PrismaClient, Gender } from "@prisma/client";

const prisma = new PrismaClient();

const eyewearImages = [
  "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500", // Glasses on table
  "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=500", // Classic glasses
  "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=500", // Modern frames
  "https://images.unsplash.com/photo-1589785210332-d85f7a012975?w=500", // Stylish eyewear
  "https://images.unsplash.com/photo-1582142327529-68bbb3f44383?w=500", // Round glasses
];

const contactLensImages = [
  "https://images.unsplash.com/photo-1596489397666-83216839359e?w=500", // Contact lens case
  "https://images.unsplash.com/photo-1620898516104-c5a4db82488e?w=500", // Eye close-up
];

const eyewearProducts = [
  {
    name: "Ray-Ban Clubmaster Classic",
    brand: "Ray-Ban",
    description: "The original Clubmaster frames. Retro and timeless, these frames are inspired by the 50s.",
    price: 9990.00,
    stock: 50,
    frameShape: "BROWLINE",
    frameMaterial: "Acetate/Metal",
    frameColor: "Tortoise/Gold",
    lensType: "Demo Lens",
    lensColor: "Clear",
    gender: Gender.UNISEX,
    tags: ["classic", "retro", "office"],
    categorySlugs: ["eyewear", "browline", "men", "women"],
    imageIndex: 1
  },
  {
    name: "Oakley Holbrook RX",
    brand: "Oakley",
    description: "A timeless, classic design fused with modern Oakley technology. Perfect for an active lifestyle.",
    price: 8500.00,
    stock: 30,
    frameShape: "SQUARE",
    frameMaterial: "O-Matter",
    frameColor: "Satin Black",
    lensType: "Demo Lens",
    lensColor: "Clear",
    gender: Gender.MALE,
    tags: ["sport", "durable", "lightweight"],
    categorySlugs: ["eyewear", "square", "men", "sport"],
    imageIndex: 2
  },
  {
    name: "Tom Ford Blue Block Round",
    brand: "Tom Ford",
    description: "Sophisticated round frames featuring embedded blue light blocking technology and the signature T logo.",
    price: 22000.00,
    stock: 15,
    frameShape: "ROUND",
    frameMaterial: "Acetate",
    frameColor: "Black",
    lensType: "Blue Block light",
    lensColor: "Clear",
    gender: Gender.UNISEX,
    tags: ["luxury", "designer", "blue-light"],
    categorySlugs: ["eyewear", "round", "luxury", "unisex"],
    imageIndex: 4
  },
  {
    name: "Silhouette Titan Minimal Art",
    brand: "Silhouette",
    description: "The icon of rimless eyewear. Feather-light titanium construction for ultimate comfort.",
    price: 25000.00,
    stock: 20,
    frameShape: "RIMLESS",
    frameMaterial: "Titanium",
    frameColor: "Silver",
    lensType: "Demo Lens",
    lensColor: "Clear",
    gender: Gender.UNISEX,
    tags: ["minimalist", "rimless", "titanium"],
    categorySlugs: ["eyewear", "rimless", "tech"],
    imageIndex: 0
  },
  {
    name: "Warby Parker Percey",
    brand: "Warby Parker",
    description: "A trim, bookish shape in hand-polished cellulose acetate. Smart and versatile.",
    price: 6500.00,
    stock: 60,
    frameShape: "RECTANGLE",
    frameMaterial: "Acetate",
    frameColor: "Crystal",
    lensType: "Demo Lens",
    lensColor: "Clear",
    gender: Gender.FEMALE,
    tags: ["modern", "chic", "crystal"],
    categorySlugs: ["eyewear", "rectangle", "women"],
    imageIndex: 3
  }
];

const contactLensProducts = [
  {
    name: "Acuvue Oasys 1-Day",
    brand: "Johnson & Johnson",
    description: "Daily disposable contact lenses with HydraLuxe technology for all-day comfort and performance.",
    price: 2500.00,
    stock: 100,
    frameShape: "OTHER", // N/A
    frameMaterial: "Silicone Hydrogel",
    frameColor: "Clear",
    lensType: "Spherical",
    lensColor: "Clear",
    gender: Gender.UNISEX,
    tags: ["daily", "comfortable", "hydraluxe"],
    categorySlugs: ["contact-lenses", "acuvue", "daily-disposable", "clear-spherical"],
    imageIndex: 0
  },
  {
    name: "Air Optix Colors",
    brand: "Alcon",
    description: "Monthly disposable color contact lenses. Enhance your look with 12 stunning colors.",
    price: 1800.00,
    stock: 80,
    frameShape: "OTHER", // N/A
    frameMaterial: "Silicone Hydrogel",
    frameColor: "Various",
    lensType: "Coloured",
    lensColor: "Various",
    gender: Gender.UNISEX,
    tags: ["colored", "monthly", "beauty"],
    categorySlugs: ["contact-lenses", "alcon", "monthly", "coloured"],
    imageIndex: 1
  },
  {
    name: "Biofinity Toric",
    brand: "CooperVision",
    description: "Premium monthly lenses for astigmatism. Designed for stability, clarity, and comfort.",
    price: 2200.00,
    stock: 75,
    frameShape: "OTHER",
    frameMaterial: "Comfilcon A",
    frameColor: "Clear",
    lensType: "Toric",
    lensColor: "Clear",
    gender: Gender.UNISEX,
    tags: ["astigmatism", "toric", "monthly"],
    categorySlugs: ["contact-lenses", "coopervision", "monthly", "toric"],
    imageIndex: 0
  },
  {
    name: "Dailies Total1 Multifocal",
    brand: "Alcon",
    description: "The first and only water gradient contact lens for presbyopia. seamless vision near, far, and everywhere in between.",
    price: 3200.00,
    stock: 40,
    frameShape: "OTHER",
    frameMaterial: "Delefilcon A",
    frameColor: "Clear",
    lensType: "Multifocal",
    lensColor: "Clear",
    gender: Gender.UNISEX,
    tags: ["multifocal", "presbyopia", "daily"],
    categorySlugs: ["contact-lenses", "alcon", "daily-disposable", "multifocal"],
    imageIndex: 0
  }
];

async function main() {
  console.log("Seeding Eyewear and Contact Lenses...");

  const allProducts = [...eyewearProducts, ...contactLensProducts];

  for (const p of allProducts) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    // Specifications
    const specifications = {
       warranty: "1 Year",
       origin: "International",
       lensWidth: p.frameShape !== "OTHER" ? 52 : undefined,
       bridgeWidth: p.frameShape !== "OTHER" ? 18 : undefined,
    };

    let product = await prisma.product.findUnique({ where: { slug } });

    if (!product) {
       product = await prisma.product.create({
          data: {
             name: p.name,
             slug,
             brand: p.brand,
             description: p.description,
             price: p.price,
             stock: p.stock,
             frameShape: p.frameShape,
             frameMaterial: p.frameMaterial,
             frameColor: p.frameColor,
             lensType: p.lensType,
             lensColor: p.lensColor,
             gender: p.gender,
             sku: `SKU-${Math.floor(Math.random() * 10000)}`,
             specifications,
             tags: p.tags
          } as any
       });
       console.log(`Created product: ${p.name}`);
    } else {
       console.log(`Product already exists: ${p.name}`);
    }

    // Connect Categories
    for (const catSlug of p.categorySlugs) {
       const category = await prisma.category.findUnique({ where: { slug: catSlug } });
       if (category) {
          await prisma.product.update({
             where: { id: product.id },
             data: { categories: { connect: { id: category.id } } }
          });
       } else {
        console.warn(`Category not found: ${catSlug}`);
       }
    }

    // Add Image
    const existingImages = await prisma.productImage.count({ where: { productId: product.id } });
    if (existingImages === 0) {
        const imageUrl = p.frameShape !== "OTHER" 
            ? eyewearImages[p.imageIndex % eyewearImages.length] 
            : contactLensImages[p.imageIndex % contactLensImages.length];

        await prisma.productImage.create({
            data: {
                productId: product.id,
                url: imageUrl,
                altText: p.name,
                isMain: true
            }
        });
    }
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
