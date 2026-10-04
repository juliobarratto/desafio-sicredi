import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Prioridade, Status } from "../../generated/prisma/client";

export enum OrdemData {
  ASC = "asc",
  DESC = "desc",
}

export class ListarSolicitacoesDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  pesquisa?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsEnum(Prioridade)
  prioridade?: Prioridade;

  @IsOptional()
  @IsEnum(OrdemData)
  ordemData: OrdemData = OrdemData.DESC;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite: number = 10;
}
