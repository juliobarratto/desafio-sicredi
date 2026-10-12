import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { popularBancoSeVazio } from "./popular-banco";

async function executarSeed() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL é obrigatória para executar o seed.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const resultado = await popularBancoSeVazio(prisma);

    if (resultado.bancoJaPossuiaDados) {
      console.log("Seed ignorado: o banco já possui solicitações.");
      return;
    }

    console.log(
      `Seed concluído: ${resultado.quantidadeCriada} solicitações fictícias criadas.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

void executarSeed().catch((erro: unknown) => {
  console.error("Falha ao executar o seed.", erro);
  process.exitCode = 1;
});
