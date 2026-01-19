"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "cyan" | "magenta" | "purple";
}

const glowColors = {
  cyan: "hover:shadow-[0_0_60px_rgba(0,212,255,0.15)]",
  magenta: "hover:shadow-[0_0_60px_rgba(255,45,146,0.15)]",
  purple: "hover:shadow-[0_0_60px_rgba(139,92,246,0.15)]",
};

export function Card({ children, className, hover = true, glow = "cyan" }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -8 } : undefined}
      className={clsx(
        "relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] transition-all duration-300",
        hover && "hover:border-white/[0.12]",
        hover && glowColors[glow],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface CardIconProps {
  children: ReactNode;
  gradient?: boolean;
}

export function CardIcon({ children, gradient = false }: CardIconProps) {
  return (
    <div
      className={clsx(
        "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
        gradient
          ? "bg-gradient-to-br from-cyan-500 to-purple-500"
          : "bg-cyan-500/10 text-cyan-400"
      )}
    >
      {children}
    </div>
  );
}
