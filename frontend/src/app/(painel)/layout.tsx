import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";

interface PainelLayoutProps {
  children: ReactNode;
}

export default function PainelLayout({ children }: PainelLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f6f8f3] text-[#20382c] md:flex">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[#e0e6de] bg-white px-6 md:px-8">
          <p className="text-xs text-[#738176]">Área de trabalho</p>
          <p className="text-xs text-[#738176]">Portal interno</p>
        </header>

        <main className="mx-auto max-w-7xl p-5 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
