"use client";

import { type ReactElement, useState } from "react";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { format } from "date-fns";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-500/20", text: "text-green-400", label: "Active" },
  past_due: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Past Due" },
  canceled: { bg: "bg-red-500/20", text: "text-red-400", label: "Canceled" },
  unpaid: { bg: "bg-orange-500/20", text: "text-orange-400", label: "Unpaid" },
};

export default function PortalSubscriptionPage(): ReactElement {
  const { user } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const subscription = useQuery(
    api.stripe.getUserSubscription,
    user?.id ? { userId: user.id } : "skip"
  );

  const handleManageSubscription = async (): Promise<void> => {
    if (!user?.email) return;

    setPortalLoading(true);
    setPortalError(null);

    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : "Something went wrong");
      setPortalLoading(false);
    }
  };

  const statusStyle = subscription
    ? STATUS_STYLES[subscription.status] ?? STATUS_STYLES.canceled
    : null;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">
          <span className="text-gradient-cyber">Subscription</span> Management
        </h1>
        <p className="text-gray-400">
          View and manage your Web Care subscription.
        </p>
      </motion.div>

      {/* Subscription Status */}
      {subscription === undefined ? (
        <div className="text-center text-gray-400 py-8">
          Loading subscription...
        </div>
      ) : !subscription ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-elevated rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <span className="text-3xl">🔄</span>
          </div>
          <h3 className="text-xl font-display font-semibold mb-2">
            No active subscription
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Subscribe to Web Care to keep your website updated, secure, and
            performing at its best.
          </p>
          <Link
            href="/start-project#packages"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-cyan-500/25"
          >
            Subscribe to Web Care - $149/mo
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-elevated rounded-2xl p-6 ${
              subscription.status === "active" ? "border border-green-500/30" : ""
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-display font-bold text-white">
                    Web Care Monthly
                  </h2>
                  {statusStyle && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusStyle.label}
                    </span>
                  )}
                </div>
                <p className="text-gray-400">
                  Website maintenance, updates, and support
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-display font-bold text-white">
                  $149
                  <span className="text-lg text-gray-400">/mo</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Billing Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-elevated rounded-2xl p-6"
          >
            <h3 className="text-lg font-display font-semibold mb-4">
              Billing Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Current Period</span>
                <span className="text-white">
                  {format(
                    new Date(subscription.currentPeriodStart),
                    "MMM d, yyyy"
                  )}{" "}
                  -{" "}
                  {format(
                    new Date(subscription.currentPeriodEnd),
                    "MMM d, yyyy"
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Next Billing Date</span>
                <span className="text-white">
                  {subscription.cancelAtPeriodEnd
                    ? "Cancels at period end"
                    : format(
                        new Date(subscription.currentPeriodEnd),
                        "MMMM d, yyyy"
                      )}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{subscription.customerEmail}</span>
              </div>
            </div>
          </motion.div>

          {/* Cancellation Notice */}
          {subscription.cancelAtPeriodEnd && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-elevated rounded-2xl p-6 border border-yellow-500/30 bg-yellow-500/5"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-yellow-400">
                    Subscription Ending
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">
                    Your subscription is set to cancel on{" "}
                    {format(
                      new Date(subscription.currentPeriodEnd),
                      "MMMM d, yyyy"
                    )}
                    . You can reactivate anytime before this date.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Manage Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-start"
          >
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50"
            >
              {portalLoading ? "Loading..." : "Manage Subscription"}
            </button>
            <p className="text-sm text-gray-500 self-center">
              Update payment method, view invoices, or cancel
            </p>
          </motion.div>

          {portalError && (
            <p className="text-red-400 text-sm">{portalError}</p>
          )}
        </div>
      )}
    </div>
  );
}
