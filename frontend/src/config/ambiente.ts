function obterApiUrl() {
  const valor = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!valor) {
    throw new Error(
      "A variável NEXT_PUBLIC_API_URL é obrigatória. Consulte o arquivo .env.example.",
    );
  }

  let url: URL;
  try {
    url = new URL(valor);
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL deve conter uma URL válida.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_API_URL deve usar http: ou https:.");
  }

  return valor.replace(/\/$/, "");
}

export const ambiente = {
  apiUrl: obterApiUrl(),
  timeoutApiMs: 10_000,
} as const;
