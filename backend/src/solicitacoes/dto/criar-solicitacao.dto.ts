import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Transform } from "class-transformer";

import { Prioridade } from "../../generated/prisma/client";
import { normalizarTexto } from "./normalizar-texto";

export class CriarSolicitacaoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(normalizarTexto)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @Transform(normalizarTexto)
  descricao: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(normalizarTexto)
  solicitante: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(normalizarTexto)
  areaSolicitante: string;

  @IsEnum(Prioridade)
  prioridade: Prioridade;
}
