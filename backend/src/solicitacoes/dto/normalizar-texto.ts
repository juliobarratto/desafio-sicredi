export function normalizarTexto({ value }: { value: unknown }) {
  return typeof value === "string" ? value.trim() : value;
}
