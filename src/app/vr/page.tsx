import { Metadata } from "next";
import VRPageClient from "./VRPageClient";

export const metadata: Metadata = {
  title: "VR Community - Creators, Virtual Worlds & Digital Art",
  description: "Join the VR Community - a space for creators to share virtual worlds, sell properties, showcase artwork, and connect. Get featured and be part of what's next.",
  keywords: ["VR community", "virtual reality creators", "virtual worlds", "VR marketplace", "sell VR properties", "virtual art", "3D virtual worlds", "VR creators"],
  openGraph: {
    title: "Media4U VR Community - Creators & Virtual Worlds",
    description: "A growing community where VR creators share worlds, sell properties, and showcase their art.",
    type: "website",
    url: "https://media4u.fun/vr",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media4U VR Community",
    description: "A growing community for VR creators to share, sell, and connect.",
  },
  alternates: {
    canonical: "https://media4u.fun/vr",
  },
};

export default function VRPage() {
  return <VRPageClient />;
}
