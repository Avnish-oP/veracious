
import { PrismaClient, CategoryType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Categories...");

  // 1. Sunglasses
  const sunglasses = await prisma.category.upsert({
    where: { slug: "sunglasses" },
    update: {},
    create: {
      name: "Sunglasses",
      slug: "sunglasses",
      description: "Stylish protection for your eyes",
      type: "OTHER",
      order: 1,
    },
  });
  console.log("Upserted Sunglasses");

  // 2. Eyewear
  const eyewear = await prisma.category.upsert({
    where: { slug: "eyewear" },
    update: {},
    create: {
      name: "Eyewear",
      slug: "eyewear",
      description: "Prescription frames and lenses",
      type: "OTHER",
      order: 2,
    },
  });
  console.log("Upserted Eyewear");
  console.log("Upserted Eyewear");

  // Sunglasses Sub-categories
  
  // 1. GENDER (SEX)
  const sunglassesGenders = [
    { name: "Men", slug: "men-sunglasses", type: "SEX" },
    { name: "Women", slug: "women-sunglasses", type: "SEX" },
    { name: "Unisex", slug: "unisex-sunglasses", type: "SEX" },
  ];

  for (const g of sunglassesGenders) {
    await prisma.category.upsert({
      where: { slug: g.slug },
      update: { parentId: sunglasses.id, type: g.type as CategoryType },
      create: {
        name: g.name,
        slug: g.slug,
        type: g.type as CategoryType,
        parentId: sunglasses.id,
      },
    });
  }

  // 2. SHAPE
  const sunglassesShapes = [
    { name: "Aviator", slug: "aviator", type: "SHAPE" },
    { name: "Browline", slug: "browline", type: "SHAPE" },
    { name: "Cat Eye", slug: "cat-eye", type: "SHAPE" },
    { name: "Geometric", slug: "geometric", type: "SHAPE" },
    { name: "Oval", slug: "oval", type: "SHAPE" },
    { name: "Rectangle", slug: "rectangle", type: "SHAPE" },
    { name: "Rimless", slug: "rimless", type: "SHAPE" },
    { name: "Round", slug: "round-sunglasses", type: "SHAPE" },
    { name: "Square", slug: "square-sunglasses", type: "SHAPE" },
    { name: "Wayfarer", slug: "wayfarer", type: "SHAPE" },
  ];

  for (const s of sunglassesShapes) {
    await prisma.category.upsert({
      where: { slug: s.slug },
      update: { parentId: sunglasses.id, type: s.type as CategoryType },
      create: {
        name: s.name,
        slug: s.slug,
        type: s.type as CategoryType,
        parentId: sunglasses.id,
      },
    });
  }

  // 3. COLLECTIONS
  const sunglassesCollections = [
    { name: "Eco", slug: "eco-collection", type: "COLLECTION" },
    { name: "Festival", slug: "festival-collection", type: "COLLECTION" },
    { name: "Luxury", slug: "luxury-collection", type: "COLLECTION" },
    { name: "Sport", slug: "sport-collection", type: "COLLECTION" },
    { name: "Tech", slug: "tech-collection", type: "COLLECTION" },
    { name: "Vintage", slug: "vintage-collection", type: "COLLECTION" },
  ];

  for (const c of sunglassesCollections) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { parentId: sunglasses.id, type: c.type as CategoryType },
      create: {
        name: c.name,
        slug: c.slug,
        type: c.type as CategoryType,
        parentId: sunglasses.id,
      },
    });
  }

  // 4. BRANDS
  const sunglassesBrands = [
    { name: "CityStyle", slug: "citystyle", type: "BRAND" },
    { name: "SkyVision", slug: "skyvision", type: "BRAND" },
  ];

  for (const b of sunglassesBrands) {
    await prisma.category.upsert({
      where: { slug: b.slug },
      update: { parentId: sunglasses.id, type: b.type as CategoryType },
      create: {
        name: b.name,
        slug: b.slug,
        type: b.type as CategoryType,
        parentId: sunglasses.id,
      },
    });
  }

  // 5. OTHER (Manual addition just to catch the user's list, though likely overlaps with main categories)
  // "Sunglasses", "Eyewear", "Contact Lenses" are top categories, but user listed them.
  // We added them as top level. 
  // Let's ensure they are not added as sub-categories to keep data clean, unless explicitly needed as "Other"
  // User input: "Other \n Sunglasses \n Eyewear \n Contact Lenses"
  // Assuming these are links perhaps? For now, we'll skip adding them as *sub-categories* of Sunglasses
  // because that would be recursive or weird. "Other" might be a header.

  // 3. Contact Lenses
  const contactLenses = await prisma.category.upsert({
    where: { slug: "contact-lenses" },
    update: {},
    create: {
      name: "Contact Lenses",
      slug: "contact-lenses",
      description: "Comfortable contact lenses for daily use",
      type: "OTHER",
      order: 3,
    },
  });
  console.log("Upserted Contact Lenses");

  // Contact Lens Sub-categories
  
  // MANUFACTURER
  const manufacturers = [
    { name: "Johnson & Johnson (Acuvue)", slug: "acuvue" },
    { name: "CooperVision", slug: "coopervision" },
    { name: "Alcon", slug: "alcon" },
    { name: "Bausch + Lomb", slug: "bausch-lomb" },
  ];

  for (const m of manufacturers) {
    await prisma.category.upsert({
      where: { slug: m.slug },
      update: { parentId: contactLenses.id, type: "MANUFACTURER" },
      create: {
        name: m.name,
        slug: m.slug,
        type: "MANUFACTURER",
        parentId: contactLenses.id,
      },
    });
  }

  // TYPES
  const types = [
    { name: "Coloured", slug: "coloured" },
    { name: "Coloured with Power", slug: "coloured-power" },
    { name: "Toric (Astigmatism)", slug: "toric" },
    { name: "Clear Spherical", slug: "clear-spherical" },
    { name: "Multifocal", slug: "multifocal" },
  ];

  for (const t of types) {
    await prisma.category.upsert({
      where: { slug: t.slug },
      update: { parentId: contactLenses.id, type: "LENS_TYPE" },
      create: {
        name: t.name,
        slug: t.slug,
        type: "LENS_TYPE",
        parentId: contactLenses.id,
      },
    });
  }

  // DISPOSABILITY
  const disposability = [
    { name: "Daily Disposable", slug: "daily-disposable" },
    { name: "Biweekly", slug: "biweekly" },
    { name: "Monthly", slug: "monthly" },
    { name: "Yearly", slug: "yearly" },
  ];

  for (const d of disposability) {
    await prisma.category.upsert({
      where: { slug: d.slug },
      update: { parentId: contactLenses.id, type: "DISPOSABILITY" },
      create: {
        name: d.name,
        slug: d.slug,
        type: "DISPOSABILITY",
        parentId: contactLenses.id,
      },
    });
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
