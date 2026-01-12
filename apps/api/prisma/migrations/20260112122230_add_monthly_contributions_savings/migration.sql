/*
  Warnings:

  - Added the required column `monthlyContribution` to the `SavingsGoal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SavingsGoal" ADD COLUMN     "monthlyContribution" DECIMAL(65,30) NOT NULL;
