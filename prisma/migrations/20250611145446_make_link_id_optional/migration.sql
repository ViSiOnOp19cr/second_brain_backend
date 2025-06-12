/*
  Warnings:

  - You are about to drop the column `link` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `hash` on the `Link` table. All the data in the column will be lost.
  - Added the required column `url` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Link_hash_key";

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "link",
DROP COLUMN "tags",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "linkId" INTEGER;

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "hash",
ADD COLUMN     "url" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ContentTags" (
    "contentId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "ContentTags_pkey" PRIMARY KEY ("contentId","tagId")
);

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTags" ADD CONSTRAINT "ContentTags_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTags" ADD CONSTRAINT "ContentTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
