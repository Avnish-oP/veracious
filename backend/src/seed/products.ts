import { Gender } from "../generated/prisma";
import prisma from "../utils/prisma";
const sunglassesImages = [
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
  "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400",
  "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400",
  "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400",
  "https://images.unsplash.com/photo-1577803645773-f96470509666?w=400",
  "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400",
  "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=400",
  "https://images.unsplash.com/photo-1506629905607-bb5126bc0d0e?w=400",
  "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=400",
];

const products = [
  {
    name: "Classic Aviator Pro",
    brand: "SkyVision",
    description:
      "Timeless aviator design with premium polarized lenses and lightweight titanium frame.",
    price: 299.99,
    discountPrice: 249.99,
    stock: 50,
    frameShape: "AVIATOR",
    frameMaterial: "Titanium",
    frameColor: "Gold",
    lensType: "Polarized",
    lensColor: "Brown",
    gender: Gender.UNISEX,
    isFeatured: true,
    tags: ["bestseller", "polarized", "aviator"],
  },
  {
    name: "Urban Round Frames",
    brand: "CityStyle",
    description:
      "Modern round frames perfect for urban lifestyle with UV400 protection.",
    price: 189.99,
    stock: 75,
    frameShape: "ROUND",
    frameMaterial: "Acetate",
    frameColor: "Black",
    lensType: "UV Protection",
    lensColor: "Gray",
    gender: Gender.UNISEX,
    tags: ["urban", "round", "trendy"],
  },
  {
    name: "Cat Eye Elegance",
    brand: "FemmeStyle",
    description:
      "Sophisticated cat eye design with gradient lenses for the modern woman.",
    price: 225.99,
    discountPrice: 199.99,
    stock: 40,
    frameShape: "CAT_EYE",
    frameMaterial: "Acetate",
    frameColor: "Tortoiseshell",
    lensType: "Gradient",
    lensColor: "Brown Gradient",
    gender: Gender.FEMALE,
    isFeatured: true,
    tags: ["cat-eye", "feminine", "gradient"],
  },
  {
    name: "Sport Wraparound",
    brand: "ActiveGear",
    description:
      "High-performance wraparound sunglasses for sports and outdoor activities.",
    price: 159.99,
    stock: 60,
    frameShape: "RECTANGLE",
    frameMaterial: "TR90",
    frameColor: "Matte Black",
    lensType: "Polarized",
    lensColor: "Blue Mirror",
    gender: Gender.UNISEX,
    tags: ["sport", "polarized", "wraparound"],
  },
  {
    name: "Vintage Square Classic",
    brand: "RetroVision",
    description: "Vintage-inspired square frames with modern lens technology.",
    price: 179.99,
    stock: 45,
    frameShape: "SQUARE",
    frameMaterial: "Metal",
    frameColor: "Silver",
    lensType: "UV Protection",
    lensColor: "Green",
    gender: Gender.MALE,
    tags: ["vintage", "square", "classic"],
  },
  {
    name: "Oval Minimalist",
    brand: "CleanLines",
    description:
      "Minimalist oval design with ultra-light frame and crystal clear lenses.",
    price: 149.99,
    stock: 80,
    frameShape: "OVAL",
    frameMaterial: "Titanium",
    frameColor: "Rose Gold",
    lensType: "Clear",
    lensColor: "Clear",
    gender: Gender.FEMALE,
    tags: ["minimalist", "oval", "lightweight"],
  },
  {
    name: "Browline Heritage",
    brand: "ClassicFrame",
    description:
      "Heritage browline style with premium acetate upper frame and metal lower rim.",
    price: 239.99,
    stock: 35,
    frameShape: "BROWLINE",
    frameMaterial: "Acetate/Metal",
    frameColor: "Brown/Gold",
    lensType: "Polarized",
    lensColor: "Brown",
    gender: Gender.MALE,
    isFeatured: true,
    tags: ["browline", "heritage", "classic"],
  },
  {
    name: "Rimless Freedom",
    brand: "AirFrame",
    description:
      "Ultra-light rimless design for maximum comfort and style freedom.",
    price: 279.99,
    discountPrice: 239.99,
    stock: 25,
    frameShape: "RIMLESS",
    frameMaterial: "Titanium",
    frameColor: "Silver",
    lensType: "Anti-Reflective",
    lensColor: "Clear Blue",
    gender: Gender.UNISEX,
    tags: ["rimless", "lightweight", "modern"],
  },
  {
    name: "Geometric Edge",
    brand: "ModernArt",
    description: "Bold geometric design for the fashion-forward individual.",
    price: 199.99,
    stock: 55,
    frameShape: "GEOMETRIC",
    frameMaterial: "Acetate",
    frameColor: "Navy Blue",
    lensType: "Mirror",
    lensColor: "Silver Mirror",
    gender: Gender.UNISEX,
    tags: ["geometric", "bold", "fashion"],
  },
  {
    name: "Wayfarer Classic",
    brand: "IconicFrames",
    description: "The timeless wayfarer style that never goes out of fashion.",
    price: 169.99,
    stock: 90,
    frameShape: "WAYFARER",
    frameMaterial: "Acetate",
    frameColor: "Black",
    lensType: "UV Protection",
    lensColor: "Gray",
    gender: Gender.UNISEX,
    isFeatured: true,
    tags: ["wayfarer", "classic", "timeless"],
  },
  // Continue with more products...
  {
    name: "Pilot's Choice",
    brand: "AeroStyle",
    description:
      "Professional pilot-inspired aviators with superior glare protection.",
    price: 319.99,
    discountPrice: 279.99,
    stock: 30,
    frameShape: "AVIATOR",
    frameMaterial: "Stainless Steel",
    frameColor: "Gunmetal",
    lensType: "Polarized",
    lensColor: "Green",
    gender: Gender.MALE,
    tags: ["pilot", "professional", "aviator"],
  },
  {
    name: "Butterfly Dreams",
    brand: "GlamourVision",
    description: "Oversized butterfly frames with crystal embellishments.",
    price: 259.99,
    stock: 40,
    frameShape: "CAT_EYE",
    frameMaterial: "Acetate",
    frameColor: "Pink",
    lensType: "Gradient",
    lensColor: "Pink Gradient",
    gender: Gender.FEMALE,
    tags: ["butterfly", "oversized", "glamour"],
  },
  {
    name: "Tech Titanium",
    brand: "FutureTech",
    description:
      "Advanced titanium construction with smart UV-responsive lenses.",
    price: 399.99,
    discountPrice: 349.99,
    stock: 20,
    frameShape: "RECTANGLE",
    frameMaterial: "Titanium",
    frameColor: "Space Gray",
    lensType: "Photochromic",
    lensColor: "Clear to Gray",
    gender: Gender.UNISEX,
    isFeatured: true,
    tags: ["tech", "titanium", "smart"],
  },
  {
    name: "Retro Round Vintage",
    brand: "VintageCollective",
    description: "Authentic 70s-inspired round frames with tinted lenses.",
    price: 139.99,
    stock: 65,
    frameShape: "ROUND",
    frameMaterial: "Metal",
    frameColor: "Antique Brass",
    lensType: "Tinted",
    lensColor: "Yellow",
    gender: Gender.UNISEX,
    tags: ["retro", "70s", "vintage"],
  },
  {
    name: "Executive Square",
    brand: "BusinessClass",
    description: "Professional square frames for the modern executive.",
    price: 219.99,
    stock: 50,
    frameShape: "SQUARE",
    frameMaterial: "Acetate",
    frameColor: "Dark Havana",
    lensType: "Polarized",
    lensColor: "Brown",
    gender: Gender.MALE,
    tags: ["executive", "professional", "square"],
  },
  {
    name: "Beach Vibes",
    brand: "CoastalStyle",
    description:
      "Colorful frames perfect for beach days and summer adventures.",
    price: 129.99,
    stock: 85,
    frameShape: "WAYFARER",
    frameMaterial: "Plastic",
    frameColor: "Coral",
    lensType: "UV Protection",
    lensColor: "Blue",
    gender: Gender.FEMALE,
    tags: ["beach", "summer", "colorful"],
  },
  {
    name: "Muscle Car Inspired",
    brand: "RoadKing",
    description: "Bold frames inspired by classic American muscle cars.",
    price: 189.99,
    stock: 45,
    frameShape: "RECTANGLE",
    frameMaterial: "Metal",
    frameColor: "Chrome",
    lensType: "Mirror",
    lensColor: "Blue Mirror",
    gender: Gender.MALE,
    tags: ["muscle-car", "bold", "chrome"],
  },
  {
    name: "Eco Bamboo",
    brand: "GreenVision",
    description: "Sustainable bamboo frames with eco-friendly packaging.",
    price: 159.99,
    discountPrice: 139.99,
    stock: 40,
    frameShape: "WAYFARER",
    frameMaterial: "Bamboo",
    frameColor: "Natural",
    lensType: "UV Protection",
    lensColor: "Brown",
    gender: Gender.UNISEX,
    tags: ["eco", "bamboo", "sustainable"],
  },
  {
    name: "Diamond Cut Luxury",
    brand: "LuxuryOptics",
    description:
      "Luxury frames with diamond-cut detailing and premium materials.",
    price: 499.99,
    discountPrice: 449.99,
    stock: 15,
    frameShape: "CAT_EYE",
    frameMaterial: "Titanium",
    frameColor: "Rose Gold",
    lensType: "Polarized",
    lensColor: "Gray",
    gender: Gender.FEMALE,
    isFeatured: true,
    tags: ["luxury", "diamond", "premium"],
  },
  {
    name: "Gaming Pro",
    brand: "GameVision",
    description:
      "Blue light blocking frames designed for gamers and digital professionals.",
    price: 179.99,
    stock: 70,
    frameShape: "RECTANGLE",
    frameMaterial: "TR90",
    frameColor: "Matte Black",
    lensType: "Blue Light Filter",
    lensColor: "Clear",
    gender: Gender.UNISEX,
    tags: ["gaming", "blue-light", "digital"],
  },
  {
    name: "Festival Fashion",
    brand: "PartyVision",
    description: "Vibrant frames perfect for festivals and outdoor events.",
    price: 119.99,
    stock: 60,
    frameShape: "ROUND",
    frameMaterial: "Plastic",
    frameColor: "Rainbow",
    lensType: "Mirror",
    lensColor: "Rainbow Mirror",
    gender: Gender.UNISEX,
    tags: ["festival", "vibrant", "party"],
  },
  {
    name: "Precision Oval",
    brand: "PrecisionOptics",
    description: "Precision-engineered oval frames with perfect symmetry.",
    price: 209.99,
    stock: 35,
    frameShape: "OVAL",
    frameMaterial: "Titanium",
    frameColor: "Brushed Steel",
    lensType: "Anti-Reflective",
    lensColor: "Clear",
    gender: Gender.UNISEX,
    tags: ["precision", "oval", "engineered"],
  },
  {
    name: "Artist's Vision",
    brand: "CreativeFrames",
    description: "Unique artistic frames for creative individuals.",
    price: 169.99,
    stock: 45,
    frameShape: "GEOMETRIC",
    frameMaterial: "Acetate",
    frameColor: "Purple",
    lensType: "Gradient",
    lensColor: "Purple Gradient",
    gender: Gender.FEMALE,
    tags: ["artistic", "creative", "unique"],
  },
  {
    name: "Military Grade",
    brand: "TacticalVision",
    description: "Durable tactical frames built for extreme conditions.",
    price: 249.99,
    stock: 30,
    frameShape: "RECTANGLE",
    frameMaterial: "Polycarbonate",
    frameColor: "Olive Drab",
    lensType: "Polarized",
    lensColor: "Smoke",
    gender: Gender.MALE,
    tags: ["military", "tactical", "durable"],
  },
  {
    name: "Sunset Gradient",
    brand: "HorizonStyle",
    description:
      "Beautiful gradient lenses that capture the essence of a sunset.",
    price: 189.99,
    discountPrice: 159.99,
    stock: 55,
    frameShape: "AVIATOR",
    frameMaterial: "Metal",
    frameColor: "Gold",
    lensType: "Gradient",
    lensColor: "Orange Gradient",
    gender: Gender.FEMALE,
    tags: ["sunset", "gradient", "beautiful"],
  },
  {
    name: "Minimalist Edge",
    brand: "SimpleStyle",
    description:
      "Clean, minimalist design with sharp edges and premium finish.",
    price: 199.99,
    stock: 40,
    frameShape: "SQUARE",
    frameMaterial: "Stainless Steel",
    frameColor: "Silver",
    lensType: "UV Protection",
    lensColor: "Gray",
    gender: Gender.UNISEX,
    tags: ["minimalist", "clean", "sharp"],
  },
  {
    name: "Ocean Blue Classic",
    brand: "SeaVision",
    description: "Classic frames with ocean-inspired blue tones.",
    price: 149.99,
    stock: 65,
    frameShape: "WAYFARER",
    frameMaterial: "Acetate",
    frameColor: "Ocean Blue",
    lensType: "Polarized",
    lensColor: "Blue",
    gender: Gender.UNISEX,
    tags: ["ocean", "blue", "classic"],
  },
  {
    name: "Night Vision Pro",
    brand: "NightStyle",
    description:
      "Specialized frames for night driving and low-light conditions.",
    price: 229.99,
    stock: 25,
    frameShape: "RECTANGLE",
    frameMaterial: "TR90",
    frameColor: "Matte Black",
    lensType: "Night Vision",
    lensColor: "Yellow",
    gender: Gender.UNISEX,
    tags: ["night", "driving", "low-light"],
  },
  {
    name: "Flower Power",
    brand: "FloralVision",
    description: "Delicate floral patterns embedded in the frame design.",
    price: 179.99,
    stock: 50,
    frameShape: "ROUND",
    frameMaterial: "Acetate",
    frameColor: "Floral Print",
    lensType: "UV Protection",
    lensColor: "Rose",
    gender: Gender.FEMALE,
    tags: ["floral", "delicate", "feminine"],
  },
  {
    name: "Carbon Fiber Elite",
    brand: "CarbonTech",
    description:
      "Ultra-lightweight carbon fiber construction for maximum durability.",
    price: 359.99,
    discountPrice: 319.99,
    stock: 20,
    frameShape: "RECTANGLE",
    frameMaterial: "Carbon Fiber",
    frameColor: "Matte Carbon",
    lensType: "Polarized",
    lensColor: "Gray",
    gender: Gender.MALE,
    isFeatured: true,
    tags: ["carbon-fiber", "elite", "lightweight"],
  },
];

async function seedProducts() {
  console.log("Starting to seed products...");
  // Convert USD seeded prices to INR for the business (assumption: 1 USD = 83.5 INR)
  const USD_TO_INR = 83.5;

  // First, let's create structured categories with bifurcation (sex, shape, collection, brand, material)
  const categories = [
    // Sex
    { name: "Men", slug: "men", type: "SEX" },
    { name: "Women", slug: "women", type: "SEX" },
    { name: "Unisex", slug: "unisex", type: "SEX" },

    // Shape
    { name: "Aviator", slug: "aviator", type: "SHAPE" },
    { name: "Wayfarer", slug: "wayfarer", type: "SHAPE" },
    { name: "Round", slug: "round", type: "SHAPE" },
    { name: "Cat Eye", slug: "cat-eye", type: "SHAPE" },
    { name: "Rectangle", slug: "rectangle", type: "SHAPE" },
    { name: "Square", slug: "square", type: "SHAPE" },
    { name: "Oval", slug: "oval", type: "SHAPE" },
    { name: "Geometric", slug: "geometric", type: "SHAPE" },
    { name: "Rimless", slug: "rimless", type: "SHAPE" },
    { name: "Browline", slug: "browline", type: "SHAPE" },

    // Collections
    { name: "Luxury", slug: "luxury", type: "COLLECTION" },
    { name: "Vintage", slug: "vintage", type: "COLLECTION" },
    { name: "Sport", slug: "sport", type: "COLLECTION" },
    { name: "Festival", slug: "festival", type: "COLLECTION" },
    { name: "Eco", slug: "eco", type: "COLLECTION" },
    { name: "Tech", slug: "tech", type: "COLLECTION" },

    // Some brands as categories (optional)
    { name: "SkyVision", slug: "skyvision", type: "BRAND" },
    { name: "CityStyle", slug: "citystyle", type: "BRAND" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      // cast to any because generated prisma client needs to be regenerated after schema changes
      create: {
        name: category.name,
        slug: category.slug,
        type: category.type,
        description: (category as any).description || null,
        icon: (category as any).icon || null,
        order: (category as any).order || 0,
        isActive:
          (category as any).isActive !== undefined
            ? (category as any).isActive
            : true,
      } as any,
    });
  }

  console.log("Categories created");

  // Create products with images
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Create specifications object
    const specifications = {
      lensWidth: Math.floor(Math.random() * 20) + 50, // 50-70mm
      bridgeWidth: Math.floor(Math.random() * 8) + 14, // 14-22mm
      templeLength: Math.floor(Math.random() * 20) + 130, // 130-150mm
      weight: Math.floor(Math.random() * 30) + 20, // 20-50g
      warranty: "2 years",
      origin: ["Italy", "Germany", "Japan", "USA"][
        Math.floor(Math.random() * 4)
      ],
    };

    // Ensure unique slug per product run; if product exists, reuse it to make seeding idempotent
    const uniqueSlug = `${slug}-${i}`;
    let createdProduct = await prisma.product.findUnique({
      where: { slug: uniqueSlug },
    });
    if (!createdProduct) {
      // Convert price fields from USD -> INR for storage
      const priceINR = Number((product.price * USD_TO_INR).toFixed(2));
      const discountPriceINR = product.discountPrice
        ? Number((product.discountPrice * USD_TO_INR).toFixed(2))
        : undefined;

      const productData = {
        ...product,
        price: priceINR,
        ...(discountPriceINR !== undefined
          ? { discountPrice: discountPriceINR }
          : {}),
        slug: uniqueSlug,
        sku: `SKU-${Date.now()}-${i}`,
        specifications,
      } as any;

      createdProduct = await prisma.product.create({ data: productData });
    } else {
      // Optionally update the product fields if you want fresh data on reseed
      // await prisma.product.update({ where: { id: createdProduct.id }, data: { ...product, specifications } });
    }

    // Add 2-4 random images for each product
    const numImages = Math.floor(Math.random() * 3) + 2;
    for (let j = 0; j < numImages; j++) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: sunglassesImages[
            Math.floor(Math.random() * sunglassesImages.length)
          ],
          altText: `${product.name} - View ${j + 1}`,
          isMain: j === 0,
        },
      });
    }

    // Assign categories based on product properties (shape, gender, tags), fallback to random
    const desiredSlugs = new Set<string>();

    // shape -> e.g. AVIATOR -> aviator, CAT_EYE -> cat-eye
    if (product.frameShape) {
      desiredSlugs.add(
        String(product.frameShape).toLowerCase().replace(/_/g, "-")
      );
    }

    // gender mapping
    if (product.gender) {
      const g = String(product.gender).toLowerCase();
      if (g === "male") desiredSlugs.add("men");
      else if (g === "female") desiredSlugs.add("women");
      else desiredSlugs.add("unisex");
    }

    // tags -> map common tags to collections
    if (product.tags && Array.isArray(product.tags)) {
      const collectionTags = [
        "luxury",
        "vintage",
        "sport",
        "festival",
        "eco",
        "tech",
        "beach",
      ];
      for (const t of product.tags) {
        const tag = String(t).toLowerCase();
        if (collectionTags.includes(tag)) desiredSlugs.add(tag);
      }
    }

    // Ensure 1-3 categories total by filling randomly if needed
    const minCount = 1;
    const maxCount = 3;
    const targetCount =
      Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    const allSlugs = categories.map((c) => c.slug);
    while (desiredSlugs.size < targetCount) {
      desiredSlugs.add(allSlugs[Math.floor(Math.random() * allSlugs.length)]);
    }

    for (const slug of Array.from(desiredSlugs)) {
      const dbCategory = await prisma.category.findUnique({ where: { slug } });
      if (dbCategory) {
        await prisma.product.update({
          where: { id: createdProduct.id },
          data: { categories: { connect: { id: dbCategory.id } } },
        });
      }
    }

    console.log(`Created product: ${product.name}`);
  }

  console.log(
    `Successfully seeded ${products.length} products! Prices stored in INR.`
  );
}

seedProducts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
