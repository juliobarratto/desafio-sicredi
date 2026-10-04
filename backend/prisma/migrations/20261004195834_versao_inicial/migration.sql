-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ABERTA', 'EM_ANALISE', 'APROVADA', 'REJEITADA');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('CRIACAO', 'ALERACAO_STATUS', 'EXCLUSAO');

-- CreateTable
CREATE TABLE "solicitacao" (
    "id_solicitacao" SERIAL NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "descricao" TEXT NOT NULL,
    "solicitante" VARCHAR(150) NOT NULL,
    "area_solicitante" VARCHAR(150) NOT NULL,
    "prioridade" "Prioridade" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ABERTA',
    "data_solicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_exclusao" TIMESTAMP(3),

    CONSTRAINT "solicitacao_pkey" PRIMARY KEY ("id_solicitacao")
);

-- CreateTable
CREATE TABLE "historico_solicitacao" (
    "id_historico" SERIAL NOT NULL,
    "id_solicitacao" INTEGER NOT NULL,
    "tipo_evento" "TipoEvento" NOT NULL,
    "status_anterior" "Status",
    "status_novo" "Status",
    "comentario" TEXT,
    "data_evento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_solicitacao_pkey" PRIMARY KEY ("id_historico")
);

-- CreateIndex
CREATE INDEX "historico_solicitacao_id_solicitacao_idx" ON "historico_solicitacao"("id_solicitacao");

-- AddForeignKey
ALTER TABLE "historico_solicitacao" ADD CONSTRAINT "historico_solicitacao_id_solicitacao_fkey" FOREIGN KEY ("id_solicitacao") REFERENCES "solicitacao"("id_solicitacao") ON DELETE RESTRICT ON UPDATE CASCADE;
