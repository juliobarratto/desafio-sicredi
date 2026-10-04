import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";

import { Prioridade } from "../../generated/prisma/client";

export class CriarSolicitacaoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  solicitante: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  areaSolicitante: string;

  @IsEnum(Prioridade)
  prioridade: Prioridade;
}
