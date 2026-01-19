import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet the team behind Media4U. We create immersive VR environments, stunning websites, and innovative multiverse experiences that connect people and inspire creativity.",
  openGraph: {
    title: "About | Media4U",
    description:
      "Meet the team behind Media4U. We create immersive VR environments, stunning websites, and innovative multiverse experiences.",
  },
};

export default function AboutPage(): ReactElement {
  return <AboutContent />;
}
