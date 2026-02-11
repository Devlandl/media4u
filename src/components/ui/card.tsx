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

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      className={clsx(
        "relative p-6 rounded-xl bg-zinc-950 border border-zinc-800 transition-all duration-300",
        hover && "hover:border-zinc-700",
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

export function CardIcon({ children }: CardIconProps) {
  return (
    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
      {children}
    </div>
  );
}
