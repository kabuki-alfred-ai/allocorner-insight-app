-- CreateEnum
CREATE TYPE "Tone" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "tone" "Tone" NOT NULL DEFAULT 'NEUTRAL';
