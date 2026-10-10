import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FormularioSolicitacao } from "./formulario-solicitacao";
import { criarSolicitacao } from "../services/solicitacoes.service";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("../services/solicitacoes.service", () => ({
  criarSolicitacao: vi.fn(),
  atualizarSolicitacao: vi.fn(),
}));

describe("FormularioSolicitacao", () => {
  beforeEach(() => vi.clearAllMocks());

  it("associa os erros aos campos e move o foco para o primeiro inválido", async () => {
    const user = userEvent.setup();
    render(<FormularioSolicitacao modo="criar" />);

    await user.click(
      screen.getByRole("button", { name: "Cadastrar solicitação" }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Revise os campos destacados",
    );
    expect(screen.getByLabelText(/Título/)).toHaveFocus();
    expect(screen.getByLabelText(/Título/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("Informe o título.")).toBeInTheDocument();
  });

  it("normaliza os campos antes de cadastrar", async () => {
    vi.mocked(criarSolicitacao).mockResolvedValue({
      idSolicitacao: 1,
      titulo: "Nova rede",
      descricao: "Descrição",
      solicitante: "Julio",
      areaSolicitante: "Tecnologia",
      prioridade: "ALTA",
      status: "ABERTA",
      dataSolicitacao: "2026-10-10T12:00:00.000Z",
      dataExclusao: null,
    });
    const user = userEvent.setup();
    render(<FormularioSolicitacao modo="criar" />);

    await user.type(screen.getByLabelText(/Título/), "  Nova rede  ");
    await user.type(screen.getByLabelText(/Descrição/), "  Descrição  ");
    await user.type(screen.getByLabelText(/Solicitante/), "  Julio  ");
    await user.type(
      screen.getByLabelText(/Área solicitante/),
      "  Tecnologia  ",
    );
    await user.selectOptions(screen.getByLabelText(/Prioridade/), "ALTA");
    await user.click(
      screen.getByRole("button", { name: "Cadastrar solicitação" }),
    );

    expect(criarSolicitacao).toHaveBeenCalledWith({
      titulo: "Nova rede",
      descricao: "Descrição",
      solicitante: "Julio",
      areaSolicitante: "Tecnologia",
      prioridade: "ALTA",
    });
    expect(push).toHaveBeenCalledWith("/solicitacoes/1?sucesso=criada");
  });
});
