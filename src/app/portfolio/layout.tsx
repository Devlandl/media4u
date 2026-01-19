import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Portfolio",
};

interface PortfolioLayoutProps {
  children: ReactNode;
}

export default function PortfolioLayout({ children }: PortfolioLayoutProps) {
  return children;
}
