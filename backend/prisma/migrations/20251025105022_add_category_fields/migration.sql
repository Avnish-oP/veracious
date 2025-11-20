-- CreateEnum
CREATE TYPE "public"."CategoryType" AS ENUM ('SEX', 'SHAPE', 'COLLECTION', 'BRAND', 'MATERIAL', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "description" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "type" "public"."CategoryType" NOT NULL DEFAULT 'OTHER';

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
