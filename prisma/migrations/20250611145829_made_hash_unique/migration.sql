/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `Link` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Link_hash_key" ON "Link"("hash");
