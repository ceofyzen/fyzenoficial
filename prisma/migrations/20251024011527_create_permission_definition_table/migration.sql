/*
  Warnings:

  - You are about to drop the column `module` on the `Permission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[targetType,departmentId,action]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[targetType,roleId,action]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[targetType,userId,action]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Permission_targetType_departmentId_module_idx";

-- DropIndex
DROP INDEX "public"."Permission_targetType_roleId_module_idx";

-- DropIndex
DROP INDEX "public"."Permission_targetType_userId_module_idx";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "module",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "targetId" TEXT;

-- CreateTable
CREATE TABLE "PermissionDefinition" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PermissionDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PermissionDefinition_action_key" ON "PermissionDefinition"("action");

-- CreateIndex
CREATE INDEX "PermissionDefinition_category_idx" ON "PermissionDefinition"("category");

-- CreateIndex
CREATE INDEX "Permission_targetType_action_idx" ON "Permission"("targetType", "action");

-- CreateIndex
CREATE UNIQUE INDEX "permission_department_action_unique" ON "Permission"("targetType", "departmentId", "action");

-- CreateIndex
CREATE UNIQUE INDEX "permission_role_action_unique" ON "Permission"("targetType", "roleId", "action");

-- CreateIndex
CREATE UNIQUE INDEX "permission_user_action_unique" ON "Permission"("targetType", "userId", "action");

-- RenameForeignKey
ALTER TABLE "Permission" RENAME CONSTRAINT "Permission_departmentId_fkey" TO "permission_department_fkey";

-- RenameForeignKey
ALTER TABLE "Permission" RENAME CONSTRAINT "Permission_roleId_fkey" TO "permission_role_fkey";

-- RenameForeignKey
ALTER TABLE "Permission" RENAME CONSTRAINT "Permission_userId_fkey" TO "permission_user_fkey";
