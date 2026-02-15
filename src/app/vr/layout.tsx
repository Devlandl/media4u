import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "VR Community",
  description: "Join the VR Community - a growing space for creators to share virtual worlds, sell properties, showcase artwork, and connect with fellow builders.",
  keywords: [
    "VR",
    "virtual reality",
    "VR environments",
    "VR experiences",
    "virtual worlds",
    "VR properties",
    "virtual showrooms",
    "VR destinations",
    "immersive experiences",
    "custom VR development",
    "virtual reality development",
  ],
  openGraph: {
    title: "VR Community - Creators & Virtual Worlds | Media4U",
    description: "Join a growing community of VR creators sharing virtual worlds, properties, and artwork.",
  },
};

export default function VRLayout({ children }: { children: ReactNode }) {
  return children;
}
