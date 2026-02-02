"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { format } from "date-fns";

type SubscriptionStatus = "active" | "past_due" | "canceled" | "unpaid";

const statusColors: Record<SubscriptionStatus, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  past_due: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  canceled: "bg-red-500/20 text-red-400 border-red-500/30",
  unpaid: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const statusLabels: Record<SubscriptionStatus, string> = {
  active: "Active",
  past_due: "Past Due",
  canceled: "Canceled",
  unpaid: "Unpaid",
};

export default function AdminSubscriptionsPage() {
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const subscriptions = useQuery(
    api.stripe.getAllSubscriptions,
    filterStatus !== "all" ? { status: filterStatus } : {}
  );

  const selected = subscriptions?.find((s: Doc<"subscriptions">) => s._id === selectedId);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">Subscriptions</h1>
        <p className="text-gray-400">View and manage Web Care subscriptions</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {(["all", "active", "past_due", "canceled", "unpaid"] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterStatus === status
                  ? "bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
              }`}
            >
              {status === "all" ? "All" : statusLabels[status]}
            </button>
          )
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-elevated rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <p className="text-sm font-semibold text-gray-300">
                {subscriptions?.length ?? 0} Subscriptions
              </p>
            </div>
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {subscriptions?.map((subscription: Doc<"subscriptions">) => (
                <motion.button
                  key={subscription._id}
                  onClick={() => setSelectedId(subscription._id)}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className={`w-full p-4 text-left transition-all border-l-4 ${
                    selectedId === subscription._id
                      ? "border-cyan-500 bg-white/10"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold text-white text-sm truncate">
                    {subscription.customerEmail}
                  </p>
                  <p className="text-xs text-gray-400">Web Care Monthly</p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded border ${statusColors[subscription.status as SubscriptionStatus]}`}
                    >
                      {statusLabels[subscription.status as SubscriptionStatus]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {subscription.cancelAtPeriodEnd
                        ? "Canceling"
                        : format(
                            new Date(subscription.currentPeriodEnd),
                            "MMM d"
                          )}
                    </span>
                  </div>
                </motion.button>
              ))}
              {subscriptions?.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No subscriptions found
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          {selected ? (
            <div className="glass-elevated rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Subscription
                  </p>
                  <p className="text-xl font-semibold text-white">
                    Web Care Monthly
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-medium border ${statusColors[selected.status as SubscriptionStatus]}`}
                >
                  {statusLabels[selected.status as SubscriptionStatus]}
                </span>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Customer Email
                </p>
                <a
                  href={`mailto:${selected.customerEmail}`}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  {selected.customerEmail}
                </a>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Current Period Start
                  </p>
                  <p className="text-white">
                    {format(
                      new Date(selected.currentPeriodStart),
                      "MMMM d, yyyy"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Current Period End
                  </p>
                  <p className="text-white">
                    {format(
                      new Date(selected.currentPeriodEnd),
                      "MMMM d, yyyy"
                    )}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Created
                  </p>
                  <p className="text-white">
                    {format(new Date(selected.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Auto-Renew
                  </p>
                  <p
                    className={
                      selected.cancelAtPeriodEnd
                        ? "text-yellow-400"
                        : "text-green-400"
                    }
                  >
                    {selected.cancelAtPeriodEnd
                      ? "Canceling at period end"
                      : "Yes"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Stripe IDs
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Subscription: </span>
                    <code className="text-gray-300 text-xs">
                      {selected.stripeSubscriptionId}
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-500">Price: </span>
                    <code className="text-gray-300 text-xs">
                      {selected.stripePriceId}
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-500">Customer: </span>
                    <code className="text-gray-300 text-xs">
                      {selected.stripeCustomerId}
                    </code>
                  </div>
                </div>
              </div>

              <a
                href={`https://dashboard.stripe.com/subscriptions/${selected.stripeSubscriptionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View in Stripe Dashboard
              </a>
            </div>
          ) : (
            <div className="glass-elevated rounded-2xl p-12 text-center">
              <p className="text-gray-400">
                Select a subscription to view details
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
