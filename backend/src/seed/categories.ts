
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
  const sunglassesShapes = [
    { name: "Aviator", slug: "aviator", type: "SHAPE" },
    { name: "Wayfarer", slug: "wayfarer", type: "SHAPE" },
    { name: "Round", slug: "round-sunglasses", type: "SHAPE" },
    { name: "Square", slug: "square-sunglasses", type: "SHAPE" },
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
  
  const sunglassesGenders = [
    { name: "Men", slug: "men-sunglasses", type: "SEX" },
    { name: "Women", slug: "women-sunglasses", type: "SEX" },
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
