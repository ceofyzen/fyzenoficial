-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "hierarchyLevel" INTEGER NOT NULL DEFAULT 99;

-- CreateIndex
CREATE INDEX "Role_hierarchyLevel_idx" ON "Role"("hierarchyLevel");
