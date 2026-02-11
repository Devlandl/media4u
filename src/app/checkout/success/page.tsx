"use client";

import { type ReactElement, useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage(): ReactElement {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/portal";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="glass-elevated rounded-3xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-400 mb-2">
              Thank you for your purchase. Your project is now active.
            </p>
            <p className="text-gray-500 mb-8">
              We&apos;ve sent a confirmation email with next steps.
            </p>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-brand-light/10 to-brand-dark/10 border border-white/10 rounded-2xl p-6 mb-8 text-left"
          >
            <h2 className="text-lg font-semibold text-white mb-4">What happens next?</h2>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <span className="text-brand-light mt-1">1.</span>
                <span>Check your email for project details and welcome information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-light mt-1">2.</span>
                <span>Access your portal to set up integration credentials</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-light mt-1">3.</span>
                <span>Our team will begin working on your project</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-light mt-1">4.</span>
                <span>You&apos;ll receive regular updates as we make progress</span>
              </li>
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Link href="/portal">
              <Button size="lg" className="w-full">
                Go to Portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500">
              Redirecting automatically in {countdown} seconds...
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
