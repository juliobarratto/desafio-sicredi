"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icone: "▦" },
  { href: "/solicitacoes", label: "Solicitações", icone: "≡" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-[#173f2d] p-4 text-white md:w-56 md:shrink-0 md:px-4 md:py-8">
      <Link href="/dashboard" className="flex w-fit items-center gap-3 px-1">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#d9efb1] text-xl text-[#173f2d]"
        >
          ↗
        </span>
        <span>
          <span className="block text-lg font-bold tracking-tight">Solicita.</span>
          <span className="mt-0.5 block text-[10px] tracking-wider text-[#a5bea8] uppercase">
            Solicitações internas
          </span>
        </span>
      </Link>

      <p className="mt-10 hidden px-3 text-[10px] tracking-[0.16em] text-[#91aa97] uppercase md:block">
        Área de trabalho
      </p>

      <nav aria-label="Navegação principal" className="mt-4 flex gap-2 md:mt-3 md:flex-col">
        {links.map((link) => {
          const ativo =
            pathname === link.href ||
            pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={ativo ? "page" : undefined}
              className={
                "flex min-h-11 flex-1 items-center gap-3 rounded-lg px-3 py-3 text-xs font-medium transition-colors md:flex-none " +
                (ativo
                  ? "bg-[#d9efb1] text-[#173f2d]"
                  : "text-[#adc0b2] hover:bg-white/10")
              }
            >
              <span aria-hidden="true" className="text-lg leading-none">{link.icone}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <p className="mt-14 hidden border-t border-[#355a42] px-3 pt-4 text-xs leading-6 text-[#9bb49f] md:block">
        Gestão de solicitações
        <br />
        Desafio técnico Sicredi
      </p>
    </aside>
  );
}
