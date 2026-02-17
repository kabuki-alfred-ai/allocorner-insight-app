-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "gcp_duration" DOUBLE PRECISION,
ADD COLUMN     "gcp_job_id" TEXT,
ADD COLUMN     "processed_at" TIMESTAMP(3),
ADD COLUMN     "processing_error" TEXT,
ADD COLUMN     "processing_status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "retry_count" INTEGER NOT NULL DEFAULT 0;
