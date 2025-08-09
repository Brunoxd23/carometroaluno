"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showHeader = pathname !== "/login";

  return (
    <>
      {showHeader && <Header />}
      <main
        className={`${
          showHeader ? "min-h-[calc(100vh-4rem)]" : "min-h-screen"
        } bg-gray-50 ${showHeader ? "" : "pt-0"}`}
      >
        {children}
      </main>
    </>
  );
}
