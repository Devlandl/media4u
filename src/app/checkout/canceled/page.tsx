"use client";

import { type ReactElement } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export default function CheckoutCanceledPage(): ReactElement {
  return (
    <div className="mesh-bg min-h-screen">
      <Section className="pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Checkout <span className="text-gradient-cyber">Canceled</span>
          </h1>

          <p className="text-gray-400 text-lg mb-4">
            Your checkout was canceled. No charges were made.
          </p>

          <p className="text-gray-500 mb-8">
            Changed your mind? No problem. If you have any questions about our
            packages or need help deciding, we&apos;re here to help.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/start-project">
              <Button variant="primary" size="lg">
                View Packages
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
