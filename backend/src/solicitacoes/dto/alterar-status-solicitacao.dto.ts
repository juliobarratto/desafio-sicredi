import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

import { Status } from "../../generated/prisma/client";

export class AlterarStatusSolicitacaoDto {
  @IsEnum(Status)
  status: Status;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comentario?: string;
}
