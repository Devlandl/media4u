import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "VR & Multiverse",
  description: "Custom VR environments and multiverse experiences. Interactive virtual events, showrooms, training simulations, and immersive digital worlds.",
  keywords: ["VR", "virtual reality", "multiverse", "immersive experiences", "virtual events", "3D environments"],
};

export default function VRLayout({ children }: { children: ReactNode }) {
  return children;
}
