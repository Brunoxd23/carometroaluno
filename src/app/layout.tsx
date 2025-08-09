import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import GlobalStyles from "@/components/GlobalStyles";
import { SessionProvider } from "@/providers/SessionProvider";
import LayoutClient from "@/components/LayoutClient";

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
        <SessionProvider>
          <GlobalStyles fontFamily={orbitron.style.fontFamily} />
          <LayoutClient>{children}</LayoutClient>
        </SessionProvider>
      </body>
    </html>
  );
}
