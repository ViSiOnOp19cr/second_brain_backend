-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_linkId_fkey";

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
