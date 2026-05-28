import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InovaTech — Gestão de Fornecedores",
  description: "Sistema de gestão de fornecedores InovaTech",
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/fornecedores", label: "Fornecedores" },
  { href: "/produtos", label: "Produtos" },
  { href: "/custos", label: "Custos" },
  { href: "/documentos", label: "Documentos" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-8 flex items-center gap-6 h-14">
            <Link href="/" className="font-bold text-blue-700 tracking-tight text-lg shrink-0">
              InovaTech
            </Link>
            <nav className="flex gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
          InovaTech · Gestão de Fornecedores
        </footer>
      </body>
    </html>
  );
}
