import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import GlobalStyles from "@/components/GlobalStyles";

const inter = Inter({ subsets: ["latin"] });
const orbitron = Orbitron({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carometro Alunos",
  description:
    "Sistema de visualização de fotos dos alunos por curso e período",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <GlobalStyles fontFamily={orbitron.style.fontFamily} />
        <Header />
        <main className="min-h-[calc(100vh-4rem)] bg-gray-50">{children}</main>
      </body>
    </html>
  );
}
