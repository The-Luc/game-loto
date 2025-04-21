/*
  Warnings:

  - You are about to drop the column `cardId` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "cardId",
ADD COLUMN     "selectedCardIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
