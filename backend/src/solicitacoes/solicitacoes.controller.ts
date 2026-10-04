import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { SolicitacoesService } from "./solicitacoes.service";
import { AlterarStatusSolicitacaoDto } from "./dto/alterar-status-solicitacao.dto";
import { AtualizarSolicitacaoDto } from "./dto/atualizar-solicitacao.dto";
import { CriarSolicitacaoDto } from "./dto/criar-solicitacao.dto";
import { ListarSolicitacoesDto } from "./dto/listar-solicitacoes.dto";

@Controller("solicitacoes")
export class SolicitacoesController {
  constructor(private readonly solicitacoesService: SolicitacoesService) {}

  @Get()
  listar(@Query() filtros: ListarSolicitacoesDto) {
    return this.solicitacoesService.listar(filtros);
  }

  @Get(":id/historico")
  buscarHistorico(@Param("id", new ParseIntPipe()) idSolicitacao: number) {
    return this.solicitacoesService.buscarHistorico(idSolicitacao);
  }

  @Get(":id")
  buscarPorId(@Param("id", new ParseIntPipe()) idSolicitacao: number) {
    return this.solicitacoesService.buscarPorId(idSolicitacao);
  }

  @Post()
  criar(@Body() dados: CriarSolicitacaoDto) {
    return this.solicitacoesService.criar(dados);
  }

  @Patch(":id/status")
  alterarStatus(
    @Param("id", new ParseIntPipe()) idSolicitacao: number,
    @Body() dados: AlterarStatusSolicitacaoDto,
  ) {
    return this.solicitacoesService.alterarStatus(idSolicitacao, dados);
  }

  @Patch(":id")
  atualizar(
    @Param("id", new ParseIntPipe()) idSolicitacao: number,
    @Body() dados: AtualizarSolicitacaoDto,
  ) {
    return this.solicitacoesService.atualizar(idSolicitacao, dados);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  excluir(@Param("id", new ParseIntPipe()) idSolicitacao: number) {
    return this.solicitacoesService.excluir(idSolicitacao);
  }
}
