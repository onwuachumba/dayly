-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifyDaily" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "quietEnd" TEXT,
ADD COLUMN     "quietStart" TEXT;
