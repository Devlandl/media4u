"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import { ReactNode } from "react";

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const isPortalPage = pathname?.startsWith("/portal");
  const hideLayout = isAdminPage || isPortalPage;

  return (
    <>
      {!hideLayout && <Header />}
      <main className={`flex-1 ${!hideLayout ? "pt-20" : ""}`}>{children}</main>
      {!hideLayout && <Footer />}
    </>
  );
}
