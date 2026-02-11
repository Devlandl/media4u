"use client";

import { type ReactElement, useState } from "react";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { format } from "date-fns";
import { RefreshCw, AlertTriangle } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Active" },
  past_due: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Past Due" },
  canceled: { bg: "bg-red-500/10", text: "text-red-400", label: "Canceled" },
  unpaid: { bg: "bg-orange-500/10", text: "text-orange-400", label: "Unpaid" },
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
        <h1 className="text-xl lg:text-2xl font-semibold mb-2">
          <span className="text-white">Subscription</span> Management
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
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 lg:p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">
            No active subscription
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Subscribe to Web Care to keep your website updated, secure, and
            performing at its best.
          </p>
          <Link
            href="/start-project#packages"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 font-medium transition-all"
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
            className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6 ${
              subscription.status === "active" ? "border border-emerald-500/20" : ""
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-medium text-white">
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
                <div className="text-xl lg:text-2xl font-semibold text-white">
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
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
          >
            <h3 className="text-lg font-medium mb-4">
              Billing Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-gray-400">Current Period</span>
                <span className="text-white text-sm text-right">
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
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-gray-400">Next Billing Date</span>
                <span className="text-white text-sm text-right">
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
                <span className="text-white text-sm text-right">{subscription.customerEmail}</span>
              </div>
            </div>
          </motion.div>

          {/* Cancellation Notice */}
          {subscription.cancelAtPeriodEnd && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900 rounded-xl p-4 lg:p-6 border border-amber-500/20 bg-amber-500/5"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-400">
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
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 font-medium transition-all disabled:opacity-50"
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
