import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import GlobalStyles from "@/components/GlobalStyles";
import { SessionProvider } from "@/providers/SessionProvider";
import LayoutClient from "@/components/LayoutClient";
import ToastGlobal from "@/components/ToastGlobal"; // Use o componente que você já tem
import { ToastProvider } from "@/components/ui/ToastContext";

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
      <body className={`${inter.className} bg-transparent`}>
        <SessionProvider>
          <ToastProvider>
            <GlobalStyles fontFamily={orbitron.style.fontFamily} />
            <LayoutClient>{children}</LayoutClient>
            <ToastGlobal /> {/* Use o componente que você já criou */}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
