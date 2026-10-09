interface IndicadorCardProps {
  titulo: string;
  valor: number;
  descricao?: string;
  destaque?: boolean;
  corMarcador?: "azul" | "amarelo" | "verde" | "vermelho";
}

const coresMarcador = {
  azul: "bg-[#7b99ba]",
  amarelo: "bg-[#c79740]",
  verde: "bg-[#4b8c60]",
  vermelho: "bg-[#ba6b63]",
};

export function IndicadorCard({
  titulo,
  valor,
  descricao,
  destaque = false,
  corMarcador,
}: IndicadorCardProps) {
  return (
    <article
      className={
        "h-full min-w-0 rounded-xl border p-5 " +
        (destaque
          ? "border-[#185b40] bg-[#185b40] text-white"
          : "border-[#e0e6de] bg-white text-[#20382c]")
      }
    >
      <h2
        className={
          "flex items-center gap-2 text-xs font-normal " +
          (destaque ? "text-[#d1e0d4]" : "text-[#738176]")
        }
      >
        {corMarcador && (
          <span
            aria-hidden="true"
            className={"h-1.5 w-1.5 shrink-0 rounded-full " + coresMarcador[corMarcador]}
          />
        )}
        {titulo}
      </h2>

      <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums">
        {valor}
      </p>

      {descricao && (
        <p className={"mt-2 text-[11px] " + (destaque ? "text-[#b9d3c1]" : "text-[#738176]")}>
          {descricao}
        </p>
      )}
    </article>
  );
}
