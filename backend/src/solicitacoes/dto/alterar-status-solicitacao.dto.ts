import { Transform } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

import { Status } from "../../generated/prisma/client";
import { normalizarTexto } from "./normalizar-texto";

export class AlterarStatusSolicitacaoDto {
  @IsEnum(Status)
  status: Status;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Transform(normalizarTexto)
  comentario?: string;
}
