import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { Prioridade } from "../../generated/prisma/client";
import { normalizarTexto } from "./normalizar-texto";

export class AtualizarSolicitacaoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(normalizarTexto)
  titulo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @Transform(normalizarTexto)
  descricao?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(normalizarTexto)
  solicitante?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(normalizarTexto)
  areaSolicitante?: string;

  @IsOptional()
  @IsEnum(Prioridade)
  prioridade?: Prioridade;
}
