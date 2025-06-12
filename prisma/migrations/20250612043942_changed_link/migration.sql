/*
  Warnings:

  - You are about to drop the column `linkId` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Link` table. All the data in the column will be lost.
  - Added the required column `link` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_linkId_fkey";

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "linkId",
ADD COLUMN     "link" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "url",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "link" TEXT NOT NULL;
