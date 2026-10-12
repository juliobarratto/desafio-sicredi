-- CreateIndex
CREATE INDEX "solicitacao_data_exclusao_data_solicitacao_id_solicitacao_idx"
ON "solicitacao"("data_exclusao", "data_solicitacao", "id_solicitacao");

-- CreateIndex
CREATE INDEX "solicitacao_data_exclusao_status_idx"
ON "solicitacao"("data_exclusao", "status");

-- CreateIndex
CREATE INDEX "solicitacao_data_exclusao_prioridade_idx"
ON "solicitacao"("data_exclusao", "prioridade");
