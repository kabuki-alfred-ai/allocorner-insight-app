-- CreateEnum
CREATE TYPE "SpeakerProfile" AS ENUM ('YOUNG_GIRL', 'ADULT_MAN', 'OTHER');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "speaker_profile" "SpeakerProfile";
