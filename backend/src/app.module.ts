import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validarAmbiente } from "./config/validar-ambiente";
import { DashboardModule } from "./dashboard/dashboard.module";
import { SolicitacoesModule } from "./solicitacoes/solicitacoes.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validarAmbiente,
    }),

    SolicitacoesModule,
    DashboardModule,
  ],
})
export class AppModule {}
