/*
  Warnings:

  - You are about to drop the column `firstImage` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `secondImage` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Product` table. All the data in the column will be lost.
  - Added the required column `business_id` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `business_id` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "firstImage",
DROP COLUMN "secondImage",
ADD COLUMN     "business_id" TEXT NOT NULL,
ADD COLUMN     "first_image" VARCHAR(300),
ADD COLUMN     "second_image" VARCHAR(300);

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "categoryId",
ADD COLUMN     "business_id" TEXT NOT NULL,
ADD COLUMN     "category_id" INTEGER;

-- CreateIndex
CREATE INDEX "Category_business_id_idx" ON "Category"("business_id");

-- CreateIndex
CREATE INDEX "Product_business_id_idx" ON "Product"("business_id");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
