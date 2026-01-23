"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import { ReactNode } from "react";

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Header />}
      <main className={`flex-1 ${!isAdminPage ? "pt-20" : ""}`}>{children}</main>
      {!isAdminPage && <Footer />}
    </>
  );
}
