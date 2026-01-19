import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore our VR environments, web design, multiverse projects, and creative consulting services. Custom digital solutions for every budget.",
  openGraph: {
    title: "Services | Media4U",
    description:
      "Explore our VR environments, web design, multiverse projects, and creative consulting services.",
  },
};

interface ServicesLayoutProps {
  children: ReactNode;
}

export default function ServicesLayout({ children }: ServicesLayoutProps): ReactNode {
  return children;
}
