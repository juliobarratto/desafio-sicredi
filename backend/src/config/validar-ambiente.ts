function lerTexto(
  configuracao: Record<string, unknown>,
  nome: string,
  valorPadrao?: string,
) {
  const valor = configuracao[nome] ?? valorPadrao;

  if (typeof valor !== "string" || !valor.trim()) {
    throw new Error(`A variável de ambiente ${nome} é obrigatória.`);
  }

  return valor.trim();
}

function validarUrl(valor: string, nome: string, protocolos: string[]) {
  let url: URL;

  try {
    url = new URL(valor);
  } catch {
    throw new Error(
      `A variável de ambiente ${nome} deve conter uma URL válida.`,
    );
  }

  if (!protocolos.includes(url.protocol)) {
    throw new Error(
      `A variável de ambiente ${nome} deve usar ${protocolos.join(" ou ")}.`,
    );
  }

  return valor;
}

export function validarAmbiente(configuracao: Record<string, unknown>) {
  const databaseUrl = validarUrl(
    lerTexto(configuracao, "DATABASE_URL"),
    "DATABASE_URL",
    ["postgresql:", "postgres:"],
  );
  const corsOrigins = lerTexto(
    configuracao,
    "CORS_ORIGINS",
    "http://localhost:3001",
  )
    .split(",")
    .map((origem) => origem.trim())
    .filter(Boolean);
  const porta = Number(configuracao.PORT ?? 3000);

  if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
    throw new Error(
      "A variável de ambiente PORT deve ser um inteiro entre 1 e 65535.",
    );
  }

  for (const origem of corsOrigins) {
    validarUrl(origem, "CORS_ORIGINS", ["http:", "https:"]);
  }

  return {
    ...configuracao,
    DATABASE_URL: databaseUrl,
    CORS_ORIGINS: corsOrigins.join(","),
    PORT: porta,
  };
}
