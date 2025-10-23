-- CreateEnum
CREATE TYPE "PontoTipo" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "PontoSource" AS ENUM ('AUTOMATICO', 'MANUAL');

-- CreateTable
CREATE TABLE "PontoRegistro" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "type" "PontoTipo" NOT NULL,
    "source" "PontoSource" NOT NULL,
    "userId" TEXT NOT NULL,
    "justificativa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PontoRegistro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PontoRegistro_userId_idx" ON "PontoRegistro"("userId");

-- CreateIndex
CREATE INDEX "PontoRegistro_timestamp_idx" ON "PontoRegistro"("timestamp");

-- CreateIndex
CREATE INDEX "PontoRegistro_userId_timestamp_idx" ON "PontoRegistro"("userId", "timestamp");

-- AddForeignKey
ALTER TABLE "PontoRegistro" ADD CONSTRAINT "PontoRegistro_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
