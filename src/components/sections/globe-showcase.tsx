"use client";

import dynamic from "next/dynamic";

const SpinningGlobe = dynamic(
  () => import("@/components/three/spinning-globe").then((m) => m.SpinningGlobe),
  { ssr: false },
);

export function GlobeShowcase() {
  return (
    <section className="relative">
      <div className="relative h-[280px] md:h-[320px] lg:h-[360px]">
        <SpinningGlobe />
      </div>
    </section>
  );
}
