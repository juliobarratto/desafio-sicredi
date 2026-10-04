import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SolicitacoesModule } from './solicitacoes/solicitacoes.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    SolicitacoesModule,
    DashboardModule,
  ],
})
export class AppModule {}
