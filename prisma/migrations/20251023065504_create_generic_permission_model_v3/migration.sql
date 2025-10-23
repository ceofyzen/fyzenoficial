/*
  Warnings:

  - You are about to drop the column `accessModule` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the `RolePermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PermissionTargetType" AS ENUM ('DEPARTMENT', 'ROLE', 'USER');

-- AlterEnum
ALTER TYPE "ModuloEnum" ADD VALUE 'PERMISSOES';

-- DropForeignKey
ALTER TABLE "public"."RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "accessModule";

-- DropTable
DROP TABLE "public"."RolePermission";

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "module" "ModuloEnum" NOT NULL,
    "targetType" "PermissionTargetType" NOT NULL,
    "departmentId" TEXT,
    "roleId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Permission_targetType_departmentId_module_idx" ON "Permission"("targetType", "departmentId", "module");

-- CreateIndex
CREATE INDEX "Permission_targetType_roleId_module_idx" ON "Permission"("targetType", "roleId", "module");

-- CreateIndex
CREATE INDEX "Permission_targetType_userId_module_idx" ON "Permission"("targetType", "userId", "module");

-- CreateIndex
CREATE INDEX "Permission_departmentId_idx" ON "Permission"("departmentId");

-- CreateIndex
CREATE INDEX "Permission_roleId_idx" ON "Permission"("roleId");

-- CreateIndex
CREATE INDEX "Permission_userId_idx" ON "Permission"("userId");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
