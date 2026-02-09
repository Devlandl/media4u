"use client";

import { type ReactElement } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCanceledPage(): ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="glass-elevated rounded-3xl p-8 md:p-12 text-center">
          {/* Cancel Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"
          >
            <XCircle className="w-12 h-12 text-white" />
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
              Payment Canceled
            </h1>
            <p className="text-lg text-gray-400 mb-2">
              Your payment was not completed.
            </p>
            <p className="text-gray-500 mb-8">
              No charges were made. You can try again whenever you&apos;re ready.
            </p>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-white/10 rounded-2xl p-6 mb-8 text-left"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Need help?</h2>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <span className="text-orange-400">•</span>
                <span>Your project is saved and waiting for payment</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400">•</span>
                <span>Click &quot;Pay Now&quot; from your portal to complete payment</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400">•</span>
                <span>Contact support if you experienced any issues</span>
              </li>
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/portal" className="flex-1">
              <Button size="lg" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Portal
              </Button>
            </Link>
            <Link href="/start-project" className="flex-1">
              <Button variant="secondary" size="lg" className="w-full">
                Browse Packages
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
