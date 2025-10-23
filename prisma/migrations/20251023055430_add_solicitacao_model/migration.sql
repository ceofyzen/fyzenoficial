-- CreateEnum
CREATE TYPE "SolicitacaoStatus" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "SolicitacaoTipo" AS ENUM ('FERIAS', 'ATESTADO', 'LICENCA_NAO_REMUNERADA', 'OUTRO');

-- CreateTable
CREATE TABLE "Solicitacao" (
    "id" TEXT NOT NULL,
    "tipo" "SolicitacaoTipo" NOT NULL,
    "dataInicio" DATE NOT NULL,
    "dataFim" DATE NOT NULL,
    "justificativa" TEXT,
    "observacaoRh" TEXT,
    "status" "SolicitacaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solicitacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Solicitacao_userId_idx" ON "Solicitacao"("userId");

-- CreateIndex
CREATE INDEX "Solicitacao_status_idx" ON "Solicitacao"("status");

-- CreateIndex
CREATE INDEX "Solicitacao_tipo_idx" ON "Solicitacao"("tipo");

-- CreateIndex
CREATE INDEX "Solicitacao_dataInicio_idx" ON "Solicitacao"("dataInicio");

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
