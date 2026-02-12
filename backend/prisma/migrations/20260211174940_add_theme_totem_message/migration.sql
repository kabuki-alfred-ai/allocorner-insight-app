-- AlterTable
ALTER TABLE "themes" ADD COLUMN     "totem_message_id" TEXT;

-- AddForeignKey
ALTER TABLE "themes" ADD CONSTRAINT "themes_totem_message_id_fkey" FOREIGN KEY ("totem_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
