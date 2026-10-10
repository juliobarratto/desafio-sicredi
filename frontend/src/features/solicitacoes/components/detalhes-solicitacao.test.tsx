import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DetalhesSolicitacao } from "./detalhes-solicitacao";
import {
  alterarStatusSolicitacao,
  buscarHistoricoSolicitacao,
  buscarSolicitacao,
} from "../services/solicitacoes.service";
import type { Solicitacao } from "../types/solicitacao";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("../services/solicitacoes.service", () => ({
  alterarStatusSolicitacao: vi.fn(),
  buscarHistoricoSolicitacao: vi.fn(),
  buscarSolicitacao: vi.fn(),
  excluirSolicitacao: vi.fn(),
}));

const solicitacaoBase: Solicitacao = {
  idSolicitacao: 1,
  titulo: "Nova rede",
  descricao: "Descrição",
  solicitante: "Julio",
  areaSolicitante: "Tecnologia",
  prioridade: "ALTA",
  status: "EM_ANALISE",
  dataSolicitacao: "2026-10-10T12:00:00.000Z",
  dataExclusao: null,
};

describe("DetalhesSolicitacao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buscarHistoricoSolicitacao).mockResolvedValue([]);
  });

  it("não oferece edição para uma solicitação com decisão final", async () => {
    vi.mocked(buscarSolicitacao).mockResolvedValue({
      ...solicitacaoBase,
      status: "APROVADA",
    });

    render(<DetalhesSolicitacao idSolicitacao={1} />);

    expect(
      await screen.findByRole("heading", { name: "Nova rede" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Editar" }),
    ).not.toBeInTheDocument();
  });

  it("abre o diálogo, limita e normaliza o comentário da decisão", async () => {
    vi.mocked(buscarSolicitacao).mockResolvedValue(solicitacaoBase);
    vi.mocked(alterarStatusSolicitacao).mockResolvedValue({
      ...solicitacaoBase,
      status: "APROVADA",
    });
    const user = userEvent.setup();
    render(<DetalhesSolicitacao idSolicitacao={1} />);

    await user.click(await screen.findByRole("button", { name: "Aprovar" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("open");
    expect(screen.getByLabelText(/Comentário/)).toHaveAttribute(
      "maxlength",
      "1000",
    );

    await user.type(
      screen.getByLabelText(/Comentário/),
      "  Dentro do escopo.  ",
    );
    await user.click(screen.getByRole("button", { name: "Confirmar decisão" }));

    await waitFor(() =>
      expect(alterarStatusSolicitacao).toHaveBeenCalledWith(1, {
        status: "APROVADA",
        comentario: "Dentro do escopo.",
      }),
    );
  });

  it("fecha o diálogo com Escape e devolve o foco ao acionador", async () => {
    vi.mocked(buscarSolicitacao).mockResolvedValue(solicitacaoBase);
    const user = userEvent.setup();
    render(<DetalhesSolicitacao idSolicitacao={1} />);

    const botaoAprovar = await screen.findByRole("button", { name: "Aprovar" });
    await user.click(botaoAprovar);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(botaoAprovar).toHaveFocus();
  });
});
